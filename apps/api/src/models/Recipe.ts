// src/models/Recipe.ts
import mongoose, { Schema } from "mongoose";

const AttributionSchema = new Schema({
  source: { type: String, default: "local-seed", index: true },
  sourceId: { type: String, index: true },
  sourceUrl: String,
  author: String,
  license: String
}, { _id: false });

const RecipeSchema = new Schema(
  {
    title: { type: String, required: true, index: true },
    description: String,

    // existing fields
    ingredientIds: [{ type: Schema.Types.ObjectId, ref: "Ingredient" }],
    ingredientsText: [String],
    steps: [String],
    tags: [String],
    ownerId: String,
    imageUrl: String,

    // new optional fields (safe to add)
    imageLocal: String,
    imageBlurDataUrl: String,
    servings: Number,
    prepTimeMin: Number,
    cookTimeMin: Number,
    totalTimeMin: Number,
    attribution: { type: AttributionSchema, default: {} }
  },
  { timestamps: true }
);

RecipeSchema.index({ title: "text", ingredientsText: "text", tags: "text" });
// helps avoid duplicates when importing
RecipeSchema.index({ "attribution.source": 1, "attribution.sourceId": 1 });

export const RecipeModel = mongoose.models.Recipe || mongoose.model("Recipe", RecipeSchema);
