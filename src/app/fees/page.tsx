import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Fees",
  description:
    "Orveliant's transparent fee model: we succeed when you do. Clear, aligned pricing across Trading, Staking and Hybrid.",
};

const plans = [
  {
    name: "AI Quant Trading",
    highlight: "Performance-aligned",
    lines: [
      { k: "Management fee", v: "0%" },
      { k: "Performance fee", v: "20% of profits" },
      { k: "High-water mark", v: "Yes" },
      { k: "Deposit / account fee", v: "None" },
    ],
    note: "We only earn a performance fee on new profits, protected by a high-water mark — so we succeed when you do.",
  },
  {
    name: "Staking",
    highlight: "Simple spread",
    lines: [
      { k: "Management fee", v: "0%" },
      { k: "Staking service fee", v: "10% of yield" },
      { k: "Net yield to you", v: "90% of rewards" },
      { k: "Deposit / account fee", v: "None" },
    ],
    note: "You keep the majority of on-chain staking rewards. The service fee covers validator infrastructure and operations.",
  },
  {
    name: "Hybrid Strategy",
    highlight: "Blended",
    lines: [
      { k: "Trading portion", v: "20% performance fee" },
      { k: "Staking portion", v: "10% of yield" },
      { k: "Allocation fee", v: "None" },
      { k: "Rebalancing fee", v: "None" },
    ],
    note: "Fees apply only to each underlying portion — the AI's automatic allocation and rebalancing are free.",
  },
];

export default function FeesPage() {
  return (
    <div className="container-x py-16">
      <SectionHeading
        center
        eyebrow="Transparent pricing"
        title={<>We earn when <span className="text-gold-gradient">you earn.</span></>}
        subtitle="No hidden charges, no account fees, no surprises. Fees are aligned with your results — the way it should be."
      />

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {plans.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.1}>
            <div className="card card-hover h-full p-7">
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <h3 className="font-display text-lg font-bold">{p.name}</h3>
                <span className="chip shrink-0">{p.highlight}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {p.lines.map((l) => (
                  <li key={l.k} className="flex items-center justify-between border-b border-line/60 pb-3 text-sm">
                    <span className="text-ink-dim">{l.k}</span>
                    <span className="font-semibold text-ink">{l.v}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs leading-relaxed text-ink-mute">{p.note}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-12">
        <Reveal>
          <p className="mx-auto max-w-3xl text-center text-sm text-ink-mute">
            Indicative fee structure for Phase 1. Final fees, minimums and any network/gas
            costs will be confirmed at account activation. Nothing here guarantees profit;
            performance fees only apply when profits are generated.
          </p>
        </Reveal>
      </div>

      <div className="mt-14 text-center">
        <Reveal>
          <Link href="/waitlist" className="btn-gold">Request Access</Link>
        </Reveal>
      </div>
    </div>
  );
}
