"use client";

import type { HybridCompass, RegimeGate } from "@/lib/intelligence/types";

export function HybridCompassCard({
  hybrid,
  regime,
}: {
  hybrid: HybridCompass;
  regime: RegimeGate;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
      <div className="rounded-2xl border border-gold/30 bg-gold/[0.06] p-5 sm:p-6">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-light">
          Hybrid bias
        </div>
        <div className="mt-2 font-display text-2xl font-bold capitalize text-ink sm:text-3xl">
          {hybrid.bias}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-dim">{hybrid.rationale}</p>
        <p className="mt-4 text-xs leading-relaxed text-ink-mute">
          Driven by Regime Gate <strong className="text-ink">{regime.state}</strong> (score{" "}
          {regime.score}). Unique to Orveliant’s Trading · Staking · Hybrid stack.
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-canvas/40 p-5 sm:p-6">
        <div className="mb-2 flex items-center justify-between text-sm text-ink-mute">
          <span>AI Quant Trading</span>
          <span className="font-display text-lg font-bold text-ink">{hybrid.tradingPct}%</span>
        </div>
        <div className="h-3.5 overflow-hidden rounded-full bg-surface-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-deep to-gold-bright transition-all duration-700"
            style={{ width: `${hybrid.tradingPct}%` }}
          />
        </div>

        <div className="mb-2 mt-6 flex items-center justify-between text-sm text-ink-mute">
          <span>Staking</span>
          <span className="font-display text-lg font-bold text-ink">{hybrid.stakingPct}%</span>
        </div>
        <div className="h-3.5 overflow-hidden rounded-full bg-surface-3">
          <div
            className="h-full rounded-full bg-ink-mute/50 transition-all duration-700"
            style={{ width: `${hybrid.stakingPct}%` }}
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-line bg-surface/50 px-3 py-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-ink-mute">Trading share</div>
            <div className="mt-1 font-display text-xl font-bold text-gold-light">
              {hybrid.tradingPct}%
            </div>
          </div>
          <div className="rounded-xl border border-line bg-surface/50 px-3 py-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-ink-mute">Staking share</div>
            <div className="mt-1 font-display text-xl font-bold text-ink">{hybrid.stakingPct}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
