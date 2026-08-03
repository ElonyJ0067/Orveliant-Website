export type Product = {
  slug: string;
  name: string;
  tagline: string;
  icon: string;
  summary: string;
  bullets: string[];
  accent: string;
};

export const PRODUCTS: Product[] = [
  {
    slug: "ai-quant-trading",
    name: "AI Quant Trading",
    tagline: "Act on opportunity in real time",
    icon: "/icon-trading.webp",
    summary:
      "Our AI continuously monitors the market and executes precise entries and exits — only when signal strength and risk conditions align.",
    bullets: [
      "Real-time analysis of price, momentum, volume, volatility & liquidity",
      "High-confidence entries with disciplined, rule-based exits",
      "Dynamic position sizing calibrated to your capital",
      "Automated stop-loss, exposure & drawdown protection",
    ],
    accent: "#c9a227",
  },
  {
    slug: "staking",
    name: "Staking",
    tagline: "Transparent, on-chain yield",
    icon: "/icon-staking-v7.webp",
    summary:
      "Put your assets to work through real, verifiable staking. Yields are sourced on-chain and shown transparently — never a fixed promise.",
    bullets: [
      "Real on-chain staking across major networks",
      "Transparent, variable APR — clearly sourced",
      "Institutional-grade validator infrastructure",
      "Flexible allocation, continuous reward tracking",
    ],
    accent: "#e8ce78",
  },
  {
    slug: "hybrid",
    name: "Hybrid Strategy",
    tagline: "AI decides the optimal balance",
    icon: "/icon-hybrid-v2.webp",
    summary:
      "Deposit once and let the AI automatically allocate between Trading and Staking — optimizing the disciplined balance of growth and stability for you.",
    bullets: [
      "Automatic capital allocation between Trading & Staking",
      "Continuously rebalanced to market conditions",
      "Risk profile you set — the AI executes the discipline",
      "One deposit, one dashboard, fully managed",
    ],
    accent: "#f4dd8f",
  },
];

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}
