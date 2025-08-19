// apps/api/scripts/importers/theMealDb.ts
import fs from "fs";
import path from "path";
import { pathToFileURL } from "node:url";

type Meal = Record<string, any>;

function toIngredientsText(meal: Meal) {
  const rows: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = (meal[`strIngredient${i}`] || "").trim();
    const measure = (meal[`strMeasure${i}`] || "").trim();
    if (!name) continue;
    const line = [measure, name].filter(Boolean).join(" ").trim();
    rows.push(line);
  }
  return rows;
}

function toSteps(meal: Meal) {
  return (meal.strInstructions || "")
    .split(/\r?\n+/)
    .map((s: string) => s.trim())
    .filter(Boolean);
}

function toTags(meal: Meal) {
  return (meal.strTags || "")
    .split(",")
    .map((t: string) => t.trim().toLowerCase())
    .filter(Boolean);
}

function mapMeal(meal: Meal) {
  return {
    title: meal.strMeal,
    description: [meal.strArea, meal.strCategory].filter(Boolean).join(" • "),
    ingredientsText: toIngredientsText(meal),
    steps: toSteps(meal),
    tags: toTags(meal),
    imageUrl: meal.strMealThumb || null,
    attribution: {
      source: "themealdb",
      sourceId: String(meal.idMeal),
      sourceUrl: `https://www.themealdb.com/meal.php?c=${meal.idMeal}`
    },
    servings: 2
  };
}

async function getJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  return res.json();
}

async function listCategories(): Promise<string[]> {
  const data = await getJson("https://www.themealdb.com/api/json/v1/1/list.php?c=list");
  return (data.meals || []).map((c: any) => c.strCategory);
}

async function byCategory(cat: string) {
  const data = await getJson(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(cat)}`);
  return data.meals || [];
}

async function mealById(id: string) {
  const data = await getJson(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
  return (data.meals && data.meals[0]) || null;
}

export async function runMealDbImport(limitPerCategory = 25) {
  const categories = await listCategories();
  const out: any[] = [];

  for (const cat of categories) {
    const list = await byCategory(cat);
    const subset = list.slice(0, limitPerCategory);
    for (const m of subset) {
      const full = await mealById(m.idMeal);
      if (full) out.push(mapMeal(full));
    }
  }

  const outDir = path.join(process.cwd(), "seeds");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "recipes.mealdb.json");
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
  console.log(`Saved ${out.length} recipes → ${outFile}`);
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] || "").href;
if (isMain) {
  runMealDbImport(25).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
