import type { Metadata } from "next";
import Link from "next/link";
import { MarketsMark } from "@/components/MarketsMark";
import { MarketsView } from "@/components/MarketsView";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Markets",
  description:
    "Live prices and professional charts for the curated, high-liquidity assets Ocean Park Asset supports across Trading, Staking and Hybrid strategies.",
};

export default function MarketsPage() {
  return (
    <div className="container-x py-16">
      <div className="grid items-center gap-4 sm:gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
        <Reveal>
          <div className="eyebrow mb-3">Live markets</div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-[2.7rem] font-bold leading-[1.1] tracking-tight">
            Curated assets.{" "}
            <span className="text-gold-gradient">Real-time clarity.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-dim">
            Professional, exchange-grade charts for every chain we support — updated live,
            focused on the assets that matter for disciplined execution.
          </p>
          <div className="mt-6">
            <Link href="/desk" className="btn-gold text-sm">
              Open Intelligence Desk →
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.12} className="relative mx-auto mt-0 flex w-full max-w-[320px] items-center justify-center overflow-visible sm:max-w-[360px] lg:max-w-none">
          <MarketsMark />
        </Reveal>
      </div>

      <div className="-mt-3 sm:-mt-1 lg:mt-12">
        <MarketsView />
      </div>
      <p className="mt-6 text-xs text-ink-mute">
        Market data is sourced from public market APIs and refreshes automatically.
        Figures are indicative and for informational purposes only.
      </p>
    </div>
  );
}
