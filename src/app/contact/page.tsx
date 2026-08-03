import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with the Orveliant team in ${SITE.location} — ${SITE.email} or ${SITE.phone}.`,
};

export default function ContactPage() {
  return (
    <div className="container-x py-16 md:py-20">
      <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch lg:gap-16 xl:gap-20">
        <Reveal className="h-full">
          <div className="flex h-full flex-col">
            <div className="eyebrow mb-4">Contact</div>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">
              Speak with the <span className="text-gold-gradient">desk.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-dim">
              Institutional questions deserve a direct line. Reach Orveliant by email or phone,
              or send a brief note — we respond within one business day.
            </p>

            <div className="mt-10 space-y-3">
              <a
                href={`mailto:${SITE.email}`}
                className="group flex items-start gap-4 rounded-2xl border border-line bg-surface/40 px-5 py-5 transition-colors hover:border-gold/40 hover:bg-gold/[0.04]"
              >
                <span
                  className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold-light"
                  aria-hidden
                >
                  <MailIcon />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                    Email
                  </span>
                  <span className="mt-1 block font-display text-lg font-semibold text-ink transition-colors group-hover:text-gold-light">
                    {SITE.email}
                  </span>
                  <span className="mt-1 block text-sm text-ink-mute">
                    Best for strategy, security, and access requests
                  </span>
                </span>
              </a>

              <a
                href={SITE.phoneHref}
                className="group flex items-start gap-4 rounded-2xl border border-line bg-surface/40 px-5 py-5 transition-colors hover:border-gold/40 hover:bg-gold/[0.04]"
              >
                <span
                  className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold-light"
                  aria-hidden
                >
                  <PhoneIcon />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                    Phone
                  </span>
                  <span className="mt-1 block font-display text-lg font-semibold tabular-nums text-ink transition-colors group-hover:text-gold-light">
                    {SITE.phone}
                  </span>
                  <span className="mt-1 block text-sm text-ink-mute">
                    Direct line for time-sensitive conversations
                  </span>
                </span>
              </a>

              <div className="flex items-start gap-4 rounded-2xl border border-line bg-surface/40 px-5 py-5">
                <span
                  className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold-light"
                  aria-hidden
                >
                  <PinIcon />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                    Location
                  </span>
                  <span className="mt-1 block font-display text-lg font-semibold text-ink">
                    {SITE.location}
                  </span>
                  <span className="mt-1 block text-sm text-ink-mute">
                    {SITE.locationDetail}
                  </span>
                </span>
              </div>
            </div>

            <p className="mt-10 text-xs leading-relaxed text-ink-mute">
              Orveliant operates from {SITE.location}. Full registered entity details will be
              published at platform launch.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="h-full min-h-0">
          <ContactForm />
        </Reveal>
      </div>
    </div>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden>
      <path
        d="M4 6.5h16v11H4v-11z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 7.2L12 12.4l7.5-5.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden>
      <path
        d="M8.2 4.8c.4-.4.9-.6 1.4-.5l2.1.4c.5.1.9.5 1 1l.5 2.3c.1.5-.1 1-.5 1.3l-1.2 1c.8 1.5 2 2.7 3.5 3.5l1-1.2c.3-.4.8-.6 1.3-.5l2.3.5c.5.1.9.5 1 1l.4 2.1c.1.5-.1 1.1-.5 1.4l-1.3 1.1c-.4.4-1 .6-1.6.5-4.3-.6-7.9-4.2-8.5-8.5-.1-.6.1-1.2.5-1.6L8.2 4.8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden>
      <path
        d="M12 21s6.5-5.2 6.5-11a6.5 6.5 0 10-13 0c0 5.8 6.5 11 6.5 11z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
