"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";

type Role = "user" | "assistant";

type Message = {
  id: string;
  role: Role;
  content: string;
};

const WELCOME = "Hi, what would you like to know about Orveliant?";

/** Soft mint — available status */
const STATUS_ONLINE = "#4db887";

/** Clear glass interior — never yellow */
const DISC_FACE = "rgba(255, 255, 255, 0.07)";

const FAB = {
  closed: {
    face: "rgba(255, 255, 255, 0.07)",
    faceHover: "rgba(255, 255, 255, 0.14)",
    shadow:
      "0 10px 28px -14px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.14)",
    shadowHover:
      "0 18px 40px -14px rgba(0,0,0,0.82), 0 0 32px -8px rgba(201,162,39,0.32), inset 0 1px 0 rgba(255,255,255,0.28)",
  },
  open: {
    face: "rgba(255, 255, 255, 0.07)",
    faceHover: "rgba(255, 255, 255, 0.14)",
    shadow:
      "0 10px 28px -14px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.14)",
    shadowHover:
      "0 18px 40px -14px rgba(0,0,0,0.82), 0 0 28px -8px rgba(201,162,39,0.26), inset 0 1px 0 rgba(255,255,255,0.28)",
  },
} as const;

/** Metallic gold ring drawn as SVG stroke — cannot fill the disc yellow */
function GoldRim() {
  const uid = useId().replace(/:/g, "");
  const gid = `fab-rim-${uid}`;

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      className="pointer-events-none absolute inset-0 z-[1] size-full overflow-visible transition-[filter,opacity] duration-300 ease-out opacity-[0.92] group-hover:opacity-100 group-hover:drop-shadow-[0_0_8px_rgba(244,221,143,0.45)]"
    >
      <defs>
        <linearGradient id={gid} x1="12" y1="10" x2="88" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f7e7a8" />
          <stop offset="22%" stopColor="#f4dd8f" />
          <stop offset="48%" stopColor="#c9a227" />
          <stop offset="72%" stopColor="#a17d18" />
          <stop offset="100%" stopColor="#e8ce78" />
        </linearGradient>
      </defs>
      <circle
        cx="50"
        cy="50"
        r="48.2"
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth="2.4"
        className="origin-center transition-[stroke-width] duration-300 ease-out group-hover:[stroke-width:3]"
      />
    </svg>
  );
}

function BotMark({
  className = "",
  tone = "onDark",
}: {
  className?: string;
  /** onDark = metallic gold on deep surfaces (default); onGold kept for rare bright discs */
  tone?: "onGold" | "onDark";
}) {
  const uid = useId().replace(/:/g, "");
  const gradId = `bot-gold-${uid}`;
  const isOnGold = tone === "onGold";
  const stroke = isOnGold ? "#120e06" : `url(#${gradId})`;

  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {!isOnGold ? (
        <defs>
          <linearGradient
            id={gradId}
            x1="6"
            y1="8"
            x2="34"
            y2="34"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#f7e7a8" />
            <stop offset="22%" stopColor="#f4dd8f" />
            <stop offset="48%" stopColor="#c9a227" />
            <stop offset="72%" stopColor="#a17d18" />
            <stop offset="100%" stopColor="#e8ce78" />
          </linearGradient>
        </defs>
      ) : null}
      <path
        d="M11.4 9.8h17.2c3.98 0 7.2 3.22 7.2 7.2v7.8c0 3.98-3.22 7.2-7.2 7.2H19.3l-5.22 4.46c-.67.57-1.71.09-1.71-.78V32h-.96c-3.98 0-7.2-3.22-7.2-7.2V17c0-3.98 3.22-7.2 7.2-7.2Z"
        stroke={stroke}
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.9 18.7h12.1M13.9 23h7.9"
        stroke={stroke}
        strokeWidth="1.85"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Online badge drawn in a shared 100×100 viewBox so header + FAB
 * keep identical relative size and SE seat (match launcher look).
 */
function OnlineDot({ ring = "rgba(8,9,11,0.2)" }: { ring?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      className="pointer-events-none absolute inset-0 z-[2] size-full overflow-visible"
    >
      <circle cx="87" cy="87" r="12.5" fill={ring} />
      <circle cx="87" cy="87" r="9.2" fill={STATUS_ONLINE} />
    </svg>
  );
}

/** Clear glass disc + SVG gold rim (gold never fills the face) */
function GoldAvatar({
  className = "",
  markClassName = "h-[55%] w-[55%]",
  showStatus = true,
}: {
  className?: string;
  markClassName?: string;
  showStatus?: boolean;
}) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-full backdrop-blur-xl ${className}`}
      style={{
        background: DISC_FACE,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
      }}
    >
      <GoldRim />
      <BotMark className={`relative z-[1] ${markClassName}`} tone="onDark" />
      {showStatus ? <OnlineDot /> : null}
    </div>
  );
}

function renderLightMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\/[a-z0-9\-_/]+)/gi);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-surface-3 px-1 py-0.5 text-[0.8em] text-gold-light">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (/^\/[a-z0-9\-_/]+$/i.test(part)) {
      return (
        <a
          key={i}
          href={part}
          className="text-gold-light underline decoration-gold/40 underline-offset-2 transition-colors hover:text-gold-bright"
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function ChatBot() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: WELCOME },
  ]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  function resetChat() {
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
    setInput("");
    setMessages([{ id: "welcome", role: "assistant", content: WELCOME }]);
  }

  function openChat() {
    setOpen(true);
  }

  function closeChat() {
    setOpen(false);
    resetChat();
  }

  function toggleChat() {
    if (open) closeChat();
    else openChat();
  }

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 220);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, open, busy]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content,
    };
    const assistantId = `a-${Date.now()}`;
    const history = [...messages.filter((m) => m.id !== "welcome"), userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setInput("");
    setBusy(true);
    setMessages([
      ...messages,
      userMsg,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });

      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; reply?: string; error?: string }
        | null;

      if (!res.ok || !data?.ok || !data.reply) {
        const error = data?.error || "Something went wrong. Please try again.";
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: error } : m)),
        );
        return;
      }

      // Light typewriter feel without streaming dependency
      const full = data.reply;
      const chunk = Math.max(2, Math.ceil(full.length / 28));
      let i = 0;
      while (i < full.length) {
        if (controller.signal.aborted) return;
        i = Math.min(full.length, i + chunk);
        const snapshot = full.slice(0, i);
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: snapshot } : m)),
        );
        await new Promise((r) => setTimeout(r, 16));
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: "Connection dropped. Give it another try when you're ready.",
              }
            : m,
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  const canSend = !busy && Boolean(input.trim());

  return (
    <div className="pointer-events-none fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-[80] flex flex-col items-end gap-3 sm:bottom-[max(1.75rem,env(safe-area-inset-bottom))] sm:right-[max(1.75rem,env(safe-area-inset-right))]">
      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="dialog"
            aria-label="Orveliant assistant"
            aria-modal="false"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex h-[min(34rem,calc(100dvh-6.5rem-env(safe-area-inset-bottom)))] w-[min(24rem,calc(100vw-2.5rem-env(safe-area-inset-right)))] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_28px_80px_-28px_rgba(0,0,0,0.9),0_0_0_1px_rgba(201,162,39,0.12)]"
          >
            <header className="relative flex items-center gap-3 border-b border-line bg-surface-2/95 px-4 py-3.5 backdrop-blur-md">
              <GoldAvatar className="h-11 w-11 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold tracking-tight text-ink">
                  Orveliant Assistant
                </p>
                <p className="text-xs text-ink-mute">Ready to assist</p>
              </div>
              <button
                type="button"
                onClick={closeChat}
                className="rounded-lg p-2 text-ink-mute transition-colors hover:bg-surface-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                aria-label="Close chat"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M4 4l8 8M12 4l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </header>

            <div
              ref={listRef}
              className="flex-1 space-y-3 overflow-y-auto bg-canvas px-4 py-4"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse at top right, rgba(244,221,143,0.06), transparent 46%)",
              }}
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <div
                      className="relative mr-2 mt-0.5 hidden h-8 w-8 shrink-0 items-center justify-center rounded-full backdrop-blur-xl sm:flex"
                      style={{
                        background: DISC_FACE,
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
                      }}
                    >
                      <GoldRim />
                      <BotMark className="relative z-[1] h-5 w-5" tone="onDark" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[0.9rem] leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-md font-medium text-[#100c02] shadow-[0_10px_30px_-10px_rgba(201,162,39,0.55)]"
                        : "rounded-bl-md border border-line bg-surface-2 text-ink-dim"
                    }`}
                    style={
                      m.role === "user"
                        ? {
                            background: "linear-gradient(120deg, #f4dd8f, #c9a227 60%, #a17d18)",
                          }
                        : undefined
                    }
                  >
                    {m.content ? (
                      <p className="whitespace-pre-wrap">{renderLightMarkdown(m.content)}</p>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-ink-mute" aria-label="Thinking">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-bright" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-bright [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-bright [animation-delay:300ms]" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={onSubmit}
              className="border-t border-line bg-surface-2/95 p-3 backdrop-blur-md"
            >
              <div className="chat-composer flex h-12 items-stretch overflow-hidden rounded-xl border border-line bg-canvas">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={2000}
                  placeholder="Ask anything about Orveliant…"
                  autoComplete="off"
                  className="min-w-0 flex-1 border-0 bg-transparent px-4 text-sm text-ink placeholder:text-ink-mute"
                  disabled={busy}
                />
                <div className="flex items-center pr-1.5">
                  <button
                    type="submit"
                    disabled={!canSend}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.65rem] transition-[background,color,filter] ${
                      canSend
                        ? "text-[#100c02] hover:brightness-105"
                        : "border border-gold/35 bg-gold/10 text-gold-light"
                    }`}
                    style={
                      canSend
                        ? {
                            background:
                              "linear-gradient(120deg, #f4dd8f, #c9a227 60%, #a17d18)",
                          }
                        : undefined
                    }
                    aria-label="Send message"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path
                        d="M2 7h9M7.5 3.5L11 7l-3.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="mt-2 text-center text-[0.65rem] leading-snug text-ink-mute">
                Informational only — not financial advice. No guaranteed returns.
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={open ? "Close Orveliant assistant" : "Open Orveliant assistant"}
        onClick={toggleChat}
        initial={false}
        animate={{
          backgroundColor: open ? FAB.open.face : FAB.closed.face,
          boxShadow: open ? FAB.open.shadow : FAB.closed.shadow,
          y: 0,
        }}
        whileHover={{
          scale: 1.06,
          y: -2,
          backgroundColor: open ? FAB.open.faceHover : FAB.closed.faceHover,
          boxShadow: open ? FAB.open.shadowHover : FAB.closed.shadowHover,
        }}
        whileTap={{ scale: 0.96, y: 0 }}
        transition={{ type: "spring", stiffness: 460, damping: 26, mass: 0.65 }}
        className="pointer-events-auto group relative flex h-[3.35rem] w-[3.35rem] cursor-pointer items-center justify-center rounded-full backdrop-blur-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-bright/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        style={{ color: "#f4dd8f" }}
      >
        {/* Soft ambient glow — only on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[-10px] rounded-full opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle, rgba(201,162,39,0.22) 0%, transparent 68%)",
          }}
        />
        <GoldRim />
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ opacity: 0, rotate: -40 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 40 }}
              transition={{ duration: 0.15 }}
              className="relative z-[1] transition-transform duration-300 ease-out group-hover:scale-105"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path
                  d="M5.5 5.5l9 9M14.5 5.5l-9 9"
                  stroke="currentColor"
                  strokeWidth="1.85"
                  strokeLinecap="round"
                />
              </svg>
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="relative z-[1] flex size-full items-center justify-center transition-transform duration-300 ease-out group-hover:scale-[1.06]"
            >
              <BotMark className="h-[55%] w-[55%]" tone="onDark" />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && <OnlineDot />}
      </motion.button>
    </div>
  );
}
