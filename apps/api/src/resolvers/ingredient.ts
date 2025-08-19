// src/resolvers/ingredient.ts
import { IngredientModel } from "../models/index.js";

export const Ingredient = {
  // Stable ID regardless of _id vs id
  id: (p: any) => String(p._id ?? p.id),

  // Convenience: one field the UI can bind to (local > remote)
  image: (p: any) => p.imageLocal ?? p.imageUrl ?? null,
};

// helpers
const cap = (n: number, min = 1, max = 200) =>
  Math.max(min, Math.min(max, Number(n) || 0));

export const Query = {
  ingredients: async (
    _: unknown,
    { search, category, hasImage, limit = 50, offset = 0 }: any
  ) => {
    const q: any = {};
    let projection: any = undefined;
    let sort: any = { name: 1 };

    if (search) {
      q.$text = { $search: String(search) };
      projection = { score: { $meta: "textScore" } };
      sort = { score: { $meta: "textScore" } };
    }

    if (category) q.category = new RegExp(`^${String(category)}$`, "i");

    if (hasImage === true || hasImage === "true") {
      q.$or = [
        { imageLocal: { $exists: true, $ne: null } },
        { imageUrl: { $exists: true, $ne: null } },
      ];
    }

    return IngredientModel.find(q, projection)
      .collation({ locale: "en", strength: 1 }) // case-insensitive sort
      .sort(sort)
      .skip(Number(offset) || 0)
      .limit(cap(limit))
      .lean();
  },
  ingredientsCount: async (_: unknown, { search, category, hasImage }: any) => {
    const q: any = {};
    if (search) {
      // when using text index, counting with text search is fine
      q.$text = { $search: String(search) };
    }
    if (category) q.category = new RegExp(`^${String(category)}$`, "i");
    if (hasImage === true || hasImage === "true") {
      q.$or = [
        { imageLocal: { $exists: true, $ne: null } },
        { imageUrl: { $exists: true, $ne: null } },
      ];
    }
    return IngredientModel.countDocuments(q);
  },
  ingredientsByIds: async (_: unknown, { ids }: any) => {
    if (!Array.isArray(ids) || !ids.length) return [];
    return IngredientModel.find({ _id: { $in: ids } }).lean();
  },
  myIngredients: async (_: unknown, { limit = 50, offset = 0 }: any, ctx: any) => {
    if (!ctx?.user) return [];
    return IngredientModel.find({ ownerId: ctx.user.id })
      .sort({ updatedAt: -1 })
      .skip(Number(offset) || 0)
      .limit(cap(limit))
      .lean();
  },
};