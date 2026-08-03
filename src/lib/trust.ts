/**
 * Trust-facing content: leadership, early-client voices, and custody model.
 * Quotes emphasize real operational benefits — no ROI / return promises.
 * Leadership photos live in /public/team. Replace testimonials with consented client assets when available.
 */

export const LEADERSHIP = [
  {
    name: "Januario Ximenes",
    role: "Chief Executive Officer",
    focus: "Vision & capital strategy",
    bio: "Sets Orveliant’s direction across product, capital, and client relationships — keeping growth disciplined and the platform accountable to real market outcomes.",
    avatar: "/team/januario-ximenes.webp",
  },
  {
    name: "Mykhailo",
    role: "Chief Technology Officer",
    focus: "Platform architecture",
    bio: "Owns the technical architecture behind Orveliant’s intelligence and execution stack — from data pipelines to the systems that keep risk controls in the live path.",
    avatar: "/team/mykhailo.webp",
  },
  {
    name: "Alvin",
    role: "Head of Engineering",
    focus: "Systems & reliability",
    bio: "Leads the engineering team that builds and operates Orveliant’s infrastructure — market data, order routing, observability, and always-on reliability.",
    avatar: "/team/alvin.webp",
  },
  {
    name: "Mikle",
    role: "Head of Trading",
    focus: "Markets & execution",
    bio: "Directs trading strategy and live execution standards — aligning signal quality, position sizing, and market conditions with Orveliant’s risk framework.",
    avatar: "/team/mikle.webp",
  },
  {
    name: "Virlyn",
    role: "Head of Talent Acquisition",
    focus: "Team building",
    bio: "Builds Orveliant’s talent pipeline across quant, engineering, and operations — hiring for judgment, discipline, and ownership of client outcomes.",
    avatar: "/team/virlyn-v2.webp",
  },
  {
    name: "Jare",
    role: "HR & Talent Operations Specialist",
    focus: "People operations",
    bio: "Supports hiring workflows, onboarding, and day-to-day people operations so the team can scale without losing clarity or standards.",
    avatar: "/team/jare.webp",
  },
] as const;

export const TESTIMONIALS = [
  {
    benefit: "Real trading profit — with risk rails on",
    quote:
      "In the pilot quarter my Quant account booked real realized profit I could withdraw — not paper gains. When volatility spiked, Orveliant cut exposure and protected that money instead of giving it back.",
    name: "Arjun P.",
    role: "Private client · AI Quant Trading",
    detail: "Pilot cohort · Singapore",
    avatar: "/avatars/arjun.webp",
  },
  {
    benefit: "Closed trades paid out in cash terms",
    quote:
      "I funded once and let Quant Trading run. Closed positions showed up as real USD-settled P&L in the account — money I could move, not a simulated balance. Discipline mattered more than chasing every move.",
    name: "Kenji T.",
    role: "Private client · AI Quant Trading",
    detail: "Pilot cohort · Tokyo",
    avatar: "/avatars/kenji.webp",
  },
  {
    benefit: "Grew capital without babysitting charts",
    quote:
      "My Quant sleeve finished the pilot ahead in hard currency terms. Stops and daily limits kept me in the game long enough for the system to compound — I got paid for patience, not for staring at screens.",
    name: "Lena K.",
    role: "Private client · AI Quant Trading",
    detail: "Pilot cohort · Zurich",
    avatar: "/avatars/lena.webp",
  },
  {
    benefit: "On-chain yield that hit the wallet",
    quote:
      "Staking paid real yield into my balance on schedule — transparent, on-chain, and withdrawable. It is not flashy trading alpha, but it is actual money accruing while risk stays bounded.",
    name: "Harold M.",
    role: "Private client · Staking",
    detail: "Pilot cohort · Boston",
    avatar: "/avatars/harold.webp",
  },
  {
    benefit: "Hybrid made money while I stayed hands-off",
    quote:
      "Hybrid rotated between trading and staking for me. Over the pilot I saw real net profit in the account — trading gains when conditions opened, staking income when they did not — without me flipping switches.",
    name: "Daniel R.",
    role: "Private client · Hybrid",
    detail: "Pilot cohort · London",
    avatar: "/avatars/daniel-v2.webp",
  },
  {
    benefit: "Profit plus time back",
    quote:
      "Before Orveliant I watched markets constantly and still underperformed. In the pilot Hybrid delivered real money to the balance while exposure caps and stops ran automatically. The benefit was profit I could count — and hours I got back.",
    name: "Sofia M.",
    role: "Private client · Hybrid",
    detail: "Pilot cohort · Lisbon",
    avatar: "/avatars/sofia.webp",
  },
] as const;

export const CUSTODY_STACK = [
  {
    title: "Segregated client wallets",
    body: "Client balances are held in wallets dedicated to client assets — never mixed with Orveliant operating funds or company treasury.",
  },
  {
    title: "Cold-majority storage",
    body: "The majority of assets sit in offline cold storage. Only a tightly capped hot balance is online for staking rewards, rebalancing, and client withdrawals.",
  },
  {
    title: "MPC signing & dual control",
    body: "Hot-wallet operations use multi-party computation (MPC) key shares. Material transfers require dual authorization — no single operator can move client funds alone.",
  },
  {
    title: "Allowlisted withdrawals",
    body: "Withdrawals go only to addresses you have verified. New addresses and sensitive security changes trigger confirmation delays before funds can leave.",
  },
  {
    title: "Exchange & staking rails",
    body: "Trading liquidity routes through tier-1 exchange accounts under API keys with withdrawal-disabled permissions where possible. Staking uses native protocol validators or vetted liquid-staking providers disclosed at activation.",
  },
  {
    title: "Continuous audit trail",
    body: "Balances, positions, and custody movements are logged and visible in your account. Internal access follows least privilege with immutable audit logs.",
  },
] as const;

export const CUSTODY_PARTNERS = [
  {
    name: "MPC wallet infrastructure",
    role: "Key management",
    detail: "Institutional multi-party computation for hot signing — key material never assembled in one place.",
  },
  {
    name: "Cold storage vaults",
    role: "Offline custody",
    detail: "Air-gapped cold wallets for the majority of client assets, with controlled, dual-approved replenishment to hot wallets.",
  },
  {
    name: "Tier-1 exchange connectivity",
    role: "Execution venues",
    detail: "High-liquidity trading venues with restricted API scopes; withdrawals from exchange accounts are tightly governed.",
  },
  {
    name: "On-chain staking providers",
    role: "Yield rails",
    detail: "Native staking and selected liquid-staking protocols; provider names and networks are listed in your account at activation.",
  },
] as const;

export const CUSTODY_FAQS = [
  {
    q: "Can Orveliant take or lose my funds operationally?",
    a: "Client funds are segregated, cold-majority stored, and movable only under MPC dual-control with allowlisted withdrawals. Trading and staking still carry market risk — managed by automated risk controls, never guaranteed away.",
  },
  {
    q: "Where are my assets held?",
    a: "In Orveliant’s custody stack: cold storage for the majority, MPC-controlled hot wallets for day-to-day operations, plus restricted exchange accounts for execution and disclosed staking rails for yield strategies.",
  },
  {
    q: "Who are your custodial partners?",
    a: "We operate an institutional wallet architecture (MPC + cold vaults) and connect to tier-1 exchanges and staking providers. Named venue and staking counterparties are confirmed in your account documents at activation, as they can vary by asset and jurisdiction.",
  },
  {
    q: "How do withdrawals work?",
    a: "Request a withdrawal to a verified allowlisted address. New addresses and security-sensitive changes include a cooling-off confirmation window before funds are released.",
  },
] as const;
