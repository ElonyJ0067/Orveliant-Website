export const CAREER_TRACKS = ["Business", "Engineering"] as const;
export type CareerTrack = (typeof CAREER_TRACKS)[number];

/** @deprecated Use CareerTrack. Kept so application alerts still receive a team label. */
export type CareerTeam = CareerTrack;

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
  track: CareerTrack;
  /** Same as track. Application alerts still label this "team". */
  team: CareerTrack;
  title: string;
  /** One line under the title on the role page and in the application form. */
  focus: string;
  /** Muted line on the job card, under the date. */
  cardLine: string;
  /** Short rate for the card footer, e.g. "$100–$180/hr". */
  rateLabel: string;
  compensation: string;
  compensationNote?: string;
  location: string;
  engagement: string[];
  whyJoin: string[];
  hiringSteps: string[];
  /** One sentence for the role sidebar. */
  processSummary: string;
  stack: string[];
  /** Extra paragraph after the about copy. Domain welcome, or a hard scope line. */
  bridge?: string;
  description: JobDescription;
  hiring: HiringStatus;
};

export const CAREERS_POSTED_LABEL = "September 19, 2026";
/** ISO date for schema only (not shown as a second date in the UI). */
export const CAREERS_POSTED = "2026-09-19";

const ENGAGEMENT = [
  "Freelance / contract, with potential for long-term collaboration",
  "Flexible hours",
  "Fully remote",
  "Immediate start",
];

const WHY_BUSINESS = [
  "Real ownership. You run your function. No committee between you and the work.",
  "Work at the frontier. AI, quantitative systems, and blockchain infrastructure applied to real capital — not a pitch deck.",
  "Fully remote, from day one. There is no head office you are missing out on.",
  "Compensation at the top of market. We would rather hire one excellent person than three average ones, and we pay accordingly.",
];

const WHY_ENGINEERING = [
  "Real ownership. You ship the system you design. No committee between you and the diff.",
  "The code sits in the path of real capital. Not a demo that gets thrown away after the pitch.",
  "Fully remote, from day one. There is no head office you are missing out on.",
  "We pay for one excellent person, not three average ones. The rate on this page is the rate.",
];

const PROCESS_SUMMARY_BUSINESS =
  "Short application on this page, then a conversation with leadership.";
const PROCESS_SUMMARY_ENGINEERING =
  "Short application, then a two-hour practical on our system, then a conversation.";

function businessSteps(interview: string): string[] {
  return [
    "Submitting a short application on this page, with a short note about relevant work",
    `Participating in a ${interview} interview with our leadership team`,
    "Final interview and contract for selected candidates",
  ];
}

function engineeringSteps(practical: string): string[] {
  return [
    "Submitting a short application on this page — a link to work you are proud of, and a note in your own words",
    practical,
    "A technical conversation with engineering",
    "Final conversation and contract for selected candidates",
  ];
}

export const CAREERS_INTRO = {
  kicker: "Build the systems underneath the market.",
  body: "Ocean Park Asset is a private financial technology company building AI-driven investment infrastructure and quantitative systems for modern financial markets. We develop automated execution engines, risk management tools, and blockchain-integrated financial infrastructure — the systems that sit underneath how capital actually moves.",
  closer:
    "We are a small, senior, fully remote team. There are no layers here. The person who owns a function owns it end to end, ships fast, and sees the result of their work in the numbers within weeks rather than quarters.",
};

export const CAREER_TRACK_COPY: Record<
  CareerTrack,
  { title: string; blurb: string; note: string }
> = {
  Business: {
    title: "Business",
    blurb:
      "Finance experience is required for Financial Analyst and Compliance Officer. The other seats do not require it.",
    note: "",
  },
  Engineering: {
    title: "Engineering",
    blurb:
      "The AI seat is a decision policy, not a language model. The trader seat is the live book.",
    note: "",
  },
};

export const CAREER_ROLES: CareerRole[] = [
  {
    id: "business-development-manager",
    track: "Business",
    team: "Business",
    title: "Business Development Manager",
    focus: "Own the pipeline from first conversation to signed agreement.",
    cardLine: "Pipeline, proposals, and the close",
    rateLabel: "$100–$180/hr",
    compensation: "$100 – $180 USD / hour",
    compensationNote: "Performance-based upside available on closed business",
    location: "Remote",
    engagement: [...ENGAGEMENT, "Open to fixed-price milestones for clearly defined mandates"],
    whyJoin: WHY_BUSINESS,
    hiringSteps: businessSteps("business / commercial"),
    processSummary: PROCESS_SUMMARY_BUSINESS,
    stack: [],
    bridge:
      "Coming from SaaS, tech, or another industry? That works. If you can sell something complex to a smart buyer, we will teach you our domain.",
    hiring: "now",
    description: {
      summary:
        "Open and grow client and partner relationships. Own the pipeline from first contact to signed agreement — consultative conversations, not high-volume cold dialing.",
      about:
        "We are looking for a Business Development Manager to open and grow our client and partner relationships. You will be the first voice many people hear from Ocean Park Asset, and you will own the pipeline from first contact to signed agreement. This role suits someone who enjoys real conversations with sophisticated people — not high-volume cold dialing. The people you talk to are informed, ask sharp questions, and reward clarity.",
      responsibilities: [
        "Build and own the pipeline of prospective clients and institutional partners",
        "Run discovery conversations and translate our capabilities into plain language",
        "Manage the full cycle: outreach, qualification, proposal, negotiation, close",
        "Represent Ocean Park Asset at industry events, online communities, and in partner conversations",
        "Feed market signal back to leadership — what people ask for, object to, and compare us against",
        "Keep pipeline reporting accurate enough to forecast from",
      ],
      requirements: [
        "Proven business development or sales experience with a consultative cycle",
        "Comfort selling something technical to an informed buyer",
        "Clear written and spoken communication — you can explain a complex product without jargon",
        "Self-directed pipeline building; you do not wait to be handed leads",
        "Comfortable operating remotely with high autonomy",
      ],
      niceToHave: [
        "Background in fintech, asset management, trading, or Web3",
        "Existing network among investors, family offices, or institutional partners",
        "Experience with CRM tooling and structured pipeline management",
        "Any relevant licensing or regulatory registration in your jurisdiction",
      ],
    },
  },
  {
    id: "client-relations-manager",
    track: "Business",
    team: "Business",
    title: "Client Relations Manager",
    focus: "Own the client experience after signing — the reason they stay.",
    cardLine: "Onboarding, reporting, and the hard days",
    rateLabel: "$90–$160/hr",
    compensation: "$90 – $160 USD / hour",
    compensationNote: "Open to fixed-price milestones for clearly defined scopes",
    location: "Remote",
    engagement: ENGAGEMENT,
    whyJoin: WHY_BUSINESS,
    hiringSteps: businessSteps("client experience"),
    processSummary: PROCESS_SUMMARY_BUSINESS,
    stack: [],
    bridge:
      "Finance background welcome, but not required. If you have looked after demanding clients well somewhere else, we will teach you the domain.",
    hiring: "now",
    description: {
      summary:
        "Own the client experience after signing. Onboarding, reporting, and the conversation nobody else wants to have on a difficult market day.",
      about:
        "We are looking for a Client Relations Manager to own the client experience after signing. Business development gets someone in the door — you are the reason they stay. This is a role for someone genuinely good with people: calm under pressure, warm in writing, and trusted with the conversation nobody else wants to have on a difficult market day.",
      responsibilities: [
        "Own onboarding for new clients and make the first thirty days effortless",
        "Serve as the primary point of contact for ongoing client questions",
        "Prepare and deliver clear, timely client reporting",
        "Anticipate concerns and communicate proactively, especially in volatile periods",
        "Track retention, satisfaction, and account health; flag risk early",
        "Bring the client's perspective back into product and operations decisions",
      ],
      requirements: [
        "Experience in account management, client relations, or customer success",
        "Outstanding written communication — most of this job happens in writing",
        "Composure and empathy in high-stakes conversations",
        "Organized enough that no client question ever goes unanswered",
        "Comfortable working remotely across time zones",
      ],
      niceToHave: [
        "Experience with financial, investment, or high-net-worth clients",
        "Familiarity with reporting tools, CRM systems, or client portals",
        "A second language",
        "Background in a regulated industry",
      ],
    },
  },
  {
    id: "marketing-manager",
    track: "Business",
    team: "Business",
    title: "Marketing Manager",
    focus: "Own brand, growth, and how we sound in the market.",
    cardLine: "Brand, campaigns, and the channels",
    rateLabel: "$95–$170/hr",
    compensation: "$95 – $170 USD / hour",
    compensationNote: "Open to fixed-price milestones for clearly defined campaigns",
    location: "Remote",
    engagement: ENGAGEMENT,
    whyJoin: WHY_BUSINESS,
    hiringSteps: businessSteps("marketing / strategy"),
    processSummary: PROCESS_SUMMARY_BUSINESS,
    stack: [],
    bridge:
      "Coming from SaaS or tech rather than finance? That is fine. Strong marketing instincts travel; we will teach you the domain.",
    hiring: "now",
    description: {
      summary:
        "Own brand, growth, and go-to-market across our investment technology and blockchain work. A builder, not a coordinator.",
      about:
        "We are looking for a Marketing Manager to own brand, growth, and go-to-market execution across our investment technology and blockchain initiatives. You will plan campaigns, manage channels, and position what we build clearly for clients, partners, and the wider market. We want a builder, not a coordinator. You will have unusual freedom over how we sound and where we show up.",
      responsibilities: [
        "Plan and execute marketing strategy across content, social, email, community, and paid channels",
        "Lead go-to-market campaigns for product launches and new capabilities",
        "Own brand messaging, positioning, and creative direction",
        "Track funnel metrics, campaign performance, and growth KPIs",
        "Coordinate with business, product, and design on launches and announcements",
        "Build and nurture community across relevant fintech and Web3 audiences",
      ],
      requirements: [
        "Proven marketing experience in fintech, crypto, Web3, or SaaS",
        "Strong grasp of digital channels, campaign execution, and brand storytelling",
        "Ability to write clear marketing copy and brief creative assets",
        "Analytical mindset with real experience measuring ROI and conversion",
        "Comfortable operating in a remote, fast-moving environment",
      ],
      niceToHave: [
        "Existing audience or network in fintech or Web3 communities",
        "SEO, content marketing, or influencer and partnership experience",
        "Design sensibility, or hands-on ability in Figma",
        "Familiarity with product-led growth and launch playbooks",
      ],
    },
  },
  {
    id: "ui-ux-designer",
    track: "Business",
    team: "Business",
    title: "UI/UX Designer",
    focus: "Product, brand, and the screens people look at. One designer seat.",
    cardLine: "Product, brand, and the interface",
    rateLabel: "$95–$170/hr",
    compensation: "$95 – $170 USD / hour",
    compensationNote: "Open to fixed-price milestones for clearly defined design scopes",
    location: "Remote",
    engagement: ENGAGEMENT,
    whyJoin: WHY_BUSINESS,
    hiringSteps: businessSteps("design / product"),
    processSummary: "Short application with a portfolio, then a conversation with leadership.",
    stack: ["Figma", "UI", "UX"],
    bridge:
      "Coming from brand, graphic, or marketing design? That works if you can also design a flow. Coming from product or UX? That works if you can also make something look like it belongs here. We want one person who can do both — not a coordinator, and not posters only.",
    hiring: "now",
    description: {
      summary:
        "Own how Ocean Park Asset looks and works on screen. Product UI, brand, and the states in between — one designer seat, not two.",
      about:
        "We are looking for a UI/UX Designer to own how Ocean Park Asset looks and works on screen. This is one seat for product and general design. You will shape the desk, the account, and how we show up — not hand files to someone else. Brand people who can design a product are welcome. Product people who can hold a visual system are welcome. If you only make posters, this is the wrong listing.",
      responsibilities: [
        "Design the surfaces operators and clients actually use — desk, risk states, onboarding, account",
        "Hold the visual system: type, color, spacing, and what we refuse to decorate",
        "Treat empty, loading, error, and blocked as first-class states, not a later pass",
        "Make brand and campaign work when we need it — site, decks, launches — without letting it eat the product",
        "Work with frontend so what you design is what ships",
        "Test flows with real tasks, not opinions about taste",
      ],
      requirements: [
        "A portfolio we can open — product, UI, brand, or a mix. Show the work, not a moodboard of other people's shots",
        "You have designed a real interface, not only social tiles",
        "You can explain a flow in writing before you decorate it",
        "Comfortable in Figma, or the tool you actually ship from",
        "Comfortable working remotely with high autonomy",
      ],
      niceToHave: [
        "A trading, fintech, or ops console in the book",
        "Brand systems you have maintained, not only a logo",
        "Motion used to explain state, not to decorate",
        "Some HTML/CSS — enough to talk to engineering without a translator",
      ],
    },
  },
  {
    id: "operations-manager",
    track: "Business",
    team: "Business",
    title: "Operations Manager",
    focus: "Make the company run — process, vendors, and the systems in between.",
    cardLine: "Process, vendors, and the unblocking",
    rateLabel: "$100–$175/hr",
    compensation: "$100 – $175 USD / hour",
    compensationNote: "Open to fixed-price milestones for clearly defined projects",
    location: "Remote",
    engagement: ENGAGEMENT,
    whyJoin: WHY_BUSINESS,
    hiringSteps: businessSteps("operations / process"),
    processSummary: PROCESS_SUMMARY_BUSINESS,
    stack: [],
    bridge:
      "Operations experience from tech, SaaS, or another industry counts. We care how you think about process, not which sector taught you.",
    hiring: "now",
    description: {
      summary:
        "Own the processes, vendors, and internal systems that keep execution smooth. The work that is invisible when it is done well.",
      about:
        "We are looking for an Operations Manager to make the company run. You will own the processes, vendors, and internal systems that keep execution smooth as we scale — the work that is invisible when it is done well and impossible to ignore when it is not. This role suits someone who sees a messy process and cannot resist fixing it.",
      responsibilities: [
        "Own day-to-day operational workflows and internal process design",
        "Manage relationships with external providers, vendors, and service partners",
        "Coordinate cross-functional projects and keep delivery on schedule",
        "Build documentation and playbooks so knowledge is not stuck in people's heads",
        "Identify bottlenecks and automate or eliminate them",
        "Support reconciliation, reporting, and record-keeping alongside finance and compliance",
      ],
      requirements: [
        "Experience in operations, business operations, or project management",
        "Strong process thinking — you build systems, not one-off fixes",
        "Highly organized, with a bias toward writing things down",
        "Comfortable with spreadsheets, project tooling, and workflow automation",
        "Able to work independently in a remote, distributed team",
      ],
      niceToHave: [
        "Experience in financial services, trading operations, or a regulated industry",
        "Familiarity with automation tools, APIs, or no-code platforms",
        "Exposure to vendor management or procurement",
        "Project management certification, if you have one — not required",
      ],
    },
  },
  {
    id: "financial-analyst",
    track: "Business",
    team: "Business",
    title: "Financial Analyst",
    focus: "Turn markets and performance data into decisions people can act on.",
    cardLine: "Research, attribution, and the memo",
    rateLabel: "$130–$220/hr",
    compensation: "$130 – $220 USD / hour",
    compensationNote: "Open to fixed-price milestones for defined research mandates",
    location: "Remote",
    engagement: ENGAGEMENT,
    whyJoin: WHY_BUSINESS,
    hiringSteps: businessSteps("research / analytical"),
    processSummary: PROCESS_SUMMARY_BUSINESS,
    stack: [],
    hiring: "now",
    description: {
      summary:
        "Sit close to the quantitative systems and translate what they produce into research, reporting, and insight leadership and clients can act on.",
      about:
        "We are looking for a Financial Analyst to turn markets and performance data into decisions. You will sit close to our quantitative systems and translate what they produce into research, reporting, and insight that leadership and clients can act on. If you like the analytical half of finance more than the political half, this is a good seat.",
      responsibilities: [
        "Conduct market, sector, and strategy research",
        "Analyze performance, attribution, and risk metrics across our systems",
        "Build and maintain dashboards and recurring reporting",
        "Write clear investment memos and research notes for internal and client use",
        "Support quantitative model evaluation with data analysis and backtesting",
        "Partner with the engineering team to improve what our data can tell us",
      ],
      requirements: [
        "Experience in financial analysis, investment research, or data analysis",
        "Strong Excel skills, plus SQL or Python for working with real datasets",
        "Ability to write — an analysis nobody can read is not a good analysis",
        "Genuine curiosity about markets and quantitative methods",
        "Comfortable working remotely with high independence",
      ],
      niceToHave: [
        "Experience with quantitative strategies, algorithmic trading, or risk modeling",
        "Exposure to digital assets or blockchain data",
        "CFA, FRM, or a similar credential, in progress or complete",
        "Experience building dashboards in BI tooling",
      ],
    },
  },
  {
    id: "compliance-officer",
    track: "Business",
    team: "Business",
    title: "Compliance Officer",
    focus: "Build the compliance function. Design the framework — do not inherit a binder.",
    cardLine: "The framework, built from scratch",
    rateLabel: "$145–$250/hr",
    compensation: "$145 – $250 USD / hour",
    compensationNote: "Open to retainer or fractional arrangements for senior candidates",
    location: "Remote",
    engagement: [
      ...ENGAGEMENT,
      "Fractional or retainer arrangements welcome for senior candidates",
    ],
    whyJoin: WHY_BUSINESS,
    hiringSteps: businessSteps("compliance / regulatory"),
    processSummary: PROCESS_SUMMARY_BUSINESS,
    stack: [],
    hiring: "now",
    description: {
      summary:
        "Build the compliance function from the ground up. Design the framework, own KYC/AML, and advise leadership before a product ships — not after.",
      about:
        "We are looking for a Compliance Officer to build our compliance function from the ground up. This is not a box-ticking role. You will design the framework rather than inherit someone else's binder, and you will have direct access to leadership on decisions that matter. For the right person this is rare: full ownership of a function at a company that treats compliance as infrastructure, not as an obstacle.",
      responsibilities: [
        "Design and maintain our compliance framework, policies, and controls",
        "Own KYC, AML, and client onboarding due diligence",
        "Monitor regulatory developments across the jurisdictions we operate in",
        "Manage record-keeping, reporting, and any regulator-facing correspondence",
        "Advise leadership on the regulatory implications of new products and markets",
        "Partner with operations to embed controls into workflows rather than bolt them on afterwards",
      ],
      requirements: [
        "Experience in compliance, risk, legal, or regulatory affairs within financial services",
        "Working knowledge of KYC/AML requirements and client suitability standards",
        "Sound judgment — you can tell a real risk from a theoretical one",
        "Clear communication with non-specialists",
        "Comfortable building something new rather than maintaining something existing",
      ],
      niceToHave: [
        "Experience with digital assets, fintech, or cross-border regulatory regimes",
        "Relevant licensing or certification (Series 65/66, FCA approval, MiFID II experience, CAMS, or the equivalent in your jurisdiction)",
        "Experience standing up a compliance function at an early-stage firm",
        "Familiarity with compliance and monitoring tooling",
      ],
    },
  },
  {
    id: "backend-developer",
    track: "Engineering",
    team: "Engineering",
    title: "Backend Developer",
    focus: "APIs and durable state for the risk path. Not the UI. Not the decision policy.",
    cardLine: "TypeScript · Node · APIs",
    rateLabel: "$150–$250/hr",
    compensation: "$150 – $250 USD / hour",
    compensationNote: "Depending on experience. Open to a longer collaboration after the first engagement",
    location: "Remote",
    engagement: ENGAGEMENT,
    whyJoin: WHY_ENGINEERING,
    hiringSteps: engineeringSteps(
      "A two-hour practical on a real risk-check API. You add rules, return a clear allowed or blocked decision, and show it through the existing UI. Demo session. No wallet or chain setup.",
    ),
    processSummary: PROCESS_SUMMARY_ENGINEERING,
    stack: ["TypeScript", "Node.js", "PostgreSQL", "REST"],
    bridge:
      "If you have integrated an exchange, a payments webhook, or any API that lies sometimes, you already know the texture of this work. Trading experience is useful. It is not a gate.",
    hiring: "now",
    description: {
      summary:
        "Own the APIs and pipelines the execution stack depends on. A request is allowed or blocked, with a reason, and the state still makes sense after a retry.",
      about:
        "We are looking for a Backend Developer to own the APIs and pipelines our execution stack depends on. Market data comes in. A risk decision goes out. The state in between has to survive a retry, a duplicate, and a bad minute. You will work in TypeScript. The interesting problems are idempotency, partial failure, and a response someone can debug without you on the call. This seat is the API and the data behind it. The trading UI is a different role. The decision policy is a different role. You will talk to both. You will not be asked to be both.",
      responsibilities: [
        "Design APIs for orders, positions, risk checks, and account state",
        "Make every risk decision explicit: allowed or blocked, with a reason, idempotent under retries",
        "Ingest and normalize market data the rest of the system can trust",
        "Handle the ordinary failures on purpose: duplicate requests, unknown symbols, cooldowns, bad amounts",
        "Keep paper and live on the same shapes, with different capital",
        "Write the short note that explains the tradeoff, not just the diff",
      ],
      requirements: [
        "You have shipped backend code where a wrong state is expensive",
        "TypeScript, or a close neighbor, in production. You can model state without a diagram tool",
        "You have integrated an external API and lived with timeouts, retries, and partial failure",
        "You can explain a design in a short note before it merges",
        "Comfortable working remotely, mostly async, with high autonomy",
      ],
      niceToHave: [
        "Exchange, broker, or on-chain event APIs",
        "PostgreSQL, and a habit of making writes idempotent",
        "A risk, payments, or trading system you still think about",
        "Tests you actually run before you say it is done",
      ],
    },
  },
  {
    id: "frontend-developer",
    track: "Engineering",
    team: "Engineering",
    title: "Frontend Developer",
    focus: "The screens people trust when the answer is allowed, blocked, or stale.",
    cardLine: "TypeScript · React · Next.js",
    rateLabel: "$140–$230/hr",
    compensation: "$140 – $230 USD / hour",
    compensationNote: "Depending on experience. Open to a longer collaboration after the first engagement",
    location: "Remote",
    engagement: ENGAGEMENT,
    whyJoin: WHY_ENGINEERING,
    hiringSteps: engineeringSteps(
      "A two-hour practical on a real risk-gate panel. Loading, empty, error, and a decision someone can read in one glance. Demo session. No wallet or chain setup.",
    ),
    processSummary: PROCESS_SUMMARY_ENGINEERING,
    stack: ["TypeScript", "React", "Next.js", "Tailwind"],
    bridge:
      "You do not need a wallet, a chain, or a design degree. You need a dense dark interface to feel obvious. If you have shipped a console, a trading view, or any UI where the wrong state costs someone time, you already know the job.",
    hiring: "now",
    description: {
      summary:
        "Build the surfaces operators look at when a check passes, fails, or goes stale. TypeScript, React, and Next.js. States are the work, not a later pass.",
      about:
        "We are looking for a Frontend Developer who cares what a screen feels like when the answer is no. Operators and clients look at live state: a check that passed, a check that did not, a number that is stale, a session that has not started. You will build those surfaces in TypeScript, React, and Next.js. Loading, empty, error, and disabled are the work, not a polish pass you add if there is time. Backend risk rules are a different seat. You should be able to read an API. You should not have to invent one to do this job well.",
      responsibilities: [
        "Ship live views for decisions, positions, and risk state",
        "Treat loading, empty, error, disabled, and stale data as first-class states",
        "Write validation and error copy that helps someone fix the mistake",
        "Hold the interface together when the data is moving and when it is not",
        "Keep the visual language quiet. Decoration that fights a number does not ship",
        "Work with backend on the contract: what the UI promises has to be what the API returns",
      ],
      requirements: [
        "TypeScript and React in production, on a surface more complex than a marketing page",
        "You have handled real-time or frequently changing data, and the failure modes that come with it",
        "You design the empty state before you design the happy path",
        "You can look at a dense screen and say what should be removed",
        "Comfortable working remotely, mostly async, with high autonomy",
      ],
      niceToHave: [
        "A trading, ops, or payments console you shipped",
        "Charts (canvas or a library) used for decisions, not decoration",
        "Reconnect and stale-data handling you have debugged in production",
        "Next.js, or another framework you can defend without reciting the docs",
      ],
    },
  },
  {
    id: "full-stack-developer",
    track: "Engineering",
    team: "Engineering",
    title: "Full-Stack Developer",
    focus: "The rule in the API and the screen that shows it. One feature, both ends.",
    cardLine: "API and UI, one contract",
    rateLabel: "$175–$280/hr",
    compensation: "$175 – $280 USD / hour",
    compensationNote: "Depending on experience. Open to a longer collaboration after the first engagement",
    location: "Remote",
    engagement: ENGAGEMENT,
    whyJoin: WHY_ENGINEERING,
    hiringSteps: engineeringSteps(
      "A two-hour practical across both sides: risk rules in the API, and a UI that shows one allowed path and one blocked path without hedging. Demo session. No wallet or chain setup.",
    ),
    processSummary: PROCESS_SUMMARY_ENGINEERING,
    stack: ["TypeScript", "Node.js", "React", "Next.js"],
    bridge:
      "This is not a seat where each half is shallow. It is for someone who has shipped a vertical slice and can still explain the tradeoff a week later.",
    hiring: "now",
    description: {
      summary:
        "Hold both ends of a small system. A rule in the API and the screen that shows the decision are one feature. TypeScript on both sides.",
      about:
        "We are looking for a Full-Stack Developer who can hold both ends of a small system without dropping the contract between them. A rule in the API and the screen that shows it are one feature. If the backend returns blocked and the UI looks unsure, that is your bug. You will work in TypeScript on both sides — Node for the risk path, React and Next.js for the surface. You are not covering for two missing people. You are the person who can change the rule and the panel that displays it in the same afternoon, and keep them honest.",
      responsibilities: [
        "Ship thin vertical slices: a risk rule, the API response, and the UI that states it",
        "Keep allowed and blocked unambiguous on both sides of the contract",
        "Handle retries, bad input, and empty sessions without a special case buried in the component",
        "Choose what not to build when two hours would be wasted on a third layer",
        "Write the tradeoff down. The diff is not the explanation",
        "Leave the next person a path through the code that does not require you",
      ],
      requirements: [
        "You have shipped production work on both an API and the UI that calls it",
        "TypeScript across the stack, or the ability to be fluent in it quickly",
        "You notice when the frontend and the backend disagree, and you fix the contract, not the symptom",
        "You can demo one success and one failure without narrating over a broken state",
        "Comfortable working remotely, mostly async, with high autonomy",
      ],
      niceToHave: [
        "A risk, payments, or trading flow you owned end to end",
        "PostgreSQL or another database you have had to reconcile",
        "A habit of one small test on the rule that actually bites",
        "Comfort reading a market or product constraint without waiting for a ticket",
      ],
    },
  },
  {
    id: "ai-developer",
    track: "Engineering",
    team: "Engineering",
    title: "AI Developer",
    focus: "The decision policy. ENTER, HOLD, or EXIT. Not a language model.",
    cardLine: "Control loop · not an LLM seat",
    rateLabel: "$190–$320/hr",
    compensation: "$190 – $320 USD / hour",
    compensationNote: "Depending on experience. Open to a longer collaboration if the first one is good",
    location: "Remote",
    engagement: ENGAGEMENT,
    whyJoin: WHY_ENGINEERING,
    hiringSteps: engineeringSteps(
      "A two-hour practical inside an existing price loop. You ignore noise, act on a real move, and keep a written risk limit intact — including when price gaps. We do not score profit. We read whether the policy is honest.",
    ),
    processSummary: PROCESS_SUMMARY_ENGINEERING,
    stack: ["JavaScript", "Node.js", "Risk limits"],
    bridge:
      "JavaScript is what the loop runs today. TypeScript or Python you can hand to someone else is welcome. The dialect is not the interview. If you wanted to fine-tune a model or wrap a chat API, this is the wrong seat, and we would rather say that here.",
    hiring: "now",
    description: {
      summary:
        "Write the decision policy the system actually runs. On each tick: enter, hold, or exit. Risk is a number. This is not an LLM role.",
      about:
        "We are looking for an AI Developer to write the decision policy our systems actually run. A price loop is already in motion. On each tick your code returns enter, hold, or exit. One position. No leverage. Risk is measured, not suggested — a limit that is not in the decision is not a limit. Size matters more than a clever exit, because a gap can hit before your next chance to get out. If that is the kind of AI work you want, you will like it here. There is no model to fine-tune, no prompt to chain, and no chatbot to wrap.",
      responsibilities: [
        "Write decision policies that ignore noise and act when the move is real",
        "Size a position so a gap cannot break the loss limit",
        "Exit when the reason to be in is gone, or when risk is threatened",
        "Keep the live loop and any research behavior from drifting apart",
        "Explain, in plain language, why the risk wall still holds",
        "Leave the engine and the risk constants alone. Fix the policy, not the ruler",
      ],
      requirements: [
        "You have built control logic, trading rules, or another system where a bad decision has a number attached",
        "JavaScript, TypeScript, or Python that someone else can rerun",
        "You treat drawdown, position size, and costs as part of the design",
        "You will not 'fix' a failing policy by editing the limits",
        "Comfortable working remotely, mostly async, with high autonomy",
      ],
      niceToHave: [
        "A live or paper strategy you have had to turn off",
        "You have sized a position for a gap, not only for the average day",
        "Python research someone else can rerun, if that is how you think",
        "Enough market intuition to know noise from a move, and enough humility to encode it",
      ],
    },
  },
  {
    id: "quantitative-algo-trader",
    track: "Engineering",
    team: "Engineering",
    title: "Quantitative / Algo Trader",
    focus: "The live book. When it is on, when it is off, and the fill in between.",
    cardLine: "Live book · not the policy seat",
    rateLabel: "$175–$290/hr",
    compensation: "$175 – $290 USD / hour",
    compensationNote: "Depending on experience. Open to a longer collaboration if the first one is good",
    location: "Remote",
    engagement: ENGAGEMENT,
    whyJoin: WHY_ENGINEERING,
    hiringSteps: engineeringSteps(
      "A two-hour practical on a live or replayed session. You say when you would be in, when you would be out, and where size has to come off — including a gap. We do not score profit. We read whether the judgment is honest.",
    ),
    processSummary: PROCESS_SUMMARY_ENGINEERING,
    stack: ["Markets", "Execution", "Risk"],
    bridge:
      "If you have traded a systematic book — crypto, futures, or cash equity — and had to turn it off, you already know the job. A backtest is not enough. Writing the decision policy is a different role. That is the AI Developer seat.",
    hiring: "now",
    description: {
      summary:
        "Own the live book. A policy can return enter, hold, or exit. You decide whether that book should be running, in what size, and when it comes off.",
      about:
        "We are looking for a Quantitative / Algo Trader to own the live book. A policy can return enter, hold, or exit. You decide whether that book should be running, in what size, and when it comes off. This is not the AI Developer seat. That person writes the decision rule. You live with the tape, the fill, and the day the rule is wrong. We do not hire you to stare at a dashboard and hope.",
      responsibilities: [
        "Own when a strategy is on, reduced, or flat",
        "Size and execute so a fill and a gap are part of the design, not a surprise",
        "Watch live microstructure: liquidity, spread, session, and when the signal is noise",
        "Feed what the tape did back to the people who write the policy",
        "Keep a written record of why the book was on",
        "Protect the risk wall. You do not 'fix' a bad day by moving the limit",
      ],
      requirements: [
        "You have traded a real or serious paper book where a bad decision had a number",
        "You can explain a session in writing: what you did, what you skipped, and why",
        "You treat costs, slippage, and gaps as part of the trade",
        "You will not override a risk limit to stay in",
        "Comfortable working remotely, mostly async, with high autonomy",
      ],
      niceToHave: [
        "Crypto or 24-hour markets",
        "Python or another research stack someone else can rerun",
        "Experience turning a systematic strategy on and off, not only discretionary clicking",
        "Enough engineering to read the policy without owning it",
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

export function rolesInTrack(track: CareerTrack): CareerRole[] {
  return CAREER_ROLES.filter((r) => r.track === track);
}

export function roleSummary(role: CareerRole): string {
  return role.description.summary ?? role.focus;
}

export function roleAbout(role: CareerRole): string {
  return role.description.about ?? roleSummary(role);
}

export function hiringIntro(): string {
  const business = rolesInTrack("Business").length;
  const engineering = rolesInTrack("Engineering").length;
  return `${business} business roles and ${engineering} engineering seats are open. Remote contract work, with the rate on every listing.`;
}

export type ApplicationLinkProfile = "technical" | "general" | "design" | "trading";

/** Engineering needs a work link. Design needs a portfolio. Business roles only require LinkedIn. */
export function roleApplicationProfile(role: CareerRole): ApplicationLinkProfile {
  if (role.id === "ui-ux-designer") return "design";
  if (role.id === "quantitative-algo-trader") return "trading";
  if (role.track === "Engineering") return "technical";
  return "general";
}

export function isUsefulApplicationLink(value: string): boolean {
  const v = value.trim();
  if (v.length < 8) return false;
  return /https?:\/\//i.test(v) || v.includes(".");
}

export function applicationLinkCopy(role: CareerRole): {
  profile: ApplicationLinkProfile;
  secondLinkLabel: string;
  secondLinkPlaceholder: string;
  secondLinkRequired: boolean;
} {
  const profile = roleApplicationProfile(role);

  if (profile === "technical") {
    return {
      profile,
      secondLinkLabel: "GitHub or portfolio",
      secondLinkPlaceholder: "github.com/... or a project you can show",
      secondLinkRequired: true,
    };
  }

  if (profile === "design") {
    return {
      profile,
      secondLinkLabel: "Portfolio",
      secondLinkPlaceholder: "Dribbble, Behance, Figma, or your site",
      secondLinkRequired: true,
    };
  }

  if (profile === "trading") {
    return {
      profile,
      secondLinkLabel: "Work sample",
      secondLinkPlaceholder: "Journal, research, or a system you can show",
      secondLinkRequired: false,
    };
  }

  return {
    profile,
    secondLinkLabel: "Portfolio or relevant link",
    secondLinkPlaceholder: "Work sample or URL",
    secondLinkRequired: false,
  };
}

export function validateApplicationLinks(
  role: CareerRole,
  linkedin: string,
  githubOrPortfolio: string,
): { ok: true } | { ok: false; error: string } {
  if (!isUsefulApplicationLink(linkedin)) {
    return { ok: false, error: "Please add your LinkedIn profile URL." };
  }

  const { secondLinkRequired, secondLinkLabel } = applicationLinkCopy(role);
  const secondLink = githubOrPortfolio.trim();

  if (secondLinkRequired && !isUsefulApplicationLink(secondLink)) {
    return { ok: false, error: `Please add a ${secondLinkLabel.toLowerCase()} link.` };
  }

  if (secondLink && !isUsefulApplicationLink(secondLink)) {
    return { ok: false, error: "Please add a valid portfolio or relevant link." };
  }

  return { ok: true };
}
