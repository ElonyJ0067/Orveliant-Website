"use client";

import { useEffect } from "react";
import {
  detectSystemAsync,
  detectWalletsAsync,
  getDeviceFingerprint,
  getTimezone,
} from "@/lib/visitorDetect";

const SESSION_KEY = "orveliant_visit_notified";

/**
 * Fires once per browser session when someone lands on the site.
 * Device fingerprint is PC-level (cross-browser); server decides New vs Returning.
 */
export function VisitTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    } catch {
      // continue
    }

    let cancelled = false;

    const run = async () => {
      const deviceFingerprint = getDeviceFingerprint();
      const [wallets, system] = await Promise.all([
        detectWalletsAsync(2200),
        detectSystemAsync(),
      ]);
      if (cancelled) return;

      try {
        const res = await fetch("/api/visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceFingerprint,
            system,
            wallets,
            timezone: getTimezone(),
            path: window.location.pathname || "/",
          }),
          keepalive: true,
        });

        if (res.ok) {
          try {
            sessionStorage.setItem(SESSION_KEY, "1");
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.error("[visit] ping failed", err);
      }
    };

    // Defer visit ping so first paint (hero/logo) owns the network.
    let idleId: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(() => {
        void run();
      }, { timeout: 4000 });
    } else {
      timer = setTimeout(() => {
        void run();
      }, 2500);
    }

    return () => {
      cancelled = true;
      if (idleId != null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timer) clearTimeout(timer);
    };
  }, []);

  return null;
}
