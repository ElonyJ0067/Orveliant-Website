/**
 * Binance public market-data hosts.
 * `api.binance.com` often returns HTTP 451 (geo) on cloud hosts like Netlify;
 * `data-api.binance.vision` is the official market-data-only mirror.
 *
 * Strategy tuned for serverless (~10s Netlify limit):
 * 1) Race the two market-data hosts (not all three — avoids 429 storms)
 * 2) Fall back to api.binance.com once if both miss
 */
const BINANCE_PRIMARY = [
  "https://data-api.binance.vision",
  "https://api1.binance.com",
] as const;

const BINANCE_FALLBACK = "https://api.binance.com";

/** Prefer vision first — works when stream.binance.com is geo-blocked. */
export const BINANCE_WS_BASES = [
  "wss://data-stream.binance.vision",
  "wss://stream.binance.com:9443",
  "wss://stream.binance.com:443",
] as const;

type FetchInit = RequestInit & {
  next?: { revalidate?: number };
};

/** Keep under Netlify hobby function budget when a host hangs. */
const HOST_TIMEOUT_MS = 4_500;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function isHardBlock(status: number): boolean {
  return status === 451 || status === 403 || status === 418;
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

    if (res.status === 429) {
      await sleep(550);
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

async function tryHost(
  base: string,
  path: string,
  init?: FetchInit,
): Promise<Response> {
  const res = await fetchHost(base, path, init);
  if (isHardBlock(res.status)) {
    throw new Error(`Binance ${res.status} from ${base}`);
  }
  if (res.status === 429 || res.status >= 500) {
    throw new Error(`Binance ${res.status} from ${base}`);
  }
  return res;
}

/**
 * GET a Binance REST path (must start with `/api/...`).
 */
export async function binanceGet(
  pathAndQuery: string,
  init?: FetchInit,
): Promise<Response> {
  const path = pathAndQuery.startsWith("/") ? pathAndQuery : `/${pathAndQuery}`;

  try {
    return await Promise.any(
      BINANCE_PRIMARY.map((base) => tryHost(base, path, init)),
    );
  } catch {
    /* both primaries missed — one last host */
  }

  try {
    return await tryHost(BINANCE_FALLBACK, path, init);
  } catch {
    throw new Error("Binance unreachable");
  }
}
