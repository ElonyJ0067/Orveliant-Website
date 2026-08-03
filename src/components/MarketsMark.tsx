"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Markets hero mark — desktop uses hover; below lg uses ambient float + tap glow.
 * (DevTools mobile often still reports hover:hover, so we key off max-lg width.)
 */
export function MarketsMark() {
  const [lit, setLit] = useState(false);
  const clearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (clearRef.current) clearTimeout(clearRef.current);
    };
  }, []);

  function spark() {
    setLit(true);
    if (clearRef.current) clearTimeout(clearRef.current);
    clearRef.current = setTimeout(() => setLit(false), 900);
  }

  return (
    <button
      type="button"
      aria-label="Orveliant mark"
      onPointerDown={spark}
      onFocus={spark}
      className="group relative mx-auto block w-full max-w-[300px] translate-x-0 translate-y-0 touch-manipulation select-none outline-none sm:max-w-[340px] lg:max-w-[460px] lg:translate-x-14 lg:translate-y-10"
    >
      {/* Ambient motion layer — separate from scale so transforms don’t fight */}
      <div className="max-lg:animate-float lg:[animation:none]">
        <div
          className={`pointer-events-none absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-opacity duration-500 max-lg:animate-pulse-glow ${
            lit ? "opacity-42" : "opacity-22 max-lg:opacity-36"
          } lg:group-hover:opacity-42`}
          style={{ background: "radial-gradient(circle, rgba(201,162,39,0.32), transparent 72%)" }}
          aria-hidden
        />
        <div
          className={`relative transition-transform duration-500 ease-out ${
            lit ? "scale-[1.05]" : "scale-100"
          } lg:group-hover:scale-[1.03]`}
        >
          <Image
            src="/mark-v6.webp"
            alt=""
            width={560}
            height={560}
            priority
            draggable={false}
            className={`relative h-auto w-full object-contain object-center transition-[filter] duration-500 ${
              lit
                ? "drop-shadow-[0_0_44px_rgba(201,162,39,0.42)]"
                : "drop-shadow-[0_0_28px_rgba(201,162,39,0.16)] max-lg:drop-shadow-[0_0_34px_rgba(201,162,39,0.28)]"
            } lg:group-hover:drop-shadow-[0_0_40px_rgba(201,162,39,0.36)]`}
          />
        </div>
      </div>
    </button>
  );
}
