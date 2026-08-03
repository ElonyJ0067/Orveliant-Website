import sharp from "sharp";
import path from "path";

const root = "F:/Working/Project/Website/Orveliant2";
const out = path.join(root, "public/images/about-brand.webp");
const markPath = path.join(root, "public/mark-v6.webp");

const W = 1920;
const H = 840; // ~16/7

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Keep gold mark; punch near-black canvas to transparent. */
async function cleanMark(targetSize) {
  const { data, info } = await sharp(markPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r < 28 && g < 28 && b < 28) {
      data[i + 3] = 0;
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .resize({
      width: targetSize,
      height: targetSize,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

async function main() {
  const rand = mulberry32(42);
  const dots = Array.from({ length: 110 }, () => {
    const x = Math.round(rand() * W);
    const y = Math.round(rand() * H);
    const r = rand() > 0.82 ? 2.1 : 1.15;
    const o = rand() > 0.7 ? 0.32 : 0.14;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#e8ce78" opacity="${o}"/>`;
  }).join("");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="62%" cy="48%" r="68%">
      <stop offset="0%" stop-color="#18140c"/>
      <stop offset="42%" stop-color="#0b0c0f"/>
      <stop offset="100%" stop-color="#050607"/>
    </radialGradient>
    <radialGradient id="glow" cx="58%" cy="46%" r="40%">
      <stop offset="0%" stop-color="#c9a227" stop-opacity="0.16"/>
      <stop offset="55%" stop-color="#c9a227" stop-opacity="0.035"/>
      <stop offset="100%" stop-color="#c9a227" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  ${dots}
  <path d="M -60 ${H * 0.74} C ${W * 0.18} ${H * 0.56}, ${W * 0.34} ${H * 0.92}, ${W * 0.58} ${H * 0.78}" fill="none" stroke="#c9a227" stroke-opacity="0.11" stroke-width="30"/>
  <path d="M ${W * 0.02} ${H * 0.88} C ${W * 0.24} ${H * 0.7}, ${W * 0.42} ${H * 0.96}, ${W * 0.72} ${H * 0.84}" fill="none" stroke="#e8ce78" stroke-opacity="0.07" stroke-width="18"/>
</svg>`;

  const bg = await sharp(Buffer.from(svg)).png().toBuffer();
  const markTarget = Math.round(H * 0.7);
  const mark = await cleanMark(markTarget);
  const resized = await sharp(mark).metadata();
  const left = Math.round((W - (resized.width || markTarget)) / 2);
  const top = Math.round((H - (resized.height || markTarget)) / 2 - H * 0.015);

  await sharp(bg)
    .composite([{ input: mark, left, top }])
    .webp({ quality: 92 })
    .toFile(out);

  const meta = await sharp(out).metadata();
  console.log("wrote", out, meta.width, meta.height);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
