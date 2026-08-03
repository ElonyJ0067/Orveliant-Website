import { NextResponse } from "next/server";
import { COINS } from "@/lib/coins";

// Near-real-time: Binance 24h ticker for spot pairs; CoinGecko USD for stables.
export const revalidate = 0;

const SYMBOL_TO_ID = new Map(
  COINS.filter((c) => c.binance).map((c) => [c.binance!.toUpperCase(), c.id]),
);

type BinanceTicker = {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
};

type Tick = { price: number; change24h: number; high24h: number; low24h: number };

type CGMarket = {
  id: string;
  current_price: number;
  price_change_percentage_24h?: number;
  high_24h?: number;
  low_24h?: number;
};

function fromCg(d: CGMarket): Tick | null {
  const price = d.current_price;
  if (!Number.isFinite(price)) return null;
  const change = d.price_change_percentage_24h ?? 0;
  return {
    price,
    change24h: change,
    high24h: d.high_24h ?? price * (1 + Math.abs(change) / 200),
    low24h: d.low_24h ?? price * (1 - Math.abs(change) / 200),
  };
}

export async function GET() {
  const symbols = COINS.filter((c) => c.binance).map((c) => c.binance!.toUpperCase());
  const ticks: Record<string, Tick> = {};

  try {
    const res = await fetch(
      "https://api.binance.com/api/v3/ticker/24hr?symbols=" +
        encodeURIComponent(JSON.stringify(symbols)),
      { headers: { accept: "application/json" }, cache: "no-store" },
    );
    if (res.ok) {
      const data: BinanceTicker[] = await res.json();
      for (const t of data) {
        const id = SYMBOL_TO_ID.get(t.symbol.toUpperCase());
        if (!id) continue;
        ticks[id] = {
          price: parseFloat(t.lastPrice),
          change24h: parseFloat(t.priceChangePercent),
          high24h: parseFloat(t.highPrice),
          low24h: parseFloat(t.lowPrice),
        };
      }
    }
  } catch {
    /* try CoinGecko below */
  }

  // Always overlay true USD for USDT / USDC when CoinGecko is available.
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=tether,usd-coin",
      { headers: { accept: "application/json" }, cache: "no-store" },
    );
    if (res.ok) {
      const data: CGMarket[] = await res.json();
      for (const d of data) {
        const tick = fromCg(d);
        if (tick) ticks[d.id] = tick;
      }
    }
  } catch {
    /* keep whatever we have */
  }

  if (Object.keys(ticks).length) {
    return NextResponse.json({ ticks, live: true });
  }

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COINS.map((c) => c.id).join(",")}`,
      { headers: { accept: "application/json" }, cache: "no-store" },
    );
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const data: CGMarket[] = await res.json();
    for (const d of data) {
      const tick = fromCg(d);
      if (tick) ticks[d.id] = tick;
    }
    return NextResponse.json({ ticks, live: Object.keys(ticks).length > 0 });
  } catch {
    return NextResponse.json({ ticks: {}, live: false });
  }
}
