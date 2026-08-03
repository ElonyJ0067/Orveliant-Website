import { NextResponse } from "next/server";
import { binanceGet } from "@/lib/binance";
import { COINS } from "@/lib/coins";

export const dynamic = "force-dynamic";

type AggTrade = {
  p: string; // price
  q: string; // qty
  m: boolean; // buyer is maker → sell aggressor
  T: number; // trade time ms
};

/**
 * Live absorption flow from recent aggressive trades.
 * buyVol / sellVol / delta over the last ~few minutes of aggTrades.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? "bitcoin";
  const coin = COINS.find((c) => c.id === id) ?? COINS[0];

  if (!coin.binance) {
    return NextResponse.json({ error: "No spot pair" }, { status: 400 });
  }

  try {
    const res = await binanceGet(
      `/api/v3/aggTrades?symbol=${coin.binance}&limit=800`,
      { cache: "no-store" },
    );
    if (!res.ok) throw new Error(`Binance ${res.status}`);
    const trades: AggTrade[] = await res.json();

    const cutoff = Date.now() - 5 * 60 * 1000; // last 5 minutes
    let buyVol = 0;
    let sellVol = 0;
    let lastPrice = 0;

    for (const t of trades) {
      if (t.T < cutoff) continue;
      const qty = parseFloat(t.q);
      const px = parseFloat(t.p);
      if (!Number.isFinite(qty) || !Number.isFinite(px)) continue;
      lastPrice = px;
      // m=true → buyer is maker → taker sold
      if (t.m) sellVol += qty;
      else buyVol += qty;
    }

    const total = buyVol + sellVol;
    const delta = buyVol - sellVol;
    const imbalance = total > 0 ? delta / total : 0;

    return NextResponse.json({
      live: true,
      updatedAt: Date.now(),
      buyVol,
      sellVol,
      delta,
      imbalance,
      lastPrice,
      windowMs: 5 * 60 * 1000,
    });
  } catch (err) {
    console.error("[flow]", err);
    return NextResponse.json(
      { live: false, buyVol: 0, sellVol: 0, delta: 0, imbalance: 0 },
      { status: 200 },
    );
  }
}
