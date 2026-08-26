"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Logo } from "./Logo";

const nav = [
  { label: "Products", href: "/#products" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Markets", href: "/markets" },
  { label: "Desk", href: "/desk" },
  { label: "Security", href: "/security" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const isActive = (href: string) => {
    const pathOnly = href.split("#")[0];
    if (href.startsWith("/#")) return pathname === "/";
    if (pathOnly === "/security") return pathname === "/security" || pathname === "/custody";
    if (pathOnly === "/careers") return pathname === "/careers" || pathname.startsWith("/careers/");
    return pathname === pathOnly;
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-canvas/80 backdrop-blur-xl border-b border-line"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container-x flex h-[68px] items-center justify-between">
        <Logo />

        <nav className="hidden lg:flex items-center gap-7" aria-label="Primary">
          {nav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`text-sm font-medium transition-colors ${
                  active ? "text-ink" : "text-ink-dim hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link href="/waitlist" className="btn-gold text-sm">
            Request Access
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden flex flex-col gap-1.5 rounded-md p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
        >
          <span className={`h-0.5 w-6 bg-ink transition-all ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 w-6 bg-ink transition-all ${open ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-6 bg-ink transition-all ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {open && (
        <div
          id={menuId}
          className="lg:hidden border-t border-line bg-canvas/98 backdrop-blur-xl"
        >
          <nav
            className="container-x flex min-h-[min(70dvh,28rem)] flex-col gap-1 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            aria-label="Mobile"
          >
            {nav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-md px-2 py-3 text-base transition-colors ${
                    active
                      ? "bg-white/[0.03] text-ink"
                      : "text-ink-dim hover:bg-white/[0.02] hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="hairline my-3" />
            <Link href="/waitlist" onClick={() => setOpen(false)} className="btn-gold mt-auto">
              Request Access
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
