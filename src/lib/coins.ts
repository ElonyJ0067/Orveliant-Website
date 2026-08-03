export type Coin = {
  id: string; // CoinGecko id
  symbol: string;
  name: string;
  color: string;
  stakeApr?: number; // indicative staking APR (%) — displayed as "indicative"
  binance?: string; // Binance spot symbol for the live WebSocket feed
};

// Curated, high-liquidity chains supported at launch.
export const COINS: Coin[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", color: "#F7931A", binance: "BTCUSDT" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", color: "#627EEA", stakeApr: 3.4, binance: "ETHUSDT" },
  { id: "solana", symbol: "SOL", name: "Solana", color: "#14F195", stakeApr: 6.9, binance: "SOLUSDT" },
  { id: "binancecoin", symbol: "BNB", name: "BNB", color: "#F3BA2F", binance: "BNBUSDT" },
  { id: "ripple", symbol: "XRP", name: "XRP", color: "#25A768", binance: "XRPUSDT" },
  { id: "tron", symbol: "TRX", name: "TRON", color: "#EF0027", stakeApr: 4.6, binance: "TRXUSDT" },
  { id: "the-open-network", symbol: "TON", name: "Toncoin", color: "#0098EA", stakeApr: 3.8, binance: "TONUSDT" },
  { id: "cardano", symbol: "ADA", name: "Cardano", color: "#0D1E30", stakeApr: 2.5, binance: "ADAUSDT" },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche", color: "#E84142", stakeApr: 5.2, binance: "AVAXUSDT" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", color: "#E6007A", stakeApr: 11.5, binance: "DOTUSDT" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink", color: "#2A5ADA", binance: "LINKUSDT" },
  { id: "sui", symbol: "SUI", name: "Sui", color: "#4DA2FF", stakeApr: 2.8, binance: "SUIUSDT" },
  // Stables use CoinGecko USD via /api/ticker — no reliable Binance USD pair.
  { id: "tether", symbol: "USDT", name: "Tether", color: "#26A17B", stakeApr: 8.5 },
  { id: "usd-coin", symbol: "USDC", name: "USD Coin", color: "#2775CA", stakeApr: 7.8 },
];

export type MarketRow = {
  id: string;
  symbol: string;
  name: string;
  color: string;
  price: number;
  change1h: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume: number;
  sparkline: number[];
  stakeApr?: number;
};

// Deterministic fallback data (used if the live API is unavailable),
// so the UI always renders professionally.
export const FALLBACK_MARKET: MarketRow[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", color: "#F7931A", price: 64200.04, change1h: 0.09, change24h: -1.05, change7d: 1.61, marketCap: 1_280_000_000_000, volume: 26_890_000_000, sparkline: gen(64200, 0.03) },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", color: "#627EEA", price: 1873.22, change1h: 0.04, change24h: -2.7, change7d: 7.12, marketCap: 226_060_000_000, volume: 11_190_000_000, sparkline: gen(1873, 0.05), stakeApr: 3.4 },
  { id: "solana", symbol: "SOL", name: "Solana", color: "#14F195", price: 75.64, change1h: 0.04, change24h: -2.4, change7d: -3.05, marketCap: 44_060_000_000, volume: 1_810_000_000, sparkline: gen(75, 0.06), stakeApr: 6.9 },
  { id: "binancecoin", symbol: "BNB", name: "BNB", color: "#F3BA2F", price: 575.37, change1h: -0.01, change24h: -0.74, change7d: 0.77, marketCap: 76_610_000_000, volume: 1_030_000_000, sparkline: gen(575, 0.02) },
  { id: "ripple", symbol: "XRP", name: "XRP", color: "#25A768", price: 1.09, change1h: 0.0, change24h: -1.72, change7d: 0.08, marketCap: 68_310_000_000, volume: 1_080_000_000, sparkline: gen(1.09, 0.04) },
  { id: "tron", symbol: "TRX", name: "TRON", color: "#EF0027", price: 0.323, change1h: 0.03, change24h: 0.52, change7d: -2.61, marketCap: 30_640_000_000, volume: 418_820_000, sparkline: gen(0.323, 0.03), stakeApr: 4.6 },
  { id: "the-open-network", symbol: "TON", name: "Toncoin", color: "#0098EA", price: 5.21, change1h: 0.12, change24h: 1.4, change7d: 3.2, marketCap: 13_100_000_000, volume: 210_000_000, sparkline: gen(5.21, 0.05), stakeApr: 3.8 },
  { id: "cardano", symbol: "ADA", name: "Cardano", color: "#3468D1", price: 0.163, change1h: -0.05, change24h: -1.1, change7d: 2.4, marketCap: 5_800_000_000, volume: 220_000_000, sparkline: gen(0.163, 0.04), stakeApr: 2.5 },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche", color: "#E84142", price: 6.61, change1h: 0.2, change24h: -0.9, change7d: 4.1, marketCap: 2_700_000_000, volume: 190_000_000, sparkline: gen(6.61, 0.05), stakeApr: 5.2 },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", color: "#E6007A", price: 0.863, change1h: 0.03, change24h: -1.3, change7d: 5.8, marketCap: 1_300_000_000, volume: 90_000_000, sparkline: gen(0.863, 0.05), stakeApr: 11.5 },
  { id: "chainlink", symbol: "LINK", name: "Chainlink", color: "#2A5ADA", price: 14.82, change1h: 0.15, change24h: -1.8, change7d: 4.2, marketCap: 9_200_000_000, volume: 480_000_000, sparkline: gen(14.82, 0.05) },
  { id: "sui", symbol: "SUI", name: "Sui", color: "#4DA2FF", price: 2.85, change1h: 0.22, change24h: 1.1, change7d: 6.4, marketCap: 8_900_000_000, volume: 620_000_000, sparkline: gen(2.85, 0.06), stakeApr: 2.8 },
  { id: "tether", symbol: "USDT", name: "Tether", color: "#26A17B", price: 0.9992, change1h: -0.01, change24h: -0.02, change7d: 0.0, marketCap: 184_050_000_000, volume: 54_980_000_000, sparkline: gen(1, 0.001), stakeApr: 8.5 },
  { id: "usd-coin", symbol: "USDC", name: "USD Coin", color: "#2775CA", price: 0.9998, change1h: 0.0, change24h: -0.01, change7d: 0.02, marketCap: 73_210_000_000, volume: 9_120_000_000, sparkline: gen(1, 0.001), stakeApr: 7.8 },
];

function gen(base: number, vol: number): number[] {
  // Deterministic pseudo-random walk for a believable sparkline.
  const pts: number[] = [];
  let v = base * (1 - vol);
  let seed = Math.floor(base * 1000) % 97;
  for (let i = 0; i < 24; i++) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const r = (seed / 2147483648 - 0.5) * 2;
    v = v + base * vol * r * 0.5;
    v = Math.max(base * (1 - vol * 2), Math.min(base * (1 + vol * 2), v));
    pts.push(Number(v.toFixed(base < 2 ? 4 : 2)));
  }
  return pts;
}

export function fmtPrice(n: number): string {
  if (!Number.isFinite(n)) return "—";
  // CMC-style precision: more digits near peg / sub-$1 assets.
  if (n >= 1000) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (n >= 10) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (n >= 1) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  }
  if (n >= 0.1) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  }
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 5, maximumFractionDigits: 6 });
}

export function fmtCompact(n: number): string {
  if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(2) + "K";
  return "$" + n.toFixed(2);
}
