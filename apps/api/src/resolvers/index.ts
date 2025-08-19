import { makeExecutableSchema } from "@graphql-tools/schema";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as recipeResolvers from "./recipe.js";
import * as aiResolvers from "./ai.js";
import * as authResolvers from "./auth.js";
import * as ingredientResolvers from "./ingredient.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const recipeSDL = readFileSync(path.join(__dirname, "../schema/recipe.graphql"), "utf8");
const ingredientSDL = readFileSync(path.join(__dirname, "../schema/ingredient.graphql"), "utf8");
const aiSDL = readFileSync(path.join(__dirname, "../schema/ai.graphql"), "utf8");
const authSDL = readFileSync(path.join(__dirname, "../schema/auth.graphql"), "utf8");

export const schema = makeExecutableSchema({
  // Order doesn’t matter much, but keeping ingredient after recipe is tidy
  typeDefs: [authSDL, recipeSDL, ingredientSDL, aiSDL],
  resolvers: [authResolvers, recipeResolvers, ingredientResolvers, aiResolvers],
});
