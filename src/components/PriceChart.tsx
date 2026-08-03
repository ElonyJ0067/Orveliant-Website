"use client";

import { useEffect, useRef, useState } from "react";
import {
  AreaSeries,
  ColorType,
  CrosshairMode,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from "lightweight-charts";
import { fmtPrice } from "@/lib/coins";
import { useLivePrices } from "@/lib/useLivePrices";
import { LivePrice } from "./LivePrice";

const RANGES = [
  { label: "1H", days: "1h" },
  { label: "24H", days: "1" },
  { label: "7D", days: "7" },
  { label: "1M", days: "30" },
  { label: "3M", days: "90" },
  { label: "1Y", days: "365" },
  { label: "ALL", days: "max" },
] as const;

const STABLES = new Set(["tether", "usd-coin"]);

const UP = { line: "#35c07a", top: "rgba(53,192,122,0.28)", bottom: "rgba(53,192,122,0.02)" };
const DOWN = { line: "#e5544b", top: "rgba(229,84,75,0.28)", bottom: "rgba(229,84,75,0.02)" };

type Point = { time: Time; value: number };
type Tip = { x: number; y: number; time: number; value: number } | null;

function formatAxisTime(t: number, days: string): string {
  const d = new Date(t * 1000);
  if (days === "1h" || days === "1") {
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (days === "7" || days === "30") {
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: days === "7" ? "2-digit" : undefined,
    });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function PriceChart({
  id,
  symbol,
  color,
}: {
  id: string;
  symbol: string;
  color?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const lastTimeRef = useRef<Time | null>(null);
  const dataRef = useRef<Point[]>([]);
  const daysRef = useRef("7");

  const [days, setDays] = useState("7");
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [periodChange, setPeriodChange] = useState(0);
  const [hoverPrice, setHoverPrice] = useState<number | null>(null);
  const [tip, setTip] = useState<Tip>(null);
  const [high, setHigh] = useState(0);
  const [low, setLow] = useState(0);

  daysRef.current = days;

  const ticks = useLivePrices();
  const tick = ticks[id];
  const up = periodChange >= 0;
  const palette = up ? UP : DOWN;

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#7d828b",
        fontFamily: "var(--font-inter), system-ui, sans-serif",
        fontSize: 11,
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: "rgba(35,39,47,0.55)", style: 1 },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.12, bottom: 0.08 },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 4,
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: {
          color: "rgba(246,241,230,0.22)",
          width: 1,
          style: 2,
          labelVisible: false,
        },
        horzLine: {
          color: "rgba(246,241,230,0.22)",
          width: 1,
          style: 2,
          labelBackgroundColor: "#1b1f27",
        },
      },
      autoSize: true,
      handleScale: { axisPressedMouseMove: true, mouseWheel: false, pinch: true },
      handleScroll: { mouseWheel: false, pressedMouseMove: true, horzTouchDrag: true },
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: UP.line,
      topColor: UP.top,
      bottomColor: UP.bottom,
      lineWidth: 2,
      priceLineVisible: true,
      lastValueVisible: true,
      crosshairMarkerRadius: 5,
      crosshairMarkerBorderColor: "#08090b",
      crosshairMarkerBorderWidth: 2,
      crosshairMarkerBackgroundColor: UP.line,
    });

    chart.subscribeCrosshairMove((param) => {
      if (!param.point || !param.time || !seriesRef.current || !containerRef.current) {
        setTip(null);
        setHoverPrice(null);
        return;
      }
      const raw = param.seriesData.get(seriesRef.current);
      if (!raw || typeof (raw as { value?: number }).value !== "number") {
        setTip(null);
        setHoverPrice(null);
        return;
      }
      const value = (raw as { value: number }).value;
      const time =
        typeof param.time === "number"
          ? param.time
          : Math.floor(new Date(String(param.time)).getTime() / 1000);
      const rect = containerRef.current.getBoundingClientRect();
      const pad = 12;
      const tipW = 148;
      const tipH = 54;
      let x = param.point.x + 14;
      let y = param.point.y - tipH - 8;
      if (x + tipW > rect.width - pad) x = param.point.x - tipW - 14;
      if (y < pad) y = param.point.y + 16;
      setHoverPrice(value);
      setTip({ x, y, time, value });
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current) return;
    seriesRef.current.applyOptions({
      lineColor: palette.line,
      topColor: palette.top,
      bottomColor: palette.bottom,
      crosshairMarkerBackgroundColor: palette.line,
      priceLineColor: palette.line,
    });
  }, [palette.line, palette.top, palette.bottom]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setTip(null);
    setHoverPrice(null);

    fetch(`/api/chart?id=${encodeURIComponent(id)}&days=${encodeURIComponent(days)}`)
      .then((r) => r.json())
      .then((json) => {
        if (!active || !seriesRef.current) return;
        const data: Point[] = (json.series ?? []).map(
          (d: { time: number; value: number }) => ({
            time: d.time as Time,
            value: d.value,
          }),
        );
        dataRef.current = data;
        seriesRef.current.setData(data);
        lastTimeRef.current = data.length ? data[data.length - 1].time : null;

        if (data.length >= 2) {
          const first = data[0].value;
          const last = data[data.length - 1].value;
          setPeriodChange(first > 0 ? ((last - first) / first) * 100 : 0);
          let hi = -Infinity;
          let lo = Infinity;
          for (const p of data) {
            if (p.value > hi) hi = p.value;
            if (p.value < lo) lo = p.value;
          }
          setHigh(hi);
          setLow(lo);
        } else {
          setPeriodChange(0);
          setHigh(0);
          setLow(0);
        }

        chartRef.current?.timeScale().fitContent();
        setLive(Boolean(json.live));
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, days]);

  // Live tip — skip stables (chart is true USD; Binance USDCUSDT tip would distort it).
  useEffect(() => {
    if (!tick || !seriesRef.current || lastTimeRef.current == null) return;
    if (STABLES.has(id)) return;
    const last = dataRef.current[dataRef.current.length - 1];
    if (!last) return;
    // Guard against wild jumps when sources briefly disagree.
    if (last.value > 0 && Math.abs(tick.price - last.value) / last.value > 0.08) return;
    seriesRef.current.update({ time: lastTimeRef.current, value: tick.price });
  }, [tick, id]);

  const streaming = !!tick;
  const displayPrice = hoverPrice ?? tick?.price;
  const rangeLabel = RANGES.find((r) => r.days === days)?.label ?? days;

  return (
    <div className="card overflow-hidden p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {color && (
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
            )}
            <span className="font-display text-lg font-semibold tracking-tight">
              {symbol}
              <span className="text-ink-mute"> / USD</span>
            </span>
            <span
              className={`h-2 w-2 rounded-full ${streaming || live ? "bg-up animate-pulse-glow" : "bg-ink-mute"}`}
            />
            <span className="text-xs text-ink-mute">
              {streaming ? "Live" : live ? "Market data" : "Sample"}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-end gap-3">
            <span className="font-display text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">
              {displayPrice != null ? (
                hoverPrice != null ? (
                  fmtPrice(hoverPrice)
                ) : tick ? (
                  <LivePrice value={tick.price} />
                ) : (
                  "—"
                )
              ) : (
                "—"
              )}
            </span>
            <span
              className={`mb-1 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums ${
                up ? "bg-up/15 text-up" : "bg-down/15 text-down"
              }`}
            >
              {up ? "▲" : "▼"} {Math.abs(periodChange).toFixed(2)}%
              <span className="font-medium text-ink-mute">({rangeLabel})</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-0.5 rounded-xl border border-line bg-surface/60 p-1">
          {RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              onClick={() => setDays(r.days)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                days === r.days
                  ? "bg-surface-3 text-ink shadow-sm"
                  : "text-ink-mute hover:text-ink"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        <Stat label={`${rangeLabel} High`} value={high ? fmtPrice(high) : "—"} />
        <Stat label={`${rangeLabel} Low`} value={low ? fmtPrice(low) : "—"} />
        <Stat label="Last" value={tick ? fmtPrice(tick.price) : "—"} />
        <Stat
          label="24h Change"
          value={
            tick
              ? `${tick.change24h >= 0 ? "+" : ""}${tick.change24h.toFixed(2)}%`
              : "—"
          }
          tone={tick ? (tick.change24h >= 0 ? "up" : "down") : undefined}
        />
      </div>

      <div className="relative">
        <div
          ref={containerRef}
          className="h-[320px] w-full touch-pan-y sm:h-[400px]"
          onMouseLeave={() => {
            setTip(null);
            setHoverPrice(null);
          }}
        />

        {tip && (
          <div
            className="pointer-events-none absolute z-10 min-w-[140px] rounded-lg border border-line bg-surface-2/95 px-3 py-2 shadow-card backdrop-blur-sm"
            style={{ left: tip.x, top: tip.y }}
          >
            <div className="text-[11px] text-ink-mute">
              {formatAxisTime(tip.time, daysRef.current)}
            </div>
            <div className="mt-0.5 font-display text-sm font-semibold tabular-nums">
              {fmtPrice(tip.value)}
            </div>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 grid place-items-center rounded-lg bg-canvas/40 text-sm text-ink-mute backdrop-blur-[1px]">
            Loading chart…
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "up" | "down";
}) {
  const valueColor =
    tone === "up" ? "var(--color-up)" : tone === "down" ? "var(--color-down)" : "var(--color-ink)";

  return (
    <div className="rounded-xl border border-line/80 bg-surface/40 px-3 py-2.5 sm:px-4">
      <div className="text-[10px] font-medium uppercase tracking-wider text-ink-dim sm:text-[11px]">
        {label}
      </div>
      <div
        className="mt-0.5 text-sm font-semibold tabular-nums sm:text-base"
        style={{ color: valueColor }}
      >
        {value}
      </div>
    </div>
  );
}
