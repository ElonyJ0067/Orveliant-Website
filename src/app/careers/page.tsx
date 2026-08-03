import type { Metadata } from "next";
import Link from "next/link";
import { CareersForm } from "@/components/CareersForm";
import { Reveal } from "@/components/Reveal";
import { CAREER_ROLES, OPEN_ROLE } from "@/lib/careers";
import { SITE } from "@/lib/site";

const OPEN_STACK = ["Rust", "Solana", "Anchor", "On-chain"] as const;

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join Orveliant — hire for trading systems, on-chain infrastructure, and risk-controlled markets desks. Remote roles with competitive compensation.",
};

const principles = [
  {
    title: "Markets first",
    body: "We hire people who respect live market risk — not slide-deck theory.",
  },
  {
    title: "Discipline over noise",
    body: "Clear ownership, tight feedback loops, and no theater around performance.",
  },
  {
    title: "Capital protection is the craft",
    body: "If risk control is not interesting to you, Orveliant is not the right desk.",
  },
] as const;

const applyNotes = [
  {
    title: "Remote-first",
    body: "Async-friendly across timezones. Clear ownership, no meeting theater.",
  },
  {
    title: "Published ranges",
    body: "Compensation shown up front — above typical market for strong profiles.",
  },
  {
    title: "How we pay",
    body: "Engineers: salary bands. Traders: base + performance where the seat fits.",
  },
  {
    title: "How we review",
    body: "Lean roster. We reply when there is a real conversation to have.",
  },
] as const;

const interestRoles = CAREER_ROLES.filter((r) => !r.open);

export default async function CareersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role: roleParam } = await searchParams;
  const defaultRoleId =
    roleParam && CAREER_ROLES.some((r) => r.id === roleParam) ? roleParam : OPEN_ROLE.id;

  return (
    <div className="container-x py-16 md:py-20">
      {/* Hero — filled composition */}
      <section className="grid items-stretch gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <Reveal className="flex flex-col justify-center">
          <div className="eyebrow mb-4">Careers</div>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">
            Build the desk that{" "}
            <span className="text-gold-gradient">protects capital.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-dim">
            Orveliant is a small team of traders, quants, and engineers shipping a
            risk-controlled investing stack — trading systems, on-chain infrastructure, and
            hybrid strategies — for private clients.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/careers?role=${OPEN_ROLE.id}#apply`}
              className="btn-gold px-6 py-3 text-sm"
            >
              Apply — {OPEN_ROLE.title}
            </Link>
            <Link href="#open-role" className="btn-ghost px-6 py-3 text-sm text-ink">
              View open role
            </Link>
          </div>
          <dl className="mt-10 grid grid-cols-1 gap-4 border-t border-line pt-6 sm:grid-cols-3">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                Status
              </dt>
              <dd className="mt-1.5 font-display text-lg font-semibold text-ink">
                Actively hiring
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                Location
              </dt>
              <dd className="mt-1.5 font-display text-lg font-semibold text-ink">Remote</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                Focus
              </dt>
              <dd className="mt-1.5 font-display text-lg font-semibold text-ink">On-chain</dd>
            </div>
          </dl>
        </Reveal>

        <Reveal delay={0.08} className="min-h-0">
          <aside className="relative flex h-full flex-col justify-between overflow-hidden border border-line bg-surface/40 px-6 py-7 md:px-8 md:py-8">
            <div
              className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-gold/[0.09] blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
              aria-hidden
            />

            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-light">
                  Now hiring
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                  {OPEN_ROLE.team} · {OPEN_ROLE.location} · Full-time
                </div>
              </div>

              <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-ink md:text-[1.75rem]">
                {OPEN_ROLE.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-dim">
                Ship production Anchor programs for staking, vaults, and safe on-chain capital
                flows — with Rust fundamentals first, not resume theater.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {OPEN_STACK.map((tag) => (
                  <span
                    key={tag}
                    className="border border-line bg-canvas/50 px-2.5 py-1 text-[11px] font-medium tracking-wide text-ink-dim"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mt-8 border-t border-line pt-6">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                Compensation
              </div>
              <div className="mt-2 font-display text-3xl font-bold tracking-tight text-gold-light tabular-nums">
                {OPEN_ROLE.compensation}
              </div>
              <p className="mt-1 text-sm text-ink-dim">USD · remote · above typical market</p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/careers?role=${OPEN_ROLE.id}#apply`}
                  className="btn-gold flex-1 justify-center px-5 py-3 text-sm"
                >
                  Apply now
                </Link>
                <Link
                  href="#open-role"
                  className="btn-ghost flex-1 justify-center px-5 py-3 text-sm text-ink"
                >
                  Role details
                </Link>
              </div>
            </div>
          </aside>
        </Reveal>
      </section>

      {/* Principles — full-width strip */}
      <div className="mt-16 grid gap-8 border-y border-line py-10 md:grid-cols-3 md:gap-10">
        {principles.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.06}>
            <div className="h-full border-l border-gold/30 pl-4 md:border-l-0 md:border-t md:border-gold/30 md:pl-0 md:pt-4">
              <h2 className="font-display text-lg font-semibold text-ink">{p.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-dim">{p.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Open role — stacked, no sticky void */}
      <section id="open-role" className="mt-20 scroll-mt-24">
        <Reveal>
          <div className="grid gap-6 border-b border-line pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="eyebrow mb-3">Open role</div>
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                {OPEN_ROLE.title}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-dim">
                {OPEN_ROLE.description?.summary ?? OPEN_ROLE.focus}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-mute">
                Don&apos;t self-reject if you&apos;re strong in Rust and still leveling up in
                Anchor — careful shipping and security mindset matter most.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute lg:justify-end">
              <span className="text-gold-light">Open</span>
              <span>{OPEN_ROLE.team}</span>
              <span>{OPEN_ROLE.location}</span>
              <span>Full-time</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.04}>
          <div className="mt-0 grid items-center gap-6 border-b border-line py-7 sm:grid-cols-[1fr_auto] sm:gap-10">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                Compensation
              </div>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-display text-3xl font-bold tracking-tight text-gold-light tabular-nums md:text-4xl">
                  {OPEN_ROLE.compensation}
                </span>
                <span className="text-sm text-ink-dim">USD · remote · above typical market</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/careers?role=${OPEN_ROLE.id}#apply`}
                className="btn-gold px-6 py-3 text-sm"
              >
                Apply for this role
              </Link>
              <a
                href={`mailto:${SITE.email}?subject=${encodeURIComponent(`Careers — ${OPEN_ROLE.title}`)}`}
                className="btn-ghost px-6 py-3 text-sm text-ink"
              >
                Email the desk
              </a>
            </div>
          </div>
        </Reveal>

        {OPEN_ROLE.description && (
          <>
            <div className="grid gap-0 border-b border-line lg:grid-cols-2">
              <Reveal delay={0.05} className="lg:border-r lg:border-line">
                <div className="py-8 lg:pr-10">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-lg font-semibold tracking-tight">
                      What you&apos;ll do
                    </h3>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                      Mandate
                    </span>
                  </div>
                  <ol className="mt-5 divide-y divide-line border-y border-line">
                    {OPEN_ROLE.description.responsibilities.map((item, i) => (
                      <li
                        key={item}
                        className="grid gap-3 py-4 sm:grid-cols-[2.75rem_1fr] sm:gap-5"
                      >
                        <span className="font-display text-sm font-semibold tracking-widest text-gold/45">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <p className="text-sm leading-relaxed text-ink-dim">{item}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>

              <Reveal delay={0.08}>
                <div className="border-t border-line py-8 lg:border-t-0 lg:pl-10">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-lg font-semibold tracking-tight">
                      What you bring
                    </h3>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                      Baseline
                    </span>
                  </div>
                  <ul className="mt-5">
                    {OPEN_ROLE.description.requirements.map((item) => (
                      <li
                        key={item}
                        className="flex gap-4 border-b border-line py-4 last:border-b-0"
                      >
                        <span className="mt-2 h-px w-4 shrink-0 bg-gold/70" aria-hidden />
                        <p className="text-sm leading-relaxed text-ink-dim">{item}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.1}>
              <div className="border-b border-line py-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold tracking-tight">
                      Nice to have
                    </h3>
                    <p className="mt-1 text-sm text-ink-mute">
                      Helpful, not required — apply if the core fit is there.
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                    Bonus
                  </span>
                </div>
                <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                  {OPEN_ROLE.description.niceToHave.map((item) => (
                    <li
                      key={item}
                      className="border-l border-gold/35 pl-4 text-sm leading-relaxed text-ink-dim"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </>
        )}
      </section>

      {/* Roster */}
      <section className="mt-20">
        <Reveal>
          <div className="flex flex-col gap-3 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="eyebrow mb-2">Roster</div>
              <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                Roles we hire for
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-ink-mute sm:text-right">
              Not all seats are open. Submit general interest and we&apos;ll reach out when the
              mandate fits.
            </p>
          </div>
        </Reveal>

        <div className="divide-y divide-line border-b border-line">
          {interestRoles.map((role, i) => (
            <Reveal key={role.id} delay={i * 0.04}>
              <div className="grid gap-4 py-6 lg:grid-cols-[7.5rem_1fr_auto] lg:items-center lg:gap-8">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-light">
                  {role.team}
                </div>
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="font-display text-lg font-semibold text-ink">{role.title}</h3>
                    <span className="text-sm tabular-nums text-ink-mute">
                      {role.compensation}
                      {role.compensationNote ? ` · ${role.compensationNote}` : ""}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-dim">{role.focus}</p>
                </div>
                <Link
                  href={`/careers?role=${role.id}#apply`}
                  className="text-sm font-semibold text-gold-light transition-colors hover:text-gold-bright lg:justify-self-end"
                >
                  Express interest →
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Apply — full-width band + form, no short left column */}
      <section id="apply" className="mt-20 scroll-mt-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-line bg-surface/40">
            <div
              className="pointer-events-none absolute -left-20 top-0 h-56 w-56 rounded-full bg-gold/[0.07] blur-3xl"
              aria-hidden
            />
            <div className="relative border-b border-line px-6 py-8 md:px-9 md:py-10">
              <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-end lg:gap-12">
                <div>
                  <div className="eyebrow mb-3">Apply</div>
                  <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                    Send your profile to the desk.
                  </h2>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-dim md:text-base">
                    Tell us what you&apos;ve shipped and which seat fits. One form for the open
                    role and general interest.
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-ink-mute lg:text-right">
                  Questions before applying?{" "}
                  <a
                    href={`mailto:${SITE.email}?subject=Careers%20inquiry`}
                    className="font-medium text-gold-light underline-offset-2 hover:underline"
                  >
                    {SITE.email}
                  </a>
                </p>
              </div>

              <div className="mt-8 grid gap-4 border-t border-line pt-7 sm:grid-cols-2 xl:grid-cols-4">
                {applyNotes.map((note) => (
                  <div key={note.title} className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-light">
                      {note.title}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink-dim">{note.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative px-4 py-6 sm:px-6 md:px-9 md:py-9">
              <CareersForm defaultRoleId={defaultRoleId} embedded />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
