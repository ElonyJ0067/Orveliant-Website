import { NextResponse } from "next/server";
import { binanceGet } from "@/lib/binance";
import { COINS } from "@/lib/coins";
import { analyzeBars } from "@/lib/intelligence/analyze";
import type { Bar, IntelligencePack } from "@/lib/intelligence/types";

export const dynamic = "force-dynamic";

function parseKlines(rows: unknown[][]): Bar[] {
  return rows
    .map((r) => ({
      t: Math.floor(Number(r[0]) / 1000),
      o: Number(r[1]),
      h: Number(r[2]),
      l: Number(r[3]),
      c: Number(r[4]),
      v: Number(r[5]),
    }))
    .filter(
      (b) =>
        Number.isFinite(b.t) &&
        Number.isFinite(b.o) &&
        Number.isFinite(b.h) &&
        Number.isFinite(b.l) &&
        Number.isFinite(b.c) &&
        Number.isFinite(b.v),
    );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? "bitcoin";
  const coin = COINS.find((c) => c.id === id) ?? COINS[0];

  if (!coin.binance) {
    return NextResponse.json(
      { error: "Intelligence Desk requires a spot-tradable pair." },
      { status: 400 },
    );
  }

  try {
    // ~41 days of 1h bars — enough for prior UTC week + developing session.
    const res = await binanceGet(
      `/api/v3/klines?symbol=${coin.binance}&interval=1h&limit=1000`,
      { cache: "no-store" },
    );
    if (!res.ok) throw new Error(`Binance ${res.status}`);
    const rows: unknown[][] = await res.json();
    const bars = parseKlines(rows);
    if (bars.length < 48) throw new Error("Not enough bars");

    // Structure tools stay on 1h UTC sessions; chart history loads via /api/desk-klines.
    // Omit raw bars from the response — clients never render them and the payload is large.
    const analyzed = analyzeBars(bars);
    const asOf = Date.now();
    const pack: IntelligencePack = {
      id: coin.id,
      symbol: coin.symbol,
      updatedAt: asOf,
      live: true,
      bars: [],
      ...analyzed,
      provenance: {
        venue: "binance-spot",
        pair: coin.binance,
        structureInterval: "1h",
        chartSource: "binance-klines",
        flowSource: "binance-aggTrades",
        sessionTimezone: "UTC",
        asOf,
      },
    };
    return NextResponse.json(pack);
  } catch (err) {
    console.error("[intelligence]", err);
    return NextResponse.json(
      { error: "Unable to build Intelligence Desk for this asset right now." },
      { status: 502 },
    );
  }
}
