/**
 * Browser-side chart API cache + history request coordination.
 * Historical pages (endTime set) are immutable → long TTL.
 * Latest windows refresh often so first paint stays snappy on revisits.
 *
 * Up to 2 history requests run in parallel so warm + deepen stay fast on Netlify.
 */

type CacheEntry = { at: number; status: number; body: unknown };

const mem = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<ChartJsonResult<unknown>>>();

const DEBUG_INGEST =
  "http://127.0.0.1:7278/ingest/8d2a75ab-c891-410f-a4a3-a04cfb12d6e3";

function postDebugLog(payload: {
  sessionId: string;
  runId: string;
  hypothesisId: string;
  location: string;
  message: string;
  data: Record<string, unknown>;
  timestamp: number;
}): void {
  const body = JSON.stringify(payload);
  fetch(DEBUG_INGEST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "0115ca",
    },
    body,
  }).catch(() => {
    try {
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.sendBeacon === "function"
      ) {
        navigator.sendBeacon(
          DEBUG_INGEST,
          new Blob([body], { type: "text/plain;charset=UTF-8" }),
        );
      }
    } catch {
      /* ignore debug transport fallback errors */
    }
  });
}

/** Cap concurrent older-history fetches (warm + scroll share capacity). */
const HISTORY_CONCURRENCY = 2;
let historyActive = 0;
const historyWait: Array<() => void> = [];

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

async function acquireHistorySlot(): Promise<void> {
  if (historyActive < HISTORY_CONCURRENCY) {
    historyActive += 1;
    return;
  }
  await new Promise<void>((resolve) => {
    historyWait.push(resolve);
  });
  historyActive += 1;
}

function releaseHistorySlot(): void {
  historyActive = Math.max(0, historyActive - 1);
  const next = historyWait.shift();
  if (next) next();
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
  opts?: { bust?: boolean },
): Promise<ChartJsonResult<T>> {
  const res = await fetch(url, {
    headers: { accept: "application/json" },
    cache: opts?.bust || isHistoryUrl(url) ? "no-store" : "default",
  });
  const json = (await res.json()) as T;
  if (res.ok) {
    putChartCache(url, res.status, json);
  }
  return { ok: res.ok, status: res.status, json, fromCache: false };
}

async function fetchChartJsonInner<T extends object>(
  url: string,
  retries: number,
  bust?: boolean,
): Promise<ChartJsonResult<T>> {
  let lastErr: unknown;
  let lastFail: ChartJsonResult<T> | null = null;

  for (let i = 0; i <= retries; i++) {
    try {
      const result = await fetchChartJsonOnce<T>(url, { bust: bust || i > 0 });
      if (typeof window !== "undefined") {
        const payload = result.json as {
          hasMore?: boolean;
          retryable?: boolean;
          series?: unknown[];
          bars?: unknown[];
        };
        let endTime: string | null = null;
        let pages: string | null = null;
        let id: string | null = null;
        let days: string | null = null;
        let interval: string | null = null;
        try {
          const parsed = new URL(url, window.location.origin);
          endTime = parsed.searchParams.get("endTime");
          pages = parsed.searchParams.get("pages");
          id = parsed.searchParams.get("id");
          days = parsed.searchParams.get("days");
          interval = parsed.searchParams.get("interval");
        } catch {
          /* ignore malformed debug URL parse */
        }
        // #region agent log
        postDebugLog({ sessionId: "0115ca", runId: "pre-fix", hypothesisId: "H1", location: "src/lib/chartFetch.ts:fetchChartJsonInner", message: "chart fetch attempt result", data: { path: url.split("?")[0], id, days, interval, isHistory: isHistoryUrl(url), endTime, pages, attempt: i, retries, bust: Boolean(bust || i > 0), ok: result.ok, status: result.status, retryable: Boolean(payload.retryable), hasMore: payload.hasMore ?? null, seriesLen: Array.isArray(payload.series) ? payload.series.length : null, barsLen: Array.isArray(payload.bars) ? payload.bars.length : null }, timestamp: Date.now() });
        // #endregion
      }
      if (result.ok) return result;
      lastFail = result;
      if (isRetryablePayload(result.status, result.json) && i < retries) {
        // Short backoff — multi-page API already did the heavy lift.
        await sleep(120 * (i + 1) + Math.random() * 80);
        continue;
      }
      return result;
    } catch (err) {
      if (typeof window !== "undefined") {
        let id: string | null = null;
        let days: string | null = null;
        let interval: string | null = null;
        try {
          const parsed = new URL(url, window.location.origin);
          id = parsed.searchParams.get("id");
          days = parsed.searchParams.get("days");
          interval = parsed.searchParams.get("interval");
        } catch {
          /* ignore malformed debug URL parse */
        }
        // #region agent log
        postDebugLog({ sessionId: "0115ca", runId: "pre-fix", hypothesisId: "H3", location: "src/lib/chartFetch.ts:fetchChartJsonInner", message: "chart fetch threw error", data: { path: url.split("?")[0], id, days, interval, isHistory: isHistoryUrl(url), attempt: i, retries, bust: Boolean(bust || i > 0), error: err instanceof Error ? err.message : String(err) }, timestamp: Date.now() });
        // #endregion
      }
      lastErr = err;
      if (i < retries) {
        await sleep(100 * (i + 1));
      }
    }
  }

  if (lastFail) return lastFail;
  throw lastErr instanceof Error ? lastErr : new Error("Chart fetch failed");
}

async function runHistoryLimited<T>(fn: () => Promise<T>): Promise<T> {
  await acquireHistorySlot();
  try {
    return await fn();
  } finally {
    releaseHistorySlot();
  }
}

/** Fetch JSON with in-memory TTL cache (and browser HTTP cache when allowed). */
export async function fetchChartJson<T extends object>(
  url: string,
  opts?: { bust?: boolean; retries?: number },
): Promise<ChartJsonResult<T>> {
  if (opts?.bust) {
    mem.delete(url);
  } else {
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
  if (existing && !opts?.bust) {
    return existing as Promise<ChartJsonResult<T>>;
  }

  const retries = opts?.retries ?? (isHistoryUrl(url) ? 4 : 1);
  const bust = Boolean(opts?.bust);

  const exec = async (): Promise<ChartJsonResult<T>> => {
    try {
      if (isHistoryUrl(url)) {
        return await runHistoryLimited(() =>
          fetchChartJsonInner<T>(url, retries, bust),
        );
      }
      return await fetchChartJsonInner<T>(url, retries, bust);
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
 * Soft clamp — only correct extreme empty zoom/pan. Do NOT call this on every
 * small pan (that fights the gesture and feels stiff).
 */
export function clampLogicalRange(
  logical: { from: number; to: number },
  barCount: number,
  opts?: { rightPad?: number; minSpan?: number },
): { from: number; to: number } | null {
  if (barCount <= 0) return null;
  const rightPad = opts?.rightPad ?? 8;
  const minSpan = opts?.minSpan ?? 16;
  const maxTo = barCount - 1 + rightPad;
  const minFrom = -40;
  let from = logical.from;
  let to = logical.to;
  let span = Math.max(minSpan, to - from);

  const extremeLeft = from < minFrom;
  const extremeRight = to > maxTo + 80;
  const extremeZoom = span > barCount + rightPad + 80;
  if (!extremeLeft && !extremeRight && !extremeZoom) return null;

  if (extremeLeft) {
    from = minFrom;
    to = from + span;
  }
  if (to > maxTo + 80) {
    to = maxTo;
    from = Math.max(minFrom, to - span);
  }
  if (to - from > barCount + rightPad + 80) {
    from = 0;
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

/** History URL with a unique bust token so CDN/browser never reuse a wrong page. */
export function historyRequestUrl(baseUrl: string): string {
  const join = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${join}_ts=${Date.now()}`;
}
