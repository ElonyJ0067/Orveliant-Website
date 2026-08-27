import type { MetadataRoute } from "next";

/** Unlisted site — do not publish a crawlable sitemap. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [];
}
