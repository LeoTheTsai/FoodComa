// scripts/images/cacheRecipes.ts
import fs from "fs";
import path from "path";
import crypto from "crypto";
import fetch from "node-fetch";
import sharp from "sharp";

const INPUT = process.argv[2] || "seeds/recipes.mealdb.json";
const OUTPUT = process.argv[3] || "seeds/recipes.mealdb.with-images.json";
const OUT_DIR = "public/images/recipes";

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function md5(s: string) {
  return crypto.createHash("md5").update(s).digest("hex").slice(0, 10);
}

async function toWebp(url: string, outAbs: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const webp = await sharp(buf).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  await fs.promises.mkdir(path.dirname(outAbs), { recursive: true });
  await fs.promises.writeFile(outAbs, webp);
  const tiny = await sharp(webp).resize(12).toBuffer();
  return `data:image/webp;base64,${tiny.toString("base64")}`;
}

async function main() {
  const arr = JSON.parse(fs.readFileSync(INPUT, "utf-8"));
  const out = [];

  for (const r of arr) {
    if (!r.imageUrl) {
      out.push({ ...r, imageLocal: null, imageBlurDataUrl: null });
      continue;
    }
  const id = `${slug(r.title || "recipe")}-${md5(r.imageUrl)}`;
  const rel = `images/recipes/${id}.webp`;
  const abs = path.join(OUT_DIR, `${id}.webp`);

    try {
      let blur: string;
      if (fs.existsSync(abs)) {
        const buf = fs.readFileSync(abs);
        const tiny = await sharp(buf).resize(12).toBuffer();
        blur = `data:image/webp;base64,${tiny.toString("base64")}`;
      } else {
        blur = await toWebp(r.imageUrl, abs);
      }
  out.push({ ...r, imageLocal: `/${rel}`, imageBlurDataUrl: blur });
    } catch (e: any) {
      console.warn("Image failed:", r.imageUrl, e.message);
      out.push({ ...r, imageLocal: null, imageBlurDataUrl: null });
    }
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(out, null, 2));
  console.log(`Wrote ${OUTPUT} (count=${out.length})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
