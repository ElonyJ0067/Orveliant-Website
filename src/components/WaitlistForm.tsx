"use client";

import { useId, useState } from "react";

const interests = ["AI Quant Trading", "Staking", "Hybrid Strategy"];

export function WaitlistForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [interest, setInterest] = useState("Hybrid Strategy");
  const id = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, interest }),
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
      <div className="card p-8 text-center" role="status">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border border-gold/40 bg-gold/10 text-2xl text-gold-light" aria-hidden>
          ✓
        </div>
        <h3 className="font-display text-xl font-semibold">You&apos;re on the list</h3>
        <p className="mt-2 text-ink-dim">
          Thank you, {name || "there"}. We&apos;ll reach out to{" "}
          <span className="text-ink">{email}</span> with early-access details for{" "}
          <span className="text-gold-light">{interest}</span>.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-lg border border-line bg-surface px-4 py-3 text-ink outline-none transition-colors focus:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold/40";

  return (
    <form onSubmit={handleSubmit} className="card p-7 md:p-8" noValidate>
      <div className="grid gap-5">
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
            Email address
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={field}
          />
        </div>
        <fieldset>
          <legend className="mb-2 block text-sm font-medium text-ink-dim">Primary interest</legend>
          <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Primary interest">
            {interests.map((it) => {
              const selected = interest === it;
              return (
                <button
                  type="button"
                  key={it}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setInterest(it)}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 ${
                    selected
                      ? "border-gold/50 bg-gold/10 text-gold-light"
                      : "border-line text-ink-dim hover:text-ink"
                  }`}
                >
                  {it}
                </button>
              );
            })}
          </div>
        </fieldset>
        {error && (
          <p role="alert" className="rounded-lg border border-down/30 bg-down/10 px-4 py-2.5 text-sm text-down">
            {error}
          </p>
        )}
        <button type="submit" disabled={loading} className="btn-gold mt-2 w-full disabled:opacity-60">
          {loading ? "Submitting…" : "Request Access"}
        </button>
        <p className="text-center text-xs text-ink-mute">
          By joining, you agree to receive updates from Orveliant. No spam. Unsubscribe anytime.
        </p>
      </div>
    </form>
  );
}
