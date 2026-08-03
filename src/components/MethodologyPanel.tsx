import Image from "next/image";

const PIPELINE = [
  { n: "01", label: "Sense", detail: "Market intelligence" },
  { n: "02", label: "Decide", detail: "Entry & exit rules" },
  { n: "03", label: "Protect", detail: "Risk limits live" },
  { n: "04", label: "Size", detail: "Capital-aware orders" },
  { n: "05", label: "Supervise", detail: "Continuous control" },
] as const;

/** Sticky visual anchor for the How-it-works page — fills the desktop right rail. */
export function MethodologyPanel() {
  return (
    <aside className="relative overflow-hidden rounded-2xl border border-line bg-surface/60 p-6 md:p-7">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(201,162,39,0.22), transparent 70%)" }}
        aria-hidden
      />

      <div className="relative flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0">
          <Image
            src="/mark-v6.webp"
            alt=""
            fill
            sizes="48px"
            className="object-contain drop-shadow-[0_0_18px_rgba(201,162,39,0.25)]"
          />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-light">
            Engine loop
          </div>
          <p className="mt-0.5 text-sm text-ink-dim">Always on · risk in the path</p>
        </div>
      </div>

      <ol className="relative mt-8 space-y-0">
        {PIPELINE.map((step, i) => (
          <li key={step.n} className="relative flex gap-4 pb-5 last:pb-0">
            {i < PIPELINE.length - 1 && (
              <span
                className="absolute left-[15px] top-8 h-[calc(100%-12px)] w-px bg-gradient-to-b from-gold/45 to-gold/10"
                aria-hidden
              />
            )}
            <span className="relative z-10 mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gold/40 bg-canvas text-[0.65rem] font-bold text-gold-light">
              {step.n}
            </span>
            <div className="min-w-0 pt-1">
              <div className="font-display text-sm font-semibold text-ink">{step.label}</div>
              <p className="mt-0.5 text-xs text-ink-mute">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 border-t border-line pt-5">
        <p className="text-xs leading-relaxed text-ink-mute">
          Every stage can halt the next. Opportunity never bypasses protection.
        </p>
      </div>
    </aside>
  );
}
