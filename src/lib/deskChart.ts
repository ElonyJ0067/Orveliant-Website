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

/**
 * First paint targets — sized to cover each TF’s default range in ONE request
 * (plus buffer) so production doesn’t wait on chained history pages.
 *   15m → 1D ≈ 96+48 · 1h → 5D ≈ 120+48 · 4h → 1M ≈ 180+48 · 1d → 3M ≈ 90+48
 */
export const INITIAL_LIMIT: Record<DeskInterval, number> = {
  "15m": 160,
  "1h": 200,
  "4h": 260,
  "1d": 160,
};

export const HISTORY_PAGE = 500;
export const MAX_BARS = 5_000;

/** Exact first-fetch size for a TF + visible range (capped at Binance 1000). */
export function initialLimitFor(interval: DeskInterval, range?: DeskRange): number {
  const rangeId = range ?? defaultRangeForInterval(interval);
  const span = DESK_RANGES.find((r) => r.id === rangeId)?.seconds ?? 5 * 86_400;
  const sec = intervalSeconds(interval);
  return Math.min(1000, Math.max(INITIAL_LIMIT[interval], Math.ceil(span / sec) + 64));
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

export function mergeBars(existing: Bar[], incoming: Bar[]): Bar[] {
  const map = new Map<number, Bar>();
  for (const b of existing) map.set(b.t, b);
  for (const b of incoming) map.set(b.t, b);
  const merged = Array.from(map.values()).sort((a, b) => a.t - b.t);
  return merged.length > MAX_BARS ? merged.slice(merged.length - MAX_BARS) : merged;
}

export function barsCoverSeconds(bars: Bar[], seconds: number): boolean {
  if (bars.length < 2) return false;
  return bars[bars.length - 1].t - bars[0].t >= seconds * 0.92;
}
