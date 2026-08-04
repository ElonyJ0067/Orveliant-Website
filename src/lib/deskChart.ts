import type { Bar } from "@/lib/intelligence/types";

export const DESK_INTERVALS = [
  { id: "15m", binance: "15m", label: "15m", sec: 15 * 60 },
  { id: "1h", binance: "1h", label: "1H", sec: 60 * 60 },
  { id: "4h", binance: "4h", label: "4H", sec: 4 * 60 * 60 },
  { id: "1d", binance: "1d", label: "1D", sec: 24 * 60 * 60 },
] as const;

export type DeskInterval = (typeof DESK_INTERVALS)[number]["id"];

export const DESK_RANGES = [
  { id: "1D", label: "1D", seconds: 1 * 86_400 },
  { id: "5D", label: "5D", seconds: 5 * 86_400 },
  { id: "1M", label: "1M", seconds: 30 * 86_400 },
  { id: "3M", label: "3M", seconds: 90 * 86_400 },
] as const;

export type DeskRange = (typeof DESK_RANGES)[number]["id"];

/** Always pull Binance’s max page on first paint — max left-scroll without pagination. */
export const INITIAL_LIMIT: Record<DeskInterval, number> = {
  "15m": 1000,
  "1h": 1000,
  "4h": 1000,
  "1d": 1000,
};

/** Binance max kline page. */
export const HISTORY_PAGE = 1000;
export const MAX_BARS = 12_000;

/** Exact first-fetch size for a TF + visible range (capped at Binance 1000). */
export function initialLimitFor(_interval: DeskInterval, _range?: DeskRange): number {
  return 1000;
}

export function defaultRangeForInterval(interval: DeskInterval): DeskRange {
  if (interval === "15m") return "1D";
  if (interval === "1h") return "5D";
  if (interval === "4h") return "1M";
  return "3M";
}

export function intervalSeconds(interval: DeskInterval): number {
  return DESK_INTERVALS.find((i) => i.id === interval)?.sec ?? 3600;
}

export function isDeskInterval(v: string): v is DeskInterval {
  return DESK_INTERVALS.some((i) => i.id === v);
}

export function mergeBars(existing: Bar[], incoming: Bar[]): {
  bars: Bar[];
  added: number;
} {
  const map = new Map<number, Bar>();
  for (const b of existing) map.set(b.t, b);
  let added = 0;
  for (const b of incoming) {
    if (!map.has(b.t)) added += 1;
    map.set(b.t, b);
  }
  let bars = Array.from(map.values()).sort((a, b) => a.t - b.t);
  if (bars.length > MAX_BARS) {
    // Keep the newest window; if a prepend was fully clipped, added becomes 0.
    const clipped = bars.length - MAX_BARS;
    bars = bars.slice(clipped);
    added = Math.max(0, added - clipped);
  }
  return { bars, added };
}

export function barsCoverSeconds(bars: Bar[], seconds: number): boolean {
  if (bars.length < 2) return false;
  return bars[bars.length - 1].t - bars[0].t >= seconds * 0.92;
}
