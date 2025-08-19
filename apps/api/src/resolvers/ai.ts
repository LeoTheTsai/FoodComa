import { RecipeModel } from "../models/Recipe.js";
import { aiJSON, openai } from "../ai/openai.js";
import { SYSTEM_RECIPE_MIX, userMixPrompt, userMixByIngredientsPrompt } from "../ai/prompts.js";
import { IngredientModel } from "../models/Ingredient.js";
import { GeneratedRecipeSchema } from "../ai/schemas.js";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../uploads");

async function ensureUploads() { try { await fs.mkdir(uploadsDir, { recursive: true }); } catch {} }
function stylePrompt(style?: string) {
  switch (style) {
    case "CLOSE_UP": return "Close-up, shallow depth of field, moody shadows";
    case "RUSTIC": return "Rustic wooden table, natural light, linen props";
    case "STUDIO": return "Clean studio lighting, high key, minimal shadows";
    default: return "Top-down, bright natural light, shallow depth of field";
  }
}
async function generateImageFile({ title, ingredients, style }: { title: string; ingredients: string[]; style?: string; }) {
  const prompt = `${stylePrompt(style)}. Dish: ${title}. Key ingredients: ${ingredients.slice(0,6).join(", ")}.`;
  const res = await openai.images.generate({ model: process.env.IMAGE_MODEL || "gpt-image-1", prompt, size: "1024x1024" });
  const b64 = res?.data?.[0]?.b64_json;
  if (!b64) throw new Error("Image generation failed");
  await ensureUploads();
  const filename = `mix_${Date.now()}.png`;
  const filePath = path.join(uploadsDir, filename);
  await fs.writeFile(filePath, Buffer.from(b64, "base64"));
  return `/uploads/${filename}`;
}

function violatesExclusions(out: any, exclude: string[] = []) {
  const text = JSON.stringify(out).toLowerCase();
  return exclude.some((x) => text.includes(x.toLowerCase()));
}

export const Mutation = {
  mixRecipes: async (_: unknown, { recipeIds, constraints }: any, ctx: any) => {
    if (!ctx.user) throw new Error("Unauthorized");

    const recipes = await RecipeModel.find({ _id: { $in: recipeIds } })
      .select("title ingredientsText steps tags")
      .lean();
    if (!recipes.length) throw new Error("No recipes found");

    let json: any;
    for (let i = 0; i < 2; i++) {
      json = await aiJSON({
        system: SYSTEM_RECIPE_MIX,
        user: userMixPrompt({ selectedRecipes: recipes as any, constraints }),
        schema: GeneratedRecipeSchema,
      });
      if (!violatesExclusions(json, constraints?.exclude)) break;
    }

    const imageUrl = await generateImageFile({ title: json.title, ingredients: json.ingredients || [], style: constraints?.imageStyle });
    const id = "mix_" + Date.now();
    return { id, ...json, imageUrl, tags: Array.from(new Set([...(json.tags || []), "mixed"])) };
  }
  ,
  mixIngredients: async (_: unknown, { ingredientIds, constraints }: any, ctx: any) => {
    if (!ctx.user) throw new Error("Unauthorized");

    const ingredients = await IngredientModel.find({ _id: { $in: ingredientIds } })
      .select("name unit")
      .lean();
    if (!ingredients.length) throw new Error("No ingredients found");

    let json: any;
    for (let i = 0; i < 2; i++) {
      json = await aiJSON({
        system: SYSTEM_RECIPE_MIX,
        user: userMixByIngredientsPrompt({ ingredients: ingredients as any, constraints }),
        schema: GeneratedRecipeSchema,
      });
      if (!violatesExclusions(json, constraints?.exclude)) break;
    }

    const names = (json.ingredients || []).map((s: string) => String(s));
    const imageUrl = await generateImageFile({ title: json.title, ingredients: names.length ? names : ingredients.map((i: any) => i.name), style: constraints?.imageStyle });
    const id = "mix_" + Date.now();
    return { id, ...json, imageUrl, tags: Array.from(new Set([...(json.tags || []), "mixed"])) };
  }
};
