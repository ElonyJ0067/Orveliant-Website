import sharp from "sharp";
import { writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

async function fetchBuf(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url} → ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

async function circularBadge({ logoUrl, bg, logoScale = 0.72, out }) {
  const size = 128;
  const logoSize = Math.round(size * logoScale);
  const logo = await sharp(await fetchBuf(logoUrl))
    .resize(logoSize, logoSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const disc = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${bg}"/></svg>`,
  );

  await sharp(disc)
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(out);

  console.log("badge", out, statSync(out).size);
}

const dir = join("public", "coins");

await circularBadge({
  logoUrl: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
  bg: "#000000",
  logoScale: 0.78,
  out: join(dir, "sol.png"),
});

// ton_symbol is already a full blue circular badge — use it directly
{
  const buf = await fetchBuf("https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png");
  await sharp(buf).resize(128, 128, { fit: "cover" }).png().toFile(join(dir, "ton.png"));
  console.log("ton", statSync(join(dir, "ton.png")).size);
}

const cmc = [
  ["btc", 1],
  ["eth", 1027],
  ["bnb", 1839],
  ["xrp", 52],
  ["trx", 1958],
  ["ada", 2010],
  ["avax", 5805],
  ["dot", 6636],
  ["link", 1975],
  ["sui", 20947],
  ["usdt", 825],
  ["usdc", 3408],
];

for (const [sym, id] of cmc) {
  const buf = await fetchBuf(`https://s2.coinmarketcap.com/static/img/coins/128x128/${id}.png`);
  await sharp(buf).resize(128, 128, { fit: "cover" }).png().toFile(join(dir, `${sym}.png`));
  console.log("cmc", sym, statSync(join(dir, `${sym}.png`)).size);
}
