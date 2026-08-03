"use client";

import { useEffect, useId, useState } from "react";
import { CAREER_ROLES, OPEN_ROLE, isValidRoleId } from "@/lib/careers";
import { SITE } from "@/lib/site";

type Props = {
  defaultRoleId?: string;
  /** When true, form sits inside a parent panel (no outer card / duplicate section chrome). */
  embedded?: boolean;
};

export function CareersForm({ defaultRoleId, embedded = false }: Props) {
  const initialRole =
    defaultRoleId && isValidRoleId(defaultRoleId) ? defaultRoleId : OPEN_ROLE.id;

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    roleId: initialRole,
    location: "",
    links: "",
    experience: "",
    message: "",
  });
  const id = useId();

  useEffect(() => {
    if (defaultRoleId && isValidRoleId(defaultRoleId)) {
      setForm((f) => ({ ...f, roleId: defaultRoleId }));
    }
  }, [defaultRoleId]);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
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
    if (!isValidRoleId(form.roleId)) {
      setError("Please select a role.");
      return;
    }
    if (form.message.trim().length < 20) {
      setError("Please share a short note (at least a few sentences) about your background.");
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
    const role = CAREER_ROLES.find((r) => r.id === form.roleId);
    return (
      <div
        className={
          embedded
            ? "px-2 py-10 text-center md:px-4 md:py-14"
            : "card p-8 text-center md:p-10"
        }
        role="status"
      >
        <div
          className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border border-gold/40 bg-gold/10 text-2xl text-gold-light"
          aria-hidden
        >
          ✓
        </div>
        <h3 className="font-display text-xl font-semibold">Application received</h3>
        <p className="mt-2 text-ink-dim">
          Thank you{form.name ? `, ${form.name}` : ""}. We&apos;ll review your{" "}
          {role ? <span className="text-ink">{role.title}</span> : "role"} profile and reply if
          there&apos;s a fit.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-lg border border-line bg-canvas/60 px-4 py-3 text-ink outline-none transition-colors placeholder:text-ink-mute/70 focus:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold/40";

  const selected = CAREER_ROLES.find((r) => r.id === form.roleId);

  return (
    <form
      onSubmit={handleSubmit}
      className={
        embedded
          ? "w-full"
          : "card overflow-hidden p-0 shadow-[0_28px_70px_-40px_rgba(0,0,0,0.85)]"
      }
      noValidate
    >
      {!embedded && (
        <div className="border-b border-line px-7 py-6 md:px-8">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-light">
            Application
          </div>
          <h2 className="mt-1.5 font-display text-xl font-semibold text-ink md:text-2xl">
            Apply to Orveliant
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-mute">
            One form for open roles and general interest. Strong profiles are reviewed even when a
            seat is not formally posted.
          </p>
        </div>
      )}

      <div
        className={
          embedded
            ? "grid gap-5 md:gap-6"
            : "grid gap-5 px-7 py-7 md:px-8 md:py-8"
        }
      >
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
            <label htmlFor={`${id}-role`} className="mb-1.5 block text-sm font-medium text-ink-dim">
              Role
            </label>
            <select
              id={`${id}-role`}
              name="roleId"
              required
              value={form.roleId}
              onChange={set("roleId")}
              className={`${field} appearance-none bg-[length:1rem] bg-[right_0.85rem_center] bg-no-repeat pr-10`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23e8ce78' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              }}
            >
              {CAREER_ROLES.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.title}
                  {role.open ? " — Open" : ""}
                </option>
              ))}
            </select>
            {selected && (
              <p className="mt-2 text-xs leading-relaxed text-ink-mute">
                {selected.compensation}
                {selected.compensationNote ? ` · ${selected.compensationNote}` : ""} ·{" "}
                {selected.location}
                {selected.open ? " · Actively hiring" : " · General interest"}
              </p>
            )}
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
              value={form.location}
              onChange={set("location")}
              placeholder="e.g. US Eastern, UTC+9"
              className={field}
            />
          </div>
          <div>
            <label
              htmlFor={`${id}-experience`}
              className="mb-1.5 block text-sm font-medium text-ink-dim"
            >
              Relevant experience
            </label>
            <input
              id={`${id}-experience`}
              name="experience"
              value={form.experience}
              onChange={set("experience")}
              placeholder="e.g. 5 years Solana / Anchor"
              className={field}
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label htmlFor={`${id}-links`} className="mb-1.5 block text-sm font-medium text-ink-dim">
              Links
            </label>
            <input
              id={`${id}-links`}
              name="links"
              value={form.links}
              onChange={set("links")}
              placeholder="LinkedIn, GitHub, resume, or portfolio"
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
            rows={embedded ? 5 : 6}
            placeholder="Relevant work, systems you've shipped, and why Orveliant fits."
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
              href={`mailto:${SITE.email}?subject=Careers%20application`}
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
