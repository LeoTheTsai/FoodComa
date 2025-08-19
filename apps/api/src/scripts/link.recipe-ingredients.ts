// src/scripts/link.recipe-ingredients.ts
import mongoose from "mongoose";
import { RecipeModel } from "../models/Recipe";
import { IngredientModel } from "../models/Ingredient";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/recipe_mixer";

function normalizeName(s: string) {
  return s.toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
}
// naive extractor: last token or everything after quantity/unit
function extractName(line: string) {
  // try to drop leading amounts like "200 g", "1 cup", "2 pcs"
  const dropped = line.replace(/^\d+([.,]\d+)?\s*(g|gram|grams|kg|ml|l|cup|cups|tsp|tbsp|teaspoon|tablespoon|pcs|piece|pieces)?\s*/i, "");
  return normalizeName(dropped);
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  const ings = await IngredientModel.find({}, { name: 1 }).lean();
  const dict = new Map(ings.map(i => [normalizeName(i.name), String(i._id)]));

  const recipes = await RecipeModel.find({}).lean();
  let linked = 0;

  for (const r of recipes) {
    const ids: string[] = [];
    for (const line of (r.ingredientsText || [])) {
      const guess = extractName(String(line));
      const id = dict.get(guess);
      if (id && !ids.includes(id)) ids.push(id);
    }
    if (ids.length && JSON.stringify(ids) !== JSON.stringify(r.ingredientIds?.map(String) || [])) {
      await RecipeModel.updateOne({ _id: r._id }, { $set: { ingredientIds: ids } });
      linked++;
    }
  }
  console.log(`Recipes linked: ${linked}`);
  await mongoose.disconnect();
}
main().catch(async (e) => { console.error(e); await mongoose.disconnect(); process.exit(1); });
