"use client";

import { fmtPrice } from "@/lib/coins";
import type { LiquidityMagnet } from "@/lib/intelligence/types";

export function MagnetBoard({
  magnets,
  price,
}: {
  magnets: LiquidityMagnet[];
  price: number;
}) {
  if (!magnets.length) {
    return (
      <div className="rounded-xl border border-line bg-surface/50 p-5 text-sm text-ink-dim">
        No nearby magnets detected in this window.
      </div>
    );
  }

  const rows = magnets
    .map((m) => {
      const distancePct = price > 0 ? ((m.price - price) / price) * 100 : m.distancePct;
      return { ...m, distancePct };
    })
    .sort((a, b) => Math.abs(a.distancePct) - Math.abs(b.distancePct));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-xs leading-relaxed text-ink-dim">
          Magnets are resting liquidity and unfilled imbalances — equal highs/lows and fair-value
          gaps. Places price is likely to react, not promises.
        </p>
        <div className="shrink-0 text-xs text-ink-mute">Spot {fmtPrice(price)}</div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((m) => (
          <li
            key={`${m.kind}-${m.price}`}
            className="flex items-center gap-3 rounded-xl border border-line bg-canvas/40 px-3 py-3"
          >
            <div
              className={`h-10 w-1.5 shrink-0 rounded-full ${
                m.distancePct >= 0 ? "bg-down/80" : "bg-up/80"
              }`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold text-ink">{m.label}</span>
                <span className="shrink-0 font-display text-sm font-semibold tabular-nums">
                  {fmtPrice(m.price)}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-ink-mute">
                <span className="uppercase tracking-wider">{m.kind.replace("-", " ")}</span>
                <span>·</span>
                <span>
                  {m.distancePct >= 0 ? "+" : ""}
                  {m.distancePct.toFixed(2)}% from spot
                </span>
                <span>·</span>
                <span>strength {Math.round(m.strength)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
