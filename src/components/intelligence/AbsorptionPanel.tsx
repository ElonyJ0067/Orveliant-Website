"use client";

import { fmtPrice } from "@/lib/coins";
import type { AbsorptionEvent } from "@/lib/intelligence/types";
import type { LiveFlow } from "./DeskChart";

function fmtVol(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return n.toFixed(2);
}

export function AbsorptionPanel({
  events,
  flow,
}: {
  events: AbsorptionEvent[];
  flow?: LiveFlow | null;
}) {
  return (
    <div className="space-y-4">
      {flow?.live && (
        <div className="grid gap-3 sm:grid-cols-4">
          <FlowStat label="5m buy vol" value={fmtVol(flow.buyVol)} tone="up" />
          <FlowStat label="5m sell vol" value={fmtVol(flow.sellVol)} tone="down" />
          <FlowStat
            label="5m delta"
            value={`${flow.delta >= 0 ? "+" : "−"}${fmtVol(Math.abs(flow.delta))}`}
            tone={flow.delta >= 0 ? "up" : "down"}
          />
          <FlowStat
            label="Imbalance"
            value={`${(flow.imbalance * 100).toFixed(1)}%`}
            tone={flow.imbalance >= 0 ? "up" : "down"}
          />
        </div>
      )}

      <div className="rounded-xl border border-line bg-surface/40 px-4 py-3 text-xs leading-relaxed text-ink-dim sm:px-5">
        <strong className="text-ink">Absorption Sentinel</strong> watches for Look-Below-And-Fail
        and Look-Above-And-Fail events. Live tip pressure uses aggressive trade delta; event cards
        are structural sweeps from 1h candles.
      </div>

      {!events.length ? (
        <div className="rounded-xl border border-line bg-surface/50 p-5 text-sm text-ink-dim">
          No fresh LBAF / LAAF absorptions in the recent window. The Sentinel stays quiet until
          liquidity is swept and rejected — exactly when risk control matters most.
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {events.map((e) => (
            <li key={`${e.t}-${e.type}-${e.levelBroken}`} className="card flex h-full flex-col p-4">
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    e.type === "LBAF" ? "bg-up/15 text-up" : "bg-down/15 text-down"
                  }`}
                >
                  {e.type}
                </span>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-ink-mute">Strength</div>
                  <div className="font-display text-lg font-bold text-gold-gradient">{e.strength}</div>
                </div>
              </div>
              <div className="mt-3 font-display text-sm font-semibold text-ink">
                Sweep {fmtPrice(e.levelBroken)} → reclaim {fmtPrice(e.price)}
              </div>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-ink-dim">{e.note}</p>
              <div className="mt-3 text-[11px] text-ink-mute">
                {new Date(e.t * 1000).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FlowStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "up" | "down";
}) {
  return (
    <div className="rounded-xl border border-line bg-canvas/40 px-3 py-3">
      <div className="text-[10px] uppercase tracking-wider text-ink-mute">{label}</div>
      <div
        className={`mt-1 font-display text-lg font-bold tabular-nums ${
          tone === "up" ? "text-up" : "text-down"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
