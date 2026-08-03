export type Bar = {
  t: number; // unix seconds open time
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
};

export type ProfileLevelKind =
  | "poc"
  | "vah"
  | "val"
  | "pdh"
  | "pdl"
  | "pwpoc"
  | "support"
  | "resist";

export type ProfileLevel = {
  price: number;
  label: string;
  kind: ProfileLevelKind;
  /** Trader-facing definition for legend / tooltip. */
  definition: string;
  /** Session the level was measured on, e.g. "2026-08-02 UTC". */
  session: string;
};

export type VolumeBin = {
  price: number;
  volume: number;
  inValueArea: boolean;
  isPoc: boolean;
};

export type ValueAreaSource = "developing-day" | "prior-day";

export type StructureMethodology = {
  timezone: "UTC";
  barInterval: "1h";
  venue: "binance-spot";
  valueAreaPct: number;
  valueAreaSource: ValueAreaSource;
  valueAreaSession: string;
  priorDaySession: string;
  priorWeekSession: string;
  notes: string[];
};

export type StructureAtlas = {
  bins: VolumeBin[];
  levels: ProfileLevel[];
  valueAreaHigh: number;
  valueAreaLow: number;
  pointOfControl: number;
  price: number;
  positionInValue: "above" | "inside" | "below";
  methodology: StructureMethodology;
};

export type AbsorptionEvent = {
  t: number;
  price: number;
  type: "LBAF" | "LAAF";
  strength: number; // 0–100
  levelBroken: number;
  note: string;
};

export type LiquidityMagnet = {
  price: number;
  kind: "equal-highs" | "equal-lows" | "fvg-bull" | "fvg-bear" | "pool";
  strength: number;
  label: string;
  distancePct: number;
};

export type RegimeState = "OPEN" | "TIGHTENED" | "CLOSED";

export type RegimeGate = {
  state: RegimeState;
  score: number; // 0–100, higher = safer to take risk
  volatilityPctile: number;
  trendStrength: number;
  drawdownPct: number;
  reasons: string[];
  productHint: string;
  /** Transparent inputs so traders can audit the gate. */
  inputs: {
    volatilityPctile: number;
    trendStrength: number;
    drawdownPct: number;
    recentLbaf: number;
    recentLaaf: number;
    lookbackBars: number;
  };
};

export type HybridCompass = {
  tradingPct: number;
  stakingPct: number;
  bias: "growth" | "balanced" | "preserve";
  rationale: string;
};

/** Where desk numbers come from — shown in UI for trust. */
export type DeskProvenance = {
  venue: "binance-spot";
  pair: string;
  structureInterval: "1h";
  chartSource: "binance-klines";
  flowSource: "binance-aggTrades";
  sessionTimezone: "UTC";
  asOf: number;
};

export type IntelligencePack = {
  id: string;
  symbol: string;
  updatedAt: number;
  live: boolean;
  bars: Bar[];
  structure: StructureAtlas;
  absorptions: AbsorptionEvent[];
  magnets: LiquidityMagnet[];
  regime: RegimeGate;
  hybrid: HybridCompass;
  provenance: DeskProvenance;
};
