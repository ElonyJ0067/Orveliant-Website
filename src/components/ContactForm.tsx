"use client";

import { useId, useState } from "react";
import { SITE } from "@/lib/site";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const id = useId();

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (form.message.trim().length < 5) {
      setError("Please enter a short message.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Something went wrong.");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="card grid h-full min-h-[20rem] place-items-center p-8 text-center md:p-10" role="status">
        <div>
          <div
            className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border border-gold/40 bg-gold/10 text-2xl text-gold-light"
            aria-hidden
          >
            ✓
          </div>
          <h3 className="font-display text-xl font-semibold">Message received</h3>
          <p className="mt-2 text-ink-dim">
            Thank you. A member of the Ocean Park Asset team will reply within one business day.
          </p>
        </div>
      </div>
    );
  }

  const field =
    "w-full rounded-lg border border-line bg-canvas/60 px-4 py-3 text-ink outline-none transition-colors placeholder:text-ink-mute/70 focus:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold/40";

  return (
    <form
      onSubmit={handleSubmit}
      className="card flex h-full flex-col overflow-hidden p-0 shadow-[0_28px_70px_-40px_rgba(0,0,0,0.85)]"
      noValidate
    >
      <div className="shrink-0 border-b border-line px-7 py-6 md:px-8">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-light">
          Message the desk
        </div>
        <h2 className="mt-1.5 font-display text-xl font-semibold text-ink md:text-2xl">
          Send a note
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-mute">
          Share context and we&apos;ll route it to the right person.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5 px-7 py-7 md:px-8 md:py-8">
        <div className="grid shrink-0 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-name`} className="mb-1.5 block text-sm font-medium text-ink-dim">
              Name
            </label>
            <input
              id={`${id}-name`}
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={set("name")}
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
              value={form.email}
              onChange={set("email")}
              placeholder="you@firm.com"
              className={field}
            />
          </div>
        </div>
        <div className="shrink-0">
          <label htmlFor={`${id}-subject`} className="mb-1.5 block text-sm font-medium text-ink-dim">
            Subject
          </label>
          <input
            id={`${id}-subject`}
            name="subject"
            value={form.subject}
            onChange={set("subject")}
            placeholder="Early access, security, partnership…"
            className={field}
          />
        </div>
        <div className="flex min-h-[8.5rem] flex-1 flex-col">
          <label htmlFor={`${id}-message`} className="mb-1.5 block shrink-0 text-sm font-medium text-ink-dim">
            Message
          </label>
          <textarea
            id={`${id}-message`}
            name="message"
            required
            value={form.message}
            onChange={set("message")}
            rows={4}
            placeholder="What should we know?"
            className={`${field} min-h-[8.5rem] flex-1 resize-none lg:resize-y`}
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
        <button
          type="submit"
          disabled={loading}
          className="btn-gold w-full shrink-0 disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send message"}
        </button>
        <p className="shrink-0 text-center text-xs text-ink-mute">
          Prefer a direct line? {SITE.email} · {SITE.phone}
        </p>
      </div>
    </form>
  );
}
