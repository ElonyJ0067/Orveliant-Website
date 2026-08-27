import type { MetadataRoute } from "next";

/** Unlisted site — block search engines and major AI crawlers. */
const DISALLOW_ALL = { disallow: ["/"] as string[] };

const AI_AND_SEARCH_BOTS = [
  "Googlebot",
  "Googlebot-Image",
  "Googlebot-News",
  "Google-Extended",
  "Bingbot",
  "Slurp",
  "DuckDuckBot",
  "Baiduspider",
  "YandexBot",
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "anthropic-ai",
  "Applebot",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "meta-externalagent",
  "FacebookBot",
  "PerplexityBot",
  "YouBot",
  "cohere-ai",
  "Diffbot",
  "ImagesiftBot",
  "omgili",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", ...DISALLOW_ALL },
      ...AI_AND_SEARCH_BOTS.map((userAgent) => ({
        userAgent,
        ...DISALLOW_ALL,
      })),
    ],
  };
}
