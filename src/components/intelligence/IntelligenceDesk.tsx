"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { COINS, fmtPrice } from "@/lib/coins";
import type { IntelligencePack } from "@/lib/intelligence/types";
import { useLivePrices } from "@/lib/useLivePrices";
import { useLiveKline } from "@/lib/useLiveKline";
import type { DeskInterval } from "@/lib/deskChart";
import { CoinIcon } from "@/components/CoinIcon";
import { LivePrice } from "@/components/LivePrice";
import { StructureAtlasView } from "./StructureAtlasView";
import { AbsorptionPanel } from "./AbsorptionPanel";
import { MagnetBoard } from "./MagnetBoard";
import { RegimeGateCard } from "./RegimeGateCard";
import { HybridCompassCard } from "./HybridCompassCard";
import { DeskChart, type LiveFlow } from "./DeskChart";

const TOOLS = [
  {
    id: "regime",
    name: "Regime Gate",
    tag: "Risk posture",
    blurb: "Ocean Park Asset’s entry permission layer — OPEN, TIGHTENED, or CLOSED.",
  },
  {
    id: "structure",
    name: "Structure Atlas",
    tag: "Value map",
    blurb: "Volume-built POC / VAH / VAL plus prior-day magnets for disciplined sizing.",
  },
  {
    id: "absorption",
    name: "Absorption Sentinel",
    tag: "LBAF · LAAF",
    blurb: "Failed liquidity sweeps — where aggressive orders got absorbed.",
  },
  {
    id: "magnets",
    name: "Magnet Map",
    tag: "Liquidity",
    blurb: "Equal highs/lows and unfilled imbalances the desk watches next.",
  },
  {
    id: "hybrid",
    name: "Hybrid Compass",
    tag: "Allocation",
    blurb: "How Hybrid would tilt Trading vs Staking under this regime.",
  },
] as const;

type ToolId = (typeof TOOLS)[number]["id"];

const DESK_COINS = COINS.filter((c) => c.binance && !["tether", "usd-coin"].includes(c.id));
const STRUCTURE_REFRESH_MS = 20_000;
const FLOW_REFRESH_MS = 4_000;

export function IntelligenceDesk() {
  const [id, setId] = useState(DESK_COINS[0]?.id ?? "bitcoin");
  const [tool, setTool] = useState<ToolId>("structure");
  const [chartInterval, setChartInterval] = useState<DeskInterval>("1h");
  const [pack, setPack] = useState<IntelligencePack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flow, setFlow] = useState<LiveFlow | null>(null);

  const liveTicks = useLivePrices();
  const liveKline = useLiveKline(id, chartInterval);
  // Extra 1h socket only when the chart TF isn't already 1h (structure rebuilds on hour close).
  const structureKline = useLiveKline(id, chartInterval === "1h" ? null : "1h");
  const hourKline = chartInterval === "1h" ? liveKline : structureKline;
  const tick = liveTicks[id];
  const coin = useMemo(() => COINS.find((c) => c.id === id) ?? COINS[0], [id]);
  const closedHandled = useRef<number | null>(null);

  const loadDesk = useCallback(async (coinId: string, opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setLoading(true);
      setError("");
      setPack(null);
    }
    try {
      const res = await fetch(`/api/intelligence?id=${encodeURIComponent(coinId)}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load desk");
      setPack(json as IntelligencePack);
      setError("");
    } catch (err) {
      if (!opts?.silent) {
        setPack(null);
        setError(err instanceof Error ? err.message : "Failed to load desk");
      }
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Drop the previous coin’s pack immediately so DeskChart can’t paint
    // BNB levels (~$580) on BTC candles (~$64k) while the next pack loads.
    setPack(null);
    void loadDesk(id);
  }, [id, loadDesk]);

  useEffect(() => {
    const timer = setInterval(() => {
      void loadDesk(id, { silent: true });
    }, STRUCTURE_REFRESH_MS);
    return () => clearInterval(timer);
  }, [id, loadDesk]);

  // When the 1h kline closes, rebuild structure immediately.
  useEffect(() => {
    if (!hourKline?.closed) return;
    if (closedHandled.current === hourKline.t) return;
    closedHandled.current = hourKline.t;
    void loadDesk(id, { silent: true });
  }, [hourKline?.closed, hourKline?.t, id, loadDesk]);

  useEffect(() => {
    let cancelled = false;
    const pull = async () => {
      try {
        const res = await fetch(`/api/flow?id=${encodeURIComponent(id)}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!cancelled && json) {
          setFlow({
            delta: Number(json.delta) || 0,
            imbalance: Number(json.imbalance) || 0,
            buyVol: Number(json.buyVol) || 0,
            sellVol: Number(json.sellVol) || 0,
            live: Boolean(json.live),
            updatedAt: Number(json.updatedAt) || Date.now(),
          });
        }
      } catch {
        if (!cancelled) setFlow((prev) => (prev ? { ...prev, live: false } : null));
      }
    };
    void pull();
    const timer = setInterval(pull, FLOW_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [id]);

  const active = TOOLS.find((t) => t.id === tool)!;
  const spotPrice =
    liveKline?.c ?? hourKline?.c ?? tick?.price ?? pack?.structure.price ?? 0;
  const streaming = Boolean(liveKline || hourKline || tick);
  const tfLabel =
    chartInterval === "15m"
      ? "15m"
      : chartInterval === "1h"
        ? "1h"
        : chartInterval === "4h"
          ? "4h"
          : "1D";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="eyebrow mb-2">Ocean Park Asset proprietary</div>
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            Intelligence <span className="text-gold-gradient">Desk</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-dim">
            Live structural tools the strategy stack actually reasons with — regime permission,
            value-area maps, absorption of liquidity sweeps, and Hybrid tilt. Not a public
            indicator pack.
          </p>
        </div>
        {pack && (
          <div className="flex flex-col items-start gap-1 text-xs text-ink-mute lg:items-end">
            <div className="flex items-center gap-3">
              <span
                className={`h-2 w-2 rounded-full ${
                  streaming || pack.live ? "bg-up animate-pulse-glow" : "bg-ink-mute"
                }`}
              />
              <span>
                {pack.provenance?.pair ?? coin.symbol} · Binance spot · Structure 1h UTC
                {liveKline ? ` · chart ${tfLabel} live` : streaming ? " · live stream" : ""}
                {flow?.live ? " · flow 5m" : ""}
              </span>
            </div>
            <span className="text-[11px]">
              As of {new Date(pack.provenance?.asOf ?? pack.updatedAt).toLocaleString()} ·{" "}
              {pack.structure.methodology?.valueAreaSource === "developing-day"
                ? "VA developing day"
                : "VA prior day"}{" "}
              {pack.structure.methodology?.valueAreaSession ?? ""}
            </span>
          </div>
        )}
      </div>

      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-5 [&::-webkit-scrollbar]:hidden">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTool(t.id)}
            className={`card card-hover w-[min(72vw,16.5rem)] shrink-0 p-4 text-left transition-colors sm:w-auto sm:shrink ${
              tool === t.id ? "border-gold/45 bg-gold/[0.06]" : ""
            }`}
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-light">
              {t.tag}
            </div>
            <div className="mt-1.5 font-display text-sm font-semibold text-ink">{t.name}</div>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-mute">{t.blurb}</p>
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold">{active.name}</h3>
            <p className="text-sm text-ink-dim">{active.blurb}</p>
          </div>
          {spotPrice > 0 && (
            <div className="flex items-center gap-3">
              {streaming && (
                <span className="rounded border border-up/30 bg-up/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-up">
                  Live
                </span>
              )}
              <div className="font-display text-2xl font-bold tabular-nums text-gold-gradient sm:text-3xl">
                <LivePrice value={spotPrice} />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5">
          {error && !pack && (
            <div className="mb-4 rounded-lg border border-down/30 bg-down/10 px-4 py-3 text-sm text-down">
              {error}
            </div>
          )}
          <div className="space-y-6">
            {/* Chart mounts immediately — does not wait on intelligence analysis. */}
            {/* Mobile: horizontal chain strip */}
            <div className="lg:hidden -mx-1 overflow-x-auto px-1 pb-1">
              <div className="flex min-w-max gap-2">
                {DESK_COINS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setId(c.id)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                      id === c.id
                        ? "border-gold/50 bg-gold/10 text-gold-light"
                        : "border-line text-ink-dim hover:text-ink"
                    }`}
                  >
                    <CoinIcon symbol={c.symbol} size={16} />
                    {c.symbol}
                  </button>
                ))}
              </div>
            </div>

            {/*
              Desktop: CSS stretch matches rail to chart height (no JS measure).
              JS height-lock was clipping the last coins on refresh.
            */}
            <div className="grid items-stretch gap-3 lg:grid-cols-[92px_minmax(0,1fr)]">
              <aside className="hidden min-h-0 lg:block">
                <div className="flex h-full min-h-0 flex-col rounded-xl border border-line bg-canvas/40">
                  <div className="shrink-0 border-b border-line px-1 py-1.5 text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-mute">
                    Chains
                  </div>
                  <div className="grid min-h-0 flex-1 grid-rows-12 gap-px overflow-hidden p-0.5">
                    {DESK_COINS.map((c) => {
                      const live = liveTicks[c.id]?.price;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setId(c.id)}
                          title={live != null ? `${c.name} · ${fmtPrice(live)}` : c.name}
                          className={`grid place-items-center content-center gap-px rounded-md border px-0 transition-colors ${
                            id === c.id
                              ? "border-gold/50 bg-gold/10 text-gold-light"
                              : "border-transparent text-ink-dim hover:border-line hover:bg-surface/60 hover:text-ink"
                          }`}
                        >
                          <CoinIcon
                            symbol={c.symbol}
                            size={18}
                            className="mx-auto block"
                          />
                          <span className="w-full text-center text-[11px] font-semibold leading-none tracking-normal">
                            {c.symbol}
                          </span>
                          <span className="w-full truncate px-px text-center text-[9px] leading-none tabular-nums text-ink-mute">
                            {live != null ? fmtPrice(live) : "—"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </aside>

              <div className="min-w-0">
                <DeskChart
                  coinId={id}
                  interval={chartInterval}
                  onIntervalChange={setChartInterval}
                  pack={pack}
                  emphasis={tool}
                  livePrice={tick?.price}
                  liveKline={liveKline}
                  liveFlow={flow}
                />
              </div>
            </div>

            {loading && !pack && (
              <div className="grid place-items-center rounded-lg border border-line/60 bg-canvas/40 py-10 text-sm text-ink-mute">
                Building structure levels…
              </div>
            )}

            {pack && (
              <>
                {/* Full level legend — definitions for trader/dev trust */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                      Structure levels · 1h UTC sessions
                    </div>
                    <div className="text-[10px] text-ink-mute">
                      Exchange OHLC on chart TF · Ocean Park Asset models labeled on panes
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {pack.structure.levels.slice(0, 6).map((l) => (
                      <div
                        key={`${l.label}-${l.price}`}
                        className="rounded-lg border border-line bg-canvas/50 px-3 py-2.5"
                        title={l.definition}
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-mute">
                            {l.label}
                          </div>
                          <div className="font-display text-sm font-semibold tabular-nums text-ink">
                            {fmtPrice(l.price)}
                          </div>
                        </div>
                        <p className="mt-1 text-[10px] leading-snug text-ink-mute">
                          {l.definition ?? l.session}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detail array below */}
                <div className="border-t border-line pt-6">
                  {tool === "regime" && <RegimeGateCard regime={pack.regime} />}
                  {tool === "structure" && (
                    <StructureAtlasView
                      structure={pack.structure}
                      livePrice={spotPrice || undefined}
                    />
                  )}
                  {tool === "absorption" && (
                    <AbsorptionPanel events={pack.absorptions} flow={flow} />
                  )}
                  {tool === "magnets" && (
                    <MagnetBoard magnets={pack.magnets} price={spotPrice} />
                  )}
                  {tool === "hybrid" && (
                    <HybridCompassCard hybrid={pack.hybrid} regime={pack.regime} />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <details className="group rounded-xl border border-line bg-surface/30 px-5 py-4">
        <summary className="cursor-pointer list-none font-display text-sm font-semibold text-ink marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-3">
            How to read this desk
            <span className="text-xs font-normal text-ink-mute transition group-open:rotate-180">
              ↓
            </span>
          </span>
        </summary>
        <div className="mt-4 grid gap-4 border-t border-line pt-4 text-sm leading-relaxed text-ink-dim sm:grid-cols-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-light">
              Exchange vs Ocean Park Asset
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-mute">
              Candles, volume, and 5m flow are Binance spot facts. Structure levels (PDH/PDL,
              session POC/VAH/VAL, WPOC) are measured on 1h UTC sessions. Pressure, Pulse, Absorption,
              Magnets, Regime Gate, and Hybrid are Ocean Park Asset models — defined on the desk.
            </p>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-light">
              Session structure
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-mute">
              PDH/PDL = prior completed UTC day. POC/VAH/VAL = 70% value area on the developing UTC
              day (falls back to prior day early session). WPOC = prior Mon–Sun UTC week POC.
              Badge always reads Structure · 1H.
            </p>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-light">
              Chart controls
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-mute">
              Switch 15m / 1H / 4H / 1D and 1D–3M ranges. Scroll-zoom or pan left to load older
              history without resetting your view. Informational only — not a trade signal.
            </p>
          </div>
        </div>
      </details>
    </div>
  );
}
