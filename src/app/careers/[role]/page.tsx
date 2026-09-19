import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CareerJdList } from "@/components/careers/CareerJdList";
import { CareerRoleSidebar } from "@/components/careers/CareerRoleSidebar";
import { CareerSectionNav } from "@/components/careers/CareerSectionNav";
import { CareerStackPills } from "@/components/careers/CareerStackPills";
import { CareerStickyApply } from "@/components/careers/CareerStickyApply";
import { CareersForm } from "@/components/CareersForm";
import { Reveal } from "@/components/Reveal";
import {
  CAREERS_POSTED_LABEL,
  CAREER_ROLES,
  careerPath,
  getCareerRole,
  roleAbout,
  roleSummary,
  rolesInTrack,
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
      title: `${role.title} · Ocean Park Asset`,
      description,
      url: path,
    },
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
  const sameTrack = rolesInTrack(role.track).filter((r) => r.id !== role.id);
  const about = roleAbout(role);
  const backHash = role.track === "Engineering" ? "#engineering" : "#business";

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "responsibilities", label: "What you'll do" },
    { id: "requirements", label: "What we're looking for" },
    ...(description.niceToHave.length > 0
      ? [{ id: "nice-to-have", label: "Nice to have" }]
      : []),
    { id: "engagement", label: "Engagement" },
    { id: "why", label: "Why people join" },
    { id: "process", label: "Hiring process" },
    { id: "apply", label: "Apply" },
  ];

  return (
    <div className="container-x py-16 md:py-20">
      <CareerStickyApply title={role.title} />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <Reveal>
            <Link
              href={`/careers${backHash}`}
              className="text-sm text-ink-mute transition-colors hover:text-gold-light"
            >
              ← Careers
            </Link>

            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
              <span>{role.track}</span>
              <span aria-hidden>·</span>
              <span>Remote</span>
              <span aria-hidden>·</span>
              <span>Contract</span>
              <span aria-hidden>·</span>
              <span className="normal-case tracking-normal">{CAREERS_POSTED_LABEL}</span>
            </div>

            <h1 className="mt-3 max-w-4xl font-display text-3xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
              {role.title}
            </h1>

            <p className="mt-4 font-display text-lg font-semibold tabular-nums text-gold-light md:text-xl">
              {role.compensation}
            </p>
            {role.compensationNote ? (
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-mute">
                {role.compensationNote}
              </p>
            ) : null}

            <p className="mt-5 max-w-3xl border-l-2 border-gold/50 pl-4 text-sm leading-relaxed text-ink-mute md:text-base">
              {role.focus}
            </p>

            {role.stack.length > 0 ? (
              <div className="mt-5 lg:hidden">
                <CareerStackPills stack={role.stack} />
              </div>
            ) : null}

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
                Read the full description
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
              {role.bridge ? (
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-dim md:text-lg">
                  {role.bridge}
                </p>
              ) : null}
            </section>

            <section id="responsibilities" className="scroll-mt-24">
              <h2 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                What you&apos;ll do
              </h2>
              <div className="mt-4">
                <CareerJdList items={description.responsibilities} />
              </div>
            </section>

            <section id="requirements" className="scroll-mt-24">
              <h2 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                What we&apos;re looking for
              </h2>
              <div className="mt-4">
                <CareerJdList items={description.requirements} />
              </div>
            </section>

            {description.niceToHave.length > 0 ? (
              <section id="nice-to-have" className="scroll-mt-24">
                <h2 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                  Nice to have
                </h2>
                <div className="mt-4 max-w-3xl">
                  <CareerJdList items={description.niceToHave} />
                </div>
              </section>
            ) : null}

            <section id="engagement" className="scroll-mt-24">
              <h2 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                Engagement
              </h2>
              <div className="mt-4">
                <CareerJdList items={role.engagement} />
              </div>
              <div className="mt-6 max-w-3xl">
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-mute">
                  Rate range
                </h3>
                <p className="mt-2 text-base text-ink">{role.compensation}</p>
                {role.compensationNote ? (
                  <p className="mt-1 text-sm leading-relaxed text-ink-dim">{role.compensationNote}</p>
                ) : null}
              </div>
            </section>

            <section id="why" className="scroll-mt-24">
              <h2 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                Why people join us
              </h2>
              <div className="mt-4 max-w-3xl">
                <CareerJdList items={role.whyJoin} />
              </div>
            </section>

            <section id="process" className="scroll-mt-24">
              <h2 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                Hiring process
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-dim">
                Our hiring process involves:
              </p>
              <div className="mt-4">
                <CareerJdList items={role.hiringSteps} />
              </div>
            </section>

            <section id="apply" className="scroll-mt-24 border-t border-line pt-12">
              <CareersForm roleId={role.id} />
            </section>
          </div>
        </div>

        <CareerRoleSidebar role={role} />
      </div>

      <section className="mt-16 border-t border-line pt-10">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          More {role.track === "Engineering" ? "engineering" : "business"} roles
        </h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {sameTrack.map((r) => (
            <li key={r.id}>
              <Link
                href={careerPath(r.id)}
                className="flex items-baseline justify-between gap-4 py-3.5 text-sm transition-colors hover:text-gold-light"
              >
                <span>
                  <span className="font-medium text-ink">{r.title}</span>
                  <span className="mt-0.5 block text-xs text-ink-mute">{r.cardLine}</span>
                </span>
                <span className="shrink-0 tabular-nums text-ink-mute">{r.rateLabel}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href={`/careers${role.track === "Engineering" ? "#business" : "#engineering"}`}
          className="mt-4 inline-block text-sm text-ink-mute transition-colors hover:text-gold-light"
        >
          {role.track === "Engineering" ? "Business roles" : "Engineering roles"} →
        </Link>
      </section>
    </div>
  );
}
