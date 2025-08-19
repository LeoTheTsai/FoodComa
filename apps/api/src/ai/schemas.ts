export const GeneratedRecipeSchema = {
  name: "GeneratedRecipe",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { type: "string" },
      servings: { type: "integer" },
      timeMinutes: { type: "integer" },
      ingredients: { type: "array", items: { type: "string" } },
      steps: { type: "array", items: { type: "string" } },
      substitutions: { type: "array", items: { type: "string" } },
      tags: { type: "array", items: { type: "string" } },
      nutrition: {
        type: "object",
        additionalProperties: false,
        properties: {
          calories: { type: "number" },
          protein_g: { type: "number" },
          fat_g: { type: "number" },
          carbs_g: { type: "number" }
        },
        required: ["calories", "protein_g", "fat_g", "carbs_g"]
      },
      imageUrl: { type: "string" }
    },
    required: [
      "title","servings","timeMinutes","ingredients","steps",
      "substitutions","tags","nutrition","imageUrl"
    ]
  }
};
