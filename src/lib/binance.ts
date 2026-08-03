/**
 * Binance public market-data hosts.
 * `api.binance.com` often returns HTTP 451 (geo) on cloud hosts like Netlify;
 * `data-api.binance.vision` is the official market-data-only mirror.
 */
const BINANCE_REST_BASES = [
  "https://data-api.binance.vision",
  "https://api1.binance.com",
  "https://api.binance.com",
] as const;

/** Prefer vision first — works when stream.binance.com is geo-blocked. */
export const BINANCE_WS_BASES = [
  "wss://data-stream.binance.vision",
  "wss://stream.binance.com:9443",
  "wss://stream.binance.com:443",
] as const;

type FetchInit = RequestInit & {
  next?: { revalidate?: number };
};

const HOST_TIMEOUT_MS = 4_000;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchHost(
  base: string,
  path: string,
  init?: FetchInit,
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), HOST_TIMEOUT_MS);
  try {
    const res = await fetch(`${base}${path}`, {
      ...init,
      signal: ctrl.signal,
      headers: {
        accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });

    // Soft rate-limit — one quick retry on the same host.
    if (res.status === 429) {
      await sleep(350);
      const retryCtrl = new AbortController();
      const retryTimer = setTimeout(() => retryCtrl.abort(), HOST_TIMEOUT_MS);
      try {
        return await fetch(`${base}${path}`, {
          ...init,
          signal: retryCtrl.signal,
          headers: {
            accept: "application/json",
            ...(init?.headers ?? {}),
          },
        });
      } finally {
        clearTimeout(retryTimer);
      }
    }

    return res;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * GET a Binance REST path (must start with `/api/...`).
 * Races market-data hosts (short per-host timeout) so Netlify cold paths
 * don’t stall on a single blocked/slow origin.
 */
export async function binanceGet(
  pathAndQuery: string,
  init?: FetchInit,
): Promise<Response> {
  const path = pathAndQuery.startsWith("/") ? pathAndQuery : `/${pathAndQuery}`;

  const attempts = BINANCE_REST_BASES.map(async (base) => {
    const res = await fetchHost(base, path, init);
    // Geo / WAF blocks — treat as hard miss for this host.
    if (res.status === 451 || res.status === 403 || res.status === 418) {
      throw new Error(`Binance ${res.status} from ${base}`);
    }
    // Upstream blips — try another host.
    if (res.status >= 500) {
      throw new Error(`Binance ${res.status} from ${base}`);
    }
    return res;
  });

  try {
    return await Promise.any(attempts);
  } catch {
    throw new Error("Binance unreachable");
  }
}
