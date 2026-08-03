import type { Bar } from "./types";

const DAY = 86_400;

/** UTC midnight (seconds) containing `t`. */
export function utcDayStart(t: number): number {
  const d = new Date(t * 1000);
  return Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 1000);
}

/** YYYY-MM-DD in UTC. */
export function utcDayLabel(dayStartSec: number): string {
  return new Date(dayStartSec * 1000).toISOString().slice(0, 10);
}

/** Monday 00:00 UTC of the ISO-style week containing `t`. */
export function utcWeekMonday(t: number): number {
  const day0 = utcDayStart(t);
  const dow = new Date(day0 * 1000).getUTCDay(); // 0=Sun … 6=Sat
  const daysFromMonday = (dow + 6) % 7;
  return day0 - daysFromMonday * DAY;
}

export function utcWeekLabel(mondaySec: number): string {
  const end = mondaySec + 6 * DAY;
  return `${utcDayLabel(mondaySec)} → ${utcDayLabel(end)} UTC`;
}

export function barsInRange(bars: Bar[], start: number, endExclusive: number): Bar[] {
  return bars.filter((b) => b.t >= start && b.t < endExclusive);
}

export type SessionSlices = {
  now: number;
  developingDayStart: number;
  developingDayLabel: string;
  developingBars: Bar[];
  priorDayStart: number;
  priorDayLabel: string;
  priorDayBars: Bar[];
  priorWeekMonday: number;
  priorWeekLabel: string;
  priorWeekBars: Bar[];
};

/**
 * Crypto desk sessions on Binance convention: UTC days / Mon–Sun weeks.
 * Structure always consumes 1h bars.
 */
export function sliceSessions(bars: Bar[], nowSec = Math.floor(Date.now() / 1000)): SessionSlices {
  const anchor = bars[bars.length - 1]?.t ?? nowSec;
  const developingDayStart = utcDayStart(Math.max(anchor, nowSec));
  const priorDayStart = developingDayStart - DAY;
  const thisWeekMonday = utcWeekMonday(developingDayStart);
  const priorWeekMonday = thisWeekMonday - 7 * DAY;

  return {
    now: nowSec,
    developingDayStart,
    developingDayLabel: utcDayLabel(developingDayStart),
    developingBars: barsInRange(bars, developingDayStart, developingDayStart + DAY),
    priorDayStart,
    priorDayLabel: utcDayLabel(priorDayStart),
    priorDayBars: barsInRange(bars, priorDayStart, developingDayStart),
    priorWeekMonday,
    priorWeekLabel: utcWeekLabel(priorWeekMonday),
    priorWeekBars: barsInRange(bars, priorWeekMonday, thisWeekMonday),
  };
}

export function sessionHighLow(bars: Bar[]): { high: number; low: number } | null {
  if (!bars.length) return null;
  return {
    high: Math.max(...bars.map((b) => b.h)),
    low: Math.min(...bars.map((b) => b.l)),
  };
}
