"use client";

import { useEffect, useState } from "react";

type Props = {
  title: string;
};

export function CareerStickyApply({ title }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const applySection = document.getElementById("apply");
    const heroApply = document.getElementById("hero-apply");
    if (!applySection) return;

    let applyVisible = false;
    let heroVisible = false;

    const update = () => setVisible(!applyVisible && !heroVisible);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === applySection) applyVisible = entry.isIntersecting;
          if (heroApply && entry.target === heroApply) heroVisible = entry.isIntersecting;
        }
        update();
      },
      { threshold: 0.12, rootMargin: "-64px 0px 0px 0px" },
    );

    observer.observe(applySection);
    if (heroApply) observer.observe(heroApply);

    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur-md lg:hidden">
      <div className="pointer-events-auto container-x flex items-center justify-between gap-4">
        <p className="min-w-0 truncate text-sm font-medium text-ink">{title}</p>
        <a href="#apply" className="btn-gold shrink-0 px-5 py-2.5 text-sm">
          Apply
        </a>
      </div>
    </div>
  );
}
