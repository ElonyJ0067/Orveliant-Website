/**
 * Browser-side chart API cache.
 * Historical pages (endTime set) are immutable → long TTL.
 * Latest windows refresh often so first paint stays snappy on revisits.
 */

type CacheEntry = { at: number; status: number; body: unknown };

const mem = new Map<string, CacheEntry>();

export const CHART_FRESH_TTL_MS = 45_000;
export const CHART_HISTORY_TTL_MS = 30 * 60_000;

function ttlForUrl(url: string): number {
  return url.includes("endTime=") ? CHART_HISTORY_TTL_MS : CHART_FRESH_TTL_MS;
}

export function peekChartCache<T>(url: string): T | null {
  const hit = mem.get(url);
  if (!hit) return null;
  if (Date.now() - hit.at > ttlForUrl(url)) {
    mem.delete(url);
    return null;
  }
  return hit.body as T;
}

export function putChartCache(url: string, status: number, body: unknown): void {
  mem.set(url, { at: Date.now(), status, body });
  // Soft cap — drop oldest when large.
  if (mem.size > 80) {
    const first = mem.keys().next().value;
    if (first != null) mem.delete(first);
  }
}

export type ChartJsonResult<T> = {
  ok: boolean;
  status: number;
  json: T;
  fromCache: boolean;
};

/** Fetch JSON with in-memory TTL cache (and browser HTTP cache when allowed). */
export async function fetchChartJson<T extends object>(
  url: string,
  opts?: { bust?: boolean; retries?: number },
): Promise<ChartJsonResult<T>> {
  if (!opts?.bust) {
    const cached = peekChartCache<T>(url);
    if (cached) {
      const hit = mem.get(url)!;
      return {
        ok: hit.status >= 200 && hit.status < 300,
        status: hit.status,
        json: cached,
        fromCache: true,
      };
    }
  }

  const retries = opts?.retries ?? 1;
  let lastErr: unknown;

  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { accept: "application/json" },
      });
      const json = (await res.json()) as T;
      // Cache only successful payloads — never freeze a transient 503 into memory.
      if (res.ok) {
        putChartCache(url, res.status, json);
      }
      return { ok: res.ok, status: res.status, json, fromCache: false };
    } catch (err) {
      lastErr = err;
      if (i < retries) {
        await new Promise((r) => setTimeout(r, 280 * (i + 1)));
      }
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error("Chart fetch failed");
}

/** Warm the next older-history page without applying it to the chart. */
export function warmChartUrl(url: string): void {
  if (peekChartCache(url)) return;
  void fetchChartJson(url, { retries: 0 }).catch(() => {});
}
