import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { WaitlistForm } from "@/components/WaitlistForm";

export const metadata: Metadata = {
  title: "Request Access",
  description:
    "Join the Ocean Park Asset early-access list to be first to activate AI Quant Trading, Staking, or Hybrid strategies.",
};

const perks = [
  "Priority onboarding when accounts open",
  "Early access to Trading, Staking & Hybrid",
  "Direct updates from the Ocean Park Asset team",
  "No guaranteed returns — just disciplined access",
];

export default function WaitlistPage() {
  return (
    <div className="container-x py-16">
      <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
        <Reveal>
          <div>
            <div className="eyebrow mb-3">Early access</div>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-[1.05] tracking-tight">
              Be first to put your capital{" "}
              <span className="text-gold-gradient">to work.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-dim">
              Ocean Park Asset is opening access in phases. Join the list and we&apos;ll invite you
              to activate your account — Trading, Staking, or the intelligent Hybrid strategy.
            </p>
            <ul className="mt-8 space-y-3">
              {perks.map((p) => (
                <li key={p} className="flex items-center gap-3 text-ink-dim">
                  <span className="text-gold-light">◆</span> {p}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <WaitlistForm />
        </Reveal>
      </div>
    </div>
  );
}
