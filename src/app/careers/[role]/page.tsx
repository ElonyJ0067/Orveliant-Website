import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CareerJdList } from "@/components/careers/CareerJdList";
import { CareerRoleSidebar } from "@/components/careers/CareerRoleSidebar";
import { CareerSectionNav } from "@/components/careers/CareerSectionNav";
import { CareerStickyApply } from "@/components/careers/CareerStickyApply";
import { CareersForm } from "@/components/CareersForm";
import { Reveal } from "@/components/Reveal";
import {
  CAREER_ROLES,
  CAREERS_POSTED,
  careerPath,
  compensationRangeUsd,
  getCareerRole,
  hiringNow,
  roleAbout,
  roleSummary,
} from "@/lib/careers";

export function generateStaticParams() {
  return CAREER_ROLES.map((r) => ({ role: r.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ role: string }>;
}): Promise<Metadata> {
  const { role: id } = await params;
  const role = getCareerRole(id);
  if (!role) return { title: "Role" };
  const path = careerPath(role.id);
  const description = roleSummary(role);
  return {
    title: role.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${role.title} · Orveliant`,
      description,
      url: path,
    },
  };
}

function jobPostingJsonLd(role: NonNullable<ReturnType<typeof getCareerRole>>) {
  const range = compensationRangeUsd(role.compensation);
  const salary = range
    ? {
        baseSalary: {
          "@type": "MonetaryAmount",
          currency: "USD",
          value: {
            "@type": "QuantitativeValue",
            minValue: range.min,
            maxValue: range.max,
            unitText: "YEAR",
          },
        },
      }
    : {};

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: role.title,
    description: `${roleSummary(role)} ${role.focus}`,
    datePosted: CAREERS_POSTED,
    employmentType: ["FULL_TIME", "PART_TIME"],
    hiringOrganization: {
      "@type": "Organization",
      name: "Orveliant",
      sameAs: "https://orveliant.com",
      url: "https://orveliant.com",
    },
    jobLocationType: "TELECOMMUTE",
    directApply: true,
    url: `https://orveliant.com${careerPath(role.id)}`,
    ...salary,
  };
}

export default async function CareerRolePage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role: id } = await params;
  const role = getCareerRole(id);
  if (!role) notFound();

  const { description } = role;
  const alsoHiring = hiringNow().filter((r) => r.id !== role.id);
  const about = roleAbout(role);

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "responsibilities", label: "Responsibilities" },
    { id: "requirements", label: "Requirements" },
    ...(description.niceToHave.length > 0
      ? [{ id: "nice-to-have", label: "Nice to have" }]
      : []),
    { id: "apply", label: "Apply" },
  ];

  return (
    <div className="container-x py-16 md:py-20">
      {role.hiring === "now" ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd(role)) }}
        />
      ) : null}

      <CareerStickyApply title={role.title} />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <Reveal>
            <Link
              href="/careers"
              className="text-sm text-ink-mute transition-colors hover:text-gold-light"
            >
              ← Careers
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
              <span>{role.team}</span>
              <span aria-hidden>·</span>
              <span>{role.hiring === "now" ? "Hiring" : "Open to profiles"}</span>
              <span aria-hidden>·</span>
              <span>{role.location}</span>
            </div>

            <h1 className="mt-3 max-w-4xl font-display text-3xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
              {role.title}
            </h1>

            <p className="mt-5 max-w-3xl border-l-2 border-gold/50 pl-4 text-sm leading-relaxed text-ink-mute md:text-base">
              {role.focus}
            </p>

            <div id="hero-apply" className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#apply" className="btn-gold group inline-flex px-7 py-3.5 text-sm sm:text-base">
                Apply for this role
                <span
                  aria-hidden
                  className="inline-block transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </a>
              <a href="#overview" className="btn-ghost px-5 py-3 text-sm text-ink">
                Read full description
              </a>
            </div>
          </Reveal>

          <div className="mt-12 space-y-12">
            <CareerSectionNav sections={sections} />

            <section id="overview" className="scroll-mt-24">
              <h2 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                About this role
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-dim md:text-lg">
                {about}
              </p>
            </section>

            <section id="responsibilities" className="scroll-mt-24">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                  What you&apos;ll do
                </h2>
                <span className="text-xs tabular-nums text-ink-mute">
                  {description.responsibilities.length} items
                </span>
              </div>
              <div className="mt-4">
                <CareerJdList items={description.responsibilities} />
              </div>
            </section>

            <section id="requirements" className="scroll-mt-24">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                  What you need
                </h2>
                <span className="text-xs tabular-nums text-ink-mute">
                  {description.requirements.length} items
                </span>
              </div>
              <div className="mt-4">
                <CareerJdList items={description.requirements} />
              </div>
            </section>

            {description.niceToHave.length > 0 ? (
              <section id="nice-to-have" className="scroll-mt-24">
                <h2 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                  Helpful, not required
                </h2>
                <div className="mt-4 max-w-3xl">
                  <CareerJdList items={description.niceToHave} />
                </div>
              </section>
            ) : null}

            <section id="apply" className="scroll-mt-24 border-t border-line pt-12">
              <CareersForm roleId={role.id} />
            </section>
          </div>
        </div>

        <CareerRoleSidebar role={role} />
      </div>

      <section className="mt-16 border-t border-line pt-10">
        {alsoHiring.length > 0 ? (
          <>
            <h2 className="font-display text-lg font-semibold tracking-tight">Also hiring</h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {alsoHiring.map((r) => (
                <li key={r.id}>
                  <Link
                    href={careerPath(r.id)}
                    className="flex items-baseline justify-between gap-4 py-3.5 text-sm transition-colors hover:text-gold-light"
                  >
                    <span>
                      <span className="font-medium text-ink">{r.title}</span>
                      <span className="mt-0.5 block text-xs text-ink-mute">{r.focus}</span>
                    </span>
                    <span className="shrink-0 text-ink-mute">{r.team}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <h2 className="font-display text-lg font-semibold tracking-tight">More roles</h2>
        )}
        <Link
          href="/careers"
          className="mt-4 inline-block text-sm text-ink-mute transition-colors hover:text-gold-light"
        >
          All roles →
        </Link>
      </section>
    </div>
  );
}
