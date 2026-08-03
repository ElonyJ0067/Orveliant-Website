"use client";

import type { RegimeGate } from "@/lib/intelligence/types";

const STATE_STYLE = {
  OPEN: "border-up/40 bg-up/10 text-up",
  TIGHTENED: "border-gold/40 bg-gold/10 text-gold-light",
  CLOSED: "border-down/40 bg-down/10 text-down",
} as const;

export function RegimeGateCard({ regime }: { regime: RegimeGate }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className={`rounded-2xl border p-5 sm:p-6 ${STATE_STYLE[regime.state]}`}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-80">
            Regime Gate
          </div>
          <div className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {regime.state}
          </div>
          <p className="mt-3 max-w-xl text-sm leading-relaxed opacity-90">{regime.productHint}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Metric label="Permission score" value={`${regime.score}/100`} />
          <Metric label="Vol percentile" value={`${regime.volatilityPctile}th`} />
          <Metric label="Trend clarity" value={`${regime.trendStrength}`} />
          <Metric label="Local drawdown" value={`${regime.drawdownPct}%`} />
        </div>
      </div>

      <div>
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
          Why this gate
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {regime.reasons.map((r) => (
            <li
              key={r}
              className="rounded-lg border border-line bg-surface/50 px-3 py-2.5 text-xs leading-relaxed text-ink-dim"
            >
              {r}
            </li>
          ))}
        </ul>
      </div>

      {regime.inputs && (
        <div className="rounded-xl border border-line/80 bg-canvas/30 px-3 py-3 sm:px-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
            Auditable inputs · 1h structure
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-dim">
            <span>Vol %ile {regime.inputs.volatilityPctile}</span>
            <span>Trend {regime.inputs.trendStrength}</span>
            <span>DD {regime.inputs.drawdownPct}%</span>
            <span>LBAF {regime.inputs.recentLbaf}</span>
            <span>LAAF {regime.inputs.recentLaaf}</span>
            <span>{regime.inputs.lookbackBars} bars</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-canvas/40 px-3 py-3 sm:px-4 sm:py-4">
      <div className="text-[10px] uppercase tracking-wider text-ink-mute">{label}</div>
      <div className="mt-1 font-display text-lg font-bold text-ink sm:text-xl">{value}</div>
    </div>
  );
}
