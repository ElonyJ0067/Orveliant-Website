"use client";

import { useState } from "react";
import { COINS } from "@/lib/coins";
import { CoinIcon } from "./CoinIcon";
import { MarketsTable } from "./MarketsTable";
import { PriceChart } from "./PriceChart";

export function MarketsView() {
  const [selected, setSelected] = useState(COINS[0]);

  return (
    <div className="space-y-10">
      <div>
        <div className="relative mb-4">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-canvas to-transparent sm:hidden" aria-hidden />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-canvas to-transparent sm:hidden" aria-hidden />
          <div className="flex gap-2 overflow-x-auto px-2 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-7 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
            {COINS.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className={`flex shrink-0 items-center justify-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors sm:px-2.5 sm:py-1.5 ${
                  selected.id === c.id
                    ? "border-gold/50 bg-gold/10 text-gold-light"
                    : "border-line text-ink-dim hover:border-line hover:text-ink"
                }`}
              >
                <CoinIcon symbol={c.symbol} size={16} />
                {c.symbol}
              </button>
            ))}
          </div>
        </div>
        <PriceChart id={selected.id} symbol={selected.symbol} color={selected.color} />
      </div>

      <MarketsTable />
    </div>
  );
}
