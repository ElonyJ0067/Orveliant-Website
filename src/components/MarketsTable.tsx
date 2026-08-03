"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FALLBACK_MARKET, fmtCompact, type MarketRow } from "@/lib/coins";
import { useLivePrices } from "@/lib/useLivePrices";
import { CoinIcon } from "./CoinIcon";
import { LivePrice } from "./LivePrice";
import { Sparkline } from "./Sparkline";

function Change({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className={up ? "text-up" : "text-down"}>
      {up ? "▲" : "▼"} {Math.abs(value).toFixed(2)}%
    </span>
  );
}

export function MarketsTable({
  compact = false,
  limit,
}: {
  compact?: boolean;
  limit?: number;
}) {
  const [rows, setRows] = useState<MarketRow[]>(FALLBACK_MARKET);
  const [live, setLive] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const liveTicks = useLivePrices();

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/markets");
        const json = await res.json();
        if (active && json.rows) {
          setRows(json.rows);
          setLive(json.live);
          setUpdatedAt(json.updatedAt);
        }
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
  const shown = limit ? merged.slice(0, limit) : merged;
  const streaming = Object.keys(liveTicks).length > 0;

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 border-b border-line">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${streaming || live ? "bg-up animate-pulse-glow" : "bg-ink-mute"}`} />
          <span className="text-sm font-medium text-ink-dim">
            {streaming ? "Live · streaming in real time" : live ? "Live market data" : "Market data"}
          </span>
        </div>
        {updatedAt && (
          <span className="text-xs text-ink-mute">
            {streaming ? "Prices update every second" : `Updated ${new Date(updatedAt).toLocaleTimeString()}`}
          </span>
        )}
      </div>

      {/* Mobile card list */}
      <ul className="divide-y divide-line/60 md:hidden">
        {shown.map((r) => (
          <li key={r.id} className="px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <CoinIcon symbol={r.symbol} size={32} className="shrink-0" />
                <div className="min-w-0 leading-tight">
                  <div className="truncate font-semibold text-ink">{r.name}</div>
                  <div className="text-xs text-ink-mute">{r.symbol}</div>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="font-medium tabular-nums">
                  <LivePrice value={r.price} />
                </div>
                <div className="mt-0.5 text-sm tabular-nums">
                  <Change value={r.change24h} />
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              {!compact ? (
                <div className="text-xs text-ink-mute">
                  MCap{" "}
                  <span className="tabular-nums text-ink-dim">{fmtCompact(r.marketCap)}</span>
                  <span className="mx-1.5 text-line">·</span>
                  7d <Change value={r.change7d} />
                </div>
              ) : (
                <div className="text-xs text-ink-mute">24h change</div>
              )}
              <Sparkline
                id={r.id}
                data={r.sparkline}
                up={
                  r.sparkline.length >= 2
                    ? r.sparkline[r.sparkline.length - 1] >= r.sparkline[0]
                    : r.change7d >= 0
                }
              />
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop / tablet table */}
      <div className="relative hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-ink-mute [&>th]:px-5 [&>th]:py-3 [&>th]:font-medium [&>th]:text-xs [&>th]:uppercase [&>th]:tracking-wider">
                <th>Asset</th>
                <th className="text-right">Price</th>
                <th className="text-right">24h</th>
                {!compact && <th className="text-right">7d</th>}
                {!compact && <th className="text-right">Market Cap</th>}
                <th className="text-right">7d Chart</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-line/60 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <CoinIcon symbol={r.symbol} size={32} className="shrink-0" />
                      <div className="leading-tight">
                        <div className="font-semibold text-ink">{r.name}</div>
                        <div className="text-xs text-ink-mute">{r.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium tabular-nums">
                    <LivePrice value={r.price} />
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums">
                    <Change value={r.change24h} />
                  </td>
                  {!compact && (
                    <td className="px-5 py-3.5 text-right tabular-nums">
                      <Change value={r.change7d} />
                    </td>
                  )}
                  {!compact && (
                    <td className="px-5 py-3.5 text-right tabular-nums text-ink-dim">
                      {fmtCompact(r.marketCap)}
                    </td>
                  )}
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end">
                      <Sparkline
                        id={r.id}
                        data={r.sparkline}
                        up={
                          r.sparkline.length >= 2
                            ? r.sparkline[r.sparkline.length - 1] >= r.sparkline[0]
                            : r.change7d >= 0
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-3.5 border-t border-line">
        <p className="text-xs text-ink-mute">
          {compact ? `Showing ${shown.length} of ${rows.length} supported assets` : `${rows.length} supported assets`}
        </p>
        {compact && (
          <Link href="/markets" className="text-sm font-semibold text-gold-light hover:text-gold-bright transition-colors">
            View all markets →
          </Link>
        )}
      </div>
    </div>
  );
}
