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

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
