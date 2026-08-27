/** Short, trader-facing definitions — shown in legend / tooltips. */

export const LEVEL_DEFINITIONS = {
  poc: "Highest-volume price in the value-area session (Binance 1h, UTC).",
  vah: "Top of the 70% value area for the value-area session.",
  val: "Bottom of the 70% value area for the value-area session.",
  pdh: "Prior UTC day high (completed Binance session, 00:00–24:00).",
  pdl: "Prior UTC day low (completed Binance session, 00:00–24:00).",
  pwpoc: "Point of control of the prior Mon–Sun UTC week.",
} as const;

export const MODEL_DEFINITIONS = {
  pressure:
    "Ocean Park Asset Pressure — wick rejection bias × √volume on each bar. Positive = bid absorption bias.",
  regimePulse:
    "Ocean Park Asset Regime Pulse — short-horizon calm/stress score (0–100) from return volatility. Not RSI.",
  absorption:
    "Ocean Park Asset Absorption Sentinel — LBAF/LAAF failed sweeps from 1h wick + relative volume geometry.",
  magnets:
    "Ocean Park Asset Magnet Map — equal high/low liquidity pools and 3-candle fair value gaps on 1h.",
  regimeGate:
    "Ocean Park Asset Regime Gate — risk permission from realized vol, local drawdown, trend clarity, and recent absorption.",
  hybrid:
    "Ocean Park Asset Hybrid Compass — Trading vs Staking tilt implied by Regime Gate. Not a portfolio allocator.",
  flow: "Exchange aggressor flow — Binance aggTrades buy/sell volume over the last 5 minutes.",
  candles: "Exchange OHLC — Binance spot klines for the selected chart timeframe.",
  structure: "Structure Atlas — session levels from Binance spot 1h bars (UTC sessions).",
} as const;
