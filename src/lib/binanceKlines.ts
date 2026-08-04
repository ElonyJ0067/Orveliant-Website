/**
 * Multi-page Binance klines in one serverless round-trip.
 * Binance caps each call at 1000 bars; Netlify↔browser RTT is the bottleneck,
 * so we pull several windows in parallel inside the function and merge.
 */

import { binanceGet } from "@/lib/binance";

const INTERVAL_MS: Record<string, number> = {
  "1m": 60_000,
  "3m": 180_000,
  "5m": 300_000,
  "15m": 900_000,
  "30m": 1_800_000,
  "1h": 3_600_000,
  "2h": 7_200_000,
  "4h": 14_400_000,
  "6h": 21_600_000,
  "8h": 28_800_000,
  "12h": 43_200_000,
  "1d": 86_400_000,
  "3d": 259_200_000,
  "1w": 604_800_000,
};

export const MAX_KLINE_PAGES = 3;

export function parsePagesParam(raw: string | null): number {
  const n = raw ? Number(raw) : 1;
  if (!Number.isFinite(n)) return 1;
  return Math.min(MAX_KLINE_PAGES, Math.max(1, Math.floor(n)));
}

function intervalMs(interval: string): number {
  return INTERVAL_MS[interval] ?? 3_600_000;
}

function dedupeRows(rows: unknown[][]): unknown[][] {
  const map = new Map<number, unknown[]>();
  for (const r of rows) {
    const t = Number(r[0]);
    if (!Number.isFinite(t)) continue;
    map.set(t, r);
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, r]) => r);
}

/**
 * Fetch up to `pages` consecutive kline windows (newest → older) in parallel.
 * `endTimeMs` omitted → latest window is page 0.
 * Throws if every host call fails (so routes can return retryable 503).
 */
export async function fetchBinanceKlinePages(opts: {
  symbol: string;
  interval: string;
  limit: number;
  endTimeMs?: number;
  pages?: number;
}): Promise<{ rows: unknown[][]; hasMore: boolean }> {
  const limit = Math.min(1000, Math.max(1, opts.limit));
  const pages = Math.min(
    MAX_KLINE_PAGES,
    Math.max(1, opts.pages ?? 1),
  );
  const step = limit * intervalMs(opts.interval);
  const anchor =
    opts.endTimeMs != null && Number.isFinite(opts.endTimeMs)
      ? Math.floor(opts.endTimeMs)
      : null;

  const paths = Array.from({ length: pages }, (_, i) => {
    let path =
      `/api/v3/klines?symbol=${opts.symbol}` +
      `&interval=${opts.interval}&limit=${limit}`;
    if (anchor != null) {
      path += `&endTime=${anchor - i * step}`;
    } else if (i > 0) {
      path += `&endTime=${Date.now() - i * step}`;
    }
    return path;
  });

  let anyOk = false;
  const settled = await Promise.all(
    paths.map(async (path) => {
      try {
        const res = await binanceGet(path, { cache: "no-store" });
        if (!res.ok) return [] as unknown[][];
        anyOk = true;
        return (await res.json()) as unknown[][];
      } catch {
        return [] as unknown[][];
      }
    }),
  );

  const rows = dedupeRows(settled.flat());
  if (!rows.length) {
    if (!anyOk) throw new Error("Binance unreachable");
    return { rows: [], hasMore: false };
  }

  const oldestPage = settled[settled.length - 1] ?? [];
  const hasMore = oldestPage.length >= limit;

  return { rows, hasMore };
}
