import Link from "next/link";
import { careerPath, type CareerRole } from "@/lib/careers";

type Props = {
  role: CareerRole;
};

export function CareerJobCard({ role }: Props) {
  return (
    <li className="border-b border-line">
      <Link
        href={careerPath(role.id)}
        className="group block py-7 transition-colors hover:bg-white/[0.03] sm:py-8"
      >
        <div className="flex items-baseline justify-between gap-6">
          <h3 className="font-display text-xl font-semibold tracking-tight text-ink transition-colors group-hover:text-gold-light">
            {role.title}
          </h3>
          <p className="shrink-0 font-display text-sm font-medium tabular-nums text-gold-light">
            {role.rateLabel}
          </p>
        </div>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-dim">{role.focus}</p>
        {role.stack.length > 0 ? (
          <p className="mt-3 text-sm text-ink-mute">{role.stack.join(" · ")}</p>
        ) : null}
      </Link>
    </li>
  );
}
