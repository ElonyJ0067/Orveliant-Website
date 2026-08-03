import Link from "next/link";
import { Logo } from "./Logo";
import { SocialLinks } from "./SocialLinks";
import { SITE } from "@/lib/site";

const cols = [
  {
    title: "Products",
    links: [
      { label: "AI Quant Trading", href: "/products/ai-quant-trading" },
      { label: "Staking", href: "/products/staking" },
      { label: "Hybrid Strategy", href: "/products/hybrid" },
      { label: "Intelligence Desk", href: "/desk" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "How It Works", href: "/how-it-works" },
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Insights", href: "/insights" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "Security & Risk", href: "/security" },
      { label: "Fund Safety", href: "/custody" },
      { label: "Fees", href: "/fees" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Risk Disclosure", href: "/legal/risk" },
      { label: "Cookie Policy", href: "/legal/cookies" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-line bg-canvas">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/45 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(80%_100%_at_50%_0%,rgba(201,162,39,0.06),transparent_70%)]"
      />

      <div className="container-x relative py-14 md:py-16">
        <div className="grid gap-10 border-b border-line pb-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
          <div>
            <Logo />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-mute">
              Disciplined, risk-controlled AI investing across Trading, Staking and Hybrid —
              for private clients who treat protection as seriously as growth.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm sm:justify-end">
              <a
                href={`mailto:${SITE.email}`}
                className="font-medium text-gold-light transition-colors hover:text-gold-bright"
              >
                {SITE.email}
              </a>
              <span className="text-ink-mute/40" aria-hidden>
                /
              </span>
              <a
                href={SITE.phoneHref}
                className="tabular-nums text-ink-dim transition-colors hover:text-gold-light"
              >
                {SITE.phone}
              </a>
            </div>
            <p className="text-sm text-ink-mute sm:text-right">{SITE.location}</p>
            <SocialLinks />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4 md:gap-x-10">
          {cols.map((col) => (
            <nav key={col.title} aria-label={col.title} className="min-w-0">
              <h4 className="border-b border-line pb-3 font-display text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-ink">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-ink-mute transition-colors duration-200 hover:text-gold-light"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-8 md:flex-row md:items-center md:justify-between md:gap-8">
          <p className="text-xs text-ink-mute">
            © {new Date().getFullYear()} Orveliant. All rights reserved.
          </p>
          <p className="max-w-2xl text-xs leading-relaxed text-ink-mute md:text-right">
            Trading and staking digital assets involves substantial risk, including possible
            loss of capital. Nothing on this site is financial advice or a guarantee of returns.
          </p>
        </div>
      </div>
    </footer>
  );
}
