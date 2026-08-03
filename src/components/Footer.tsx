import Link from "next/link";
import { Logo } from "./Logo";
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
] as const;

const legalLinks = [
  { label: "Terms", href: "/legal/terms" },
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Risk Disclosure", href: "/legal/risk" },
  { label: "Cookies", href: "/legal/cookies" },
] as const;

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-28 overflow-hidden border-t border-line/70 bg-canvas">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 40% at 12% 0%, rgba(201,162,39,0.09), transparent 70%), radial-gradient(45% 35% at 88% 8%, rgba(201,162,39,0.05), transparent 65%)",
        }}
      />

      <div className="container-x relative py-14 md:py-16">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-16 xl:gap-24">
          <div className="max-w-[21rem] shrink-0">
            <Logo />
            <p className="mt-4 text-[13px] leading-[1.7] text-ink-dim">
              Disciplined, risk-controlled AI investing across Trading, Staking and Hybrid —
              for private clients who treat protection as seriously as growth.
            </p>
            <Link
              href="/waitlist"
              className="group mt-6 inline-flex items-center gap-2 border-b border-gold/40 pb-0.5 text-[13px] font-semibold text-gold-light transition-[border-color,color] duration-200 hover:border-gold-bright hover:text-gold-bright"
            >
              Request private access
              <span
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </div>

          <nav
            aria-label="Footer"
            className="grid w-full grid-cols-2 gap-x-8 gap-y-10 sm:w-auto sm:grid-cols-3 sm:gap-x-12 lg:shrink-0 lg:gap-x-16 lg:pt-1 xl:gap-x-20"
          >
            {cols.map((col) => (
              <div key={col.title} className="min-w-0">
                <h4 className="font-display text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ink/90">
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-[13px] text-ink-mute transition-colors duration-200 hover:text-ink"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 border-t border-line/70 pt-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <address className="flex flex-col gap-2 text-[12.5px] not-italic text-ink-dim sm:flex-row sm:flex-wrap sm:items-center sm:gap-y-2">
              <a
                href={`mailto:${SITE.email}`}
                className="transition-colors duration-200 hover:text-ink"
              >
                {SITE.email}
              </a>
              <span className="mx-3 hidden text-ink-mute/45 sm:inline" aria-hidden>
                ·
              </span>
              <a
                href={SITE.phoneHref}
                className="tabular-nums transition-colors duration-200 hover:text-ink"
              >
                {SITE.phone}
              </a>
              <span className="mx-3 hidden text-ink-mute/45 sm:inline" aria-hidden>
                ·
              </span>
              <span className="text-ink-mute">{SITE.location}</span>
            </address>

            <a
              href={SITE.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Orveliant on LinkedIn (opens in a new tab)"
              className="inline-flex items-center gap-2 self-start text-[12.5px] text-ink-mute transition-colors duration-200 hover:text-ink sm:self-auto"
            >
              <LinkedInIcon className="h-4 w-4" />
              <span>LinkedIn</span>
            </a>
          </div>

          <div className="mt-7 flex flex-col gap-4 border-t border-line/50 pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
              <p className="shrink-0 text-[11px] text-ink-mute">
                © {year} Orveliant. All rights reserved.
              </p>
              <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {legalLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-[11px] text-ink-mute/90 transition-colors duration-200 hover:text-ink-dim"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>
            <p className="max-w-2xl text-[11px] leading-relaxed text-ink-mute/80">
              Trading and staking digital assets involves substantial risk, including possible
              loss of capital. Nothing on this site is financial advice or a guarantee of returns.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
