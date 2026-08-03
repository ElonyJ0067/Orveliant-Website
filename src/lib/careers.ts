export type CareerRole = {
  id: string;
  team: string;
  title: string;
  focus: string;
  compensation: string;
  compensationNote?: string;
  open: boolean;
  location: string;
  description?: JobDescription;
};

export type JobDescription = {
  summary: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
};

export const CAREER_ROLES: CareerRole[] = [
  {
    id: "rust-anchor-developer",
    team: "Engineering",
    title: "Rust / Anchor Developer",
    focus:
      "Solana programs, secure instruction design, and production-grade on-chain infrastructure for staking and execution paths.",
    compensation: "$150k–$220k",
    open: true,
    location: "Remote",
    description: {
      summary:
        "We're looking for a Rust developer who enjoys building real Solana programs — not just demos. At Orveliant you'll help ship the on-chain side of our investing stack (Trading, Staking, and Hybrid) for private clients, with a clear focus on safe capital flows and clean, maintainable Anchor code. Strong Rust + Anchor fundamentals matter more than a perfect resume.",
      responsibilities: [
        "Build and improve Anchor programs for staking, vaults, and on-chain flows tied to the desk",
        "Work with the team on safe authorities, pause controls, and careful upgrade paths",
        "Connect programs to our off-chain systems so deposits, rewards, and settlements stay reliable",
        "Write practical tests and keep docs clear enough for review and handoff",
        "Ship iteratively with Risk, Backend, and Markets — small, solid releases over big risky ones",
      ],
      requirements: [
        "Comfortable Rust day-to-day, and real experience with Anchor / Solana programs (shipped or open-source welcome)",
        "You understand Solana basics well: accounts, PDAs, CPI, and how transactions fit together",
        "You care about security when money is involved — careful account checks, least privilege, no shortcuts",
        "You communicate clearly and like owning work from build → test → deploy",
        "Happy working remote and async with a small, focused team",
      ],
      niceToHave: [
        "Staking, liquid staking, or vault experience",
        "Any exposure to trading bots, execution systems, or DeFi protocols",
        "Helped prepare a program for audit or security review",
        "TypeScript / backend skills for clients, indexers, or ops tools",
        "Curiosity about hybrid systems that balance trading and on-chain yield",
      ],
    },
  },
  {
    id: "trading-bot-systems-engineer",
    team: "Engineering",
    title: "Trading Bot / Systems Engineer",
    focus:
      "Execution bots, monitoring, failover, and the reliability layer that keeps strategies running under live market conditions.",
    compensation: "$140k–$200k",
    open: false,
    location: "Remote",
  },
  {
    id: "backend-engineer-trading-systems",
    team: "Engineering",
    title: "Backend Engineer (Trading Systems)",
    focus:
      "APIs, market data pipelines, order orchestration, and on-chain integrations behind the desk.",
    compensation: "$145k–$210k",
    open: false,
    location: "Remote",
  },
  {
    id: "frontend-engineer-trading-ui",
    team: "Engineering",
    title: "Frontend Engineer (Trading UI)",
    focus:
      "Desk interfaces, charts, and real-time views that make market state and risk controls readable under pressure.",
    compensation: "$125k–$175k",
    open: false,
    location: "Remote",
  },
  {
    id: "risk-engineer",
    team: "Risk",
    title: "Risk Engineer",
    focus:
      "Limits, drawdown shields, alerting, and the controls that sit in the path of every order.",
    compensation: "$140k–$200k",
    open: false,
    location: "Remote",
  },
  {
    id: "quantitative-algo-trader",
    team: "Markets",
    title: "Quantitative / Algo Trader",
    focus:
      "Signal research, systematic execution, and live performance under explicit risk constraints.",
    compensation: "$160k–$280k",
    compensationNote: "Base + performance",
    open: false,
    location: "Remote",
  },
  {
    id: "defi-onchain-trader",
    team: "Markets",
    title: "DeFi / On-chain Trader",
    focus:
      "Venue selection, liquidity, and on-chain execution across DeFi markets with capital protection first.",
    compensation: "$130k–$220k",
    compensationNote: "Base + performance",
    open: false,
    location: "Remote",
  },
];

export const OPEN_ROLE = CAREER_ROLES.find((r) => r.open)!;

export const ROLE_IDS = CAREER_ROLES.map((r) => r.id);

export function getCareerRole(id: string): CareerRole | undefined {
  return CAREER_ROLES.find((r) => r.id === id);
}

export function isValidRoleId(id: string): boolean {
  return ROLE_IDS.includes(id);
}
