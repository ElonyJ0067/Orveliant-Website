"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Jump to top without CSS smooth-scroll interference. */
export function scrollWindowTop() {
  const html = document.documentElement;
  const previous = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  html.scrollTop = 0;
  document.body.scrollTop = 0;
  html.style.scrollBehavior = previous;
}

/**
 * Force true top on route changes. Next can restore prior scroll after paint;
 * hash targets (e.g. /#products) are respected instead.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    const hash = window.location.hash.slice(1);

    if (hash) {
      const scrollToHash = () => {
        const el = document.getElementById(hash);
        if (!el) return false;
        const previous = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = "auto";
        el.scrollIntoView();
        document.documentElement.style.scrollBehavior = previous;
        return true;
      };

      if (scrollToHash()) return;

      const raf = requestAnimationFrame(() => {
        scrollToHash();
      });
      const t = window.setTimeout(() => {
        scrollToHash();
      }, 80);
      return () => {
        cancelAnimationFrame(raf);
        window.clearTimeout(t);
      };
    }

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

  return null;
}
