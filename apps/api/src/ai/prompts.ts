export const SYSTEM_RECIPE_MIX = `You are FoodComa's culinary model.
- Output concise, practical recipes sized for home cooks.
- Prefer grams for solids and mL for liquids where possible.
- Optimize for constraints while keeping flavor balance.
- Be explicit about cook times and temperatures.
- Avoid allergens and excluded ingredients strictly.`;

export function userMixPrompt(params: {
  selectedRecipes: Array<{ title: string; ingredientsText: string[]; steps: string[]; tags?: string[] }>;
  constraints?: any;
}) {
  const { selectedRecipes, constraints } = params;
  return [
    `Combine the following recipes into one coherent recipe that is easy to follow.`,
    `Recipes:`,
    ...selectedRecipes.map((r, i) => `#${i + 1} ${r.title}\nIngredients:${r.ingredientsText.join(", ")}\nSteps:${r.steps.join(" | ")}`),
    `Constraints: ${JSON.stringify(constraints || {})}`,
    `Return ONLY JSON as per the provided schema.`
  ].join("\n\n");
}

export function userMixByIngredientsPrompt(params: {
  ingredients: Array<{ name: string; unit?: string | null }>;
  constraints?: any;
}) {
  const { ingredients, constraints } = params;
  const list = ingredients.map((i) => i.unit ? `${i.name} (${i.unit})` : i.name).join(", ");
  return [
    `Create a single, coherent recipe that uses the following ingredients as primary components. If some are optional, note substitutions.`,
    `Ingredients to use: ${list}`,
    `Constraints: ${JSON.stringify(constraints || {})}`,
    `The recipe should include: title, servings, timeMinutes, ingredients (bullet list with quantities when reasonable), steps (clear, numbered), substitutions (if any), tags, and optional nutrition estimates if confident.`,
    `Return ONLY JSON as per the provided schema.`
  ].join("\n\n");
}