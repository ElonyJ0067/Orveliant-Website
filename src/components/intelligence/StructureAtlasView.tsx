"use client";

import { fmtPrice } from "@/lib/coins";
import type { StructureAtlas } from "@/lib/intelligence/types";

export function StructureAtlasView({
  structure,
  livePrice,
}: {
  structure: StructureAtlas;
  livePrice?: number;
}) {
  const maxVol = Math.max(...structure.bins.map((b) => b.volume), 1);
  const spot = livePrice ?? structure.price;
  const position =
    spot > structure.valueAreaHigh
      ? "above"
      : spot < structure.valueAreaLow
        ? "below"
        : "inside";
  const m = structure.methodology;

  return (
    <div className="grid items-stretch gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-gold/25 bg-gold/[0.05] p-4 sm:p-5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-light">
            Position vs value
          </div>
          <div className="mt-2 font-display text-xl font-semibold capitalize text-ink sm:text-2xl">
            {position === "inside"
              ? "Inside value area"
              : position === "above"
                ? "Above value — extension risk"
                : "Below value — discount / flush zone"}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink-dim sm:text-sm">
            Risk posture vs the auction’s fair value on{" "}
            <span className="text-ink">{m?.valueAreaSession ?? "the active UTC session"}</span>
            {m?.valueAreaSource === "developing-day"
              ? " (developing day profile)."
              : " (prior completed day profile)."}
            {livePrice != null && <> Spot now {fmtPrice(livePrice)}.</>}
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
              Volume profile · {m?.valueAreaSession ?? "UTC session"}
            </div>
            <div className="text-[10px] text-ink-mute">
              {Math.round((m?.valueAreaPct ?? 0.7) * 100)}% value area · Binance 1h
            </div>
          </div>
          <div className="relative min-h-44 flex-1 overflow-hidden rounded-xl border border-line bg-canvas/50 px-2 py-3 sm:min-h-52">
            {structure.bins.length ? (
              <div className="flex h-full items-stretch gap-0.5">
                {structure.bins.map((b, i) => (
                  <div key={i} className="flex flex-1 flex-col justify-end">
                    <div
                      className={`w-full rounded-t-sm ${
                        b.isPoc
                          ? "bg-gold"
                          : b.inValueArea
                            ? "bg-gold/45"
                            : "bg-ink-mute/25"
                      }`}
                      style={{ height: `${Math.max(4, (b.volume / maxVol) * 100)}%` }}
                      title={`${fmtPrice(b.price)}`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid h-full place-items-center text-xs text-ink-mute">
                Waiting for session volume…
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-full min-h-0 flex-col gap-3">
        <div className="grid shrink-0 grid-cols-3 gap-2 text-center">
          {[
            { k: "VAH", v: structure.valueAreaHigh },
            { k: "POC", v: structure.pointOfControl },
            { k: "VAL", v: structure.valueAreaLow },
          ].map((x) => (
            <div key={x.k} className="rounded-lg border border-line bg-surface/60 px-2 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-mute">
                {x.k}
              </div>
              <div className="mt-1 font-display text-sm font-semibold tabular-nums text-ink">
                {fmtPrice(x.v)}
              </div>
            </div>
          ))}
        </div>

        <ul className="flex min-h-0 flex-1 flex-col justify-between rounded-xl border border-line bg-canvas/40 p-3 sm:p-4">
          {structure.levels.map((l) => (
            <li
              key={`${l.label}-${l.price}`}
              className="flex flex-1 flex-col justify-center gap-0.5 border-b border-line/50 py-1.5 text-sm last:border-0"
              title={l.definition}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-ink-dim">{l.label}</span>
                <span className="font-semibold tabular-nums text-ink">{fmtPrice(l.price)}</span>
              </div>
              <div className="text-[10px] leading-snug text-ink-mute">
                {l.session}
              </div>
            </li>
          ))}
        </ul>

        {m?.notes?.length ? (
          <p className="text-[10px] leading-relaxed text-ink-mute">
            {m.notes[0]} Sessions: prior day {m.priorDaySession}; week {m.priorWeekSession}.
          </p>
        ) : null}
      </div>
    </div>
  );
}
