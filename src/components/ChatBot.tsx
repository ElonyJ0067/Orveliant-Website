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

function BotMark({
  className = "",
  tone = "onGold",
}: {
  className?: string;
  /** onGold = deep mark on bright gold discs; onDark = gold mark on dark surfaces */
  tone?: "onGold" | "onDark";
}) {
  const isOnGold = tone === "onGold";
  const bubble = isOnGold ? "#1a1408" : "#f4dd8f";
  const dots = isOnGold ? "#f4dd8f" : "#1a1408";

  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M7 7.5h26c3.05 0 5.5 2.45 5.5 5.5v13c0 3.05-2.45 5.5-5.5 5.5H18.6L12.1 36.4c-.6.5-1.5.05-1.45-.7l.55-4.2H7c-3.05 0-5.5-2.45-5.5-5.5v-13C1.5 9.95 3.95 7.5 7 7.5Z"
        fill={bubble}
      />
      <circle cx="14.2" cy="19" r="2.15" fill={dots} />
      <circle cx="20" cy="19" r="2.15" fill={dots} />
      <circle cx="25.8" cy="19" r="2.15" fill={dots} />
    </svg>
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
              <div
                className="relative flex h-11 w-11 items-center justify-center rounded-full shadow-[0_8px_24px_-6px_rgba(201,162,39,0.7)]"
                style={{
                  background: "linear-gradient(145deg, #f7e7a8, #e8ce78 45%, #c9a227)",
                }}
              >
                <BotMark className="h-6 w-6" tone="onGold" />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-up ring-2 ring-surface-2" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold tracking-tight text-ink">
                  Orveliant Assistant
                </p>
                <p className="text-xs text-ink-mute">Online · usually replies instantly</p>
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
                      className="mr-2 mt-0.5 hidden h-8 w-8 shrink-0 items-center justify-center rounded-full sm:flex"
                      style={{
                        background: "linear-gradient(145deg, #f7e7a8, #e8ce78 45%, #c9a227)",
                      }}
                    >
                      <BotMark className="h-5 w-5" tone="onGold" />
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
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="pointer-events-auto group relative flex h-14 w-14 items-center justify-center rounded-full text-[#1a1408] shadow-[0_14px_40px_-8px_rgba(201,162,39,0.75),0_0_0_1px_rgba(244,221,143,0.35)] transition-[filter] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-bright/70"
        style={{
          background: open
            ? "linear-gradient(145deg, #14171d, #0e1014)"
            : "linear-gradient(145deg, #f7e7a8, #e8ce78 45%, #c9a227)",
          color: open ? "#f4dd8f" : "#1a1408",
          border: open ? "1px solid #23272f" : "1px solid rgba(244,221,143,0.55)",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ opacity: 0, rotate: -40 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 40 }}
              transition={{ duration: 0.15 }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path
                  d="M4.5 4.5l9 9M13.5 4.5l-9 9"
                  stroke="currentColor"
                  strokeWidth="1.7"
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
            >
              <BotMark className="h-6 w-6" tone="onGold" />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-up ring-2 ring-[#08090b]" />
        )}
      </motion.button>
    </div>
  );
}
