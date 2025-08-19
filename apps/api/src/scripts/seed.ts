import "dotenv/config";
import mongoose from "mongoose";
import { RecipeModel } from "../models/Recipe.js";
import { IngredientModel } from "../models/Ingredient.js";

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI missing");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Mongo connected");

  await RecipeModel.deleteMany({});
  await IngredientModel.deleteMany({});

  const ings = await IngredientModel.insertMany([
    { name: "Chicken Breast", unit: "g" },
    { name: "Garlic", unit: "clove" },
    { name: "Olive Oil", unit: "tbsp" },
    { name: "Rice", unit: "g" },
    { name: "Soy Sauce", unit: "tbsp" },
    { name: "Tofu", unit: "g" },
    { name: "Broccoli", unit: "g" }
  ]);

  const map = Object.fromEntries(ings.map(i => [i.name, i._id]));

  const r1 = await RecipeModel.create({
    title: "Garlic Chicken Rice Bowl",
    description: "Quick weeknight bowl.",
    ingredientIds: [map["Chicken Breast"], map["Garlic"], map["Olive Oil"], map["Rice"], map["Soy Sauce"]],
    ingredientsText: [
      "300 g chicken breast",
      "2 cloves garlic, minced",
      "1 tbsp olive oil",
      "200 g cooked rice",
      "1 tbsp soy sauce"
    ],
    steps: [
      "Season chicken with soy sauce.",
      "Sauté garlic in olive oil.",
      "Cook chicken until browned.",
      "Serve over rice."
    ],
    tags: ["quick", "asian", "bowl"]
  });

  const r2 = await RecipeModel.create({
    title: "Tofu Broccoli Stir-Fry",
    description: "Light, vegetarian stir-fry.",
    ingredientIds: [map["Tofu"], map["Broccoli"], map["Garlic"], map["Olive Oil"], map["Soy Sauce"]],
    ingredientsText: [
      "250 g firm tofu, cubed",
      "200 g broccoli florets",
      "2 cloves garlic, sliced",
      "1 tbsp olive oil",
      "1 tbsp soy sauce"
    ],
    steps: [
      "Pan-fry tofu until golden.",
      "Stir-fry broccoli and garlic.",
      "Combine with tofu and season."
    ],
    tags: ["vegetarian", "stir-fry", "quick"]
  });

  console.log("Seeded recipes:", r1._id.toString(), r2._id.toString());
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
