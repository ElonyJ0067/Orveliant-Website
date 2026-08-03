/**
 * Strip baked black backgrounds from product icons so they float like hybrid/markets marks.
 * Usage: node scripts/remove-icon-bg.mjs public/icon-foo.webp public/icon-foo-out.webp
 */
import sharp from "sharp";

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("Usage: node scripts/remove-icon-bg.mjs <input> <output>");
  process.exit(1);
}

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
let out = Buffer.from(data);

for (let i = 0; i < out.length; i += 4) {
  const r = out[i],
    g = out[i + 1],
    b = out[i + 2],
    a = out[i + 3];
  if (a < 5) {
    out[i] = out[i + 1] = out[i + 2] = out[i + 3] = 0;
    continue;
  }
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lum = (r + g + b) / 3;
  const sat = max === 0 ? 0 : (max - min) / max;
  if (lum < 36 && sat < 0.45 && r < 50) {
    const gold = r > g + 5 && g >= b;
    if (!gold || lum < 18) {
      out[i] = out[i + 1] = out[i + 2] = out[i + 3] = 0;
    } else {
      const t = Math.max(0, Math.min(1, (lum - 8) / 28));
      out[i + 3] = Math.round(a * t * 0.85);
      if (out[i + 3] < 10) out[i] = out[i + 1] = out[i + 2] = out[i + 3] = 0;
    }
  }
}

for (let iter = 0; iter < 3; iter++) {
  const prev = Buffer.from(out);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (prev[i + 3] < 10) continue;
      const lum = (prev[i] + prev[i + 1] + prev[i + 2]) / 3;
      if (lum > 48) continue;
      let transN = 0;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [-1, -1],
        [1, -1],
        [-1, 1],
      ]) {
        const nx = x + dx,
          ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) {
          transN++;
          continue;
        }
        if (prev[(ny * w + nx) * 4 + 3] < 10) transN++;
      }
      if ((transN >= 2 && lum < 42) || (transN >= 1 && lum < 28)) {
        out[i] = out[i + 1] = out[i + 2] = out[i + 3] = 0;
      }
    }
  }
}

await sharp(out, { raw: { width: w, height: h, channels: 4 } })
  .webp({ quality: 93, alphaQuality: 100, effort: 6 })
  .toFile(output);

const meta = await sharp(output).metadata();
console.log(`Wrote ${output} (hasAlpha=${meta.hasAlpha})`);
