import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { WaitlistForm } from "@/components/WaitlistForm";

export const metadata: Metadata = {
  title: "Request Access",
  description:
    "Join the Ocean Park Asset early-access list to be first to activate AI Quant Trading, Staking, or Hybrid strategies.",
};

/** Matches Contact desk panel height (measured). */
const DESK_PANEL_H = "lg:h-[679px] lg:max-h-[679px] lg:overflow-hidden";

const rows = [
  {
    n: "01",
    label: "Priority",
    title: "Onboarding when accounts open",
    detail: "First in line when your phase is invited.",
  },
  {
    n: "02",
    label: "Access",
    title: "Trading, Staking & Hybrid",
    detail: "Early access across all three strategies.",
  },
  {
    n: "03",
    label: "Desk",
    title: "Direct updates from the team",
    detail: "Invite details only — no spam.",
  },
];

export default function WaitlistPage() {
  return (
    <div className="container-x py-16 md:py-20">
      <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-16 xl:gap-20">
        <Reveal>
          <div className={`flex flex-col ${DESK_PANEL_H}`}>
            <div className="eyebrow mb-3">Early access</div>
            <h1 className="font-display text-[2.35rem] font-extrabold leading-[1.08] tracking-tight md:text-5xl">
              Be first to put your capital{" "}
              <span className="text-gold-gradient">to work.</span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ink-dim md:text-lg">
              Ocean Park Asset opens in phases. Join the list and we&apos;ll invite you to activate
              Trading, Staking, or the intelligent Hybrid strategy when your phase opens.
            </p>

            <div className="mt-6 space-y-2.5">
              {rows.map((row) => (
                <div
                  key={row.n}
                  className="group flex items-start gap-4 rounded-2xl border border-line bg-surface/40 px-5 py-4 transition-colors hover:border-gold/40 hover:bg-gold/[0.04]"
                >
                  <span
                    className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gold/30 bg-gold/10 font-display text-xs font-semibold tracking-wide text-gold-light"
                    aria-hidden
                  >
                    {row.n}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                      {row.label}
                    </span>
                    <span className="mt-1 block font-display text-lg font-semibold text-ink transition-colors group-hover:text-gold-light">
                      {row.title}
                    </span>
                    <span className="mt-1 block text-sm text-ink-mute">{row.detail}</span>
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-auto pt-6 text-xs leading-relaxed text-ink-mute">
              No guaranteed returns — disciplined access only. Invite-only onboarding across Trading,
              Staking, and Hybrid.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <WaitlistForm />
        </Reveal>
      </div>
    </div>
  );
}
