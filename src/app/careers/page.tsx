import type { Metadata } from "next";
import Link from "next/link";
import { permanentRedirect, redirect } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import {
  careerPath,
  hiringIntro,
  hiringNow,
  isValidRoleId,
  otherRoles,
  roleSummary,
  rolesByTeam,
} from "@/lib/careers";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Open roles at Orveliant. Engineering seats are hiring now. Remote, full or part-time, published USD bands.",
  alternates: { canonical: "/careers" },
  openGraph: {
    title: "Careers · Orveliant",
    description:
      "Engineering seats are hiring now. Remote, full or part-time, published USD bands.",
    url: "/careers",
  },
};

function HiringFacts() {
  return (
    <dl className="space-y-5">
      <div>
        <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
          Location
        </dt>
        <dd className="mt-1.5 text-sm leading-relaxed text-ink">
          Remote. No required city. Written overlap with the team.
        </dd>
      </div>
      <div>
        <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
          Type
        </dt>
        <dd className="mt-1.5 text-sm leading-relaxed text-ink">
          Full-time or part-time. Bands are full-time USD; part-time is pro-rated.
        </dd>
      </div>
      <div>
        <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
          How we hire
        </dt>
        <dd className="mt-1.5 text-sm leading-relaxed text-ink">
          Each role page has the full description. Apply there. Take-home where the seat has
          one.
        </dd>
      </div>
    </dl>
  );
}

export default async function CareersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role: roleParam } = await searchParams;
  if (roleParam) {
    if (isValidRoleId(roleParam)) permanentRedirect(careerPath(roleParam));
    redirect("/careers");
  }

  const featured = hiringNow();
  const rest = rolesByTeam(otherRoles());

  return (
    <div className="container-x py-16 md:py-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <Reveal>
            <div className="max-w-2xl">
              <div className="eyebrow mb-4">Careers</div>
              <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">
                Open roles
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-dim">
                {hiringIntro(featured)}
              </p>
            </div>
          </Reveal>

          <section className="mt-16">
            <div className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
              <h2 className="font-display text-2xl font-bold tracking-tight">Hiring</h2>
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                {featured.length} {featured.length === 1 ? "seat" : "seats"}
              </span>
            </div>

            <ul className="divide-y divide-line">
              {featured.map((role) => (
                <li key={role.id} className="py-7">
                  <article className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-light">
                          Hiring now
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                          {role.team}
                        </span>
                      </div>

                      <h3 className="mt-3 font-display text-xl font-semibold text-ink">
                        <Link
                          href={careerPath(role.id)}
                          className="transition-colors hover:text-gold-light"
                        >
                          {role.title}
                        </Link>
                      </h3>

                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-mute">
                        {role.focus}
                      </p>
                      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-dim">
                        {roleSummary(role)}
                      </p>

                      <p className="mt-3 text-sm tabular-nums text-ink">
                        {role.compensation}
                        {role.compensationNote ? ` · ${role.compensationNote}` : ""}
                      </p>

                      <p className="mt-2 text-xs text-ink-mute">
                        Full job description on the role page — responsibilities, requirements,
                        and application.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 lg:justify-self-end lg:pt-8">
                      <Link
                        href={careerPath(role.id)}
                        className="btn-ghost px-4 py-2 text-sm text-ink"
                      >
                        View full role
                      </Link>
                      <Link
                        href={`${careerPath(role.id)}#apply`}
                        className="btn-gold group px-4 py-2 text-sm"
                      >
                        Apply
                        <span
                          aria-hidden
                          className="inline-block transition-transform duration-200 group-hover:translate-x-0.5"
                        >
                          →
                        </span>
                      </Link>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-16">
            <div className="border-b border-line pb-4">
              <h2 className="font-display text-2xl font-bold tracking-tight">Other roles</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-mute">
                Not an active search. Each listing still has a full description — apply if the
                work already matches what you do.
              </p>
            </div>

            <div>
              {rest.map((desk) => (
                <div key={desk.team} className="pt-8 first:pt-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-light">
                    {desk.team}
                  </p>
                  <p className="mt-1 text-sm text-ink-mute">{desk.blurb}</p>
                  <ul className="mt-3 divide-y divide-line border-y border-line">
                    {desk.roles.map((role) => (
                      <li key={role.id}>
                        <Link
                          href={careerPath(role.id)}
                          className="grid gap-1 py-3.5 text-sm transition-colors hover:text-gold-light sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-4"
                        >
                          <span>
                            <span className="font-medium text-ink">{role.title}</span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-ink-mute">
                              {role.focus}
                            </span>
                          </span>
                          <span className="tabular-nums text-ink-mute sm:text-right">
                            {role.compensation}
                            {role.compensationNote ? ` · ${role.compensationNote}` : ""}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <p className="mt-16 border-t border-line pt-8 text-sm text-ink-mute">
            Questions before applying?{" "}
            <a
              href={`mailto:${SITE.email}?subject=Careers%20inquiry`}
              className="font-medium text-gold-light underline-offset-2 hover:underline"
            >
              {SITE.email}
            </a>
          </p>
        </div>

        <aside className="hidden lg:block">
          <div className="card sticky top-24 p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-light">
              Working at Orveliant
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-dim">
              Systematic investing, written risk limits, and operator-grade infrastructure for
              private clients. We publish compensation bands and keep job descriptions complete
              on every role page.
            </p>
            <div className="mt-6 border-t border-line pt-6">
              <HiringFacts />
            </div>
            <Link
              href="/about"
              className="mt-6 inline-block text-sm font-medium text-gold-light transition-colors hover:text-gold-bright"
            >
              About the company →
            </Link>
          </div>
        </aside>
      </div>

      <div className="mt-12 border-y border-line py-6 lg:hidden">
        <HiringFacts />
      </div>
    </div>
  );
}
