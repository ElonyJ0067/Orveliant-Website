"use client";

import { useEffect, useRef, useState } from "react";

/**
 * First paint = poster only. Video sources attach after idle so they don't
 * compete with fonts/CSS/logo on a cold visit.
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    const slow =
      connection?.saveData ||
      connection?.effectiveType === "slow-2g" ||
      connection?.effectiveType === "2g";

    if (motion.matches || slow) return;

    let cancelled = false;
    const arm = () => {
      if (!cancelled) setActive(true);
    };

    let idleId: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(arm, { timeout: 1800 });
    } else {
      timer = setTimeout(arm, 900);
    }

    return () => {
      cancelled = true;
      if (idleId != null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video || !active) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (motion.matches) {
        video.pause();
        video.currentTime = 0;
      } else {
        void video.play().catch(() => {});
      }
    };

    sync();
    motion.addEventListener("change", sync);
    return () => motion.removeEventListener("change", sync);
  }, [active]);

  return (
    <video
      ref={ref}
      className="hero-art absolute inset-0 h-full w-full object-cover object-center"
      autoPlay={active}
      muted
      loop
      playsInline
      preload={active ? "auto" : "none"}
      poster="/hero-poster.webp"
      aria-hidden
    >
      {active && (
        <>
          <source src="/Hero.webm" type="video/webm" />
          <source src="/Hero.mp4" type="video/mp4" />
        </>
      )}
    </video>
  );
}
