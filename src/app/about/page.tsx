import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AboutHeroVisual } from "@/components/AboutHeroVisual";
import { Reveal } from "@/components/Reveal";
import { LEADERSHIP } from "@/lib/trust";

export const metadata: Metadata = {
  title: "About",
  description:
    "Orveliant is built by senior traders and engineers to deliver disciplined, risk-controlled AI investing across Trading, Staking and Hybrid strategies.",
};

const values = [
  { title: "Discipline", body: "We favor consistent, rule-based execution over impulsive bets. The system does what it is designed to do — every time." },
  { title: "Transparency", body: "No guaranteed-return promises. Real on-chain staking, clearly-sourced data, and honest communication about risk." },
  { title: "Protection", body: "Capital preservation is engineered into every layer. Growth is pursued only within strict risk boundaries." },
  { title: "Focus", body: "We support the chains that matter, done properly — rather than chasing breadth at the cost of quality." },
];

const foundations = [
  { label: "Origin", value: "Traders & engineers" },
  { label: "Mandate", value: "Risk before growth" },
  { label: "Status", value: "Private pilot clients" },
] as const;

export default function AboutPage() {
  return (
    <div className="container-x py-16">
      {/* Hero — copy + brand visual (fills the right rail) */}
      <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        <Reveal>
          <div className="eyebrow mb-3">About Orveliant</div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-[2.7rem] font-bold leading-[1.1] tracking-tight">
            Built for real markets.{" "}
            <span className="text-gold-gradient">Designed for disciplined performance.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-dim">
            Orveliant was created by senior traders and engineers to bring institutional-grade
            discipline to AI-driven crypto investing — for private clients who value controlled
            risk as much as growth.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/waitlist" className="btn-gold text-sm">
              Request Access
            </Link>
            <Link href="/how-it-works" className="btn-ghost text-sm">
              How it works
            </Link>
          </div>
          <dl className="mt-10 grid max-w-xl grid-cols-1 gap-4 border-t border-line pt-6 sm:grid-cols-3 sm:gap-5">
            {foundations.map((f) => (
              <div key={f.label}>
                <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                  {f.label}
                </dt>
                <dd className="mt-1.5 font-display text-sm font-semibold text-ink">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={0.1} className="relative mx-auto w-full max-w-[420px] lg:max-w-none">
          <AboutHeroVisual />
        </Reveal>
      </div>

      <div className="mt-16 grid gap-10 border-y border-line py-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div>
            <h2 className="font-display text-xl font-semibold">Our mission</h2>
            <p className="mt-4 leading-relaxed text-ink-dim">
              To let people put capital to work through a continuously active, risk-controlled
              AI system — without needing to watch the market themselves. We turn real-time
              market intelligence into disciplined execution, so growth is pursued responsibly.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div>
            <h2 className="font-display text-xl font-semibold">Our technology</h2>
            <p className="mt-4 leading-relaxed text-ink-dim">
              The platform is powered by a trading engine built and refined by our quant and
              engineering teams, then rigorously backtested, forward-tested, stress-tested,
              and validated in live markets. It is already used by private pilot clients under
              real trading conditions.
            </p>
          </div>
        </Reveal>
      </div>

      <div className="mt-16">
        <h2 className="font-display text-2xl font-bold">What we stand for</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={(i % 4) * 0.08}>
              <div className="border-t border-line pt-5">
                <h3 className="font-display font-semibold text-gold-light">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-dim">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-20">
        <h2 className="font-display text-2xl font-bold">Leadership</h2>
        <p className="mt-3 max-w-2xl text-ink-dim">
          The people behind Orveliant — leadership across strategy, technology, trading,
          and talent, accountable for how the platform is built and how capital is handled.
        </p>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {LEADERSHIP.map((m, i) => (
            <Reveal key={m.name} delay={(i % 3) * 0.08}>
              <article className="group">
                <div className="relative mb-5 aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-panel">
                  <Image
                    src={m.avatar}
                    alt={m.name}
                    fill
                    quality={92}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                    className="object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas/55 via-transparent to-transparent" />
                </div>
                <h3 className="font-display text-lg font-semibold text-ink">{m.name}</h3>
                <p className="mt-1 text-sm font-medium text-gold-light">{m.role}</p>
                <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-ink-mute">{m.focus}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-dim">{m.bio}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-20 border-y border-line py-12 text-center md:py-16">
        <Reveal>
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            Real-time intelligence. Proven validation.{" "}
            <span className="text-gold-gradient">Disciplined execution.</span>
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/waitlist" className="btn-gold">Request Access</Link>
            <Link href="/how-it-works" className="btn-ghost">How it works</Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
