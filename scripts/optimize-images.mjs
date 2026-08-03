import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const publicDir = join(process.cwd(), "public");
const targets = ["hero.png", "icon-trading.png", "icon-staking.png", "icon-hybrid.png"];

for (const file of targets) {
  const input = join(publicDir, file);
  const output = input.replace(/\.png$/, ".webp");
  try {
    const before = (await stat(input)).size;
    await sharp(input).webp({ quality: 82, effort: 6 }).toFile(output);
    const after = (await stat(output)).size;
    console.log(
      `${file} -> ${file.replace(/\.png$/, ".webp")}  ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`,
    );
  } catch (err) {
    console.error(`Failed ${file}:`, err.message);
  }
}

await readdir(publicDir);
