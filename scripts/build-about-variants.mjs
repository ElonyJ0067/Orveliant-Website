import path from "path";
import sharp from "sharp";

const root = process.cwd();
const markPath = path.join(root, "public/mark-v6.webp");
const outDir = path.join(root, "public/images");

const W = 1920;
const H = 840; // exact about-section ratio (16:7)

function mulberry32(seed) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function cleanMark(targetSize) {
  const { data, info } = await sharp(markPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r < 28 && g < 28 && b < 28) data[i + 3] = 0;
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

function particleLayer(seed, count, minR = 0.7, maxR = 2.6) {
  const rand = mulberry32(seed);
  const nodes = [];
  for (let i = 0; i < count; i += 1) {
    const x = Math.round(rand() * W);
    const y = Math.round(rand() * H);
    const r = (minR + rand() * (maxR - minR)).toFixed(2);
    const opacity = (0.08 + rand() * 0.26).toFixed(3);
    const tint = rand() > 0.6 ? "#f5db8a" : "#cda22f";
    nodes.push(
      `<circle cx="${x}" cy="${y}" r="${r}" fill="${tint}" opacity="${opacity}" />`,
    );
  }
  return nodes.join("\n");
}

function flowingBands(seed, count, yBase, ySwing, strokeBase, strokeSwing) {
  const rand = mulberry32(seed);
  const bands = [];

  for (let i = 0; i < count; i += 1) {
    const s = i / (count - 1 || 1);
    const x0 = -120 + s * 80;
    const x1 = W * (0.2 + rand() * 0.16);
    const x2 = W * (0.62 + rand() * 0.18);
    const x3 = W + 180 - s * 90;

    const y0 = yBase + (rand() - 0.5) * ySwing;
    const y1 = yBase - ySwing * (0.9 + rand() * 0.4);
    const y2 = yBase + ySwing * (0.65 + rand() * 0.45);
    const y3 = yBase + (rand() - 0.5) * ySwing * 0.7;

    const width = (strokeBase + rand() * strokeSwing).toFixed(2);
    const opacity = (0.035 + rand() * 0.095).toFixed(3);
    const color = rand() > 0.5 ? "#e9ca73" : "#b8861f";
    bands.push(
      `<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} C ${x1.toFixed(1)} ${y1.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}, ${x3.toFixed(1)} ${y3.toFixed(1)}" fill="none" stroke="${color}" stroke-width="${width}" stroke-opacity="${opacity}" stroke-linecap="round" />`,
    );
  }
  return bands.join("\n");
}

function variantSvg(kind) {
  if (kind === 1) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="57%" cy="48%" r="72%">
      <stop offset="0%" stop-color="#18140f"/>
      <stop offset="40%" stop-color="#0b0d10"/>
      <stop offset="100%" stop-color="#050607"/>
    </radialGradient>
    <radialGradient id="focus" cx="54%" cy="47%" r="38%">
      <stop offset="0%" stop-color="#cda22f" stop-opacity="0.22"/>
      <stop offset="48%" stop-color="#cda22f" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#cda22f" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" />
  <rect width="100%" height="100%" fill="url(#focus)" />
  ${flowingBands(21, 7, H * 0.74, H * 0.21, 11, 20)}
  ${flowingBands(22, 5, H * 0.83, H * 0.15, 5, 10)}
  ${particleLayer(23, 125)}
</svg>`;
  }

  if (kind === 2) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090a0c"/>
      <stop offset="55%" stop-color="#090b0f"/>
      <stop offset="100%" stop-color="#050607"/>
    </linearGradient>
    <radialGradient id="leftGlow" cx="22%" cy="44%" r="48%">
      <stop offset="0%" stop-color="#a77c17" stop-opacity="0.13"/>
      <stop offset="100%" stop-color="#a77c17" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="rightGlow" cx="80%" cy="50%" r="40%">
      <stop offset="0%" stop-color="#f0d27a" stop-opacity="0.15"/>
      <stop offset="52%" stop-color="#f0d27a" stop-opacity="0.025"/>
      <stop offset="100%" stop-color="#f0d27a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" />
  <rect width="100%" height="100%" fill="url(#leftGlow)" />
  <rect width="100%" height="100%" fill="url(#rightGlow)" />
  ${flowingBands(31, 8, H * 0.62, H * 0.24, 8, 12)}
  ${flowingBands(32, 6, H * 0.82, H * 0.13, 3, 7)}
  ${particleLayer(33, 95)}
  <path d="M -60 ${H * 0.22} C ${W * 0.18} ${H * 0.08}, ${W * 0.38} ${H * 0.44}, ${W * 0.64} ${H * 0.26}" fill="none" stroke="#e4c36f" stroke-opacity="0.11" stroke-width="2.8"/>
  <path d="M ${W * 0.05} ${H * 0.17} C ${W * 0.22} ${H * 0.02}, ${W * 0.34} ${H * 0.34}, ${W * 0.56} ${H * 0.18}" fill="none" stroke="#b7881f" stroke-opacity="0.09" stroke-width="1.9"/>
</svg>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="49%" cy="50%" r="80%">
      <stop offset="0%" stop-color="#120f0a"/>
      <stop offset="35%" stop-color="#0b0c0f"/>
      <stop offset="100%" stop-color="#040506"/>
    </radialGradient>
    <radialGradient id="halo1" cx="36%" cy="50%" r="28%">
      <stop offset="0%" stop-color="#d4ab3a" stop-opacity="0.19"/>
      <stop offset="100%" stop-color="#d4ab3a" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="halo2" cx="70%" cy="44%" r="34%">
      <stop offset="0%" stop-color="#f1d88f" stop-opacity="0.11"/>
      <stop offset="100%" stop-color="#f1d88f" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" />
  <rect width="100%" height="100%" fill="url(#halo1)" />
  <rect width="100%" height="100%" fill="url(#halo2)" />
  ${flowingBands(41, 10, H * 0.7, H * 0.2, 4, 9)}
  ${flowingBands(42, 5, H * 0.85, H * 0.11, 14, 12)}
  ${particleLayer(43, 140)}
  <ellipse cx="${W * 0.38}" cy="${H * 0.5}" rx="${W * 0.19}" ry="${H * 0.27}" fill="none" stroke="#d2a93b" stroke-opacity="0.08" stroke-width="2"/>
  <ellipse cx="${W * 0.38}" cy="${H * 0.5}" rx="${W * 0.26}" ry="${H * 0.36}" fill="none" stroke="#f4de9c" stroke-opacity="0.05" stroke-width="1.8"/>
</svg>`;
}

async function renderVariant(kind, mark, markX, markY, scale = 0.66) {
  const fileName = `about-brand-option-${kind}.webp`;
  const outPath = path.join(outDir, fileName);
  const svg = variantSvg(kind);
  const bg = await sharp(Buffer.from(svg)).png().toBuffer();
  const size = Math.round(H * scale);

  const resizedMark = await sharp(mark)
    .resize({
      width: size,
      height: size,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const m = await sharp(resizedMark).metadata();
  const w = m.width || size;
  const h = m.height || size;
  const left = Math.round(W * markX - w / 2);
  const top = Math.round(H * markY - h / 2);

  await sharp(bg)
    .composite([{ input: resizedMark, left, top }])
    .webp({ quality: 93 })
    .toFile(outPath);

  console.log(`wrote ${fileName}`);
}

async function main() {
  const mark = await cleanMark(Math.round(H * 0.72));
  await renderVariant(1, mark, 0.5, 0.5, 0.7);
  await renderVariant(2, mark, 0.7, 0.53, 0.66);
  await renderVariant(3, mark, 0.38, 0.5, 0.68);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
