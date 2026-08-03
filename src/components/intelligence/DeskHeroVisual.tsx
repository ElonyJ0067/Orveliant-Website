"use client";

import { useMemo } from "react";
import { fmtPrice } from "@/lib/coins";
import { useLivePrices } from "@/lib/useLivePrices";

const FALLBACK_BTC = 63050;

function fmtAxis(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toFixed(0);
}

function fmtLevel(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Square hero frame of the Intelligence Desk — same aspect-square slot as
 * desk-visual.webp. Prices track live BTC so the mock stays market-credible.
 */
export function DeskHeroVisual() {
  const ticks = useLivePrices();
  const tick = ticks.bitcoin;
  const price = tick?.price && tick.price > 0 ? tick.price : FALLBACK_BTC;
  const change24h = tick?.change24h ?? 0.82;
  const upDay = change24h >= 0;

  const levels = useMemo(() => {
    const poc = price * 0.9978;
    const vah = price * 1.0064;
    const val = price * 0.9912;
    const hi = vah * 1.004;
    const lo = val * 0.994;
    return { poc, vah, val, hi, lo };
  }, [price]);

  // Normalize price → chart Y (0–100 band)
  const toV = (p: number) => {
    const { hi, lo } = levels;
    return ((p - lo) / Math.max(hi - lo, 1)) * 100;
  };

  const profile = [
    18, 28, 40, 54, 70, 86, 98, 84, 66, 50, 44, 58, 74, 88, 68, 46, 32, 22,
  ];
  const candles = [
    { o: 42, c: 36, h: 46, l: 32 },
    { o: 36, c: 44, h: 47, l: 34 },
    { o: 44, c: 38, h: 46, l: 35 },
    { o: 38, c: 48, h: 50, l: 36 },
    { o: 48, c: 45, h: 52, l: 43 },
    { o: 45, c: 54, h: 56, l: 42 },
    { o: 54, c: 50, h: 58, l: 48 },
    { o: 50, c: 58, h: 61, l: 49 },
    { o: 58, c: 55, h: 62, l: 53 },
    { o: 55, c: 64, h: 66, l: 54 },
    { o: 64, c: 60, h: 68, l: 58 },
    { o: 60, c: 70, h: 73, l: 59 },
    { o: 70, c: 66, h: 74, l: 64 },
    { o: 66, c: 76, h: 78, l: 65 },
    { o: 76, c: 72, h: 80, l: 70 },
    { o: 72, c: 82, h: 85, l: 71 },
  ];

  const chartH = 128;
  const padTop = 12;
  const y = (v: number) => padTop + ((100 - v) / 100) * chartH;
  const chartLeft = 48;
  const chartRight = 278;
  const chartW = chartRight - chartLeft;
  const candleW = chartW / candles.length;
  const lastClose = candles[candles.length - 1].c;
  const lastY = y(lastClose);
  const vahV = toV(levels.vah);
  const pocV = toV(levels.poc);
  const valV = toV(levels.val);
  const priceV = toV(price);

  // Even scale ticks — keep structure labels separate so they don't collide
  const axisMarks = [0.92, 0.7, 0.48, 0.26, 0.08].map(
    (t) => levels.lo + (levels.hi - levels.lo) * t,
  );

  return (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl bg-surface"
      aria-hidden
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(65% 50% at 80% 12%, rgba(201,162,39,0.12), transparent 60%), radial-gradient(45% 35% at 10% 90%, rgba(53,192,122,0.06), transparent 70%)",
        }}
      />

      {/* Title — matches live Intelligence Desk chrome */}
      <div className="relative flex shrink-0 items-start justify-between gap-2 border-b border-line px-3 py-2.5 sm:px-3.5 sm:py-3">
        <div className="min-w-0">
          <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-mute sm:text-[10px]">
            1H desk
          </div>
          <div className="mt-0.5 truncate font-display text-[13px] font-semibold text-ink sm:text-sm">
            BTC · Structure levels
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded border border-up/30 bg-up/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-up sm:gap-1.5 sm:px-2 sm:text-[10px]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-up/50 animate-ping motion-reduce:animate-none" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-up" />
            </span>
            Live
          </span>
          <div className="text-right">
            <div className="font-display text-base font-bold tabular-nums leading-none text-gold-light sm:text-lg">
              {fmtPrice(price).replace(/^\$/, "")}
            </div>
            <div
              className={`mt-0.5 text-[9px] font-medium tabular-nums sm:text-[10px] ${
                upDay ? "text-up" : "text-down"
              }`}
            >
              {upDay ? "+" : ""}
              {change24h.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col px-3 py-2 sm:px-3.5 sm:py-2.5">
        <div className="mb-1.5 flex flex-wrap items-center gap-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-ink-mute sm:mb-2 sm:gap-1.5 sm:text-[9px]">
          <span className="rounded border border-gold/40 bg-gold/[0.08] px-1.5 py-0.5 text-gold-light">
            Levels
          </span>
          <span className="rounded border border-line/80 px-1.5 py-0.5 text-ink-mute">
            Pressure
          </span>
          <span className="rounded border border-line/80 px-1.5 py-0.5 text-ink-mute">
            Regime
          </span>
          <span className="rounded border border-line px-1.5 py-0.5 normal-case tracking-normal text-ink-dim">
            Vol · POC / VAH / VAL
          </span>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-line/80 bg-[#07080a]">
          <svg
            viewBox="0 0 340 168"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label="Structure Atlas chart with volume profile and value area"
          >
            <defs>
              <linearGradient id="deskVpGold" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#c9a227" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#e8ce78" stopOpacity="0.65" />
              </linearGradient>
              <linearGradient id="deskVolUp" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#35c07a" stopOpacity="0" />
                <stop offset="100%" stopColor="#35c07a" stopOpacity="0.45" />
              </linearGradient>
              <linearGradient id="deskVolDn" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#e5544b" stopOpacity="0" />
                <stop offset="100%" stopColor="#e5544b" stopOpacity="0.45" />
              </linearGradient>
            </defs>

            {/* Value area band */}
            <rect
              x={chartLeft}
              y={y(vahV)}
              width={chartW}
              height={Math.max(y(valV) - y(vahV), 1)}
              fill="rgba(201,162,39,0.08)"
            />

            {/* Soft grid */}
            {axisMarks.map((p) => (
              <line
                key={`g-${p}`}
                x1={chartLeft}
                y1={y(toV(p))}
                x2={chartRight}
                y2={y(toV(p))}
                stroke="rgba(35,39,47,0.85)"
                strokeWidth={1}
              />
            ))}

            {/* Volume profile */}
            {profile.map((w, i) => {
              const barH = chartH / profile.length - 1;
              const top = padTop + i * (chartH / profile.length);
              const width = (w / 100) * 38;
              const isPoc = i === 6;
              return (
                <rect
                  key={i}
                  x={8}
                  y={top}
                  width={width}
                  height={barH}
                  rx={1}
                  fill={isPoc ? "#e8ce78" : "url(#deskVpGold)"}
                  opacity={isPoc ? 0.95 : 0.8}
                />
              );
            })}

            {/* Bottom volume histogram */}
            {candles.map((c, i) => {
              const cx = chartLeft + i * candleW + candleW / 2;
              const up = c.c >= c.o;
              const h = 6 + ((i * 17) % 14);
              return (
                <rect
                  key={`v-${i}`}
                  x={cx - candleW * 0.28}
                  y={156 - h}
                  width={candleW * 0.56}
                  height={h}
                  rx={0.5}
                  fill={up ? "url(#deskVolUp)" : "url(#deskVolDn)"}
                />
              );
            })}

            {/* Candles */}
            {candles.map((c, i) => {
              const cx = chartLeft + i * candleW + candleW / 2;
              const up = c.c >= c.o;
              const color = up ? "#35c07a" : "#e5544b";
              const bodyTop = y(Math.max(c.o, c.c));
              const bodyBot = y(Math.min(c.o, c.c));
              return (
                <g key={i}>
                  <line
                    x1={cx}
                    y1={y(c.h)}
                    x2={cx}
                    y2={y(c.l)}
                    stroke={color}
                    strokeWidth={1.15}
                  />
                  <rect
                    x={cx - candleW * 0.3}
                    y={bodyTop}
                    width={candleW * 0.6}
                    height={Math.max(bodyBot - bodyTop, 1.8)}
                    rx={0.5}
                    fill={color}
                  />
                </g>
              );
            })}

            {/* Structure levels — pills inside plot, clear of the price scale */}
            <g className="desk-hero-levels">
              {(
                [
                  { v: vahV, label: "VAH", dash: true, color: "#e8ce78" },
                  { v: pocV, label: "POC", dash: false, color: "#f4dd8f" },
                  { v: valV, label: "VAL", dash: true, color: "#c9a227" },
                ] as const
              ).map((lvl) => (
                <g key={lvl.label}>
                  <line
                    x1={chartLeft}
                    y1={y(lvl.v)}
                    x2={chartRight}
                    y2={y(lvl.v)}
                    stroke={lvl.color}
                    strokeWidth={lvl.dash ? 1 : 1.35}
                    strokeDasharray={lvl.dash ? "3.5 3" : undefined}
                    opacity={0.85}
                  />
                  <rect
                    x={chartRight - 34}
                    y={y(lvl.v) - 7}
                    width={30}
                    height={13}
                    rx={2}
                    fill="#0e1014"
                    stroke={lvl.color}
                    strokeWidth={0.8}
                  />
                  <text
                    x={chartRight - 19}
                    y={y(lvl.v) + 3}
                    fill={lvl.color}
                    fontSize="7.5"
                    fontWeight="700"
                    textAnchor="middle"
                    fontFamily="ui-sans-serif, system-ui"
                  >
                    {lvl.label}
                  </text>
                </g>
              ))}
            </g>

            {/* Axis prices */}
            {axisMarks.map((p) => (
              <text
                key={`a-${p}`}
                x={334}
                y={y(toV(p)) + 3}
                fill="#b6bac1"
                fontSize="7.5"
                textAnchor="end"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              >
                {fmtAxis(p)}
              </text>
            ))}

            {/* Live last-price tag (TradingView style) */}
            <g className="desk-hero-last">
              <line
                x1={chartLeft}
                y1={y(priceV)}
                x2={300}
                y2={y(priceV)}
                stroke="#35c07a"
                strokeWidth={1}
                strokeDasharray="2 3"
                opacity={0.6}
              />
              <rect
                x={296}
                y={Math.min(Math.max(y(priceV) - 8, 4), 148)}
                width={42}
                height={16}
                rx={3}
                fill="#35c07a"
              />
              <text
                x={317}
                y={Math.min(Math.max(y(priceV) + 3.5, 15), 159)}
                fill="#06140c"
                fontSize="7.5"
                fontWeight="700"
                textAnchor="middle"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              >
                {fmtAxis(price)}
              </text>
            </g>

            {/* Hide last candle tip under price tag clarity */}
            <circle
              cx={chartLeft + (candles.length - 0.5) * candleW}
              cy={lastY}
              r={2.2}
              fill="#35c07a"
              className="desk-hero-dot"
            />
          </svg>
        </div>

        <div className="mt-1.5 grid shrink-0 grid-cols-3 gap-1 sm:mt-2 sm:gap-1.5">
          {[
            { label: "VAH", value: levels.vah },
            { label: "POC", value: levels.poc },
            { label: "VAL", value: levels.val },
          ].map((l) => (
            <div
              key={l.label}
              className="rounded-lg border border-line bg-canvas/50 px-2 py-1.5 sm:px-2.5 sm:py-2"
            >
              <div className="text-[8px] font-semibold uppercase tracking-wider text-ink-mute sm:text-[9px]">
                {l.label}
              </div>
              <div className="mt-0.5 font-display text-[11px] font-semibold tabular-nums text-ink sm:text-xs">
                {fmtLevel(l.value)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative grid shrink-0 grid-cols-2 gap-1.5 border-t border-line px-3 py-2 sm:gap-2 sm:px-3.5 sm:py-2.5">
        <div className="rounded-xl border border-up/35 bg-up/10 px-2.5 py-2 sm:px-3 sm:py-2.5">
          <div className="text-[8px] font-semibold uppercase tracking-[0.16em] text-up/80 sm:text-[9px]">
            Regime Gate
          </div>
          <div className="mt-0.5 font-display text-lg font-extrabold tracking-tight text-up sm:text-xl">
            OPEN
          </div>
          <div className="mt-0.5 text-[9px] text-up/75 sm:text-[10px]">
            Permission 78 · vol mid
          </div>
        </div>
        <div className="rounded-xl border border-line bg-canvas/45 px-2.5 py-2 sm:px-3 sm:py-2.5">
          <div className="text-[8px] font-semibold uppercase tracking-[0.16em] text-ink-mute sm:text-[9px]">
            Hybrid tilt
          </div>
          <div className="mt-1.5">
            <div className="mb-1 flex justify-between text-[9px] text-ink-dim sm:text-[10px]">
              <span>Trading</span>
              <span className="tabular-nums text-gold-light">62%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full w-[62%] rounded-full bg-gold desk-hero-bar" />
            </div>
          </div>
          <div className="mt-1.5 text-[9px] text-ink-mute sm:text-[10px]">
            Staking 38% · risk-on
          </div>
        </div>
      </div>

      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .desk-hero-levels {
            opacity: 0;
            animation: desk-hero-fade 0.7s ease 0.35s forwards;
          }
          .desk-hero-last {
            opacity: 0;
            animation: desk-hero-fade 0.5s ease 0.7s forwards;
          }
          .desk-hero-dot {
            transform-box: fill-box;
            transform-origin: center;
            animation: desk-hero-pulse 2.2s ease-in-out infinite;
          }
          .desk-hero-bar {
            transform-origin: left center;
            transform: scaleX(0);
            animation: desk-hero-bar 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.55s forwards;
          }
        }
        @keyframes desk-hero-fade {
          to { opacity: 1; }
        }
        @keyframes desk-hero-bar {
          to { transform: scaleX(1); }
        }
        @keyframes desk-hero-pulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
