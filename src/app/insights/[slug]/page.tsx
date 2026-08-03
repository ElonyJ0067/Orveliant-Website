import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { formatDate, getPost, POSTS } from "@/lib/posts";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Insight" };
  return { title: post.title, description: post.excerpt };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const more = POSTS.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <div className="container-x py-16">
      <article className="mx-auto max-w-3xl">
        <Reveal>
          <Link href="/insights" className="text-sm text-ink-mute hover:text-gold-light transition-colors">
            ← All insights
          </Link>
          <div className="mt-5 flex items-center gap-3 text-xs text-ink-mute">
            <span className="chip">{post.category}</span>
            <span>{post.readingTime}</span>
            <span>·</span>
            <span>{formatDate(post.date)}</span>
          </div>
          <h1 className="mt-4 font-display text-3xl md:text-4xl font-extrabold leading-[1.1] tracking-tight">
            {post.title}
          </h1>
          <div className="hairline my-8" />
        </Reveal>

        <div className="space-y-5">
          {post.body.map((para, i) => (
            <Reveal key={i} delay={Math.min(i * 0.03, 0.2)}>
              <p className="text-lg leading-relaxed text-ink-dim">{para}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-line bg-surface/40 p-5 text-xs leading-relaxed text-ink-mute">
          This article is for general information only and is not financial advice or a
          guarantee of returns. Digital-asset trading and staking involve risk, including
          possible loss of capital.
        </div>
      </article>

      <div className="mx-auto mt-16 max-w-3xl">
        <h3 className="font-display text-xl font-semibold mb-6">More insights</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          {more.map((p) => (
            <Link key={p.slug} href={`/insights/${p.slug}`} className="card card-hover p-6">
              <div className="text-xs text-ink-mute">{p.category}</div>
              <div className="mt-2 font-display font-semibold leading-snug">{p.title}</div>
              <div className="mt-3 text-sm text-gold-light">Read →</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
