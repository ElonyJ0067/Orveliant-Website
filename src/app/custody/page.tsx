import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { CUSTODY_FAQS, CUSTODY_PARTNERS, CUSTODY_STACK } from "@/lib/trust";

export const metadata: Metadata = {
  title: "Fund Safety & Custody",
  description:
    "How Ocean Park Asset safeguards client capital: segregated wallets, cold-majority storage, MPC dual control, allowlisted withdrawals, and transparent operations.",
};

export default function CustodyPage() {
  return (
    <div className="container-x py-16">
      <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        <Reveal>
          <div className="eyebrow mb-3">Fund safety & custody</div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-[2.7rem] font-bold leading-[1.1] tracking-tight">
            Your capital, <span className="text-gold-gradient">protected by design.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-dim">
            Before performance comes protection. Ocean Park Asset’s custody stack keeps client assets
            segregated, cold-majority stored, and movable only under dual-control, allowlisted
            procedures.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="relative mx-auto aspect-square w-full max-w-[380px] overflow-hidden rounded-2xl border border-line lg:max-w-none">
            <Image
              src="/images/custody-vault.webp"
              alt="Institutional custody vault — cold storage and controlled access"
              fill
              priority
              sizes="(max-width: 1024px) 380px, 420px"
              className="object-cover"
            />
          </div>
        </Reveal>
      </div>

      <ol className="mt-16 divide-y divide-line border-y border-line">
        {CUSTODY_STACK.map((p, i) => (
          <li key={p.title} className="grid gap-3 py-7 sm:grid-cols-[4rem_1fr] sm:gap-8">
            <span className="font-display text-sm font-semibold tracking-widest text-gold/50">
              {String(i + 1).padStart(2, "0")}
            </span>
            <Reveal delay={(i % 3) * 0.06}>
              <h3 className="font-display font-semibold">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-dim">{p.body}</p>
            </Reveal>
          </li>
        ))}
      </ol>

      <div className="mt-20">
        <SectionHeading
          eyebrow="Custody stack"
          title={<>How the <span className="text-gold-gradient">rails</span> are organized.</>}
          subtitle="We describe the architecture clearly. Named venues and staking providers are confirmed in your account documents at activation — they can vary by asset and jurisdiction."
        />
        <div className="mt-10 grid gap-10 sm:grid-cols-2">
          {CUSTODY_PARTNERS.map((p, i) => (
            <Reveal key={p.name} delay={(i % 2) * 0.08}>
              <div className="border-t border-line pt-5">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-light">
                  {p.role}
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold text-ink">{p.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-dim">{p.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-20">
        <SectionHeading eyebrow="Common questions" title="Fund safety, answered" />
        <div className="mt-8 space-y-0 border-y border-line">
          {CUSTODY_FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.06}>
              <div className="border-b border-line py-6 last:border-b-0">
                <h3 className="font-display font-semibold text-ink">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-dim">{f.a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-16 border-y border-line py-10">
        <Reveal>
          <p className="text-sm leading-relaxed text-ink-mute">
            Digital-asset trading and staking involve risk, including possible loss of capital.
            Market risk is managed by Ocean Park Asset&apos;s automated controls; it is never eliminated.
            Jurisdiction, account eligibility, and the exact exchange or staking counterparties
            for your assets are confirmed when your account is activated.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link href="/waitlist" className="btn-gold">Request Access</Link>
            <Link href="/security" className="btn-ghost">Risk controls</Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
