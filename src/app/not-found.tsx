import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x py-32 text-center">
      <div className="font-display text-7xl font-extrabold text-gold-gradient">404</div>
      <h1 className="mt-4 font-display text-2xl font-bold">Page not found</h1>
      <p className="mt-3 text-ink-dim">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/" className="btn-gold">Back home</Link>
        <Link href="/markets" className="btn-ghost">View markets</Link>
      </div>
    </div>
  );
}
