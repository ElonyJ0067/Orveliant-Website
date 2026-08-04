"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineSeries,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type LogicalRange,
  type MouseEventParams,
  type Time,
} from "lightweight-charts";
import type { Bar, IntelligencePack } from "@/lib/intelligence/types";
import type { LiveKline } from "@/lib/useLiveKline";
import { COINS, fmtPrice } from "@/lib/coins";
import {
  clampLogicalRange,
  fetchChartJson,
  warmChartUrl,
} from "@/lib/chartFetch";
import {
  DESK_INTERVALS,
  DESK_RANGES,
  INITIAL_LIMIT,
  HISTORY_PAGE,
  barsCoverSeconds,
  defaultRangeForInterval,
  initialLimitFor,
  intervalSeconds,
  mergeBars,
  type DeskInterval,
  type DeskRange,
} from "@/lib/deskChart";

type Emphasis = "regime" | "structure" | "absorption" | "magnets" | "hybrid";

export type LiveFlow = {
  delta: number;
  imbalance: number;
  buyVol: number;
  sellVol: number;
  live: boolean;
  updatedAt: number;
};

type Candle = {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
};

type Hist = { time: Time; value: number; color?: string };
type LinePt = { time: Time; value: number };

/** Locked terminal height — never shrinks with scroll / width thrash. */
const CHART_HEIGHT = {
  desktop: 600,
  tablet: 520,
  mobile: 360,
} as const;

function chartHeightForWidth(w: number): number {
  if (w >= 1024) return CHART_HEIGHT.desktop;
  if (w >= 640) return CHART_HEIGHT.tablet;
  return CHART_HEIGHT.mobile;
}

/** Short axis titles so price-scale labels never clip. */
function axisLabel(label: string): string {
  if (label === "pW-POC" || label === "WPOC") return "WPOC";
  return label.length > 5 ? label.slice(0, 5) : label;
}

function fmtVol(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return n.toFixed(0);
}

function toSeries(bars: Bar[]) {
  const candles: Candle[] = [];
  const volumes: Hist[] = [];
  const pressure: Hist[] = [];
  const pulse: LinePt[] = [];

  // Rolling 12-return window kept as a ring buffer for O(1) mean/variance updates.
  const window: number[] = [];
  let sum = 0;
  let sumSq = 0;

  for (let i = 0; i < bars.length; i++) {
    const b = bars[i];
    const time = b.t as Time;
    candles.push({ time, open: b.o, high: b.h, low: b.l, close: b.c });

    const up = b.c >= b.o;
    volumes.push({
      time,
      value: b.v,
      color: up ? "rgba(53,192,122,0.45)" : "rgba(229,84,75,0.45)",
    });

    const range = Math.max(b.h - b.l, 1e-12);
    const lowerWick = Math.min(b.o, b.c) - b.l;
    const upperWick = b.h - Math.max(b.o, b.c);
    const wickBias = (lowerWick - upperWick) / range;
    const bodySign = b.c >= b.o ? 1 : -1;
    const pVal = wickBias * Math.sqrt(Math.max(b.v, 1)) * bodySign;
    pressure.push({
      time,
      value: pVal,
      color: pVal >= 0 ? "rgba(53,192,122,0.65)" : "rgba(229,84,75,0.65)",
    });

    const ret = i > 0 ? (b.c - bars[i - 1].c) / bars[i - 1].c : 0;
    window.push(ret);
    sum += ret;
    sumSq += ret * ret;
    if (window.length > 12) {
      const old = window.shift()!;
      sum -= old;
      sumSq -= old * old;
    }
    const n = window.length;
    const mean = sum / n;
    // Sample variance: (Σx² - n·mean²) / (n-1)
    const variance =
      n > 1 ? Math.max(0, (sumSq - n * mean * mean) / (n - 1)) : 0;
    const vol = Math.sqrt(variance) * 100;
    const pulseVal = Math.max(0, Math.min(100, 78 - vol * 18 + mean * 1200));
    pulse.push({ time, value: Number(pulseVal.toFixed(2)) });
  }

  return { candles, volumes, pressure, pulse };
}

async function fetchDeskBars(
  coinId: string,
  interval: DeskInterval,
  opts?: { endTimeMs?: number; limit?: number },
): Promise<{ bars: Bar[]; hasMore: boolean; retryable: boolean }> {
  const params = new URLSearchParams({
    id: coinId,
    interval,
    limit: String(opts?.limit ?? INITIAL_LIMIT[interval]),
  });
  if (opts?.endTimeMs != null) params.set("endTime", String(opts.endTimeMs));

  const url = `/api/desk-klines?${params}`;
  const { ok, json } = await fetchChartJson<{
    bars?: Bar[];
    hasMore?: boolean;
    retryable?: boolean;
    error?: string;
  }>(url, { retries: opts?.endTimeMs != null ? 4 : 2 });

  if (!ok || json.retryable) {
    const err = new Error(json.error || "Failed to load chart") as Error & {
      retryable?: boolean;
    };
    err.retryable = Boolean(json.retryable) || !ok;
    throw err;
  }

  return {
    bars: (json.bars ?? []) as Bar[],
    hasMore: Boolean(json.hasMore),
    retryable: false,
  };
}

export function DeskChart({
  coinId,
  interval,
  onIntervalChange,
  pack,
  emphasis,
  livePrice,
  liveKline,
  liveFlow,
}: {
  coinId: string;
  interval: DeskInterval;
  onIntervalChange: (interval: DeskInterval) => void;
  pack: IntelligencePack | null;
  emphasis: Emphasis;
  livePrice?: number;
  liveKline?: LiveKline | null;
  liveFlow?: LiveFlow | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const pressureRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const pulseRef = useRef<ISeriesApi<"Line"> | null>(null);
  const lastBarRef = useRef<(Candle & { volume: number }) | null>(null);
  const barsRef = useRef<Bar[]>([]);
  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);
  const viewReadyRef = useRef(false);
  const rangeRef = useRef<DeskRange>(defaultRangeForInterval(interval));
  const applyViewRef = useRef<(rangeId: DeskRange, force?: boolean) => void>(() => {});

  const [bars, setBars] = useState<Bar[]>([]);
  const [range, setRange] = useState<DeskRange>(() => defaultRangeForInterval(interval));
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Price + structure default; secondary panes opt-in (auto when tool needs them).
  const [showPressure, setShowPressure] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [showLevels, setShowLevels] = useState(true);
  const userToggled = useRef({ pressure: false, pulse: false });

  useEffect(() => {
    rangeRef.current = range;
  }, [range]);

  useEffect(() => {
    barsRef.current = bars;
  }, [bars]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    if (!userToggled.current.pressure) {
      setShowPressure(emphasis === "absorption");
    }
    if (!userToggled.current.pulse) {
      setShowPulse(emphasis === "regime" || emphasis === "hybrid");
    }
    if (emphasis === "structure" || emphasis === "regime" || emphasis === "hybrid") {
      setShowLevels(true);
    }
  }, [emphasis]);

  const [hover, setHover] = useState<{
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    pressure: number;
    pulse: number;
  } | null>(null);

  const seriesPack = useMemo(() => toSeries(bars), [bars]);

  const applyVisibleRange = useCallback((rangeId: DeskRange, force = false) => {
    const chart = chartRef.current;
    const data = barsRef.current;
    if (!chart || !data.length) return;

    const cfg = DESK_RANGES.find((r) => r.id === rangeId);
    const lastIdx = data.length - 1;
    const rightPad = 8;

    // Logical ranges never invent empty time on the left (unlike setVisibleRange
    // when zoomed out past available history — the production scroll bug).
    if (!cfg) {
      try {
        chart.timeScale().setVisibleLogicalRange({
          from: 0,
          to: lastIdx + rightPad,
        } as LogicalRange);
      } catch {
        chart.timeScale().fitContent();
      }
      viewReadyRef.current = true;
      return;
    }

    const barsNeeded = Math.ceil(cfg.seconds / intervalSeconds(interval));
    const fromIdx = Math.max(0, lastIdx - barsNeeded);
    try {
      chart.timeScale().setVisibleLogicalRange({
        from: fromIdx,
        to: lastIdx + rightPad,
      } as LogicalRange);
    } catch {
      chart.timeScale().fitContent();
    }
    candleRef.current?.priceScale().applyOptions({ autoScale: true });
    viewReadyRef.current = true;
  }, [interval]);

  applyViewRef.current = applyVisibleRange;

  const loadOlder = useCallback(async (): Promise<boolean> => {
    if (loadingMoreRef.current || !hasMoreRef.current) return false;
    const current = barsRef.current;
    if (!current.length) return false;

    const chart = chartRef.current;
    const logical = chart?.timeScale().getVisibleLogicalRange() ?? null;

    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const oldest = current[0].t;
      const { bars: older, hasMore: more } = await fetchDeskBars(coinId, interval, {
        endTimeMs: oldest * 1000 - 1,
        limit: HISTORY_PAGE,
      });
      if (!older.length) {
        setHasMore(false);
        hasMoreRef.current = false;
        return false;
      }

      const beforeLen = current.length;
      const merged = mergeBars(older, current);
      const added = merged.length - beforeLen;
      // All returned bars already known → end of exchange history for this window.
      if (added <= 0) {
        setHasMore(false);
        hasMoreRef.current = false;
        return false;
      }

      setBars(merged);
      setHasMore(more);
      hasMoreRef.current = more;
      barsRef.current = merged;

      // Keep the same candles under the cursor after prepending history.
      if (chart && logical && added > 0) {
        requestAnimationFrame(() => {
          try {
            chart.timeScale().setVisibleLogicalRange({
              from: logical.from + added,
              to: logical.to + added,
            } as LogicalRange);
          } catch {
            /* ignore */
          }
          // Re-enable autoscale so candles aren't left crushed after a bad pan.
          candleRef.current?.priceScale().applyOptions({ autoScale: true });
        });
      }

      if (more && merged.length) {
        warmChartUrl(
          `/api/desk-klines?id=${encodeURIComponent(coinId)}` +
            `&interval=${interval}&limit=${HISTORY_PAGE}` +
            `&endTime=${merged[0].t * 1000 - 1}`,
        );
      }
      return true;
    } catch {
      // Failed page — clamp so empty scroll can't crush the price scale.
      if (chart && logical) {
        const clamped = clampLogicalRange(logical, barsRef.current.length, {
          rightPad: 8,
        });
        if (clamped) {
          try {
            chart.timeScale().setVisibleLogicalRange(clamped as LogicalRange);
          } catch {
            /* ignore */
          }
        }
        candleRef.current?.priceScale().applyOptions({ autoScale: true });
      }
      return false;
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [coinId, interval]);

  const loadOlderRef = useRef(loadOlder);
  loadOlderRef.current = loadOlder;
  const autoFillPagesRef = useRef(0);
  const autoFillFailsRef = useRef(0);

  // Initial / interval / coin history load.
  useEffect(() => {
    let cancelled = false;
    viewReadyRef.current = false;
    autoFillPagesRef.current = 0;
    autoFillFailsRef.current = 0;
    setChartLoading(true);
    setChartError("");
    setBars([]);
    setHasMore(true);
    barsRef.current = [];
    hasMoreRef.current = true;

    const nextDefault = defaultRangeForInterval(interval);
    setRange(nextDefault);
    rangeRef.current = nextDefault;

    (async () => {
      try {
        const { bars: next, hasMore: more } = await fetchDeskBars(coinId, interval, {
          limit: initialLimitFor(interval, nextDefault),
        });
        if (cancelled) return;
        if (!next.length) throw new Error("No chart history returned");
        setBars(next);
        setHasMore(more);
        barsRef.current = next;
        hasMoreRef.current = more;

        // Prefetch first older page so scroll-back is ready after first paint.
        if (more && next.length) {
          const warm = () =>
            warmChartUrl(
              `/api/desk-klines?id=${encodeURIComponent(coinId)}` +
                `&interval=${interval}&limit=${HISTORY_PAGE}` +
                `&endTime=${next[0].t * 1000 - 1}`,
            );
          if (typeof requestIdleCallback === "function") {
            requestIdleCallback(warm, { timeout: 1200 });
          } else {
            window.setTimeout(warm, 400);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setChartError(err instanceof Error ? err.message : "Failed to load chart");
        }
      } finally {
        if (!cancelled) setChartLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [coinId, interval]);

  // Keep fetching older pages until the selected range is covered (or history ends).
  useEffect(() => {
    if (chartLoading || loadingMore || !bars.length || !hasMore) return;
    const cfg = DESK_RANGES.find((r) => r.id === range);
    if (!cfg || barsCoverSeconds(bars, cfg.seconds)) return;
    if (autoFillPagesRef.current >= 10) return;
    if (autoFillFailsRef.current >= 5) return;
    let cancelled = false;
    (async () => {
      // Brief pause after a miss so Netlify/Binance can recover before the next page.
      if (autoFillFailsRef.current > 0) {
        await new Promise((r) => setTimeout(r, 600 * autoFillFailsRef.current));
      }
      if (cancelled) return;
      const ok = await loadOlder();
      if (cancelled) return;
      if (ok) {
        autoFillPagesRef.current += 1;
        autoFillFailsRef.current = 0;
      } else {
        autoFillFailsRef.current += 1;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bars, range, hasMore, chartLoading, loadingMore, loadOlder]);

  // Recreate chart when pane layout changes so heights stay locked & correct.
  useEffect(() => {
    if (!containerRef.current) return;

    const w0 = containerRef.current.clientWidth || 640;
    const h0 = chartHeightForWidth(w0);

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#9aa0a8",
        fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
        fontSize: 12,
        attributionLogo: false,
        panes: {
          separatorColor: "rgba(35,39,47,0.95)",
          separatorHoverColor: "rgba(201,162,39,0.28)",
          enableResize: false,
        },
      },
      grid: {
        vertLines: { color: "rgba(35,39,47,0.28)" },
        horzLines: { color: "rgba(35,39,47,0.5)" },
      },
      rightPriceScale: {
        borderVisible: false,
        minimumWidth: 84,
        entireTextOnly: true,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 8,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "rgba(201,162,39,0.4)",
          labelBackgroundColor: "#c9a227",
          width: 1,
          style: 2,
        },
        horzLine: {
          color: "rgba(201,162,39,0.4)",
          labelBackgroundColor: "#c9a227",
          width: 1,
          style: 2,
        },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
        axisPressedMouseMove: { time: true, price: true },
        axisDoubleClickReset: { time: true, price: true },
      },
      autoSize: true,
      height: h0,
    });

    let paneIdx = 0;
    const candles = chart.addSeries(
      CandlestickSeries,
      {
        upColor: "#35c07a",
        downColor: "#e5544b",
        borderVisible: false,
        wickUpColor: "#35c07a",
        wickDownColor: "#e5544b",
      },
      paneIdx,
    );
    candles.priceScale().applyOptions({
      autoScale: true,
      scaleMargins: { top: 0.06, bottom: showPressure || showPulse ? 0.1 : 0.14 },
      borderVisible: false,
    });

    const volume = chart.addSeries(
      HistogramSeries,
      {
        priceFormat: { type: "volume" },
        priceScaleId: "",
      },
      paneIdx,
    );
    volume.priceScale().applyOptions({
      scaleMargins: { top: 0.78, bottom: 0 },
    });

    let pressure: ISeriesApi<"Histogram"> | null = null;
    if (showPressure) {
      paneIdx += 1;
      pressure = chart.addSeries(
        HistogramSeries,
        {
          priceFormat: { type: "price", precision: 2, minMove: 0.01 },
        },
        paneIdx,
      );
    }

    let pulse: ISeriesApi<"Line"> | null = null;
    if (showPulse) {
      paneIdx += 1;
      pulse = chart.addSeries(
        LineSeries,
        {
          color: "#e8ce78",
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: true,
          crosshairMarkerVisible: true,
        },
        paneIdx,
      );
      pulse.createPriceLine({
        price: 50,
        color: "rgba(125,130,139,0.45)",
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: false,
        title: "",
      });
      pulse.createPriceLine({
        price: 70,
        color: "rgba(53,192,122,0.3)",
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: false,
        title: "",
      });
      pulse.createPriceLine({
        price: 35,
        color: "rgba(229,84,75,0.3)",
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: false,
        title: "",
      });
    }

    chartRef.current = chart;
    candleRef.current = candles;
    volumeRef.current = volume;
    pressureRef.current = pressure;
    pulseRef.current = pulse;
    viewReadyRef.current = false;

    const applyLayout = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || chartHeightForWidth(w);
      // autoSize owns width — only sync height + pane splits (avoids scroll thrash).
      chart.applyOptions({ height: h });

      const panes = chart.panes();
      const extras = (showPressure ? 1 : 0) + (showPulse ? 1 : 0);
      if (extras === 0) {
        if (panes[0]) panes[0].setHeight(h);
      } else if (extras === 1) {
        if (panes[0]) panes[0].setHeight(Math.round(h * 0.78));
        if (panes[1]) panes[1].setHeight(Math.round(h * 0.2));
      } else {
        if (panes[0]) panes[0].setHeight(Math.round(h * 0.62));
        if (panes[1]) panes[1].setHeight(Math.round(h * 0.18));
        if (panes[2]) panes[2].setHeight(Math.round(h * 0.16));
      }
    };
    applyLayout();

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    let lastW = containerRef.current.clientWidth;
    let lastH = containerRef.current.clientHeight;
    const ro = new ResizeObserver(() => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      // Ignore tiny thrash from page scroll / subpixel reflow.
      if (Math.abs(w - lastW) < 2 && Math.abs(h - lastH) < 2) return;
      lastW = w;
      lastH = h;
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const logical = chart.timeScale().getVisibleLogicalRange();
        applyLayout();
        if (logical) {
          requestAnimationFrame(() => {
            try {
              chart.timeScale().setVisibleLogicalRange(logical);
            } catch {
              /* ignore */
            }
          });
        }
      }, 50);
    });
    ro.observe(containerRef.current);

    const onMove = (param: MouseEventParams<Time>) => {
      if (!param.time || !param.seriesData.size) {
        setHover(null);
        return;
      }
      const c = param.seriesData.get(candles) as Candle | undefined;
      const v = param.seriesData.get(volume) as { value: number } | undefined;
      const p = pressure
        ? (param.seriesData.get(pressure) as { value: number } | undefined)
        : undefined;
      const pu = pulse
        ? (param.seriesData.get(pulse) as { value: number } | undefined)
        : undefined;
      if (!c) {
        setHover(null);
        return;
      }
      setHover({
        o: c.open,
        h: c.high,
        l: c.low,
        c: c.close,
        v: v?.value ?? 0,
        pressure: p?.value ?? 0,
        pulse: pu?.value ?? 0,
      });
    };
    chart.subscribeCrosshairMove(onMove);

    const onLogical = (logical: LogicalRange | null) => {
      if (!logical) return;

      const n = barsRef.current.length;
      if (n > 0) {
        const clamped = clampLogicalRange(logical, n, {
          rightPad: 8,
          minSpan: 20,
        });
        if (clamped) {
          try {
            chart.timeScale().setVisibleLogicalRange(clamped as LogicalRange);
          } catch {
            /* ignore */
          }
          candleRef.current?.priceScale().applyOptions({ autoScale: true });
          // Left-edge clamp used to return before loadOlder — that stranded prod.
          if (hasMoreRef.current && !loadingMoreRef.current && clamped.from < 14) {
            void loadOlderRef.current();
          }
          return;
        }
      }

      if (loadingMoreRef.current || !hasMoreRef.current) return;
      if (logical.from < 14) {
        void loadOlderRef.current();
      }
    };
    chart.timeScale().subscribeVisibleLogicalRangeChange(onLogical);

    // Re-paint current bars after pane recreate without resetting a ready view
    // unless this is a fresh coin/interval load (viewReady false).
    if (barsRef.current.length) {
      const sp = toSeries(barsRef.current);
      candles.setData(sp.candles);
      volume.setData(sp.volumes);
      if (pressure) pressure.setData(sp.pressure);
      if (pulse) pulse.setData(sp.pulse);
      const last = barsRef.current[barsRef.current.length - 1];
      lastBarRef.current = last
        ? {
            time: last.t as Time,
            open: last.o,
            high: last.h,
            low: last.l,
            close: last.c,
            volume: last.v,
          }
        : null;
      requestAnimationFrame(() => applyViewRef.current(rangeRef.current, true));
    }

    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(onLogical);
      chart.unsubscribeCrosshairMove(onMove);
      if (resizeTimer) clearTimeout(resizeTimer);
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      volumeRef.current = null;
      pressureRef.current = null;
      pulseRef.current = null;
    };
  }, [showPressure, showPulse]);

  // Push series data; only set visible range on first paint for this dataset.
  // History prepends adjust the logical range inside loadOlder — do not reset zoom here.
  useEffect(() => {
    const candles = candleRef.current;
    const volume = volumeRef.current;
    const pressure = pressureRef.current;
    const pulse = pulseRef.current;
    const chart = chartRef.current;
    if (!candles || !volume || !chart || !seriesPack.candles.length) return;

    candles.setData(seriesPack.candles);
    volume.setData(seriesPack.volumes);
    if (pressure) pressure.setData(seriesPack.pressure);
    if (pulse) pulse.setData(seriesPack.pulse);

    const last = bars[bars.length - 1];
    lastBarRef.current = last
      ? {
          time: last.t as Time,
          open: last.o,
          high: last.h,
          low: last.l,
          close: last.c,
          volume: last.v,
        }
      : null;

    if (!viewReadyRef.current) {
      requestAnimationFrame(() => applyVisibleRange(rangeRef.current, true));
    }
  }, [seriesPack, bars, applyVisibleRange]);

  // Structure / magnet / absorption levels from the 1h intelligence pack.
  useEffect(() => {
    const candles = candleRef.current;
    if (!candles) return;

    const anySeries = candles as unknown as {
      __ovLines?: ReturnType<ISeriesApi<"Candlestick">["createPriceLine"]>[];
    };
    anySeries.__ovLines?.forEach((l) => candles.removePriceLine(l));
    anySeries.__ovLines = [];

    if (!pack) return;

    const addLine = (price: number, color: string, title: string, style: 0 | 2 = 2) => {
      const line = candles.createPriceLine({
        price,
        color,
        lineWidth: 1,
        lineStyle: style,
        axisLabelVisible: true,
        title: axisLabel(title),
      });
      anySeries.__ovLines!.push(line);
    };

    const drawStructure =
      showLevels ||
      emphasis === "structure" ||
      emphasis === "regime" ||
      emphasis === "hybrid";

    if (drawStructure && emphasis !== "magnets" && emphasis !== "absorption") {
      for (const lvl of pack.structure.levels) {
        const color =
          lvl.kind === "poc"
            ? "#e8ce78"
            : lvl.kind === "vah" || lvl.kind === "val"
              ? "rgba(201,162,39,0.8)"
              : "rgba(182,186,193,0.55)";
        addLine(lvl.price, color, lvl.label);
      }
    }
    if (emphasis === "magnets") {
      pack.magnets.slice(0, 6).forEach((m) => {
        const color =
          m.kind === "fvg-bull" || m.kind === "equal-lows"
            ? "rgba(53,192,122,0.75)"
            : "rgba(229,84,75,0.75)";
        addLine(m.price, color, m.kind.includes("fvg") ? "FVG" : "POOL", 2);
      });
    }
    if (emphasis === "absorption") {
      pack.absorptions.slice(0, 5).forEach((e) => {
        addLine(
          e.levelBroken,
          e.type === "LBAF" ? "rgba(53,192,122,0.85)" : "rgba(229,84,75,0.85)",
          e.type,
          0,
        );
      });
    }
  }, [pack, emphasis, showLevels, showPressure, showPulse, seriesPack.candles.length]);

  // Live forming candle — never resets the time scale.
  useEffect(() => {
    const series = candleRef.current;
    const vol = volumeRef.current;
    const pressure = pressureRef.current;
    const last = lastBarRef.current;
    if (!series || !last) return;

    let next = { ...last };

    if (liveKline && liveKline.interval === interval && Number.isFinite(liveKline.c)) {
      const lastT = Number(last.time);
      if (liveKline.t > lastT) {
        // New candle opened — append without touching the time scale.
        next = {
          time: liveKline.t as Time,
          open: liveKline.o,
          high: liveKline.h,
          low: liveKline.l,
          close: liveKline.c,
          volume: liveKline.v,
        };
      } else if (
        liveKline.t === lastT ||
        Math.abs(liveKline.c - last.close) / Math.max(last.close, 1) < 0.08
      ) {
        const sameBar = liveKline.t === lastT;
        next = {
          time: (sameBar ? liveKline.t : last.time) as Time,
          open: sameBar ? liveKline.o : last.open,
          high: sameBar ? liveKline.h : Math.max(last.high, liveKline.c),
          low: sameBar ? liveKline.l : Math.min(last.low, liveKline.c),
          close: liveKline.c,
          volume: sameBar ? liveKline.v : last.volume,
        };
      }
    } else if (livePrice != null && Number.isFinite(livePrice)) {
      if (last.close > 0 && Math.abs(livePrice - last.close) / last.close > 0.08) return;
      next = {
        ...last,
        close: livePrice,
        high: Math.max(last.high, livePrice),
        low: Math.min(last.low, livePrice),
      };
    } else {
      return;
    }

    lastBarRef.current = next;
    series.update({
      time: next.time,
      open: next.open,
      high: next.high,
      low: next.low,
      close: next.close,
    });

    if (vol) {
      vol.update({
        time: next.time,
        value: next.volume,
        color:
          next.close >= next.open
            ? "rgba(53,192,122,0.45)"
            : "rgba(229,84,75,0.45)",
      });
    }

    // Pressure pane stays on the wick model — 5m aggressor flow is shown separately.
  }, [liveKline, livePrice, interval]);

  const onPickRange = (id: DeskRange) => {
    setRange(id);
    rangeRef.current = id;
    applyVisibleRange(id, true);
    const data = barsRef.current;
    const cfg = DESK_RANGES.find((r) => r.id === id);
    if (cfg && !barsCoverSeconds(data, cfg.seconds) && hasMoreRef.current) {
      void loadOlder();
    }
  };

  const last = bars[bars.length - 1];
  const ohlc = hover ?? {
    o: liveKline?.o ?? last?.o ?? 0,
    h: liveKline?.h ?? last?.h ?? 0,
    l: liveKline?.l ?? last?.l ?? 0,
    c: liveKline?.c ?? livePrice ?? last?.c ?? 0,
    v: liveKline?.v ?? last?.v ?? 0,
    pressure: seriesPack.pressure[seriesPack.pressure.length - 1]?.value ?? 0,
    pulse: seriesPack.pulse[seriesPack.pulse.length - 1]?.value ?? 0,
  };
  const up = ohlc.c >= ohlc.o;
  const flowLive = Boolean(liveFlow?.live);
  const klineLive = Boolean(liveKline && liveKline.interval === interval);
  const tfLabel = DESK_INTERVALS.find((i) => i.id === interval)?.label ?? interval;
  const coinMeta = COINS.find((c) => c.id === coinId);
  const pair = pack?.provenance?.pair ?? coinMeta?.binance ?? `${pack?.symbol ?? coinMeta?.symbol ?? "—"}USDT`;
  const valueSession = pack?.structure.methodology?.valueAreaSession ?? "UTC session";

  const toggleBtn = (on: boolean) =>
    on
      ? "border-gold/40 bg-gold/[0.08] text-gold-light"
      : "border-line/80 text-ink-mute hover:border-line hover:text-ink-dim";

  const segBtn = (on: boolean) =>
    on
      ? "border-gold/45 bg-gold/[0.1] text-gold-light"
      : "border-transparent text-ink-mute hover:text-ink-dim";

  return (
    <div className="relative min-w-0 space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="-mx-0.5 flex gap-1.5 overflow-x-auto px-0.5 pb-0.5 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
            <span
              className="shrink-0 rounded border border-line px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-dim"
              title="Exchange OHLC from Binance spot klines"
            >
              Exchange · {pair} · {tfLabel}
            </span>
            <span
              className="hidden shrink-0 rounded border border-gold/35 bg-gold/[0.06] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-light sm:inline"
              title={`Structure Atlas from Binance 1h UTC sessions. Value area: ${valueSession}`}
            >
              Structure · 1H
            </span>
            {klineLive && (
              <span className="shrink-0 rounded border border-up/30 bg-up/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-up">
                Live
              </span>
            )}
            {flowLive && (
              <span
                className="hidden shrink-0 rounded border border-line/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-mute sm:inline"
                title="Binance aggTrades aggressor flow, last 5 minutes"
              >
                Flow 5m
              </span>
            )}
            {loadingMore && (
              <span className="shrink-0 rounded border border-line/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-mute">
                History…
              </span>
            )}

            <span className="mx-0.5 hidden h-3 w-px shrink-0 bg-line sm:inline-block" aria-hidden />

            <button
              type="button"
              onClick={() => setShowLevels((v) => !v)}
              title="Session levels: PDH/PDL, POC/VAH/VAL, WPOC"
              className={`shrink-0 rounded border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${toggleBtn(showLevels)}`}
            >
              Levels
            </button>
            <button
              type="button"
              onClick={() => {
                userToggled.current.pressure = true;
                setShowPressure((v) => !v);
              }}
              title="Orveliant Pressure — wick rejection bias × √volume"
              className={`shrink-0 rounded border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${toggleBtn(showPressure)}`}
            >
              Pressure
            </button>
            <button
              type="button"
              onClick={() => {
                userToggled.current.pulse = true;
                setShowPulse((v) => !v);
              }}
              title="Orveliant Regime Pulse — calm/stress score, not RSI"
              className={`shrink-0 rounded border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${toggleBtn(showPulse)}`}
            >
              Pulse
            </button>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div
              className="inline-flex max-w-full overflow-x-auto rounded-lg border border-line/80 bg-canvas/50 p-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="group"
              aria-label="Chart timeframe"
            >
              {DESK_INTERVALS.map((tf) => (
                <button
                  key={tf.id}
                  type="button"
                  onClick={() => onIntervalChange(tf.id)}
                  className={`shrink-0 rounded-md border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors sm:px-2 sm:py-1 ${segBtn(interval === tf.id)}`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
            <div
              className="inline-flex max-w-full overflow-x-auto rounded-lg border border-line/80 bg-canvas/50 p-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="group"
              aria-label="Visible range"
            >
              {DESK_RANGES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onPickRange(r.id)}
                  className={`shrink-0 rounded-md border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors sm:px-2 sm:py-1 ${segBtn(range === r.id)}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-[11px] sm:gap-x-3.5 sm:text-[13px]">
            <span className="text-ink-mute">
              O <span className="tabular-nums text-ink">{fmtPrice(ohlc.o)}</span>
            </span>
            <span className="text-ink-mute">
              H <span className="tabular-nums text-ink">{fmtPrice(ohlc.h)}</span>
            </span>
            <span className="text-ink-mute">
              L <span className="tabular-nums text-ink">{fmtPrice(ohlc.l)}</span>
            </span>
            <span className="text-ink-mute">
              C{" "}
              <span className={`tabular-nums font-semibold ${up ? "text-up" : "text-down"}`}>
                {fmtPrice(ohlc.c)}
              </span>
            </span>
            <span className="text-ink-mute">
              Vol <span className="tabular-nums text-ink-dim">{fmtVol(ohlc.v)}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-left text-xs text-ink-mute sm:text-right lg:justify-end">
          {showPressure && (
            <div title="Orveliant Pressure (wick model)">
              <div className="text-[10px] uppercase tracking-[0.14em]">Pressure</div>
              <div
                className={`mt-0.5 font-display text-base font-semibold tabular-nums ${
                  ohlc.pressure >= 0 ? "text-up" : "text-down"
                }`}
              >
                {ohlc.pressure >= 0 ? "+" : ""}
                {ohlc.pressure.toFixed(1)}
              </div>
            </div>
          )}
          {flowLive && liveFlow && (
            <div title="Exchange aggressor delta · Binance aggTrades · 5m">
              <div className="text-[10px] uppercase tracking-[0.14em]">5m Δ</div>
              <div
                className={`mt-0.5 font-display text-base font-semibold tabular-nums ${
                  liveFlow.delta >= 0 ? "text-up" : "text-down"
                }`}
              >
                {liveFlow.delta >= 0 ? "+" : ""}
                {fmtVol(Math.abs(liveFlow.delta))}
              </div>
            </div>
          )}
          {showPulse && (
            <div title="Orveliant Regime Pulse (not RSI)">
              <div className="text-[10px] uppercase tracking-[0.14em]">Pulse</div>
              <div className="mt-0.5 font-display text-base font-semibold tabular-nums text-gold-light">
                {ohlc.pulse.toFixed(1)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        {(chartLoading || chartError) && (
          <div className="absolute inset-0 z-10 grid place-items-center rounded-xl border border-line/80 bg-[#07080a]/92">
            {chartError ? (
              <p className="px-4 text-center text-sm text-down">{chartError}</p>
            ) : (
              <p className="text-sm text-ink-mute">Loading chart history…</p>
            )}
          </div>
        )}
        <div
          ref={containerRef}
          className="h-[360px] w-full min-w-0 overflow-hidden rounded-xl border border-line/80 bg-[#07080a] sm:h-[520px] lg:h-[600px]"
        />
      </div>
    </div>
  );
}
