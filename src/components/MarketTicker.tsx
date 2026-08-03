"use client";

import { useEffect, useState } from "react";
import { FALLBACK_MARKET, fmtPrice, type MarketRow } from "@/lib/coins";
import { useLivePrices } from "@/lib/useLivePrices";

export function MarketTicker() {
  const [rows, setRows] = useState<MarketRow[]>(FALLBACK_MARKET);
  const liveTicks = useLivePrices();

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/markets", { cache: "no-store" });
        const json = await res.json();
        if (active && json.rows) setRows(json.rows);
      } catch {
        /* keep fallback */
      }
    };
    load();
    const t = setInterval(load, 60_000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  const merged = rows.map((r) => {
    const tick = liveTicks[r.id];
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
          // Duplicate strip is for seamless scroll; hide the clone from assistive tech.
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
