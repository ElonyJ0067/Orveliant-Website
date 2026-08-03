import path from "path";
import sharp from "sharp";

const root = process.cwd();
const srcBackground = path.join(root, "public/images/Screenshot_1.png");
const outFile = path.join(root, "public/images/about-brand-combined.webp");

const W = 1920;
const H = 840; // about page hero ratio 16:7

function createSymbolSvg() {
  const cx = Math.round(W * 0.58);
  const cy = Math.round(H * 0.5);
  const r = Math.round(H * 0.27);
  const ringWidth = Math.round(H * 0.104);

  const slashLength = Math.round(H * 0.58);
  const slashWidth = Math.round(H * 0.1);
  const slashX = cx - Math.round(slashLength / 2);
  const slashY = cy - Math.round(slashWidth / 2);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ringMetal" x1="20%" y1="16%" x2="78%" y2="86%">
      <stop offset="0%" stop-color="#fff1b2"/>
      <stop offset="17%" stop-color="#f9d86b"/>
      <stop offset="44%" stop-color="#d59f22"/>
      <stop offset="72%" stop-color="#a86f12"/>
      <stop offset="100%" stop-color="#7c4d06"/>
    </linearGradient>

    <linearGradient id="ringEdge" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffeb96"/>
      <stop offset="100%" stop-color="#7f5309"/>
    </linearGradient>

    <linearGradient id="slashMetal" x1="18%" y1="0%" x2="86%" y2="100%">
      <stop offset="0%" stop-color="#ffe9a1"/>
      <stop offset="30%" stop-color="#f6c647"/>
      <stop offset="60%" stop-color="#d99616"/>
      <stop offset="100%" stop-color="#8b5808"/>
    </linearGradient>

    <radialGradient id="glow" cx="50%" cy="52%" r="48%">
      <stop offset="0%" stop-color="#ffd45f" stop-opacity="0.22"/>
      <stop offset="58%" stop-color="#ffbf37" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#ffbf37" stop-opacity="0"/>
    </radialGradient>

    <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="14" stdDeviation="20" flood-color="#000000" flood-opacity="0.55"/>
    </filter>
  </defs>

  <!-- overall glow -->
  <circle cx="${cx}" cy="${cy}" r="${Math.round(r * 1.34)}" fill="url(#glow)"/>

  <!-- FULL ring (fixed bottom: no break) -->
  <circle
    cx="${cx}"
    cy="${cy}"
    r="${r}"
    fill="none"
    stroke="url(#ringMetal)"
    stroke-width="${ringWidth}"
    stroke-linecap="round"
    filter="url(#softShadow)"
  />

  <!-- subtle bevel accent -->
  <circle
    cx="${cx}"
    cy="${cy}"
    r="${r - Math.round(ringWidth * 0.34)}"
    fill="none"
    stroke="#fff2bf"
    stroke-opacity="0.24"
    stroke-width="${Math.max(1, Math.round(ringWidth * 0.03))}"
  />

  <!-- slash body -->
  <g transform="rotate(-43 ${cx} ${cy})" filter="url(#softShadow)">
    <rect
      x="${slashX}"
      y="${slashY}"
      width="${slashLength}"
      height="${slashWidth}"
      rx="${Math.round(slashWidth * 0.03)}"
      fill="url(#slashMetal)"
      stroke="url(#ringEdge)"
      stroke-width="2"
    />
    <rect
      x="${slashX + Math.round(slashLength * 0.06)}"
      y="${slashY + Math.round(slashWidth * 0.1)}"
      width="${Math.round(slashLength * 0.88)}"
      height="${Math.max(4, Math.round(slashWidth * 0.14))}"
      fill="#fff3bf"
      fill-opacity="0.22"
    />
    <rect
      x="${slashX + Math.round(slashLength * 0.05)}"
      y="${slashY + Math.round(slashWidth * 0.78)}"
      width="${Math.round(slashLength * 0.9)}"
      height="${Math.max(4, Math.round(slashWidth * 0.15))}"
      fill="#7b4d07"
      fill-opacity="0.34"
    />
  </g>

  <!-- contact sparkle where slash crosses ring -->
  <ellipse cx="${cx - Math.round(r * 0.62)}" cy="${cy + Math.round(r * 0.68)}" rx="${Math.round(r * 0.2)}" ry="${Math.round(r * 0.08)}" fill="#ffc93c" fill-opacity="0.35"/>
  <ellipse cx="${cx - Math.round(r * 0.62)}" cy="${cy + Math.round(r * 0.68)}" rx="${Math.round(r * 0.33)}" ry="${Math.round(r * 0.12)}" fill="#ffc93c" fill-opacity="0.12"/>
</svg>`;
}

async function main() {
  const oldSymbolMaskCx = Math.round(W * 0.58);
  const oldSymbolMaskCy = Math.round(H * 0.49);

  const bg = await sharp(srcBackground)
    .resize(W, H, { fit: "cover", position: "center" })
    .composite([
      {
        input: Buffer.from(
          `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
             <defs>
               <linearGradient id="v" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stop-color="#000000" stop-opacity="0.42"/>
                 <stop offset="35%" stop-color="#000000" stop-opacity="0.22"/>
                 <stop offset="100%" stop-color="#000000" stop-opacity="0.16"/>
               </linearGradient>
               <radialGradient id="eraseOldSymbol" cx="${((oldSymbolMaskCx / W) * 100).toFixed(2)}%" cy="${((oldSymbolMaskCy / H) * 100).toFixed(2)}%" r="48%">
                 <stop offset="0%" stop-color="#08090b" stop-opacity="0.98"/>
                 <stop offset="72%" stop-color="#08090b" stop-opacity="0.9"/>
                 <stop offset="90%" stop-color="#08090b" stop-opacity="0.66"/>
                 <stop offset="100%" stop-color="#08090b" stop-opacity="0.1"/>
               </radialGradient>
             </defs>
             <rect width="100%" height="100%" fill="url(#v)"/>
             <rect width="100%" height="100%" fill="url(#eraseOldSymbol)"/>
             <ellipse cx="${Math.round(W * 0.45)}" cy="${Math.round(H * 0.74)}" rx="${Math.round(W * 0.17)}" ry="${Math.round(H * 0.17)}" fill="#08090b" fill-opacity="0.74"/>
           </svg>`,
        ),
      },
    ])
    .png()
    .toBuffer();

  const symbol = Buffer.from(createSymbolSvg());

  await sharp(bg)
    .composite([
      { input: symbol, top: 0, left: 0 },
      {
        input: Buffer.from(
          `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
             <defs>
               <radialGradient id="grainGlow" cx="68%" cy="55%" r="40%">
                 <stop offset="0%" stop-color="#f0cb73" stop-opacity="0.12"/>
                 <stop offset="100%" stop-color="#f0cb73" stop-opacity="0"/>
               </radialGradient>
             </defs>
             <rect width="100%" height="100%" fill="url(#grainGlow)"/>
           </svg>`,
        ),
      },
    ])
    .webp({ quality: 94 })
    .toFile(outFile);

  const meta = await sharp(outFile).metadata();
  console.log(`wrote ${outFile} ${meta.width}x${meta.height}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
