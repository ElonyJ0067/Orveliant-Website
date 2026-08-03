import { NextResponse } from "next/server";
import { binanceGet } from "@/lib/binance";
import { COINS, FALLBACK_MARKET, type Coin, type MarketRow } from "@/lib/coins";

export const revalidate = 60;

const STABLES = new Set(["tether", "usd-coin"]);
/** Don't let a slow CoinGecko round-trip block the markets table. */
const CG_BUDGET_MS = 900;

type BinanceTicker = {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
};

type CGCoin = {
  id: string;
  current_price: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_24h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d?: { price: number[] };
};

function downsample(values: number[], maxPoints: number): number[] {
  if (values.length <= maxPoints) return values;
  const step = Math.ceil(values.length / maxPoints);
  const out: number[] = [];
  for (let i = 0; i < values.length; i += step) out.push(values[i]);
  const last = values[values.length - 1];
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}

function changePct(series: number[]): number {
  if (series.length < 2 || !(series[0] > 0)) return 0;
  return ((series[series.length - 1] - series[0]) / series[0]) * 100;
}

async function loadBinanceTickers(): Promise<Map<string, BinanceTicker>> {
  const symbols = COINS.filter((c) => c.binance && !STABLES.has(c.id)).map((c) => c.binance!);
  if (!symbols.length) return new Map();
  try {
    const res = await binanceGet(
      "/api/v3/ticker/24hr?symbols=" + encodeURIComponent(JSON.stringify(symbols)),
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return new Map();
    const rows: BinanceTicker[] = await res.json();
    return new Map(rows.map((r) => [r.symbol, r]));
  } catch {
    return new Map();
  }
}

async function loadBinanceSparks(): Promise<Map<string, number[]>> {
  const map = new Map<string, number[]>();
  await Promise.all(
    COINS.map(async (c) => {
      if (!c.binance || STABLES.has(c.id)) return;
      try {
        const res = await binanceGet(
          `/api/v3/klines?symbol=${c.binance}&interval=1h&limit=168`,
          { next: { revalidate: 60 } },
        );
        if (!res.ok) return;
        const rows: unknown[][] = await res.json();
        const closes = rows.map((r) => Number(r[4])).filter((n) => Number.isFinite(n));
        if (closes.length >= 2) map.set(c.id, downsample(closes, 48));
      } catch {
        /* skip */
      }
    }),
  );
  return map;
}

async function loadCoinGecko(): Promise<Map<string, CGCoin>> {
  const ids = COINS.map((c) => c.id).join(",");
  const url =
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}` +
    `&order=market_cap_desc&sparkline=true&price_change_percentage=1h,24h,7d`;
  try {
    const res = await fetch(url, {
      headers: { accept: "application/json" },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(CG_BUDGET_MS),
    });
    if (!res.ok) return new Map();
    const data: CGCoin[] = await res.json();
    return new Map(data.map((d) => [d.id, d]));
  } catch {
    return new Map();
  }
}

function rowFromParts(
  c: Coin,
  bn: BinanceTicker | undefined,
  cg: CGCoin | undefined,
  spark: number[] | undefined,
  fb: MarketRow,
): MarketRow {
  const sparkline = spark?.length
    ? spark
    : cg?.sparkline_in_7d?.price?.length
      ? downsample(cg.sparkline_in_7d.price, 48)
      : [];
  const fromSeries = sparkline.length >= 2 ? changePct(sparkline) : null;

  return {
    id: c.id,
    symbol: c.symbol,
    name: c.name,
    color: c.color,
    price: bn ? Number(bn.lastPrice) : (cg?.current_price ?? fb.price),
    change1h: cg?.price_change_percentage_1h_in_currency ?? fb.change1h,
    change24h: bn
      ? Number(bn.priceChangePercent)
      : (cg?.price_change_percentage_24h_in_currency ?? fb.change24h),
    change7d: fromSeries ?? cg?.price_change_percentage_7d_in_currency ?? fb.change7d,
    marketCap: cg?.market_cap ?? fb.marketCap,
    volume: bn ? Number(bn.quoteVolume) : (cg?.total_volume ?? fb.volume),
    sparkline: sparkline.length ? sparkline : fb.sparkline,
    stakeApr: c.stakeApr,
  };
}

export async function GET() {
  // Binance path is the speed floor; CoinGecko may enrich within CG_BUDGET_MS.
  const [tickers, sparks, byId] = await Promise.all([
    loadBinanceTickers(),
    loadBinanceSparks(),
    loadCoinGecko(),
  ]);

  const live = tickers.size > 0 || byId.size > 0 || sparks.size > 0;

  const rows: MarketRow[] = COINS.map((c) => {
    const fb = FALLBACK_MARKET.find((f) => f.id === c.id)!;
    const bn = c.binance ? tickers.get(c.binance) : undefined;
    const cg = byId.get(c.id);
    return rowFromParts(c, bn, cg, sparks.get(c.id), fb);
  });

  return NextResponse.json(
    { rows, live, updatedAt: Date.now() },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    },
  );
}
