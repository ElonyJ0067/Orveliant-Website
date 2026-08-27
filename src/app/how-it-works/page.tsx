import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MethodologyPanel } from "@/components/MethodologyPanel";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Inside Ocean Park Asset's disciplined engine: real-time intelligence, high-confidence execution, automated capital protection, dynamic sizing and continuous performance control.",
};

const stages = [
  {
    n: "01",
    title: "Real-Time Market Intelligence",
    body: "Our AI continuously analyzes price movements, momentum, volume, volatility, liquidity, and broader market conditions to detect meaningful opportunities as they develop.",
  },
  {
    n: "02",
    title: "High-Confidence Entry & Exit Decisions",
    body: "The system enters a trade only when defined market signals and risk conditions align. Every position follows a disciplined exit strategy based on market movement, profit targets, stop-loss limits, and changing conditions.",
  },
  {
    n: "03",
    title: "Automated Capital Protection",
    body: "Every trade operates within predefined risk limits, including stop-losses, leverage controls, maximum position exposure, daily loss limits, and portfolio drawdown protection.",
  },
  {
    n: "04",
    title: "Dynamic Position Sizing & Execution",
    body: "The system calculates each position according to investor capital, market volatility, liquidity, signal strength, and current portfolio exposure — then executes automatically with a focus on reducing slippage and unnecessary risk.",
  },
  {
    n: "05",
    title: "Continuous Performance Control",
    body: "The system continuously monitors every active position and overall strategy performance. When market risk increases or performance weakens, it can reduce exposure, stop opening new positions, or pause trading automatically.",
  },
];

const validation = [
  { title: "Backtesting", body: "Evaluated across years of historical market conditions." },
  { title: "Forward Testing", body: "Validated on unseen, out-of-sample market data." },
  { title: "Stress Testing", body: "Pressured against extreme volatility and liquidity shocks." },
  { title: "Execution Validation", body: "Live-fire checks on slippage, latency and fill quality." },
];

const activeSystem = [
  {
    n: "01",
    title: "Monitor",
    body: "Prices, momentum, volatility, volume, liquidity, and broader market conditions — continuously.",
  },
  {
    n: "02",
    title: "Evaluate & size",
    body: "Opportunities assessed in real time; position size set to your available capital.",
  },
  {
    n: "03",
    title: "Execute",
    body: "Trades open only when entry, exit, and risk requirements are all satisfied.",
  },
  {
    n: "04",
    title: "Supervise",
    body: "Stop-loss, exposure limits, drawdown controls, and regime detection on every position.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container-x py-16">
      {/* Hero — copy + brand visual (fills the right rail) */}
      <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        <Reveal>
          <div className="eyebrow mb-3">The methodology</div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-[2.7rem] font-bold leading-[1.1] tracking-tight">
            Continuous intelligence. Disciplined execution.{" "}
            <span className="text-gold-gradient">Risk-controlled growth.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-dim">
            Our AI trading system continuously monitors the crypto market, responds to
            meaningful price movements in real time, and executes precise entry and exit
            decisions — always inside strict risk control.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/waitlist" className="btn-gold text-sm">
              Request Access
            </Link>
            <Link href="/desk" className="btn-ghost text-sm">
              Open Intelligence Desk
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="relative mx-auto w-full max-w-[420px] lg:max-w-none">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-surface/40">
            <Image
              src="/images/methodology-engine.webp"
              alt="Ocean Park Asset trading engine — layered intelligence, decision, and risk panels"
              fill
              priority
              sizes="(max-width: 1024px) 420px, 480px"
              className="object-cover"
            />
          </div>
        </Reveal>
      </div>

      {/* Stages + sticky process panel */}
      <div className="mt-20 grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-start lg:gap-14">
        <div className="space-y-0 border-y border-line">
          {stages.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.04}>
              <div className="grid gap-4 border-b border-line py-8 last:border-b-0 md:grid-cols-[4.5rem_1fr] md:gap-8">
                <div className="font-display text-3xl font-bold text-gold/35">{s.n}</div>
                <div>
                  <h2 className="font-display text-xl font-semibold">{s.title}</h2>
                  <p className="mt-2 leading-relaxed text-ink-dim">{s.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="lg:sticky lg:top-24">
          <Reveal delay={0.08}>
            <MethodologyPanel />
          </Reveal>
        </div>
      </div>

      <div className="mt-24">
        <SectionHeading
          eyebrow="Proven before deployed"
          title={<>Rigorously <span className="text-gold-gradient">validated</span> across market conditions</>}
          subtitle="Before live deployment, the system underwent extensive validation. It is now operating in real-market environments, already used by private clients under real trading conditions."
        />
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {validation.map((v, i) => (
            <Reveal key={v.title} delay={(i % 4) * 0.08}>
              <div className="border-t border-line pt-5">
                <h3 className="font-display font-semibold">{v.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-dim">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-24">
        <SectionHeading
          eyebrow="Always on"
          title={
            <>
              Your capital is managed by a{" "}
              <span className="text-gold-gradient">continuously active</span> trading system.
            </>
          }
          subtitle="Once your account is activated, the system runs without pause — scanning markets, sizing risk, and supervising every position."
        />

        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {activeSystem.map((step, i) => (
            <li key={step.n} className="border-t border-gold/25 pt-5">
              <Reveal delay={i * 0.08}>
                <div className="font-display text-sm font-semibold tracking-widest text-gold/50">
                  {step.n}
                </div>
                <h3 className="mt-3 font-display font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-dim">{step.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal>
          <div className="mt-10 flex flex-col items-start justify-between gap-6 border-y border-line py-8 sm:flex-row sm:items-center">
            <p className="max-w-xl font-display text-lg font-semibold leading-snug">
              Your objective: capital growth.{" "}
              <span className="text-gold-gradient">
                Our responsibility: disciplined execution and controlled risk.
              </span>
            </p>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link href="/waitlist" className="btn-gold">
                Request Access
              </Link>
              <Link href="/security" className="btn-ghost">
                Review safeguards
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
