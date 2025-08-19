// src/scripts/importers/themealdb.ingredients.ts
import fs from "fs";
import path from "path";

type Raw = { meals: Array<{ strIngredient: string; strDescription?: string; strType?: string }> };

async function getJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  return (await res.json()) as Raw;
}
function img(name: string) {
  // MealDB ingredient images are PNG; there’s also "-Small.png" variants if desired
  return `https://www.themealdb.com/images/ingredients/${encodeURIComponent(name)}.png`;
}

async function main() {
  const data = await getJson("https://www.themealdb.com/api/json/v1/1/list.php?i=list");
  const items = (data.meals || []).map((m) => ({
    name: m.strIngredient.trim(),
    altNames: [],
    category: m.strType || "",
    description: (m.strDescription || "").trim(),
    imageUrl: img(m.strIngredient.trim()),
    attribution: {
      source: "themealdb",
      sourceId: m.strIngredient.trim(),
      sourceUrl: `https://www.themealdb.com/ingredients.php?i=${encodeURIComponent(m.strIngredient.trim())}`,
    },
  }));

  const outDir = path.join(process.cwd(), "seeds");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "ingredients.mealdb.json");
  fs.writeFileSync(outFile, JSON.stringify(items, null, 2));
  console.log(`Saved ${items.length} ingredients → ${outFile}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
