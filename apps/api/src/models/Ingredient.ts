// src/models/Ingredient.ts
import mongoose, { Schema } from "mongoose";

const IngredientSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
  ownerId: { type: String, index: true },
    unit: { type: String, trim: true },                 // optional default unit
    altNames: { type: [String], default: [] },          // synonyms
    category: { type: String, default: "" },            // e.g., "Vegetable", "Dairy"
    description: { type: String, default: "" },

    imageUrl: String,         
    imageLocal: String,         
    imageBlurDataUrl: String, 

    nutritionPer100g: {          // optional, for later enrichment
      calories: Number,
      protein_g: Number,
      fat_g: Number,
      carbs_g: Number,
    },

    attribution: {
      source: { type: String, default: "themealdb", index: true },
      sourceId: String,
      sourceUrl: String,
      license: String,
    },
  },
  { timestamps: true }
);

IngredientSchema.index({ name: "text", altNames: "text" });
IngredientSchema.index({ category: 1 });
export const IngredientModel =
  mongoose.models.Ingredient || mongoose.model("Ingredient", IngredientSchema);
