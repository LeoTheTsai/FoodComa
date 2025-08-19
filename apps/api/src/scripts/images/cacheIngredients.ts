// src/scripts/images/cacheIngredients.ts
import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const INPUT = process.argv[2] || "seeds/ingredients.mealdb.json";
const OUTPUT = process.argv[3] || "seeds/ingredients.mealdb.with-images.json";
const OUT_DIR = "public/images/ingredients";

function slug(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
function md5(s: string) { return crypto.createHash("md5").update(s).digest("hex").slice(0, 10); }

async function toWebp(buf: Buffer, outAbs: string) {
  const webp = await sharp(buf).resize({ width: 800, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  await fs.promises.mkdir(path.dirname(outAbs), { recursive: true });
  await fs.promises.writeFile(outAbs, webp);
  const tiny = await sharp(webp).resize(12).toBuffer();
  return `data:image/webp;base64,${tiny.toString("base64")}`;
}

async function main() {
  const arr = JSON.parse(fs.readFileSync(INPUT, "utf-8"));
  const out = [];

  for (const it of arr) {
    if (!it.imageUrl) { out.push({ ...it, imageLocal: null, imageBlurDataUrl: null }); continue; }
    const id = `${slug(it.name)}-${md5(it.imageUrl)}`;
    const rel = `/images/ingredients/${id}.webp`;
    const abs = path.join("public", rel);

    try {
      let blur: string;
      if (fs.existsSync(abs)) {
        const buf = fs.readFileSync(abs);
        const tiny = await sharp(buf).resize(12).toBuffer();
        blur = `data:image/webp;base64,${tiny.toString("base64")}`;
      } else {
        const res = await fetch(it.imageUrl);
        if (!res.ok) throw new Error(`Fetch ${res.status} ${it.imageUrl}`);
        const buf = Buffer.from(await res.arrayBuffer());
        blur = await toWebp(buf, abs);
      }
      out.push({ ...it, imageLocal: rel, imageBlurDataUrl: blur });
    } catch (e: any) {
      console.warn("Image failed:", it.imageUrl, e.message);
      out.push({ ...it, imageLocal: null, imageBlurDataUrl: null });
    }
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(out, null, 2));
  console.log(`Wrote ${OUTPUT} (count=${out.length})`);
}
main().catch((e) => { console.error(e); process.exit(1); });
