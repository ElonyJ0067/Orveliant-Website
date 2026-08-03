import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = false,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  center?: boolean;
}) {
  return (
    <Reveal className={center ? "text-center mx-auto max-w-2xl" : "max-w-2xl"}>
      {eyebrow && <div className="eyebrow mb-3">{eyebrow}</div>}
      <h2 className="font-display text-3xl sm:text-4xl md:text-[2.7rem] font-bold leading-[1.1] tracking-tight">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-ink-dim leading-relaxed text-lg">{subtitle}</p>}
    </Reveal>
  );
}
