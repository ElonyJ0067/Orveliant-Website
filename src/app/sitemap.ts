import type { MetadataRoute } from "next";
import { POSTS } from "@/lib/posts";
import { PRODUCTS } from "@/lib/products";

const BASE = "https://orveliant.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/markets",
    "/desk",
    "/how-it-works",
    "/security",
    "/custody",
    "/fees",
    "/about",
    "/careers",
    "/contact",
    "/insights",
    "/waitlist",
    "/legal/terms",
    "/legal/privacy",
    "/legal/risk",
    "/legal/cookies",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const productRoutes = PRODUCTS.map((p) => ({
    url: `${BASE}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const postRoutes = POSTS.map((p) => ({
    url: `${BASE}/insights/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...postRoutes];
}
