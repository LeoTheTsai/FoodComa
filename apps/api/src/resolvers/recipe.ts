import { IngredientModel, RecipeModel, UserModel } from "../models/index.js";

const cap = (n: number, min = 1, max = 100) => Math.max(min, Math.min(max, n || 0));

export const Recipe = {
  id: (parent: any) => String(parent._id ?? parent.id),

  // Keep your existing ingredient lookup
  ingredients: async (parent: any) => {
    const ids = parent.ingredientIds || [];
    if (!ids.length) return [];
    const docs = await IngredientModel.find({ _id: { $in: ids } }).lean();
    const map = new Map(docs.map(d => [String(d._id), { id: String(d._id), name: d.name, unit: d.unit }]));
    return ids.map((id: any) => map.get(String(id))).filter(Boolean);
  },

  // Optional convenience field: one image prop for the UI
  image: (p: any) => p.imageLocal ?? p.imageUrl ?? null,
};

export const Ingredient = { id: (p: any) => String(p._id ?? p.id) };

export const Query = {
  recipes: async (_: unknown, { search, tag, limit = 20, offset = 0 }: any) => {
    const q: any = {};
    const opts: any = { sort: { createdAt: -1 } };
    if (search && String(search).trim()) {
      const re = new RegExp(String(search).trim(), "i");
      q.$or = [{ title: re }, { tags: re }];
    }
    if (tag) q.tags = String(tag).trim().toLowerCase();

    return RecipeModel.find(q, opts.projection)
      .sort(opts.sort)
      .skip(Number(offset) || 0)
      .limit(cap(Number(limit)))
      .lean();
  },

  recipe: async (_: unknown, { id }: any) => {
    // Ensure a fresh, executed query result is returned (not a reusable Query object)
    return await RecipeModel.findById(id).lean();
  },

  ingredients: async (_: unknown, { search, limit = 50 }: any) => {
    const q: any = {};
    if (search) q.name = new RegExp(String(search), "i");
    return IngredientModel.find(q).limit(cap(Number(limit), 1, 200)).lean();
  },

  recipesCount: async (_: unknown, { search, tag }: any) => {
    const q: any = {};
    if (search && String(search).trim()) {
      const re = new RegExp(String(search).trim(), "i");
      q.$or = [{ title: re }, { tags: re }];
    }
    if (tag) q.tags = String(tag).trim().toLowerCase();
    return RecipeModel.countDocuments(q);
  },
  favoriteRecipesCount: async (_: unknown, { search }: any, ctx: any) => {
    if (!ctx?.user) return 0;
    const user = await UserModel.findById(ctx.user.id).lean();
    const ids = (user?.favoriteRecipeIds || []).map((x: any) => String(x));
    if (!ids.length) return 0;
    const q: any = { _id: { $in: ids } };
    if (search && String(search).trim()) {
      const re = new RegExp(String(search).trim(), "i");
      q.$or = [{ title: re }, { tags: re }];
    }
    return RecipeModel.countDocuments(q);
  },
  // Personalized sections
  myRecipes: async (_: unknown, { limit = 10, offset = 0 }: any, ctx: any) => {
    if (!ctx?.user) return [];
    return RecipeModel.find({ ownerId: ctx.user.id })
      .sort({ updatedAt: -1 })
      .skip(Number(offset) || 0)
      .limit(cap(Number(limit)))
      .lean();
  },

  favoriteRecipes: async (_: unknown, { search, limit = 10, offset = 0 }: any, ctx: any) => {
    if (!ctx?.user) return [];
    const user = await UserModel.findById(ctx.user.id).lean();
    const ids = (user?.favoriteRecipeIds || []).map((x: any) => String(x));
    if (!ids.length) return [];
    const q: any = { _id: { $in: ids } };
    const opts: any = { sort: { updatedAt: -1 } };
    if (search && String(search).trim()) {
      const re = new RegExp(String(search).trim(), "i");
      q.$or = [{ title: re }, { tags: re }];
    }
    return RecipeModel.find(q)
      .sort(opts.sort)
      .skip(Number(offset) || 0)
      .limit(cap(Number(limit)))
      .lean();
  },

  lastViewedRecipes: async (_: unknown, { limit = 10, offset = 0 }: any, ctx: any) => {
    if (!ctx?.user) return [];
    const user = await UserModel.findById(ctx.user.id).lean();
    const ids = (user?.lastViewedRecipeIds || []).map((x: any) => String(x));
    if (!ids.length) return [];
    // lastViewedRecipeIds should be recent-first; preserve order
    const docs = await RecipeModel.find({ _id: { $in: ids } }).lean();
    const map = new Map(docs.map((d: any) => [String(d._id), d]));
    const ordered = ids.map(id => map.get(id)).filter(Boolean);
    const start = Number(offset) || 0;
    const end = start + cap(Number(limit));
    return ordered.slice(start, end);
  },
};
export const Mutation = {
  toggleFavoriteRecipe: async (_: unknown, { id }: any, ctx: any) => {
    if (!ctx?.user) throw new Error("Unauthorized");
    const user = await UserModel.findById(ctx.user.id);
    if (!user) throw new Error("User not found");
    const strId = String(id);
    const has = (user.favoriteRecipeIds || []).some((x: any) => String(x) === strId);
    if (has) {
      user.favoriteRecipeIds = (user.favoriteRecipeIds || []).filter((x: any) => String(x) !== strId) as any;
    } else {
      user.favoriteRecipeIds = [...(user.favoriteRecipeIds || []), id] as any;
    }
    await user.save();
    return true;
  },

  recordRecipeView: async (_: unknown, { id }: any, ctx: any) => {
    if (!ctx?.user) return false; // soft-fail for guests
    const user = await UserModel.findById(ctx.user.id);
    if (!user) return false;
    const strId = String(id);
    const list = (user.lastViewedRecipeIds || []).map((x: any) => String(x));
    const next = [strId, ...list.filter(x => x !== strId)].slice(0, 6); // cap at 6
    user.lastViewedRecipeIds = next as any;
    await user.save();
    return true;
  },
  createRecipe: async (_: unknown, { title, description, ingredients, tags, ingredientsText, steps }: any, ctx: any) => {
    if (!ctx?.user) throw new Error("Unauthorized");
    const doc = await RecipeModel.create({
      title,
      description,
      ingredientIds: ingredients || [],
      ingredientsText: ingredientsText || [],
      steps: steps || [],
      tags: (tags || []).map((t: string) => t.trim().toLowerCase()),
      ownerId: ctx.user.id,
    });
    return doc.toObject();
  },

  updateRecipe: async (_: unknown, { id, title, description, ingredients, tags, ingredientsText, steps }: any, ctx: any) => {
    if (!ctx?.user) throw new Error("Unauthorized");
    const update: any = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (ingredients !== undefined) update.ingredientIds = ingredients;
    if (tags !== undefined) update.tags = tags.map((t: string) => t.trim().toLowerCase());
    if (ingredientsText !== undefined) update.ingredientsText = ingredientsText;
    if (steps !== undefined) update.steps = steps;

    return RecipeModel.findByIdAndUpdate(id, update, { new: true }).lean();
  },

  deleteRecipe: async (_: unknown, { id }: any, ctx: any) => {
    if (!ctx?.user) throw new Error("Unauthorized");
    const doc = await RecipeModel.findById(id);
    if (!doc) return true; // idempotent
    if (String(doc.ownerId) !== String(ctx.user.id)) throw new Error("Forbidden");
    await RecipeModel.deleteOne({ _id: id });
    // Clean up references in user favorites/last viewed
    await UserModel.updateMany(
      {},
      {
        $pull: {
          favoriteRecipeIds: id,
          lastViewedRecipeIds: id,
        },
      }
    );
    return true;
  },

  createIngredient: async (_: unknown, { name, unit }: any, ctx: any) => {
    if (!ctx?.user) throw new Error("Unauthorized");
  const doc = await IngredientModel.create({ name, unit, ownerId: ctx.user.id });
    return doc.toObject();
  },
  deleteIngredient: async (_: unknown, { id }: any, ctx: any) => {
    if (!ctx?.user) throw new Error("Unauthorized");
    const ing = await IngredientModel.findById(id);
    if (!ing) return true;
    if (String(ing.ownerId) !== String(ctx.user.id)) throw new Error("Forbidden");
    // Remove ingredient from any recipes' ingredientIds arrays
    await RecipeModel.updateMany({}, { $pull: { ingredientIds: id } });
    await IngredientModel.deleteOne({ _id: id });
    return true;
  },
};
