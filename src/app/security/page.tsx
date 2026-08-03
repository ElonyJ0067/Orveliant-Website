import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Security & Risk",
  description:
    "How Orveliant protects capital: layered automated risk controls, transparent operations, and disciplined execution.",
};

const controls = [
  { title: "Automated Stop-Loss", body: "Every position carries a predefined stop, enforced instantly and without emotion." },
  { title: "Maximum Exposure Limits", body: "Position- and portfolio-level caps prevent overconcentration in any asset." },
  { title: "Daily Loss Limits", body: "Hard daily thresholds pause activity before losses can compound." },
  { title: "Drawdown Protection", body: "Portfolio-level controls scale risk down automatically as conditions weaken." },
  { title: "Leverage Governance", body: "Leverage is strictly bounded and monitored continuously against volatility." },
  { title: "Regime Detection", body: "Changing-market detection can halt new entries or pause trading entirely." },
];

const principles = [
  {
    title: "Transparency over promises",
    body: "We never advertise guaranteed returns. Staking yields are real and on-chain; trading outcomes depend on markets. We show you what is happening, not a fantasy.",
  },
  {
    title: "Risk control is the product",
    body: "Opportunity matters, but protection comes first. The system is designed to preserve capital when conditions turn — reducing exposure, pausing, or exiting.",
  },
  {
    title: "Discipline without emotion",
    body: "Rules are executed automatically and consistently. No panic, no greed, no deviation from the defined strategy.",
  },
];

export default function SecurityPage() {
  return (
    <div className="container-x py-16">
      <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        <Reveal>
          <div className="eyebrow mb-3">Security & risk</div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-[2.7rem] font-bold leading-[1.1] tracking-tight">
            Protecting capital is <span className="text-gold-gradient">the first job.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-dim">
            Every strategy on Orveliant operates inside a layered defense system that acts
            automatically — engineered to control risk in every market condition.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="relative mx-auto aspect-square w-full max-w-[380px] overflow-hidden rounded-2xl border border-line lg:max-w-none">
            <Image
              src="/images/security-shield.webp"
              alt="Layered gold shields enclosing a protected core — capital defense in depth"
              fill
              preload
              sizes="(max-width: 1024px) 380px, 420px"
              className="object-cover object-center"
            />
          </div>
        </Reveal>
      </div>

      <ol className="mt-16 divide-y divide-line border-y border-line">
        {controls.map((c, i) => (
          <li key={c.title} className="grid gap-3 py-7 sm:grid-cols-[4rem_1fr] sm:gap-8">
            <span className="font-display text-sm font-semibold tracking-widest text-gold/50">
              {String(i + 1).padStart(2, "0")}
            </span>
            <Reveal delay={(i % 3) * 0.06}>
              <h3 className="font-display font-semibold text-ink">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-dim">{c.body}</p>
            </Reveal>
          </li>
        ))}
      </ol>

      <div className="mt-24">
        <SectionHeading
          eyebrow="Our principles"
          title={<>Built to earn <span className="text-gold-gradient">trust</span></>}
        />
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {principles.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1}>
              <div className="border-t border-gold/30 pt-5">
                <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-dim">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-20 pb-4">
        <Reveal>
          <div className="border-y border-line py-10">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div className="max-w-xl">
                <h2 className="font-display text-2xl font-bold md:text-3xl">
                  Ready to allocate with <span className="text-gold-gradient">discipline?</span>
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-dim">
                  Join early access and operate inside the same risk framework.
                </p>
              </div>
              <Link href="/waitlist" className="btn-gold shrink-0">
                Request Access
              </Link>
            </div>
            <p className="mt-8 max-w-3xl text-xs leading-relaxed text-ink-mute">
              Trading and staking involve real risk of loss — Orveliant manages it with
              discipline, never with promises. Not financial advice; past results do not
              guarantee future performance.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
