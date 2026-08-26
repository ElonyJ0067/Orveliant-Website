"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { getCareerRole, isValidRoleId } from "@/lib/careers";
import { SITE } from "@/lib/site";

type Commitment = "Full-time" | "Part-time";

const COMMITMENTS: Commitment[] = ["Full-time", "Part-time"];
const MIN_NOTE = 80;

type Props = {
  roleId: string;
};

function hasUsefulLink(value: string) {
  const v = value.trim();
  if (v.length < 8) return false;
  return /https?:\/\//i.test(v) || v.includes(".");
}

export function CareersForm({ roleId }: Props) {
  const role = isValidRoleId(roleId) ? getCareerRole(roleId) : undefined;
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    roleId,
    commitment: "Full-time" as Commitment,
    location: "",
    links: "",
    experience: "",
    message: "",
  });
  const id = useId();

  const set =
    (k: "name" | "email" | "phone" | "location" | "links" | "experience" | "message") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!form.location.trim()) {
      setError("Please add your location or timezone.");
      return;
    }
    if (!hasUsefulLink(form.links)) {
      setError("Please add a LinkedIn, GitHub, resume, or portfolio URL.");
      return;
    }
    if (form.message.trim().length < MIN_NOTE) {
      setError("Please write a few sentences about relevant work.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/careers", {
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
      <div className="card grid min-h-[16rem] place-items-center p-8 text-center md:p-10" role="status">
        <div>
          <div
            className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border border-gold/40 bg-gold/10 text-2xl text-gold-light"
            aria-hidden
          >
            ✓
          </div>
          <h3 className="font-display text-xl font-semibold">Application received</h3>
          <p className="mt-2 text-ink-dim">
            Thank you{form.name ? `, ${form.name}` : ""}. We will review your{" "}
            {role ? <span className="text-ink">{role.title}</span> : "role"} profile and reply if
            there is a conversation to have.
          </p>
          <Link href="/careers" className="btn-ghost mt-6 inline-block px-6 py-2.5 text-sm text-ink">
            All roles
          </Link>
        </div>
      </div>
    );
  }

  const field =
    "w-full rounded-lg border border-line bg-canvas/60 px-4 py-3 text-ink outline-none transition-colors placeholder:text-ink-mute focus:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold/40";

  return (
    <form
      onSubmit={handleSubmit}
      className="card overflow-hidden p-0 shadow-[0_28px_70px_-40px_rgba(0,0,0,0.85)]"
      noValidate
    >
      <div className="border-b border-line px-7 py-6 md:px-8">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-light">
          Application
        </div>
        <h2 className="mt-1.5 font-display text-xl font-semibold text-ink md:text-2xl">
          Apply{role ? ` for ${role.title}` : ""}
        </h2>
        {role ? (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-mute">{role.focus}</p>
        ) : (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-mute">
            Name, a link we can open, and what you have shipped.
          </p>
        )}
      </div>

      <div className="grid gap-5 px-7 py-7 md:gap-6 md:px-8 md:py-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_16.5rem] lg:items-start">
          <div>
            <div className="mb-1.5 text-sm font-medium text-ink-dim">Role</div>
            <div className="rounded-lg border border-line bg-canvas/60 px-4 py-3">
              <p className="font-medium text-ink">{role?.title}</p>
            </div>
            {role ? (
              <p className="mt-2 text-xs leading-relaxed text-ink-mute">
                <span className="text-gold-light">{role.team}</span>
                {" · "}
                {role.compensation}
                {role.compensationNote ? ` · ${role.compensationNote}` : ""}
                {" · "}
                {role.location}
              </p>
            ) : null}
            <input type="hidden" name="roleId" value={roleId} />
          </div>
          <div>
            <div
              id={`${id}-commitment-label`}
              className="mb-1.5 block text-sm font-medium text-ink-dim"
            >
              Commitment
            </div>
            <div
              role="radiogroup"
              aria-labelledby={`${id}-commitment-label`}
              className="grid grid-cols-2 gap-2"
            >
              {COMMITMENTS.map((option) => {
                const active = form.commitment === option;
                return (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setForm((f) => ({ ...f, commitment: option }))}
                    className={`rounded-lg border px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 ${
                      active
                        ? "border-gold/50 bg-gold/10 text-gold-light"
                        : "border-line bg-canvas/60 text-ink-dim hover:text-ink"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor={`${id}-name`} className="mb-1.5 block text-sm font-medium text-ink-dim">
              Full name
            </label>
            <input
              id={`${id}-name`}
              name="name"
              autoComplete="name"
              required
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
          <div className="sm:col-span-2 lg:col-span-1">
            <label htmlFor={`${id}-phone`} className="mb-1.5 block text-sm font-medium text-ink-dim">
              Phone <span className="font-normal text-ink-mute">(optional)</span>
            </label>
            <input
              id={`${id}-phone`}
              name="phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={set("phone")}
              placeholder="+1 …"
              className={field}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label
              htmlFor={`${id}-location`}
              className="mb-1.5 block text-sm font-medium text-ink-dim"
            >
              Location / timezone
            </label>
            <input
              id={`${id}-location`}
              name="location"
              required
              value={form.location}
              onChange={set("location")}
              placeholder="e.g. US Eastern, UTC+9"
              className={field}
            />
          </div>
          <div>
            <label htmlFor={`${id}-links`} className="mb-1.5 block text-sm font-medium text-ink-dim">
              Links
            </label>
            <input
              id={`${id}-links`}
              name="links"
              required
              value={form.links}
              onChange={set("links")}
              placeholder="LinkedIn, GitHub, or resume URL"
              className={field}
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label
              htmlFor={`${id}-experience`}
              className="mb-1.5 block text-sm font-medium text-ink-dim"
            >
              Experience <span className="font-normal text-ink-mute">(optional)</span>
            </label>
            <input
              id={`${id}-experience`}
              name="experience"
              value={form.experience}
              onChange={set("experience")}
              placeholder="Years and context"
              className={field}
            />
          </div>
        </div>

        <div>
          <label htmlFor={`${id}-message`} className="mb-1.5 block text-sm font-medium text-ink-dim">
            Brief note
          </label>
          <textarea
            id={`${id}-message`}
            name="message"
            required
            value={form.message}
            onChange={set("message")}
            rows={5}
            placeholder="Relevant work you have shipped, and why this seat fits."
            className={`${field} resize-y`}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-down/30 bg-down/10 px-4 py-2.5 text-sm text-down"
          >
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full px-8 disabled:opacity-60 sm:w-auto"
          >
            {loading ? "Submitting…" : "Submit application"}
          </button>
          <p className="text-center text-xs text-ink-mute sm:text-right">
            Prefer email?{" "}
            <a
              href={`mailto:${SITE.email}?subject=${encodeURIComponent(`Careers — ${role?.title ?? "application"}`)}`}
              className="text-gold-light underline-offset-2 hover:underline"
            >
              {SITE.email}
            </a>
          </p>
        </div>
      </div>
    </form>
  );
}
