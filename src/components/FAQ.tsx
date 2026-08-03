"use client";

import { useId, useState } from "react";

const FAQS = [
  {
    q: "How does Orveliant actually manage my capital?",
    a: "Once your account is activated, our AI continuously monitors market prices, momentum, volatility, volume and liquidity. It enters positions only when its signal and risk conditions align, sizes each position to your capital, and supervises every position with automated stop-loss, exposure limits and drawdown controls.",
  },
  {
    q: "What is the difference between Trading, Staking and Hybrid?",
    a: "AI Quant Trading actively trades to capture opportunities with strict risk control. Staking earns transparent, on-chain yield from real staking. Hybrid lets the AI automatically allocate your capital between the two, based on the risk profile you choose.",
  },
  {
    q: "Do you guarantee returns?",
    a: "No. We never promise guaranteed returns. Trading outcomes depend on markets, and staking yields are variable and sourced on-chain. Our commitment is disciplined execution and strict, automated risk control — not a fixed number.",
  },
  {
    q: "Which assets and networks are supported?",
    a: "We support a curated set of high-liquidity chains — including BTC, ETH, SOL, BNB, XRP, TRON, TON, ADA, AVAX, DOT, LINK, SUI — plus USDT and USDC. We prioritize liquidity and quality over breadth, and expand deliberately.",
  },
  {
    q: "How do deposits and funding work across strategies?",
    a: "You can fund your account with major cryptocurrencies or stablecoins (USDT / USDC). All three strategies — Trading, Staking, and Hybrid — operate on your deposited capital once the account is activated.",
  },
  {
    q: "How is my risk controlled?",
    a: "Every position operates within predefined limits: automated stop-losses, maximum position and portfolio exposure, daily loss limits, drawdown protection, bounded leverage, and changing-market detection that can pause trading automatically.",
  },
  {
    q: "Is the system proven?",
    a: "Yes. Before live deployment it was extensively backtested, forward-tested, stress-tested and execution-validated across market conditions. It is already operating in real markets and used by private clients.",
  },
  {
    q: "When can I open an account?",
    a: "The client platform is launching in phases. Join the early-access list and we'll invite you to activate your account as onboarding opens.",
  },
];

export function FAQ({ limit }: { limit?: number }) {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();
  const items = typeof limit === "number" ? FAQS.slice(0, limit) : FAQS;

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {items.map((f, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-button-${i}`;
        return (
          <div key={f.q} className="card overflow-hidden">
            <button
              type="button"
              id={buttonId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold/60"
            >
              <span className="font-display font-semibold text-ink">{f.q}</span>
              <span
                className={`shrink-0 text-gold-light transition-transform duration-300 ${
                  isOpen ? "rotate-45" : ""
                }`}
                aria-hidden
              >
                +
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!isOpen}
              className={`grid transition-all duration-300 ease-out motion-reduce:transition-none ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-sm leading-relaxed text-ink-dim">{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
