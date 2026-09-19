import type { Metadata } from "next";
import { permanentRedirect, redirect } from "next/navigation";
import { CareerJobCard } from "@/components/careers/CareerJobCard";
import {
  CAREER_TRACK_COPY,
  careerPath,
  isValidRoleId,
  rolesInTrack,
} from "@/lib/careers";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Open roles at Ocean Park Asset. Seven business roles and five engineering seats. Fully remote contract work, with the rate on every listing.",
  alternates: { canonical: "/careers" },
  openGraph: {
    title: "Careers · Ocean Park Asset",
    description:
      "Seven business roles and five engineering seats. Fully remote, contract, published hourly rates.",
    url: "/careers",
  },
};

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

  const business = rolesInTrack("Business");
  const engineering = rolesInTrack("Engineering");
  const openCount = business.length + engineering.length;

  return (
    <div className="container-x py-12 md:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow">Careers</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          Open roles
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-dim md:text-lg">
          Fully remote contract work. The person who owns a function owns it end to end. The rate
          is on the role.
        </p>
        <p className="mt-5 text-sm text-ink-mute">
          <span className="font-medium text-ink">{openCount} open</span>
          <span className="mx-2 text-white/25" aria-hidden>
            ·
          </span>
          Remote
          <span className="mx-2 text-white/25" aria-hidden>
            ·
          </span>
          Contract
        </p>
      </header>

      <div className="mt-16 space-y-24 md:mt-20 md:space-y-28">
        {(
          [
            ["business", "Business", business],
            ["engineering", "Engineering", engineering],
          ] as const
        ).map(([anchor, track, roles]) => {
          const copy = CAREER_TRACK_COPY[track];
          return (
            <section key={track} id={anchor} className="scroll-mt-28">
              <header>
                <div className="flex items-end justify-between gap-6">
                  <h2 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
                    {copy.title}
                  </h2>
                  <p className="pb-1 text-sm tabular-nums text-ink-mute">{roles.length} roles</p>
                </div>
                <div className="mt-5 h-px bg-gradient-to-r from-gold via-gold/35 to-transparent" aria-hidden />
                <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-dim">{copy.blurb}</p>
              </header>
              <ul className="mt-8 border-t border-line md:mt-10">
                {roles.map((role) => (
                  <CareerJobCard key={role.id} role={role} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <p className="mt-16 text-sm text-ink-mute">
        Questions before applying?{" "}
        <a
          href={`mailto:${SITE.email}?subject=Careers%20inquiry`}
          className="font-medium text-gold-light underline-offset-2 hover:underline"
        >
          {SITE.email}
        </a>
      </p>
    </div>
  );
}
