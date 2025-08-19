// src/scripts/seed.ingredients.ts
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { IngredientModel } from "../models/Ingredient"; // adjust import if needed

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/recipe_mixer";
const INPUT = process.argv[2] || "seeds/ingredients.mealdb.json";

async function main() {
  await mongoose.connect(MONGODB_URI);
  const file = path.join(process.cwd(), INPUT);
  const data = JSON.parse(fs.readFileSync(file, "utf-8"));

  let upserts = 0;
  for (const r of data) {
    const filter = { name: r.name }; // unique by canonical name
    const update = { $set: r };
    const res = await IngredientModel.updateOne(filter, update, { upsert: true });
    if (res.upsertedCount) upserts++;
  }
  console.log(`Ingredients upserted: ${upserts}`);
  await mongoose.disconnect();
}
main().catch(async (e) => { console.error(e); await mongoose.disconnect(); process.exit(1); });
