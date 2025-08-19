// scripts/seed.mealdb.ts
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { RecipeModel } from "../models/Recipe";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/recipe_mixer";
const INPUT = process.argv[2] || "seeds/recipes.mealdb.json"; // or ...with-images.json

async function main() {
  await mongoose.connect(MONGODB_URI);
  const file = path.join(process.cwd(), INPUT);
  const data = JSON.parse(fs.readFileSync(file, "utf-8"));

  let inserted = 0, updated = 0;

  for (const r of data) {
    const filter = {
      "attribution.source": r.attribution?.source || "themealdb",
      "attribution.sourceId": r.attribution?.sourceId
    };
    const update = {
      $set: {
        title: r.title,
        description: r.description,
        ingredientsText: r.ingredientsText || [],
        steps: r.steps || [],
        tags: r.tags || [],
        imageUrl: r.imageUrl || null,
        imageLocal: r.imageLocal || null,
        imageBlurDataUrl: r.imageBlurDataUrl || null,
        servings: r.servings,
        prepTimeMin: r.prepTimeMin,
        cookTimeMin: r.cookTimeMin,
        totalTimeMin: r.totalTimeMin,
        attribution: r.attribution || { source: "themealdb", sourceId: null }
      }
    };

    const res = await RecipeModel.updateOne(filter, update, { upsert: true });
    // naive counters
    if (res.upsertedCount && res.upsertedCount > 0) inserted++;
    else if (res.matchedCount) updated++;
  }

  console.log(`Seed complete. Inserted: ${inserted}, Updated: ${updated}`);
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect();
  process.exit(1);
});
