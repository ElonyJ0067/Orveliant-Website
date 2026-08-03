import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CoinIcon } from "@/components/CoinIcon";
import { Reveal } from "@/components/Reveal";
import { COINS } from "@/lib/coins";
import { getProduct, PRODUCTS } from "@/lib/products";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.summary,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const others = PRODUCTS.filter((p) => p.slug !== slug);

  return (
    <div className="container-x py-16">
      {/* Hero */}
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <Reveal>
            <Link href="/#products" className="text-sm text-ink-mute hover:text-gold-light transition-colors">
              ← All products
            </Link>
            <div className="eyebrow mt-4 mb-3">{product.tagline}</div>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-[1.05] tracking-tight">
              {product.name}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-dim max-w-xl">
              {product.summary}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/waitlist" className="btn-gold">Request Access</Link>
              <Link href="/how-it-works" className="btn-ghost">How it works</Link>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <div className="relative mx-auto h-64 w-64 md:h-80 md:w-80">
            <div
              className="absolute inset-0 rounded-full blur-3xl opacity-50"
              style={{ background: "radial-gradient(circle, rgba(201,162,39,0.5), transparent 70%)" }}
            />
            <Image
              src={product.icon}
              alt={product.name}
              fill
              quality={95}
              sizes="(max-width: 768px) 256px, 320px"
              priority
              className="relative object-contain animate-float drop-shadow-[0_20px_40px_rgba(201,162,39,0.4)]"
            />
          </div>
        </Reveal>
      </div>

      {/* Key capabilities */}
      <div className="mt-20">
        <h2 className="font-display text-2xl md:text-3xl font-bold">
          What you get with <span className="text-gold-gradient">{product.name}</span>
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {product.bullets.map((b, i) => (
            <Reveal key={b} delay={(i % 2) * 0.1}>
              <div className="card card-hover flex h-full items-start gap-4 p-6">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-gold/30 bg-gold/10 text-gold-light">
                  ◆
                </span>
                <p className="text-sm leading-relaxed text-ink-dim pt-1.5">{b}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Product-specific section */}
      {slug === "staking" && <StakingRates />}
      {slug === "hybrid" && <HybridAllocation />}
      {slug === "ai-quant-trading" && <TradingFlow />}

      {/* Cross-sell */}
      <div className="mt-20">
        <div className="hairline mb-10" />
        <h3 className="font-display text-xl font-semibold mb-6">Explore other strategies</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          {others.map((p) => (
            <Link key={p.slug} href={`/products/${p.slug}`} className="card card-hover flex items-center gap-5 p-6">
              <Image
                src={p.icon}
                alt={p.name}
                width={128}
                height={128}
                quality={95}
                sizes="64px"
                className="h-16 w-16 object-contain"
              />
              <div>
                <div className="font-display font-semibold">{p.name}</div>
                <div className="text-sm text-ink-dim">{p.tagline}</div>
              </div>
              <span className="ml-auto text-gold-light">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StakingRates() {
  const stakable = COINS.filter((c) => c.stakeApr);
  return (
    <div className="mt-20">
      <h2 className="font-display text-2xl md:text-3xl font-bold">
        Indicative <span className="text-gold-gradient">staking rates</span>
      </h2>
      <p className="mt-3 max-w-2xl text-ink-dim">
        Yields are variable and sourced from real on-chain staking. Rates shown are
        indicative and change with network conditions — never a fixed guarantee.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stakable.map((c) => (
          <div key={c.id} className="card flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <CoinIcon symbol={c.symbol} size={36} />
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-ink-mute">{c.symbol}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-lg font-bold text-gold-gradient">
                ~{c.stakeApr}%
              </div>
              <div className="text-xs text-ink-mute">indicative APR</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HybridAllocation() {
  const modes = [
    { name: "Conservative", trading: 30, staking: 70, note: "Stability-weighted. More on-chain yield, measured trading exposure." },
    { name: "Balanced", trading: 55, staking: 45, note: "The disciplined middle. AI shifts weight as conditions change." },
    { name: "Growth", trading: 75, staking: 25, note: "Opportunity-weighted, still governed by strict risk limits." },
  ];
  return (
    <div className="mt-20">
      <h2 className="font-display text-2xl md:text-3xl font-bold">
        How the AI <span className="text-gold-gradient">allocates</span>
      </h2>
      <p className="mt-3 max-w-2xl text-ink-dim">
        You choose a risk profile. The AI continuously divides your capital between
        Trading and Staking — and rebalances automatically as markets move.
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {modes.map((m) => (
          <div key={m.name} className="card p-6">
            <div className="font-display text-lg font-semibold">{m.name}</div>
            <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-surface-3">
              <div className="bg-gold" style={{ width: `${m.trading}%` }} />
              <div className="bg-gold/30" style={{ width: `${m.staking}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-xs text-ink-mute">
              <span>Trading {m.trading}%</span>
              <span>Staking {m.staking}%</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-dim">{m.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TradingFlow() {
  const flow = [
    { t: "Detect", d: "Continuous scan of price, momentum, volume, volatility & liquidity." },
    { t: "Decide", d: "Enter only when signals and risk conditions align." },
    { t: "Size", d: "Position calibrated to capital, volatility & exposure." },
    { t: "Protect", d: "Automated stops, exposure caps & drawdown control." },
    { t: "Adapt", d: "Reduce, pause, or exit as conditions change." },
  ];
  return (
    <div className="mt-20">
      <h2 className="font-display text-2xl md:text-3xl font-bold">
        The <span className="text-gold-gradient">execution loop</span>
      </h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {flow.map((f, i) => (
          <div key={f.t} className="card p-5">
            <div className="font-display text-2xl font-bold text-gold/40">{i + 1}</div>
            <div className="mt-2 font-semibold">{f.t}</div>
            <p className="mt-1 text-sm leading-relaxed text-ink-dim">{f.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
