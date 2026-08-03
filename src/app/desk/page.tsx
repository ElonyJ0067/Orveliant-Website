import type { Metadata } from "next";
import Link from "next/link";
import { DeskHeroVisual } from "@/components/intelligence/DeskHeroVisual";
import { IntelligenceDesk } from "@/components/intelligence/IntelligenceDesk";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Intelligence Desk",
  description:
    "Orveliant’s proprietary market desk: Regime Gate, Structure Atlas, Absorption Sentinel, Liquidity Magnets, and Hybrid Compass — structural tools aligned with Trading, Staking and Hybrid.",
};

export default function DeskPage() {
  return (
    <div className="container-x py-16">
      <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
        <Reveal>
          <div className="eyebrow mb-5">Not another indicator pack</div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-[2.6rem] font-bold leading-[1.15] tracking-tight">
            Tools built for how Orveliant{" "}
            <span className="text-gold-gradient">actually decides.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-[1.7] text-ink-dim">
            Volume-value maps, failed liquidity sweeps, regime permission, and Hybrid tilt —
            the same classes of structure institutional desks use, wired to our Trading ·
            Staking · Hybrid stack. Live from exchange data. Unique to this product.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/products/ai-quant-trading" className="btn-ghost text-sm">
              See Quant Trading
            </Link>
            <Link href="/products/hybrid" className="btn-ghost text-sm">
              See Hybrid
            </Link>
            <Link href="/waitlist" className="btn-gold text-sm">
              Request Access
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.12} className="relative mx-auto w-full max-w-[460px] lg:max-w-none">
          <div
            className="relative aspect-[5/5.2] overflow-hidden rounded-2xl border border-line bg-surface/40 shadow-[0_28px_70px_-36px_rgba(0,0,0,0.95)] lg:aspect-square"
            role="img"
            aria-label="Intelligence Desk — 1H desk with structure levels, volume, Regime Gate, and Hybrid tilt"
          >
            <DeskHeroVisual />
          </div>
        </Reveal>
      </div>

      <div className="mt-14">
        <IntelligenceDesk />
      </div>

      <Reveal>
        <div className="mt-16 border-y border-line py-10 md:py-12">
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end sm:gap-12">
            <div className="max-w-2xl">
              <div className="eyebrow mb-3">Full platform access</div>
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Explore our professional investing dashboard{" "}
                <span className="text-gold-gradient">and trading tools.</span>
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-dim">
                Above is one decision desk. Access opens the full capital stack — Quant
                Trading, Staking, and Hybrid.
              </p>
            </div>
            <Link
              href="/waitlist"
              className="btn-gold shrink-0 whitespace-nowrap px-7 py-3.5 text-sm"
            >
              Explore →
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
