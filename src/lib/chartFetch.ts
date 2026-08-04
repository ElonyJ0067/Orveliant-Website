/**
 * Browser-side chart API cache + history request coordination.
 * Historical pages (endTime set) are immutable → long TTL.
 * Latest windows refresh often so first paint stays snappy on revisits.
 *
 * History requests are serialized and retried on 503 so Netlify → Binance
 * blips don’t strand the chart in an empty scroll window.
 */

type CacheEntry = { at: number; status: number; body: unknown };

const mem = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<ChartJsonResult<unknown>>>();

/** One older-history page at a time (warm + scroll share this lane). */
let historyTail: Promise<unknown> = Promise.resolve();

export const CHART_FRESH_TTL_MS = 45_000;
export const CHART_HISTORY_TTL_MS = 30 * 60_000;

function ttlForUrl(url: string): number {
  return url.includes("endTime=") ? CHART_HISTORY_TTL_MS : CHART_FRESH_TTL_MS;
}

function isHistoryUrl(url: string): boolean {
  return url.includes("endTime=");
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
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

function isRetryablePayload(status: number, json: unknown): boolean {
  if (status === 503 || status === 502 || status === 504 || status === 429) {
    return true;
  }
  if (json && typeof json === "object" && "retryable" in json) {
    return Boolean((json as { retryable?: boolean }).retryable);
  }
  return false;
}

async function fetchChartJsonOnce<T extends object>(
  url: string,
): Promise<ChartJsonResult<T>> {
  const res = await fetch(url, {
    headers: { accept: "application/json" },
  });
  const json = (await res.json()) as T;
  // Cache only successful payloads — never freeze a transient 503 into memory.
  if (res.ok) {
    putChartCache(url, res.status, json);
  }
  return { ok: res.ok, status: res.status, json, fromCache: false };
}

async function fetchChartJsonInner<T extends object>(
  url: string,
  retries: number,
): Promise<ChartJsonResult<T>> {
  let lastErr: unknown;
  let lastFail: ChartJsonResult<T> | null = null;

  for (let i = 0; i <= retries; i++) {
    try {
      const result = await fetchChartJsonOnce<T>(url);
      if (result.ok) return result;
      lastFail = result;
      if (isRetryablePayload(result.status, result.json) && i < retries) {
        await sleep(450 * (i + 1) + Math.random() * 250);
        continue;
      }
      return result;
    } catch (err) {
      lastErr = err;
      if (i < retries) {
        await sleep(350 * (i + 1));
      }
    }
  }

  if (lastFail) return lastFail;
  throw lastErr instanceof Error ? lastErr : new Error("Chart fetch failed");
}

function runHistoryQueued<T>(fn: () => Promise<T>): Promise<T> {
  const run = historyTail.then(fn, fn);
  historyTail = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

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

  const existing = inflight.get(url);
  if (existing) {
    return existing as Promise<ChartJsonResult<T>>;
  }

  const retries = opts?.retries ?? (isHistoryUrl(url) ? 3 : 1);

  const exec = async (): Promise<ChartJsonResult<T>> => {
    try {
      if (isHistoryUrl(url)) {
        return await runHistoryQueued(() => fetchChartJsonInner<T>(url, retries));
      }
      return await fetchChartJsonInner<T>(url, retries);
    } finally {
      inflight.delete(url);
    }
  };

  const pending = exec();
  inflight.set(url, pending as Promise<ChartJsonResult<unknown>>);
  return pending;
}

/** Warm the next older-history page without applying it to the chart. */
export function warmChartUrl(url: string): void {
  if (peekChartCache(url) || inflight.has(url)) return;
  void fetchChartJson(url, { retries: 1 }).catch(() => {});
}

/**
 * Clamp a logical range so the plot never shows a blank half when history
 * hasn’t loaded (or failed). Returns null when no clamp is needed.
 */
export function clampLogicalRange(
  logical: { from: number; to: number },
  barCount: number,
  opts?: { rightPad?: number; minSpan?: number },
): { from: number; to: number } | null {
  if (barCount <= 0) return null;
  const rightPad = opts?.rightPad ?? 8;
  const minSpan = opts?.minSpan ?? 16;
  const minFrom = -0.35;
  const maxTo = barCount - 1 + rightPad;
  let from = logical.from;
  let to = logical.to;
  let span = Math.max(minSpan, to - from);

  if (from < minFrom) {
    from = minFrom;
    to = from + span;
  }
  if (to > maxTo) {
    to = maxTo;
    from = Math.max(minFrom, to - span);
  }
  span = Math.max(minSpan, to - from);
  // If still wider than all data + pad, fit to content.
  if (span > barCount + rightPad + 2) {
    from = minFrom;
    to = maxTo;
  }

  if (
    Math.abs(from - logical.from) < 0.02 &&
    Math.abs(to - logical.to) < 0.02
  ) {
    return null;
  }
  return { from, to };
}
