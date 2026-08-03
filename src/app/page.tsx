import Link from "next/link";
import { FAQ } from "@/components/FAQ";
import { HeroVideo } from "@/components/HeroVideo";
import { MarketTicker } from "@/components/MarketTicker";
import { ProductCards } from "@/components/ProductCards";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { Testimonials } from "@/components/Testimonials";

export default function Home() {
  return (
    <>
      {/* HERO — fills first screen; short phones grow instead of clipping */}
      <section
        id="hero"
        className="relative flex min-h-[calc(100svh-68px)] flex-col overflow-hidden [@media(max-height:720px)]:min-h-0"
      >
        <div className="absolute inset-0 -z-10">
          <div className="hero-art-wrap absolute inset-0">
            <HeroVideo />
          </div>
          {/* Soft veil — tone video brightness toward the rest of the site */}
          <div className="absolute inset-0 bg-canvas/18" />
          <div className="absolute inset-0 bg-gradient-to-r from-canvas/55 from-[0%] via-canvas/18 via-[24%] to-transparent to-[52%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-canvas/65 from-[0%] via-transparent via-[30%] to-canvas/12" />
        </div>

        <div className="container-x flex min-h-0 flex-1 items-center py-5 sm:py-8 md:py-10 [@media(max-height:720px)]:py-4">
          <div className="hero-copy relative z-10 w-full max-w-2xl lg:max-w-[34rem] xl:max-w-[38rem]">
            <div className="hero-copy-item mb-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.8rem] font-medium tracking-[0.04em] text-gold-light sm:mb-5 sm:text-[0.85rem] md:mb-6 md:text-[0.95rem] [@media(max-height:720px)]:mb-2">
              <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-up/35 animate-ping motion-reduce:animate-none" />
                <span className="relative h-2 w-2 rounded-full bg-up" />
              </span>
              <span>Live in real markets</span>
              <span className="hidden h-3.5 w-px shrink-0 bg-gold/45 sm:block" aria-hidden />
              <span className="text-ink/70">Private pilot clients</span>
            </div>

            <h1 className="hero-copy-item font-display tracking-tight">
              <span className="block text-[2.75rem] font-extrabold leading-[0.92] sm:text-6xl md:text-7xl xl:text-8xl">
                Orveli<span className="text-gold-gradient">ant</span>
              </span>
              <span className="mt-3 block text-[1.2rem] font-bold leading-[1.22] text-ink sm:mt-5 sm:text-[1.9rem] md:text-3xl xl:text-[2.45rem] [@media(max-height:720px)]:mt-2">
                Built to <span className="text-gold-gradient">Act on Opportunity.</span>
                <br />
                Engineered to <span className="text-gold-gradient">Control Risk.</span>
              </span>
            </h1>

            <p className="hero-copy-item mt-4 max-w-lg text-[0.95rem] leading-relaxed text-ink/75 sm:mt-5 sm:text-base md:mt-7 md:text-lg xl:text-xl [@media(max-height:680px)]:hidden">
              Disciplined AI investing across{" "}
              <span className="text-ink">AI Quant Trading</span>,{" "}
              <span className="text-ink">Staking</span>, and{" "}
              <span className="text-ink">Hybrid</span> — capital growth with strict,
              automated risk control.
            </p>

            <div className="hero-copy-item mt-5 flex flex-wrap items-center gap-2.5 sm:mt-7 sm:gap-3 md:mt-10 md:gap-4 [@media(max-height:720px)]:mt-4">
              <Link href="/waitlist" className="btn-gold px-5 py-3 text-sm sm:px-7 sm:py-3.5 sm:text-base">
                Request Access
              </Link>
              <Link href="/how-it-works" className="btn-ghost px-5 py-3 text-sm text-ink sm:px-7 sm:py-3.5 sm:text-base">
                See how it works
              </Link>
            </div>
          </div>
        </div>

        <div className="relative z-10 shrink-0">
          <MarketTicker />
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="container-x py-16 scroll-mt-24">
        <SectionHeading
          eyebrow="Three ways to grow"
          title={<>One platform. <span className="text-gold-gradient">Three disciplined strategies.</span></>}
          subtitle="Activate your account and choose the approach that fits your goals. Switch or blend at any time."
        />
        <div className="mt-12">
          <ProductCards />
        </div>
      </section>

      {/* ONE PROOF */}
      <section className="container-x py-16">
        <SectionHeading
          center
          eyebrow="What clients gained"
          title={<>Real money in the account. <span className="text-gold-gradient">Risk still first.</span></>}
          subtitle="Private pilot clients — mostly AI Quant Trading, plus Staking and Hybrid — reporting realized profit they could withdraw, inside automated risk limits. Past pilot results are not a promise of future returns."
        />
        <div className="mt-12">
          <Testimonials />
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x py-16">
        <SectionHeading
          center
          eyebrow="Questions"
          title={<>Everything you need to <span className="text-gold-gradient">know.</span></>}
        />
        <div className="mt-12">
          <FAQ limit={5} />
        </div>
      </section>

      {/* CTA */}
      <section className="container-x py-20">
        <Reveal>
          <div className="border-y border-line py-12 md:py-16 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight">
              Your capital, managed by a{" "}
              <span className="text-gold-gradient">continuously active</span> system.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-ink-dim leading-relaxed">
              Join the early-access list and be first to activate Trading, Staking, or
              Hybrid on Orveliant.
            </p>
            <div className="mx-auto mt-8 grid w-full max-w-sm grid-cols-1 gap-4 sm:max-w-lg sm:grid-cols-2">
              <Link href="/waitlist" className="btn-gold justify-center">
                Request Access
              </Link>
              <Link href="/security" className="btn-ghost justify-center">
                Review our safeguards
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
