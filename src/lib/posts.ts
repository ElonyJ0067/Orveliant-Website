export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  category: string;
  body: string[];
};

export const POSTS: Post[] = [
  {
    slug: "risk-control-is-the-real-edge",
    title: "Why Risk Control — Not Prediction — Is the Real Edge",
    excerpt:
      "Everyone chases the perfect entry. Durable performance comes from what you do when you're wrong. Here's how disciplined risk control compounds over time.",
    date: "2026-07-10",
    readingTime: "5 min read",
    category: "Philosophy",
    body: [
      "In crypto, attention flows to bold predictions — the next 10x, the perfect top or bottom. But the traders who survive multiple cycles rarely win by predicting better. They win by losing smaller.",
      "Risk control is the discipline of deciding, in advance, how much you are willing to lose on any position, any day, and across the whole portfolio — and then enforcing those limits without emotion.",
      "At Orveliant, every position operates inside a layered defense system: automated stop-losses, maximum exposure caps, daily loss limits, drawdown protection, bounded leverage, and changing-market detection that can pause trading entirely.",
      "Why does this matter more than a great entry? Because losses compound asymmetrically. A 50% drawdown requires a 100% gain to recover. Keeping losses small keeps you in the game long enough for your edge to play out.",
      "This is the core of our approach: act on opportunity, but let protection lead. Growth is only meaningful if it survives the bad days.",
    ],
  },
  {
    slug: "trading-staking-or-hybrid",
    title: "Trading, Staking, or Hybrid: Which Strategy Fits You?",
    excerpt:
      "Three disciplined ways to put capital to work — and a simple framework for choosing between active trading, on-chain yield, and an AI-managed blend.",
    date: "2026-07-05",
    readingTime: "4 min read",
    category: "Strategy",
    body: [
      "Orveliant offers three strategies. They are not competing products — they are different risk-and-return profiles for different goals.",
      "AI Quant Trading is the most active. The system continuously seeks opportunities and executes with strict risk control. It suits those comfortable with market exposure in pursuit of growth.",
      "Staking is the most stable. Your assets earn transparent, on-chain yield from real staking. Yields are variable, not guaranteed, but the approach is steadier than active trading.",
      "Hybrid is for those who want balance without micromanaging it. You choose a risk profile, and the AI automatically allocates between Trading and Staking — rebalancing as market conditions change.",
      "A simple way to choose: if you prioritize growth and accept volatility, lean Trading. If you prioritize steadiness, lean Staking. If you want the discipline of both, decided continuously by the system, choose Hybrid.",
    ],
  },
  {
    slug: "what-validation-actually-means",
    title: "Backtested, Forward-Tested, Stress-Tested: What Validation Actually Means",
    excerpt:
      "\"Proven\" is an easy word to say. Here's what real validation looks like — and why it matters before a single dollar of client capital is deployed.",
    date: "2026-06-28",
    readingTime: "6 min read",
    category: "Methodology",
    body: [
      "Any system can look good on a chart chosen after the fact. Genuine validation is about testing a strategy against conditions it did not see during design.",
      "Backtesting evaluates the strategy across years of historical data. It's a starting point — necessary, but easy to over-fit if done carelessly.",
      "Forward testing runs the strategy on new, out-of-sample data it has never encountered. This is where over-fitted ideas fall apart and robust ones hold up.",
      "Stress testing deliberately pushes the system through extreme volatility and liquidity shocks — the moments that actually determine whether risk controls work.",
      "Execution validation checks the unglamorous realities: slippage, latency, and fill quality under live conditions. A strategy that looks profitable on paper can bleed out through poor execution.",
      "Only after passing all four does a system earn the word \"proven\" — and even then, past performance never guarantees future results. Validation reduces risk; it does not remove it.",
    ],
  },
];

export function getPost(slug: string) {
  return POSTS.find((p) => p.slug === slug);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
