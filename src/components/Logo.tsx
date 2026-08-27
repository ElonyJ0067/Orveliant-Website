"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

function scrollWindowTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export function Logo({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const pendingHomeTop = useRef(false);

  useEffect(() => {
    if (!pendingHomeTop.current || pathname !== "/") return;
    pendingHomeTop.current = false;

    scrollWindowTop();
    const raf = requestAnimationFrame(scrollWindowTop);
    // Next can restore the previous page scroll after the first paint.
    const t1 = window.setTimeout(scrollWindowTop, 0);
    const t2 = window.setTimeout(scrollWindowTop, 80);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pathname]);

  return (
    <Link
      href="/"
      aria-label="Ocean Park Asset home"
      scroll
      className="logo-home group flex items-center gap-2.5"
      onClick={(e) => {
        e.preventDefault();

        if (pathname === "/") {
          scrollWindowTop();
          return;
        }

        pendingHomeTop.current = true;
        if ("scrollRestoration" in history) {
          history.scrollRestoration = "manual";
        }
        router.push("/");
      }}
    >
      <Image
        src="/logo.webp"
        alt=""
        width={36}
        height={36}
        className="logo-mark h-9 w-9"
        priority
      />
      {!compact && (
        <span className="brand-wordmark font-display text-[1.15rem] font-semibold leading-none tracking-tight sm:text-[1.25rem]">
          Ocean Park
        </span>
      )}
    </Link>
  );
}
