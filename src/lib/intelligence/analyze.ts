import { LEVEL_DEFINITIONS } from "./definitions";
import { sessionHighLow, sliceSessions } from "./sessions";
import type {
  AbsorptionEvent,
  Bar,
  HybridCompass,
  LiquidityMagnet,
  ProfileLevel,
  RegimeGate,
  StructureAtlas,
  ValueAreaSource,
  VolumeBin,
} from "./types";

const VALUE_AREA_PCT = 0.7;
/** Prefer developing UTC day once we have enough 1h prints. */
const DEVELOPING_MIN_BARS = 6;

function mean(xs: number[]): number {
  if (!xs.length) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function stdev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1));
}

function percentileRank(value: number, sample: number[]): number {
  if (!sample.length) return 50;
  const below = sample.filter((x) => x < value).length;
  return Math.round((below / sample.length) * 100);
}

type ProfileResult = {
  bins: VolumeBin[];
  pointOfControl: number;
  valueAreaHigh: number;
  valueAreaLow: number;
};

/** Fixed-bin volume profile + 70% value area around POC (session bars only). */
function buildSessionProfile(bars: Bar[], binCount = 36): ProfileResult | null {
  if (bars.length < 2) return null;

  const price = bars[bars.length - 1]?.c ?? 0;
  const hi = Math.max(...bars.map((b) => b.h));
  const lo = Math.min(...bars.map((b) => b.l));
  const span = Math.max(hi - lo, price * 1e-6);
  const step = span / binCount;

  const volumes = new Array(binCount).fill(0) as number[];
  for (const b of bars) {
    const mid = (b.h + b.l + b.c) / 3;
    const idx = Math.min(binCount - 1, Math.max(0, Math.floor((mid - lo) / step)));
    const top = Math.min(binCount - 1, Math.max(0, Math.floor((b.h - lo) / step)));
    const bot = Math.min(binCount - 1, Math.max(0, Math.floor((b.l - lo) / step)));
    const spread = Math.max(1, top - bot + 1);
    for (let i = bot; i <= top; i++) {
      const weight = i === idx ? 1.6 : 1;
      volumes[i] += (b.v * weight) / (spread + 0.6);
    }
  }

  let pocIdx = 0;
  for (let i = 1; i < binCount; i++) {
    if (volumes[i] > volumes[pocIdx]) pocIdx = i;
  }

  const total = volumes.reduce((a, b) => a + b, 0) || 1;
  const target = total * VALUE_AREA_PCT;
  let loIdx = pocIdx;
  let hiIdx = pocIdx;
  let covered = volumes[pocIdx];
  while (covered < target && (loIdx > 0 || hiIdx < binCount - 1)) {
    const nextLo = loIdx > 0 ? volumes[loIdx - 1] : -1;
    const nextHi = hiIdx < binCount - 1 ? volumes[hiIdx + 1] : -1;
    if (nextHi >= nextLo) {
      hiIdx += 1;
      covered += volumes[hiIdx];
    } else {
      loIdx -= 1;
      covered += volumes[loIdx];
    }
  }

  const bins: VolumeBin[] = volumes.map((volume, i) => ({
    price: lo + (i + 0.5) * step,
    volume,
    inValueArea: i >= loIdx && i <= hiIdx,
    isPoc: i === pocIdx,
  }));

  return {
    bins,
    pointOfControl: bins[pocIdx].price,
    valueAreaHigh: lo + (hiIdx + 1) * step,
    valueAreaLow: lo + loIdx * step,
  };
}

function buildPocOnly(bars: Bar[], binCount: number): number | null {
  const profile = buildSessionProfile(bars, binCount);
  return profile?.pointOfControl ?? null;
}

function emptyMethodology(
  priorDaySession: string,
  priorWeekSession: string,
  valueAreaSession: string,
  valueAreaSource: ValueAreaSource,
): StructureAtlas["methodology"] {
  return {
    timezone: "UTC",
    barInterval: "1h",
    venue: "binance-spot",
    valueAreaPct: VALUE_AREA_PCT,
    valueAreaSource,
    valueAreaSession,
    priorDaySession,
    priorWeekSession,
    notes: [
      "PDH/PDL = completed prior UTC day high/low.",
      "POC/VAH/VAL = 70% value area on the stated UTC session.",
      "WPOC = prior Mon–Sun UTC week point of control.",
    ],
  };
}

/**
 * Structure Atlas — session-correct levels from Binance 1h bars.
 * PDH/PDL: prior completed UTC day.
 * POC/VAH/VAL: developing UTC day once enough bars print; else prior day.
 * WPOC: prior Mon–Sun UTC week POC.
 */
export function buildStructureAtlas(bars: Bar[]): StructureAtlas {
  const price = bars[bars.length - 1]?.c ?? 0;
  const sessions = sliceSessions(bars);
  const priorHl = sessionHighLow(sessions.priorDayBars);
  const pdh = priorHl?.high ?? price;
  const pdl = priorHl?.low ?? price;

  let valueAreaSource: ValueAreaSource = "prior-day";
  let valueBars = sessions.priorDayBars;
  let valueSession = `${sessions.priorDayLabel} UTC`;

  if (sessions.developingBars.length >= DEVELOPING_MIN_BARS) {
    valueAreaSource = "developing-day";
    valueBars = sessions.developingBars;
    valueSession = `${sessions.developingDayLabel} UTC (developing)`;
  } else if (!sessions.priorDayBars.length && sessions.developingBars.length) {
    valueAreaSource = "developing-day";
    valueBars = sessions.developingBars;
    valueSession = `${sessions.developingDayLabel} UTC (developing)`;
  }

  const profile =
    buildSessionProfile(valueBars, 36) ??
    buildSessionProfile(bars.slice(-48), 36);

  const pointOfControl = profile?.pointOfControl ?? price;
  const valueAreaHigh = profile?.valueAreaHigh ?? price;
  const valueAreaLow = profile?.valueAreaLow ?? price;
  const bins = profile?.bins ?? [];

  const weekPoc =
    buildPocOnly(sessions.priorWeekBars, 36) ??
    buildPocOnly(bars.slice(-168), 36) ??
    pointOfControl;

  const methodology = emptyMethodology(
    `${sessions.priorDayLabel} UTC`,
    sessions.priorWeekLabel,
    valueSession,
    valueAreaSource,
  );

  if (!sessions.priorDayBars.length) {
    methodology.notes.push(
      "Prior UTC day incomplete in feed — PDH/PDL fall back to available session prints.",
    );
  }
  if (sessions.priorWeekBars.length < 24) {
    methodology.notes.push(
      "Prior week thin in feed — WPOC uses best available prior-week 1h bars.",
    );
  }

  const levels: ProfileLevel[] = (
    [
      {
        price: valueAreaHigh,
        label: "VAH",
        kind: "vah" as const,
        definition: `${LEVEL_DEFINITIONS.vah} Session: ${valueSession}.`,
        session: valueSession,
      },
      {
        price: pointOfControl,
        label: "POC",
        kind: "poc" as const,
        definition: `${LEVEL_DEFINITIONS.poc} Session: ${valueSession}.`,
        session: valueSession,
      },
      {
        price: valueAreaLow,
        label: "VAL",
        kind: "val" as const,
        definition: `${LEVEL_DEFINITIONS.val} Session: ${valueSession}.`,
        session: valueSession,
      },
      {
        price: pdh,
        label: "PDH",
        kind: "pdh" as const,
        definition: `${LEVEL_DEFINITIONS.pdh} Session: ${sessions.priorDayLabel} UTC.`,
        session: `${sessions.priorDayLabel} UTC`,
      },
      {
        price: pdl,
        label: "PDL",
        kind: "pdl" as const,
        definition: `${LEVEL_DEFINITIONS.pdl} Session: ${sessions.priorDayLabel} UTC.`,
        session: `${sessions.priorDayLabel} UTC`,
      },
      {
        price: weekPoc,
        label: "WPOC",
        kind: "pwpoc" as const,
        definition: `${LEVEL_DEFINITIONS.pwpoc} Week: ${sessions.priorWeekLabel}.`,
        session: sessions.priorWeekLabel,
      },
    ] satisfies ProfileLevel[]
  ).sort((a, b) => b.price - a.price);

  let positionInValue: StructureAtlas["positionInValue"] = "inside";
  if (price > valueAreaHigh) positionInValue = "above";
  if (price < valueAreaLow) positionInValue = "below";

  return {
    bins,
    levels,
    valueAreaHigh,
    valueAreaLow,
    pointOfControl,
    price,
    positionInValue,
    methodology,
  };
}

/**
 * Absorption Sentinel — Ocean Park Asset's failed-break detector.
 * LBAF: Look Below And Fail (sellers swept a low, buyers absorbed).
 * LAAF: Look Above And Fail (buyers swept a high, sellers absorbed).
 * Uses wick geometry + relative volume — not a retail RSI clone.
 */
export function detectAbsorptions(bars: Bar[]): AbsorptionEvent[] {
  const out: AbsorptionEvent[] = [];
  if (bars.length < 30) return out;

  const vols = bars.map((b) => b.v);
  const avgVol = mean(vols.slice(-40));

  for (let i = 20; i < bars.length; i++) {
    const b = bars[i];
    const range = Math.max(b.h - b.l, 1e-12);
    const body = Math.abs(b.c - b.o);
    const lowerWick = Math.min(b.o, b.c) - b.l;
    const upperWick = b.h - Math.max(b.o, b.c);
    const priorLows = bars.slice(i - 20, i).map((x) => x.l);
    const priorHighs = bars.slice(i - 20, i).map((x) => x.h);
    const swingLow = Math.min(...priorLows);
    const swingHigh = Math.max(...priorHighs);
    const volRatio = avgVol > 0 ? b.v / avgVol : 1;

    // LBAF: pierce below swing low, reclaim, dominant lower wick, elevated volume
    if (
      b.l < swingLow * 0.9995 &&
      b.c > swingLow &&
      lowerWick / range > 0.45 &&
      body / range < 0.45 &&
      volRatio > 1.15
    ) {
      const strength = Math.min(
        100,
        Math.round(40 + (lowerWick / range) * 35 + Math.min(volRatio, 3) * 10),
      );
      out.push({
        t: b.t,
        price: b.c,
        type: "LBAF",
        strength,
        levelBroken: swingLow,
        note: "Look Below And Fail — sell liquidity swept, bid absorbed the flush. Risk engine watches for long bias only if Regime Gate allows.",
      });
    }

    // LAAF: pierce above swing high, reject, dominant upper wick
    if (
      b.h > swingHigh * 1.0005 &&
      b.c < swingHigh &&
      upperWick / range > 0.45 &&
      body / range < 0.45 &&
      volRatio > 1.15
    ) {
      const strength = Math.min(
        100,
        Math.round(40 + (upperWick / range) * 35 + Math.min(volRatio, 3) * 10),
      );
      out.push({
        t: b.t,
        price: b.c,
        type: "LAAF",
        strength,
        levelBroken: swingHigh,
        note: "Look Above And Fail — buy-side liquidity hunted, offer absorbed the spike. Protection layers prioritize fade / reduce exposure.",
      });
    }
  }

  // Keep the most recent / strongest events for the desk.
  return out
    .sort((a, b) => b.t - a.t || b.strength - a.strength)
    .slice(0, 8);
}

/** Liquidity Magnets — equal highs/lows (pools) + Fair Value Gaps. */
export function findLiquidityMagnets(bars: Bar[]): LiquidityMagnet[] {
  const price = bars[bars.length - 1]?.c ?? 0;
  if (bars.length < 40 || !price) return [];

  const magnets: LiquidityMagnet[] = [];
  const tol = price * 0.0012;

  // Equal highs / equal lows = resting stop pools.
  for (let i = 12; i < bars.length - 2; i++) {
    const a = bars[i];
    for (let j = i + 3; j < Math.min(bars.length, i + 28); j++) {
      const b = bars[j];
      if (Math.abs(a.h - b.h) <= tol) {
        const mid = (a.h + b.h) / 2;
        magnets.push({
          price: mid,
          kind: "equal-highs",
          strength: 55 + Math.min(30, Math.round((a.v + b.v) / (mean(bars.map((x) => x.v)) || 1) * 8)),
          label: "Buy-side liquidity pool",
          distancePct: ((mid - price) / price) * 100,
        });
      }
      if (Math.abs(a.l - b.l) <= tol) {
        const mid = (a.l + b.l) / 2;
        magnets.push({
          price: mid,
          kind: "equal-lows",
          strength: 55 + Math.min(30, Math.round((a.v + b.v) / (mean(bars.map((x) => x.v)) || 1) * 8)),
          label: "Sell-side liquidity pool",
          distancePct: ((mid - price) / price) * 100,
        });
      }
    }
  }

  // Fair Value Gaps (3-candle imbalances).
  for (let i = 2; i < bars.length; i++) {
    const left = bars[i - 2];
    const mid = bars[i - 1];
    const right = bars[i];
    if (left.h < right.l && mid.c > mid.o) {
      const gapMid = (left.h + right.l) / 2;
      magnets.push({
        price: gapMid,
        kind: "fvg-bull",
        strength: Math.min(95, 50 + ((right.l - left.h) / price) * 8000),
        label: "Bullish imbalance (FVG)",
        distancePct: ((gapMid - price) / price) * 100,
      });
    }
    if (left.l > right.h && mid.c < mid.o) {
      const gapMid = (left.l + right.h) / 2;
      magnets.push({
        price: gapMid,
        kind: "fvg-bear",
        strength: Math.min(95, 50 + ((left.l - right.h) / price) * 8000),
        label: "Bearish imbalance (FVG)",
        distancePct: ((gapMid - price) / price) * 100,
      });
    }
  }

  // Deduplicate near-identical prices; keep strongest nearby.
  magnets.sort((a, b) => a.price - b.price);
  const pruned: LiquidityMagnet[] = [];
  for (const m of magnets) {
    const last = pruned[pruned.length - 1];
    if (last && Math.abs(last.price - m.price) / price < 0.0015) {
      if (m.strength > last.strength) pruned[pruned.length - 1] = m;
      continue;
    }
    pruned.push(m);
  }

  return pruned
    .map((m) => ({
      ...m,
      distancePct: ((m.price - price) / price) * 100,
    }))
    .sort((a, b) => Math.abs(a.distancePct) - Math.abs(b.distancePct))
    .slice(0, 10);
}

/** Regime Gate — maps market state to Ocean Park Asset's risk posture. */
export function computeRegimeGate(
  bars: Bar[],
  absorptions: AbsorptionEvent[],
): RegimeGate {
  const price = bars[bars.length - 1]?.c ?? 0;
  if (bars.length < 48) {
    return {
      state: "TIGHTENED",
      score: 45,
      volatilityPctile: 50,
      trendStrength: 0,
      drawdownPct: 0,
      reasons: ["Insufficient history to unlock full Regime Gate."],
      productHint: "Hybrid stays conservative until structure clarifies.",
      inputs: {
        volatilityPctile: 50,
        trendStrength: 0,
        drawdownPct: 0,
        recentLbaf: 0,
        recentLaaf: 0,
        lookbackBars: bars.length,
      },
    };
  }

  const closes = bars.map((b) => b.c);
  const rets: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    rets.push((closes[i] - closes[i - 1]) / closes[i - 1]);
  }
  const recentVol = stdev(rets.slice(-24));
  const rolling: number[] = [];
  for (let i = 24; i < rets.length; i++) {
    rolling.push(stdev(rets.slice(i - 24, i)));
  }
  const volatilityPctile = percentileRank(recentVol, rolling);

  const smaFast = mean(closes.slice(-12));
  const smaSlow = mean(closes.slice(-48));
  const trendStrength = Math.min(100, Math.abs((smaFast - smaSlow) / price) * 4000);
  const peak = Math.max(...closes.slice(-72));
  const drawdownPct = ((peak - price) / peak) * 100;

  const recentAbs = absorptions.filter((a) => a.t >= bars[bars.length - 18]?.t);
  const lbaf = recentAbs.filter((a) => a.type === "LBAF").length;
  const laaf = recentAbs.filter((a) => a.type === "LAAF").length;

  let score = 70;
  // Primary reasons first (risk / structure), then fillers — UI shows exactly two.
  const primary: string[] = [];
  const secondary: string[] = [];

  if (volatilityPctile >= 80) {
    score -= 22;
    primary.push("Realized volatility is elevated — exposure caps tighten.");
  } else if (volatilityPctile <= 35) {
    score += 8;
    primary.push("Volatility regime is orderly — signal quality improves.");
  } else {
    secondary.push("Volatility sits in a mid regime — sizing stays inside standard rails.");
  }

  if (drawdownPct >= 8) {
    score -= 18;
    primary.push(`Local drawdown ${drawdownPct.toFixed(1)}% — drawdown shield engages.`);
  } else if (drawdownPct <= 2) {
    score += 6;
    secondary.push("Local drawdown is tight — risk budget remains fully available.");
  } else {
    secondary.push(
      `Local drawdown ${drawdownPct.toFixed(1)}% — contained; protection rails stay quiet.`,
    );
  }

  if (trendStrength >= 55) {
    score += 10;
    primary.push("Directional structure is clear — Quant Trading edge improves.");
  } else {
    score -= 6;
    primary.push("Choppy structure — Hybrid leans toward staking yield.");
  }

  if (laaf > lbaf) {
    score -= 10;
    primary.push("Recent LAAF absorptions — upside liquidity was hunted and rejected.");
  } else if (lbaf > 0) {
    score += 8;
    primary.push("Recent LBAF absorptions — sell sweeps were absorbed by bids.");
  }

  score = Math.max(5, Math.min(95, Math.round(score)));

  let state: RegimeGate["state"] = "OPEN";
  if (score < 40) state = "CLOSED";
  else if (score < 62) state = "TIGHTENED";

  const productHint =
    state === "OPEN"
      ? "Regime Gate OPEN — AI Quant Trading may take high-confidence entries inside risk limits."
      : state === "TIGHTENED"
        ? "Regime Gate TIGHTENED — Hybrid reduces active risk; Staking share rises."
        : "Regime Gate CLOSED — new speculative entries pause; capital protection leads.";

  const reasons = [...primary, ...secondary].slice(0, 2);
  if (reasons.length < 2) {
    reasons.push(
      state === "OPEN"
        ? "Permission rails clear — high-confidence Quant entries stay allowed."
        : state === "TIGHTENED"
          ? "Risk posture is cautious — new size is reduced until structure improves."
          : "Capital protection leads — speculative entries remain paused.",
    );
  }

  return {
    state,
    score,
    volatilityPctile,
    trendStrength: Math.round(trendStrength),
    drawdownPct: Number(drawdownPct.toFixed(2)),
    reasons,
    productHint,
    inputs: {
      volatilityPctile,
      trendStrength: Math.round(trendStrength),
      drawdownPct: Number(drawdownPct.toFixed(2)),
      recentLbaf: lbaf,
      recentLaaf: laaf,
      lookbackBars: bars.length,
    },
  };
}

export function computeHybridCompass(regime: RegimeGate): HybridCompass {
  let tradingPct = 55;
  if (regime.state === "OPEN") tradingPct = 70;
  if (regime.state === "TIGHTENED") tradingPct = 40;
  if (regime.state === "CLOSED") tradingPct = 18;

  // Nudge by score within band.
  tradingPct = Math.round(tradingPct + (regime.score - 50) * 0.15);
  tradingPct = Math.max(10, Math.min(85, tradingPct));
  const stakingPct = 100 - tradingPct;

  const bias: HybridCompass["bias"] =
    tradingPct >= 60 ? "growth" : tradingPct <= 35 ? "preserve" : "balanced";

  const rationale =
    bias === "growth"
      ? "Structure + Regime Gate favor active opportunity capture with stops still enforced."
      : bias === "preserve"
        ? "Risk layers prioritize capital defense — Hybrid parks more capital in on-chain yield."
        : "Mixed regime — Hybrid keeps a disciplined blend of Trading and Staking.";

  return { tradingPct, stakingPct, bias, rationale };
}

export function analyzeBars(bars: Bar[]) {
  const structure = buildStructureAtlas(bars);
  const absorptions = detectAbsorptions(bars);
  const magnets = findLiquidityMagnets(bars);
  const regime = computeRegimeGate(bars, absorptions);
  const hybrid = computeHybridCompass(regime);
  return { structure, absorptions, magnets, regime, hybrid };
}
