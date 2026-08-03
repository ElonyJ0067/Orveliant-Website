"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { TESTIMONIALS } from "@/lib/trust";

const GAP_PX = 20;

export function Testimonials() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(3);
  const [cardWidth, setCardWidth] = useState(320);

  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const v = el.clientWidth < 640 ? 1 : el.clientWidth < 1024 ? 2 : 3;
    const w = (el.clientWidth - GAP_PX * (v - 1)) / v;
    setVisible(v);
    setCardWidth(Math.max(200, w));
  }, []);

  const sync = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = Math.max(el.scrollWidth - el.clientWidth, 0);
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);

    const step = cardWidth + GAP_PX;
    const index = step > 0 ? Math.round(el.scrollLeft / step) : 0;
    const maxStop = Math.max(0, TESTIMONIALS.length - visible);
    setActive(Math.max(0, Math.min(maxStop, index)));
  }, [cardWidth, visible]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    measure();
    const t = window.setTimeout(sync, 0);
    el.addEventListener("scroll", sync, { passive: true });
    const ro = new ResizeObserver(() => {
      measure();
      window.setTimeout(sync, 0);
    });
    ro.observe(el);
    return () => {
      window.clearTimeout(t);
      el.removeEventListener("scroll", sync);
      ro.disconnect();
    };
  }, [measure, sync]);

  const scrollToIndex = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxIndex = Math.max(0, TESTIMONIALS.length - visible);
    const clamped = Math.max(0, Math.min(maxIndex, index));
    const step = cardWidth + GAP_PX;
    el.scrollTo({ left: clamped * step, behavior: "smooth" });
  };

  const scrollByCard = (dir: -1 | 1) => {
    scrollToIndex(active + dir);
  };

  // One dot per scroll stop (6 cards / 3 visible → 4 stops), not one per person.
  const stopCount = Math.max(1, TESTIMONIALS.length - visible + 1);

  return (
    <div aria-label="Client testimonials">
      <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 sm:grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] sm:gap-4">
        <button
          type="button"
          aria-label="Previous testimonials"
          disabled={!canPrev}
          onClick={() => scrollByCard(-1)}
          className="grid h-10 w-10 place-items-center justify-self-start rounded-full border border-line bg-surface text-gold-light transition-colors hover:border-gold/45 hover:bg-gold/[0.08] disabled:pointer-events-none disabled:opacity-25 sm:h-11 sm:w-11"
        >
          <Arrow dir="left" />
        </button>

        <div className="relative min-w-0">
          <div
            ref={scrollerRef}
            className="overflow-x-auto overscroll-x-contain scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex w-max py-1" style={{ gap: GAP_PX }}>
              {TESTIMONIALS.map((t) => (
                <figure
                  key={t.name}
                  style={{ width: cardWidth }}
                  className="card card-hover flex shrink-0 snap-start flex-col p-5 sm:p-6"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-light">
                    {t.benefit}
                  </p>
                  <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink-dim">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                    <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-gold/35 ring-offset-2 ring-offset-base">
                      <Image
                        src={t.avatar}
                        alt={t.name}
                        fill
                        sizes="44px"
                        className="object-cover object-top"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-ink">{t.name}</span>
                      <span className="block text-xs text-ink-dim">{t.role}</span>
                      <span className="block text-[0.7rem] text-ink-mute">{t.detail}</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          aria-label="Next testimonials"
          disabled={!canNext}
          onClick={() => scrollByCard(1)}
          className="grid h-10 w-10 place-items-center justify-self-end rounded-full border border-line bg-surface text-gold-light transition-colors hover:border-gold/45 hover:bg-gold/[0.08] disabled:pointer-events-none disabled:opacity-25 sm:h-11 sm:w-11"
        >
          <Arrow dir="right" />
        </button>
      </div>

      <div
        className="mt-7 flex items-center justify-center gap-2.5"
        role="tablist"
        aria-label="Testimonial position"
      >
        {Array.from({ length: stopCount }, (_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={active === i}
            aria-label={`Show position ${i + 1}`}
            onClick={() => scrollToIndex(i)}
            className={`rounded-full transition-all duration-300 ${
              active === i
                ? "h-2 w-7 bg-gold"
                : "h-2 w-2 bg-line hover:bg-ink-mute"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d={dir === "left" ? "M12.5 4.5L7 10l5.5 5.5" : "M7.5 4.5L13 10l-5.5 5.5"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
