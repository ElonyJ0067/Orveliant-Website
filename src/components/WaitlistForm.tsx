"use client";

import { useId, useState } from "react";
import { collectVisitorMeta } from "@/lib/visitorDetect";

const interests = [
  { value: "AI Quant Trading", short: "Trading", full: "AI Quant Trading" },
  { value: "Staking", short: "Staking", full: "Staking" },
  { value: "Hybrid Strategy", short: "Hybrid", full: "Hybrid Strategy" },
] as const;

const capitalRanges = [
  "Under $50k",
  "$50k – $250k",
  "$250k – $1M",
  "$1M+",
] as const;

type Interest = (typeof interests)[number]["value"];
type CapitalRange = (typeof capitalRanges)[number] | "Prefer not to say";

function normalizeLinkedIn(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v.slice(0, 300);
  return `https://${v}`.slice(0, 300);
}

function isPlausibleLinkedIn(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  if (v.length < 8) return false;
  return /linkedin\.com/i.test(v) || (/https?:\/\//i.test(v) && v.includes(".")) || v.includes(".");
}

export function WaitlistForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [capital, setCapital] = useState<CapitalRange>("$250k – $1M");
  const [interest, setInterest] = useState<Interest>("Hybrid Strategy");
  const [linkedin, setLinkedin] = useState("");
  const id = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!isPlausibleLinkedIn(linkedin)) {
      setError("Please enter a valid LinkedIn URL, or leave it blank.");
      return;
    }
    setLoading(true);
    try {
      const meta = await collectVisitorMeta();
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          capital,
          interest,
          linkedin: normalizeLinkedIn(linkedin),
          ...meta,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Something went wrong. Please try again.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div
        className="card grid min-h-[20rem] place-items-center p-8 text-center shadow-[0_28px_70px_-40px_rgba(0,0,0,0.85)] md:p-10 lg:h-[679px] lg:min-h-[679px] lg:max-h-[679px]"
        role="status"
      >
        <div>
          <div
            className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border border-gold/40 bg-gold/10 text-2xl text-gold-light"
            aria-hidden
          >
            ✓
          </div>
          <h3 className="font-display text-xl font-semibold">You&apos;re on the list</h3>
          <p className="mt-2 text-ink-dim">
            Thank you, {name || "there"}. We&apos;ll reach out to{" "}
            <span className="text-ink">{email}</span> with early-access details for{" "}
            <span className="text-gold-light">{interest}</span>.
          </p>
        </div>
      </div>
    );
  }

  const field =
    "w-full rounded-lg border border-line bg-canvas/60 px-4 py-3 text-ink outline-none transition-colors placeholder:text-ink-mute/70 focus:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold/40";

  const chip = (selected: boolean) =>
    `flex w-full items-center justify-center rounded-lg border px-2 py-2.5 text-center text-sm font-medium leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 ${
      selected
        ? "border-gold/50 bg-gold/10 text-gold-light"
        : "border-line text-ink-dim hover:text-ink"
    }`;

  return (
    <form
      onSubmit={handleSubmit}
      className={`card relative flex flex-col overflow-hidden p-0 shadow-[0_28px_70px_-40px_rgba(0,0,0,0.85)] ${
        error ? "lg:min-h-[744px]" : "lg:min-h-[679px]"
      }`}
      noValidate
    >
      <div className="shrink-0 border-b border-line px-7 py-6 md:px-8">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-light">
          Request access
        </div>
        <h2 className="mt-1.5 font-display text-xl font-semibold text-ink md:text-2xl">
          Join the early-access list
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-mute">
          Share a few details and we&apos;ll prioritize your invite.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 px-7 pb-8 pt-7 md:px-8 md:pt-8">
        <div className="grid shrink-0 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-name`} className="mb-1.5 block text-sm font-medium text-ink-dim">
              Full name
            </label>
            <input
              id={`${id}-name`}
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={field}
            />
          </div>
          <div>
            <label htmlFor={`${id}-email`} className="mb-1.5 block text-sm font-medium text-ink-dim">
              Email
            </label>
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@firm.com"
              className={field}
            />
          </div>
        </div>

        <fieldset className="shrink-0">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <legend className="text-sm font-medium text-ink-dim">Capital to allocate</legend>
            <button
              type="button"
              onClick={() => setCapital("Prefer not to say")}
              className={`shrink-0 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 ${
                capital === "Prefer not to say"
                  ? "text-gold-light"
                  : "text-ink-mute hover:text-ink-dim"
              }`}
            >
              Prefer not to say
            </button>
          </div>
          <div
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
            role="radiogroup"
            aria-label="Capital to allocate"
          >
            {capitalRanges.map((range) => {
              const selected = capital === range;
              return (
                <button
                  type="button"
                  key={range}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setCapital(range)}
                  className={chip(selected)}
                >
                  {range}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="shrink-0">
          <legend className="mb-2 block text-sm font-medium text-ink-dim">Primary interest</legend>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Primary interest">
            {interests.map((it) => {
              const selected = interest === it.value;
              return (
                <button
                  type="button"
                  key={it.value}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setInterest(it.value)}
                  className={chip(selected)}
                >
                  <span className="sm:hidden">{it.short}</span>
                  <span className="hidden sm:inline">{it.full}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex min-h-0 flex-1 flex-col gap-5">
          <div className="shrink-0">
            <label htmlFor={`${id}-linkedin`} className="mb-1.5 block text-sm font-medium text-ink-dim">
              LinkedIn <span className="font-normal text-ink-mute">· optional</span>
            </label>
            <input
              id={`${id}-linkedin`}
              name="linkedin"
              type="url"
              autoComplete="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="linkedin.com/in/…"
              className={field}
            />
          </div>
          {error && (
            <p
              role="alert"
              className="shrink-0 rounded-lg border border-down/30 bg-down/10 px-4 py-2.5 text-sm text-down"
            >
              {error}
            </p>
          )}
          <div className={`flex shrink-0 flex-col gap-5 ${error ? "" : "lg:mt-auto"}`}>
            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full disabled:opacity-60"
            >
              {loading ? "Submitting…" : "Request Access"}
            </button>
            <p className="text-center text-xs text-ink-mute">
              Updates from Ocean Park Asset only. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
