import { NextResponse } from "next/server";
import { binanceGet } from "@/lib/binance";
import { COINS } from "@/lib/coins";

export const dynamic = "force-dynamic";

type Series = { time: number; value: number }[];

const STABLES = new Set(["tether", "usd-coin"]);

/** Map UI ranges → Binance kline interval + visible bar count for the chip. */
const BINANCE_RANGE: Record<string, { interval: string; limit: number }> = {
  "1h": { interval: "1m", limit: 60 },
  "1": { interval: "5m", limit: 288 },
  "7": { interval: "1h", limit: 168 },
  "30": { interval: "4h", limit: 180 },
  "90": { interval: "12h", limit: 180 },
  "365": { interval: "1d", limit: 365 },
  max: { interval: "1w", limit: 500 },
};

/** Extra bars left of the visible chip so pan-back works without a round-trip. */
const LEFT_BUFFER = 420;

/** CoinGecko `days` param (1h is sliced from a 1-day series). */
const CG_DAYS: Record<string, string> = {
  "1h": "1",
  "1": "1",
  "7": "7",
  "30": "30",
  "90": "90",
  "365": "365",
  max: "max",
};

/** Fresh windows only — never CDN-cache paginated history (query-key bugs return duplicates). */
const FRESH_CACHE =
  "public, s-maxage=30, stale-while-revalidate=120";
const NO_STORE = "private, no-store, max-age=0, must-revalidate";

function dedupe(series: Series): Series {
  const out: Series = [];
  let last = -1;
  for (const p of series) {
    const t = Math.floor(p.time);
    if (!Number.isFinite(t) || !Number.isFinite(p.value)) continue;
    if (t <= last) continue;
    out.push({ time: t, value: p.value });
    last = t;
  }
  return out;
}

function sliceLastHours(series: Series, hours: number): Series {
  if (!series.length) return series;
  const cutoff = series[series.length - 1].time - hours * 3600;
  return series.filter((p) => p.time >= cutoff);
}

function retryableEmpty() {
  return NextResponse.json(
    {
      series: [] as Series,
      live: false,
      source: "none",
      hasMore: true,
      retryable: true,
      visible: 0,
    },
    { status: 503, headers: { "Cache-Control": NO_STORE } },
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? "bitcoin";
  const days = searchParams.get("days") ?? "7";
  const endTimeParam = searchParams.get("endTime");
  const endTime = endTimeParam ? Number(endTimeParam) : NaN;
  const paginating = Number.isFinite(endTime) && endTime > 0;

  const coin = COINS.find((c) => c.id === id) ?? COINS[0];
  // Stables: always true USD (CoinGecko). USDCUSDT is not USDC/USD.
  const useBinance = Boolean(coin.binance) && !STABLES.has(coin.id);

  if (useBinance) {
    try {
      const cfg = BINANCE_RANGE[days] ?? BINANCE_RANGE["7"];
      // Initial: visible chip + left buffer. Paginated: large page, never CDN-cached.
      const limit = paginating
        ? Math.min(1000, Math.max(cfg.limit, 500))
        : Math.min(1000, cfg.limit + LEFT_BUFFER);
      let path =
        `/api/v3/klines?symbol=${coin.binance}` +
        `&interval=${cfg.interval}&limit=${limit}`;
      if (paginating) {
        path += `&endTime=${Math.floor(endTime)}`;
      }

      const res = await binanceGet(path, {
        cache: "no-store",
      });
      if (res.ok) {
        const rows: unknown[][] = await res.json();
        const series = dedupe(
          rows.map((r) => ({
            time: Math.floor(Number(r[0]) / 1000),
            value: Number(r[4]),
          })),
        );
        if (series.length) {
          const hasMore = series.length >= limit;
          return NextResponse.json(
            {
              series,
              live: true,
              source: "binance",
              hasMore,
              retryable: false,
              visible: cfg.limit,
              oldest: series[0].time,
              newest: series[series.length - 1].time,
            },
            {
              headers: {
                "Cache-Control": paginating ? NO_STORE : FRESH_CACHE,
                Vary: "Accept-Encoding",
              },
            },
          );
        }
        // Empty but OK → truly at the start of exchange history.
        if (paginating) {
          return NextResponse.json(
            {
              series: [] as Series,
              live: true,
              source: "binance",
              hasMore: false,
              retryable: false,
              visible: cfg.limit,
            },
            { headers: { "Cache-Control": NO_STORE } },
          );
        }
      } else if (paginating) {
        return retryableEmpty();
      }
    } catch {
      if (paginating) return retryableEmpty();
      /* fall through for initial window */
    }
  }

  // Pagination is Binance-only. Never claim "end of history" on a miss.
  if (paginating) {
    return retryableEmpty();
  }

  try {
    const cgDays = CG_DAYS[days] ?? days;
    const url =
      `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart` +
      `?vs_currency=usd&days=${cgDays}`;
    const res = await fetch(url, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      const prices: [number, number][] = data.prices ?? [];
      let series = dedupe(
        prices.map(([t, p]) => ({ time: Math.floor(t / 1000), value: p })),
      );
      if (days === "1h") series = sliceLastHours(series, 1);
      if (series.length) {
        const visible = (BINANCE_RANGE[days] ?? BINANCE_RANGE["7"]).limit;
        return NextResponse.json(
          {
            series,
            live: true,
            source: "coingecko",
            hasMore: false,
            retryable: false,
            visible,
            oldest: series[0].time,
            newest: series[series.length - 1].time,
          },
          { headers: { "Cache-Control": FRESH_CACHE } },
        );
      }
    }
  } catch {
    /* fall through */
  }

  const synthDays =
    days === "1h" ? 1 / 24 : days === "max" ? 365 * 4 : Number(days) || 7;
  const visible = (BINANCE_RANGE[days] ?? BINANCE_RANGE["7"]).limit;
  const series = synth(coin.id, synthDays);
  return NextResponse.json({
    series,
    live: false,
    source: "synthetic",
    hasMore: false,
    retryable: false,
    visible,
    oldest: series[0]?.time ?? 0,
    newest: series[series.length - 1]?.time ?? 0,
  });
}

function synth(id: string, days: number): Series {
  const now = Math.floor(Date.now() / 1000);
  const points = days <= 1 / 24 ? 60 : days <= 1 ? 96 : days <= 7 ? 168 : 180;
  const interval = (Math.max(days, 1 / 24) * 86400) / points;
  const bases: Record<string, number> = {
    bitcoin: 64100,
    ethereum: 1878,
    solana: 75.9,
    binancecoin: 576,
    ripple: 1.1,
    tron: 0.323,
    "the-open-network": 5.2,
    cardano: 0.163,
    "avalanche-2": 6.6,
    polkadot: 0.87,
    chainlink: 14.8,
    sui: 2.85,
    tether: 1,
    "usd-coin": 1,
  };
  const base = bases[id] ?? 100;
  const stable = STABLES.has(id);
  const stepVol = stable ? 0.0004 : 0.006;
  const band = stable ? 0.001 : 0.06;

  let seed = Math.floor(base * 1000) % 9973;
  let v = base;
  const raw: number[] = [];
  for (let i = 0; i <= points; i++) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const r = seed / 2147483648 - 0.5;
    v += base * stepVol * r * 2 - (v - base) * 0.05;
    v = Math.max(base * (1 - band), Math.min(base * (1 + band), v));
    raw.push(v);
  }
  raw[raw.length - 1] = base;

  return raw.map((value, i) => ({
    time: now - Math.floor((points - i) * interval),
    value: Number(value.toFixed(value < 2 ? 6 : 2)),
  }));
}
