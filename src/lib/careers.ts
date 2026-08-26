export const CAREER_TEAMS = ["Engineering", "Markets", "Product", "Operations"] as const;
export type CareerTeam = (typeof CAREER_TEAMS)[number];
export type HiringStatus = "now" | "open";

export type JobDescription = {
  summary: string;
  /** First-person overview for the role page ("We are looking for…"). */
  about: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
};

export type CareerRole = {
  id: string;
  team: CareerTeam;
  title: string;
  /** One line: what this seat owns, and what it does not. */
  focus: string;
  compensation: string;
  compensationNote?: string;
  location: string;
  reportsTo: string;
  hiring: HiringStatus;
  process: string;
  stack: string[];
  description: JobDescription;
};

export const CAREER_TEAM_COPY: Record<CareerTeam, { blurb: string }> = {
  Engineering: {
    blurb: "Contracts, execution systems, APIs, and payment rails.",
  },
  Markets: {
    blurb: "Live books under written limits.",
  },
  Product: {
    blurb: "What operators and clients actually use.",
  },
  Operations: {
    blurb: "Pipeline and the numbers next to the book.",
  },
};

const PROCESS_TAKE_HOME =
  "Short application, then a take-home in this stack. We reply if we want a conversation.";
const PROCESS_APPLICATION =
  "Short application. We reply when there is a conversation to have.";

export const CAREER_ROLES: CareerRole[] = [
  {
    id: "smart-contract-engineer",
    team: "Engineering",
    title: "Smart Contract Engineer",
    focus: "Solidity for vaults, staking, and capital movement on EVM. Not payment webhooks. Not execution bots.",
    compensation: "$150k–$220k",
    location: "Remote",
    reportsTo: "Alvin, Head of Engineering",
    hiring: "now",
    process: PROCESS_APPLICATION,
    stack: ["Solidity", "Foundry", "EVM"],
    description: {
      summary:
        "Own the on-chain contracts behind Trading, Staking, and Hybrid. Pause paths, least privilege, and tests that fail when they should. EVM only.",
      about:
        "We are looking for a smart contract engineer to own the on-chain contracts behind our Trading, Staking, and Hybrid products on EVM. You will ship vault and settlement flows with pause paths, least privilege, and Foundry tests that fail when they should. This is an engineering seat reporting to Alvin, Head of Engineering. Payment webhooks and execution bots are handled elsewhere.",
      responsibilities: [
        "Design and ship Solidity for staking, vaults, and settlement-related flows",
        "Own access control, upgrade and pause paths, and Foundry invariant tests",
        "Work with backend so deposits, rewards, and withdrawals match off-chain state",
      ],
      requirements: [
        "Production Solidity on EVM, with Foundry or equivalent as daily tooling",
        "You know proxies, reentrancy, oracle assumptions, and how money moves on-chain",
        "You can explain a design in writing before it merges",
      ],
      niceToHave: [
        "ERC-4626 or similar vault work",
        "Sat with an audit, as author or recipient",
      ],
    },
  },
  {
    id: "trading-bot-systems-engineer",
    team: "Engineering",
    title: "Trading Bot / Systems Engineer",
    focus: "Live execution bots, failover, and kill paths. Not model training. Not the USDC ledger.",
    compensation: "$140k–$200k",
    location: "Remote",
    reportsTo: "Alvin, Head of Engineering",
    hiring: "now",
    process: PROCESS_TAKE_HOME,
    stack: ["Python", "TypeScript"],
    description: {
      summary:
        "Bots run in live markets for private clients. This seat owns the process: start, stop, restart, and prove they did. Supervision, failover, and the controls that stop a bad minute from becoming a bad day.",
      about:
        "We are looking for an engineer to build and operate the live execution bots our private clients depend on. You will own start, stop, restart, and proof they worked — supervision, failover, and controls that stop a bad minute from becoming a bad day. This is an engineering seat reporting to Alvin, Head of Engineering. Model training and the USDC ledger are out of scope.",
      responsibilities: [
        "Build and operate execution bots and the services around them",
        "Instrument latency, fills, rejects, and drift so trouble is visible early",
        "Design failover and kill paths Risk can use under stress",
        "Keep paper and live on the same code path, different capital",
        "Ship small, reversible releases with Markets and Backend",
      ],
      requirements: [
        "You have shipped and operated automated trading, or an equally unforgiving production system",
        "Python or TypeScript in production, including logging and incident habits",
        "You treat exchanges, sequence, and partial fills as normal failure modes",
        "You write the postmortem. You don't hide the gap",
      ],
      niceToHave: [
        "Exchange REST/WebSocket or OMS work",
        "Drawdown limits sitting in the execution path",
      ],
    },
  },
  {
    id: "backend-engineer-trading-systems",
    team: "Engineering",
    title: "Backend Engineer",
    focus: "APIs, market data, and order orchestration. Not the bot process. Not the UI.",
    compensation: "$145k–$210k",
    location: "Remote",
    reportsTo: "Alvin, Head of Engineering",
    hiring: "now",
    process: PROCESS_APPLICATION,
    stack: ["TypeScript", "PostgreSQL", "EVM"],
    description: {
      summary:
        "APIs and pipelines the desk and bots depend on. Market data ingest, order orchestration, and durable state that survives partial failure. Not the execution process. Not the UI.",
      about:
        "We are looking for a backend engineer to build the APIs and pipelines our desk and bots depend on — market data ingest, order orchestration, and durable state that survives partial failure. This is an engineering seat reporting to Alvin, Head of Engineering. The bot process and operator UI are handled by other seats.",
      responsibilities: [
        "Design APIs for market data, orders, positions, and account state",
        "Run durable ingest and normalize pipelines the desk can trust under load",
        "Orchestrate order and settlement flows with explicit state and retries",
      ],
      requirements: [
        "Production backend work where correctness matters more than novelty",
        "TypeScript or similar; you can model state machines and idempotent jobs",
        "You have integrated external venues or chains and handled partial failure",
      ],
      niceToHave: [
        "Exchange or broker APIs",
        "EVM indexing or event decoding",
      ],
    },
  },
  {
    id: "frontend-engineer-trading-ui",
    team: "Engineering",
    title: "Frontend Engineer",
    focus: "Real-time desk and operator UI. Not backend services. Not brand illustration.",
    compensation: "$125k–$175k",
    location: "Remote",
    reportsTo: "Alvin, Head of Engineering",
    hiring: "now",
    process: PROCESS_APPLICATION,
    stack: ["TypeScript", "React", "Next.js"],
    description: {
      summary:
        "The surfaces operators stare at when the book moves. Live charts, positions, and risk state — with reconnect and stale data handled honestly. Not backend services. Not brand illustration.",
      about:
        "We are looking for a frontend engineer to build the surfaces operators stare at when the book moves — live charts, positions, and risk state, with reconnect and stale data handled honestly. You will hold the performance bar when markets move fast. This is an engineering seat reporting to Alvin, Head of Engineering. Backend services and brand illustration are out of scope.",
      responsibilities: [
        "Ship live charts, positions, fills, and risk state",
        "Handle reconnect, stale data, and empty states as first-class",
        "Hold the performance bar when the book moves",
      ],
      requirements: [
        "TypeScript and React in production on a complex interactive surface",
        "Real-time UI (WebSockets or equivalent) and the failure modes that come with it",
        "You cut decoration that fights readability",
      ],
      niceToHave: [
        "Trading or ops consoles",
        "lightweight-charts or canvas market views",
      ],
    },
  },
  {
    id: "payments-engineer",
    team: "Engineering",
    title: "Payments Engineer",
    focus: "USDC deposits, webhooks, and ledger truth. Not PnL reporting. Not trading bots.",
    compensation: "$140k–$200k",
    location: "Remote",
    reportsTo: "Alvin, Head of Engineering",
    hiring: "now",
    process: PROCESS_TAKE_HOME,
    stack: ["TypeScript", "USDC", "EVM"],
    description: {
      summary:
        "Own the payment path: confirmed USDC in, internal ledger out, risk gate in between. Settlement timing and reconciliation. A deposit, a webhook, and the books have to match.",
      about:
        "We are looking for a payments engineer to own our USDC deposit path: confirmed money in, internal ledger out, risk gate in between. You will keep webhooks, on-chain receipts, and internal balances consistent — when a deposit lands, the books have to match. This is an engineering seat reporting to Alvin, Head of Engineering. PnL reporting and trading bots are handled elsewhere.",
      responsibilities: [
        "Build deposit and settlement flows: webhooks, confirmations, idempotent ledger writes",
        "Keep on-chain receipts and internal balances consistent",
        "Put limits, pause, and an explained reject on treasury movement",
        "Work with Backend and Smart Contract so settlement matches the chain",
        "Document retries, double-credit, delayed confirmation, and how you unwind them",
      ],
      requirements: [
        "You have shipped production payment, treasury, or similarly unforgiving money-movement systems",
        "Webhooks, idempotency, and reconciling an external source of truth to a ledger",
        "Enough EVM literacy to treat a confirmed transfer as a source document",
      ],
      niceToHave: [
        "USDC, Circle, or EIP-3009 in production",
        "A live treasury or payments ops surface",
      ],
    },
  },
  {
    id: "risk-engineer",
    team: "Engineering",
    title: "Risk Engineer",
    focus: "Limits and kill switches in the order path. Not the bot itself. Not the finance books.",
    compensation: "$140k–$200k",
    location: "Remote",
    reportsTo: "Alvin, Head of Engineering",
    hiring: "open",
    process: PROCESS_APPLICATION,
    stack: ["TypeScript", "Python"],
    description: {
      summary:
        "Encode notional, concentration, drawdown, and kill switches so execution cannot bypass them. If a control is not in the path, it does not exist.",
      about:
        "We are looking for a risk engineer to encode notional, concentration, drawdown, and kill switches so execution cannot bypass them. You will put controls in the path — if a limit is not enforced live, it does not exist. This is an engineering seat reporting to Alvin, Head of Engineering. The bot process and finance books are out of scope.",
      responsibilities: [
        "Specify and implement pre-trade and in-flight controls",
        "Show current usage vs. limit to the desk, not a daily PDF",
        "Alert on real breach, not noise",
      ],
      requirements: [
        "You have built or operated controls in trading, payments, or similar production",
        "You can encode policy as code and prove it fired",
        "You can talk to traders and engineers without a translation layer",
      ],
      niceToHave: [
        "Circuit breakers or kill-switch design",
        "Live book market-risk or operational-risk work",
      ],
    },
  },
  {
    id: "quantitative-algo-trader",
    team: "Markets",
    title: "Quantitative / Algo Trader",
    focus: "Systematic signals and live execution under written limits. Not on-chain venue picking.",
    compensation: "$160k–$280k",
    compensationNote: "Base + performance",
    location: "Remote",
    reportsTo: "Mikle, Head of Trading",
    hiring: "open",
    process: PROCESS_APPLICATION,
    stack: ["Python"],
    description: {
      summary:
        "Research and run systematic trading inside a written risk framework. Costs, capacity, and drawdown are part of the claim. No unconstrained alpha stories.",
      about:
        "We are looking for a quantitative trader to research and run systematic strategies inside our written risk framework. You will treat costs, capacity, and drawdown as part of the claim — not unconstrained alpha stories. This is a markets seat reporting to Mikle, Head of Trading. On-chain venue selection is handled elsewhere.",
      responsibilities: [
        "Research signals and execution with costs and slippage in the loop",
        "Run live books under written limits; cut risk when the regime says so",
        "Keep research code and production bots from diverging",
      ],
      requirements: [
        "Live systematic or semi-systematic trading, not only backtests",
        "You can discuss edge without hiding turnover, fees, or left-tail",
        "You accept that risk controls can override a signal",
      ],
      niceToHave: [
        "Crypto CEX microstructure",
        "Python research someone else can rerun",
      ],
    },
  },
  {
    id: "defi-onchain-trader",
    team: "Markets",
    title: "DeFi / On-chain Trader",
    focus: "EVM venue selection, liquidity, and execution. Not CEX systematic research.",
    compensation: "$130k–$220k",
    compensationNote: "Base + performance",
    location: "Remote",
    reportsTo: "Mikle, Head of Trading",
    hiring: "open",
    process: PROCESS_APPLICATION,
    stack: ["EVM"],
    description: {
      summary:
        "On-chain markets are part of the book. Choose venues, size to liquidity, and execute with an exit plan. Protocol, oracle, and exit risk are the job.",
      about:
        "We are looking for an on-chain trader to source and execute on EVM venues as part of the book. You will size to liquidity, execute with an exit plan, and treat protocol, oracle, and exit risk as core work. This is a markets seat reporting to Mikle, Head of Trading. CEX systematic research is handled elsewhere.",
      responsibilities: [
        "Source and execute on EVM venues with explicit size, slippage, and exit plans",
        "Assess protocol and operational risk before capital is committed",
        "Keep a record of fills, failed transactions, and dropped venues",
      ],
      requirements: [
        "Hands-on EVM trading or treasury execution — you have moved size",
        "You can explain a pool, a router, and a failure mode without a jargon thread",
        "Comfortable with engineers on allowances, MEV, and settlement",
      ],
      niceToHave: [
        "MEV-aware execution habits",
        "Stuck-exit or bad-oracle incident experience",
      ],
    },
  },
  {
    id: "product-manager",
    team: "Product",
    title: "Product Manager",
    focus: "Sequence of Trading, Staking, Hybrid, and the desk. Not visual design. Not engineering delivery.",
    compensation: "$135k–$190k",
    location: "Remote",
    reportsTo: "Januario Ximenes, CEO",
    hiring: "open",
    process: PROCESS_APPLICATION,
    stack: [],
    description: {
      summary:
        "Decide what ships, what waits, and what we refuse. Risk limits and disclosures are product constraints, not a later overlay.",
      about:
        "We are looking for a product manager to decide what ships, what waits, and what we refuse across Trading, Staking, Hybrid, and the desk. You will treat risk limits and disclosures as product constraints from day one — not a later overlay. This seat reports to Januario Ximenes, CEO. Visual design and engineering delivery are out of scope.",
      responsibilities: [
        "Sequence the investing stack for private clients and operators",
        "Write specs small enough that engineering and markets can both sign",
        "Turn feedback into decisions, not an endless backlog",
      ],
      requirements: [
        "Shipped product in markets, fintech, or a similarly constrained domain",
        "You can write a one-page spec",
        "You will say no to work that does not earn its complexity",
      ],
      niceToHave: [
        "Trading, custody, or portfolio products",
        "Enough technical literacy to talk to engineers without performing it",
      ],
    },
  },
  {
    id: "product-designer",
    team: "Product",
    title: "Product Designer",
    focus: "Institutional product UI. Not marketing campaigns. Not frontend implementation.",
    compensation: "$115k–$165k",
    location: "Remote",
    reportsTo: "Mykhailo, CTO",
    hiring: "open",
    process: PROCESS_APPLICATION,
    stack: ["Figma"],
    description: {
      summary:
        "Design the surfaces clients and operators use: access flows and desk views. Quiet, dense, readable. The public site and the product should feel like one house.",
      about:
        "We are looking for a product designer for the surfaces clients and operators use every day — access flows, desk views, and quiet dense interfaces where market state reads in seconds. The public site and product should feel like one house. This seat reports to Mykhailo, CTO. Marketing campaigns and frontend implementation are handled elsewhere.",
      responsibilities: [
        "Design desk and account surfaces where market state is readable in seconds",
        "Specify empty, error, and loading states with Frontend",
        "Keep type, space, and hierarchy tighter than decoration",
      ],
      requirements: [
        "A portfolio of shipped product UI, not only brand decks",
        "You can design data-heavy interfaces without clutter",
        "You take engineering and risk constraints as part of the work",
      ],
      niceToHave: [
        "Trading or fintech consoles",
        "A tight design system you actually maintained",
      ],
    },
  },
  {
    id: "marketing-manager",
    team: "Operations",
    title: "Marketing Manager",
    focus: "Waitlist quality and public narrative. Not product design. No return promises.",
    compensation: "$105k–$155k",
    location: "Remote",
    reportsTo: "Januario Ximenes, CEO",
    hiring: "open",
    process: PROCESS_APPLICATION,
    stack: [],
    description: {
      summary:
        "Build a precise presence: waitlist, hiring signal, and copy that matches how we invest. If a line needs a guaranteed return to work, it does not ship.",
      about:
        "We are looking for a marketing manager to build a precise public presence — waitlist quality, hiring signal, and copy that matches how we actually invest. If a line needs a guaranteed return to work, it does not ship. This seat reports to Januario Ximenes, CEO. Product design is out of scope.",
      responsibilities: [
        "Own site, LinkedIn, and inbound narrative, consistent with risk disclosure",
        "Run the waitlist as a pipeline: who, why, whether they fit",
        "Support hiring with copy that sounds like the work, not a job board",
      ],
      requirements: [
        "Marketing or communications for a serious B2B, fintech, or private-client shop",
        "You can write in short sentences without slogans",
        "You measure inbound quality, not only impressions",
      ],
      niceToHave: [
        "Waitlists or invitation-only products",
        "Crypto fluency without the influencer register",
      ],
    },
  },
  {
    id: "finance-analyst",
    team: "Operations",
    title: "Financial Operations Analyst",
    focus: "Books, fees, and reporting. Not payment engineering. Not investment advice.",
    compensation: "$100k–$150k",
    location: "Remote",
    reportsTo: "Januario Ximenes, CEO",
    hiring: "open",
    process: PROCESS_APPLICATION,
    stack: ["SQL"],
    description: {
      summary:
        "Keep operating expenses, fees, and desk reporting reconcilable. If a figure cannot be tied to a venue, a wallet, or a bank line, it is not done.",
      about:
        "We are looking for a financial operations analyst to keep operating expenses, fees, and desk reporting reconcilable. Every figure should tie to a venue, a wallet, or a bank line — if it cannot, it is not done. This seat reports to Januario Ximenes, CEO. Payment engineering and investment advice are out of scope.",
      responsibilities: [
        "Build reporting for PnL, fees, and operating costs with an audit trail",
        "Reconcile venue, chain, and internal ledgers",
        "Support internal packs that disclose risk and do not imply guaranteed returns",
      ],
      requirements: [
        "Reporting, FP&A, or operations finance where reconciliation actually mattered",
        "Spreadsheet and SQL fluency; you can find the break",
        "Clear writing for non-finance readers, including risk caveats",
      ],
      niceToHave: [
        "Trading firm, fund, or crypto treasury operations",
        "Fee waterfalls or client reporting packs",
      ],
    },
  },
];

export const ROLE_IDS = CAREER_ROLES.map((r) => r.id);

export function getCareerRole(id: string): CareerRole | undefined {
  return CAREER_ROLES.find((r) => r.id === id);
}

export function isValidRoleId(id: string): boolean {
  return ROLE_IDS.includes(id);
}

export function careerPath(id: string): string {
  return `/careers/${id}`;
}

export function hiringNow(): CareerRole[] {
  return CAREER_ROLES.filter((r) => r.hiring === "now");
}

export function otherRoles(): CareerRole[] {
  return CAREER_ROLES.filter((r) => r.hiring !== "now");
}

export function rolesByTeam(
  roles: CareerRole[] = CAREER_ROLES,
): { team: CareerTeam; blurb: string; roles: CareerRole[] }[] {
  return CAREER_TEAMS.map((team) => ({
    team,
    blurb: CAREER_TEAM_COPY[team].blurb,
    roles: roles.filter((r) => r.team === team),
  })).filter((desk) => desk.roles.length > 0);
}

/** "$140k–$200k" → yearly USD bounds for JobPosting schema. */
export function compensationRangeUsd(comp: string): { min: number; max: number } | null {
  const m = comp.replace(/,/g, "").match(/\$(\d+)\s*k\s*[–-]\s*\$(\d+)\s*k/i);
  if (!m) return null;
  return { min: Number(m[1]) * 1000, max: Number(m[2]) * 1000 };
}

/** ISO date for JobPosting schema only (not shown in UI). */
export const CAREERS_POSTED = "2026-08-26";

export function roleSummary(role: CareerRole): string {
  return role.description.summary ?? role.focus;
}

export function roleAbout(role: CareerRole): string {
  return role.description.about ?? roleSummary(role);
}

export function hiringIntro(roles: CareerRole[] = hiringNow()): string {
  const n = roles.length;
  if (n === 0) {
    return "No active search right now. Strong profiles for the roles below are still read.";
  }
  const eng = roles.every((r) => r.team === "Engineering");
  const words = ["", "One", "Two", "Three", "Four", "Five", "Six"] as const;
  const count = words[n] ?? String(n);
  const seat = n === 1 ? "seat is" : "seats are";
  const kind = eng ? " engineering" : "";
  return `${count}${kind} ${seat} hiring now. Other roles stay listed — we read a strong profile when the fit is real.`;
}
