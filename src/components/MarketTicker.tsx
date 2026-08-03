"use client";

import { useEffect, useState } from "react";
import { FALLBACK_MARKET, fmtPrice, type MarketRow } from "@/lib/coins";
import { useLivePrices } from "@/lib/useLivePrices";

/**
 * Homepage ticker: paint fallback prices instantly, then hydrate from REST.
 * Live WebSocket attaches after a short delay so it doesn't compete with hero LCP.
 */
export function MarketTicker() {
  const [rows, setRows] = useState<MarketRow[]>(FALLBACK_MARKET);
  const [liveReady, setLiveReady] = useState(false);
  const liveTicks = useLivePrices(liveReady);

  useEffect(() => {
    let active = true;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const load = async () => {
      try {
        const res = await fetch("/api/markets");
        const json = await res.json();
        if (active && json.rows) setRows(json.rows);
      } catch {
        /* keep fallback */
      }
    };

    let idleId: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => {
      void load();
      intervalId = setInterval(load, 60_000);
    };

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(() => start(), { timeout: 2500 });
    } else {
      timer = setTimeout(start, 1200);
    }

    const liveTimer = setTimeout(() => {
      if (active) setLiveReady(true);
    }, 2800);

    return () => {
      active = false;
      if (idleId != null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timer) clearTimeout(timer);
      clearTimeout(liveTimer);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const merged = rows.map((r) => {
    const tick = liveReady ? liveTicks[r.id] : undefined;
    return tick ? { ...r, price: tick.price, change24h: tick.change24h } : r;
  });
  const items = [...merged, ...merged];

  return (
    <div
      className="relative overflow-hidden border-t border-line/80 bg-canvas/55 backdrop-blur-md"
      aria-label="Live market prices"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-canvas to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-canvas to-transparent" />
      <div className="ticker-track flex w-max animate-ticker gap-8 py-3 motion-reduce:w-full motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center">
        {items.map((r, i) => {
          const up = r.change24h >= 0;
          const clone = i >= merged.length;
          return (
            <div
              key={`${r.id}-${i}`}
              className={`flex items-center gap-2 whitespace-nowrap text-sm ${clone ? "motion-reduce:hidden" : ""}`}
              aria-hidden={clone || undefined}
            >
              <span className="font-semibold text-ink">{r.symbol}</span>
              <span className="tabular-nums text-ink-dim">{fmtPrice(r.price)}</span>
              <span className={`tabular-nums text-xs ${up ? "text-up" : "text-down"}`}>
                {up ? "+" : ""}
                {r.change24h.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
