import Link from "next/link";
import type { CareerRole } from "@/lib/careers";
import { CareerStackPills } from "./CareerStackPills";

type Props = {
  role: CareerRole;
};

export function CareerRoleSidebar({ role }: Props) {
  return (
    <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-light">
            {role.track}
          </span>
          <span className="rounded-full border border-line bg-surface/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-mute">
            Remote · Contract
          </span>
        </div>

        <dl className="mt-6 space-y-5">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
              Rate
            </dt>
            <dd className="mt-1.5 font-display text-xl font-semibold tabular-nums text-ink">
              {role.compensation}
            </dd>
            {role.compensationNote ? (
              <dd className="mt-1 text-sm leading-relaxed text-ink-dim">{role.compensationNote}</dd>
            ) : null}
          </div>

          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
              Engagement
            </dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-ink">
              Freelance / contract. Flexible hours. Fully remote.
            </dd>
          </div>

          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
              How we hire
            </dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-ink-dim">{role.processSummary}</dd>
          </div>
        </dl>

        {role.stack.length > 0 ? (
          <div className="mt-6 border-t border-line pt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
              Stack
            </p>
            <div className="mt-3">
              <CareerStackPills stack={role.stack} />
            </div>
          </div>
        ) : null}

        <Link
          href="#apply"
          className="btn-gold group mt-6 flex w-full justify-center px-6 py-3 text-sm"
        >
          Apply for this role
          <span
            aria-hidden
            className="inline-block transition-transform duration-200 group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </div>
    </aside>
  );
}
