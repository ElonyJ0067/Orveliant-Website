import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Ocean Park Asset account.",
};

export default function LoginPage() {
  return (
    <div className="container-x py-24">
      <div className="mx-auto max-w-md">
        <div className="card p-8">
          <div className="mb-6 flex justify-center">
            <Logo />
          </div>
          <h1 className="text-center font-display text-2xl font-bold">Welcome back</h1>
          <p className="mt-2 text-center text-sm text-ink-dim">
            The client platform is launching in Phase 2.
          </p>

          <div className="mt-8 grid gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-dim">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-line bg-surface px-4 py-3 text-ink-mute outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-dim">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-line bg-surface px-4 py-3 text-ink-mute outline-none"
              />
            </div>
            <button disabled className="btn-gold w-full cursor-not-allowed opacity-60">
              Sign in
            </button>
          </div>

          <div className="mt-6 rounded-lg border border-gold/20 bg-gold/5 p-4 text-center text-sm text-ink-dim">
            Accounts aren&apos;t open yet.{" "}
            <Link href="/waitlist" className="font-semibold text-gold-light hover:text-gold-bright">
              Request Access →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
