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

/**
 * GET a Binance REST path (must start with `/api/...`).
 * Tries market-data hosts in order until one returns ok.
 */
export async function binanceGet(
  pathAndQuery: string,
  init?: FetchInit,
): Promise<Response> {
  const path = pathAndQuery.startsWith("/") ? pathAndQuery : `/${pathAndQuery}`;
  let lastErr: unknown;

  for (const base of BINANCE_REST_BASES) {
    try {
      const res = await fetch(`${base}${path}`, {
        ...init,
        headers: {
          accept: "application/json",
          ...(init?.headers ?? {}),
        },
      });
      // 451 = geo block — try next host. 418/403 similarly.
      if (res.status === 451 || res.status === 403 || res.status === 418) {
        lastErr = new Error(`Binance ${res.status} from ${base}`);
        continue;
      }
      return res;
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error("Binance unreachable");
}
