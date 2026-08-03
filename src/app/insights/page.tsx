import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { formatDate, POSTS } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Perspectives on disciplined, risk-controlled AI investing — strategy, methodology, and market thinking from the Orveliant team.",
};

export default function InsightsPage() {
  return (
    <div className="container-x py-16">
      <SectionHeading
        eyebrow="Insights"
        title={<>Thinking on <span className="text-gold-gradient">disciplined investing.</span></>}
        subtitle="Strategy, methodology, and market perspective from the Orveliant team — no hype, just clarity."
      />

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {POSTS.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 3) * 0.1}>
            <Link href={`/insights/${p.slug}`} className="card card-hover flex h-full flex-col p-7">
              <div className="flex items-center gap-3 text-xs text-ink-mute">
                <span className="chip">{p.category}</span>
                <span>{p.readingTime}</span>
              </div>
              <h2 className="mt-4 font-display text-lg font-bold leading-snug">{p.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-dim">{p.excerpt}</p>
              <div className="mt-6 flex items-center justify-between text-xs text-ink-mute">
                <span>{formatDate(p.date)}</span>
                <span className="text-gold-light">Read →</span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
