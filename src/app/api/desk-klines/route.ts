import { NextResponse } from "next/server";
import { binanceGet } from "@/lib/binance";
import { COINS } from "@/lib/coins";
import {
  HISTORY_PAGE,
  INITIAL_LIMIT,
  isDeskInterval,
  type DeskInterval,
} from "@/lib/deskChart";
import type { Bar } from "@/lib/intelligence/types";

/** Short CDN/edge cache for recent-history requests (no endTime pagination). */
export const revalidate = 60;

const BINANCE_INTERVAL: Record<DeskInterval, string> = {
  "15m": "15m",
  "1h": "1h",
  "4h": "4h",
  "1d": "1d",
};

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
  const intervalParam = searchParams.get("interval") ?? "1h";
  const endTimeParam = searchParams.get("endTime");
  const limitParam = searchParams.get("limit");

  if (!isDeskInterval(intervalParam)) {
    return NextResponse.json({ error: "Unsupported interval." }, { status: 400 });
  }

  const coin = COINS.find((c) => c.id === id) ?? COINS[0];
  if (!coin.binance) {
    return NextResponse.json(
      { error: "Desk chart requires a spot-tradable pair." },
      { status: 400 },
    );
  }

  const limitRaw = limitParam ? Number(limitParam) : INITIAL_LIMIT[intervalParam];
  const limit = Math.min(1000, Math.max(50, Number.isFinite(limitRaw) ? limitRaw : HISTORY_PAGE));
  const endTime = endTimeParam ? Number(endTimeParam) : NaN;

  try {
    let path =
      `/api/v3/klines?symbol=${coin.binance}` +
      `&interval=${BINANCE_INTERVAL[intervalParam]}&limit=${limit}`;
    if (Number.isFinite(endTime) && endTime > 0) {
      path += `&endTime=${Math.floor(endTime)}`;
    }

    // Paginated history must be fresh; initial window can reuse a short cache.
    const paginating = Number.isFinite(endTime) && endTime > 0;
    const res = await binanceGet(path, {
      ...(paginating
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60 } }),
    });
    if (!res.ok) throw new Error(`Binance ${res.status}`);

    const rows: unknown[][] = await res.json();
    const bars = parseKlines(rows);
    // Binance returns up to `limit`; fewer bars means no older history left.
    const hasMore = bars.length >= limit;

    return NextResponse.json(
      {
        id: coin.id,
        symbol: coin.symbol,
        interval: intervalParam,
        bars,
        hasMore,
        live: true,
      },
      {
        headers: paginating
          ? { "Cache-Control": "no-store" }
          : { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
      },
    );
  } catch (err) {
    console.error("[desk-klines]", err);
    return NextResponse.json(
      { error: "Unable to load desk chart history right now." },
      { status: 502 },
    );
  }
}
