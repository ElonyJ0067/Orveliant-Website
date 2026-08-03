import Image from "next/image";
import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import { Reveal } from "./Reveal";

export function ProductCards() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {PRODUCTS.map((p, i) => (
        <Reveal key={p.slug} delay={i * 0.12}>
          <Link
            href={`/products/${p.slug}`}
            className="card card-hover group flex h-full flex-col p-7"
          >
            <div className="relative mb-5 h-24 w-24">
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-40 transition-opacity group-hover:opacity-70"
                style={{ background: "radial-gradient(circle, rgba(201,162,39,0.6), transparent 70%)" }}
              />
              <Image
                src={p.icon}
                alt={p.name}
                width={192}
                height={192}
                quality={95}
                sizes="96px"
                className="relative h-24 w-24 object-contain drop-shadow-[0_8px_24px_rgba(201,162,39,0.35)] transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-1"
              />
            </div>

            <h3 className="font-display text-xl font-bold">{p.name}</h3>
            <p className="mt-1 text-sm text-gold-light">{p.tagline}</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-dim flex-1">{p.summary}</p>

            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink group-hover:text-gold-light transition-colors">
              Explore
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
