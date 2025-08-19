import { gql } from "@apollo/client";

export const MIX_RECIPES = gql`
  mutation MixRecipes($ids: [ID!]!, $c: MixConstraintsInput) {
    mixRecipes(recipeIds: $ids, constraints: $c) {
      id title servings timeMinutes ingredients steps substitutions tags nutrition imageUrl
    }
  }
`;

export const MIX_INGREDIENTS = gql`
  mutation MixIngredients($ids: [ID!]!, $c: MixConstraintsInput) {
    mixIngredients(ingredientIds: $ids, constraints: $c) {
      id title servings timeMinutes ingredients steps substitutions tags nutrition imageUrl
    }
  }
`;

export const CREATE_RECIPE = gql`
  mutation CreateRecipe(
    $title: String!, $desc: String, $ingredients: [ID!]!, $tags: [String!],
    $ingredientsText: [String!], $steps: [String!]
  ) {
    createRecipe(
      title: $title, description: $desc, ingredients: $ingredients, tags: $tags,
      ingredientsText: $ingredientsText, steps: $steps
    ) { id title tags }
  }
`;

export const UPDATE_RECIPE = gql`
  mutation UpdateRecipe(
    $id: ID!, $title: String, $desc: String, $ingredients: [ID!],
    $tags: [String!], $ingredientsText: [String!], $steps: [String!]
  ) {
    updateRecipe(
      id: $id, title: $title, description: $desc, ingredients: $ingredients,
      tags: $tags, ingredientsText: $ingredientsText, steps: $steps
    ) { id title tags }
  }
`;

export const CREATE_INGREDIENT = gql`
  mutation CreateIngredient($name: String!, $unit: String) {
    createIngredient(name: $name, unit: $unit) { id name unit }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) { user { id email name } }
  }
`;
export const REGISTER = gql`
  mutation Register($email: String!, $password: String!, $name: String) {
    register(email: $email, password: $password, name: $name) { user { id email name } }
  }
`;
export const LOGOUT = gql`mutation { logout }`;
export const REFRESH = gql`mutation { refresh }`;

export const TOGGLE_FAVORITE_RECIPE = gql`
  mutation ToggleFavorite($id: ID!) {
    toggleFavoriteRecipe(id: $id)
  }
`;

export const RECORD_RECIPE_VIEW = gql`
  mutation RecordView($id: ID!) {
    recordRecipeView(id: $id)
  }
`;

export const DELETE_RECIPE = gql`
  mutation DeleteRecipe($id: ID!) {
    deleteRecipe(id: $id)
  }
`;

export const DELETE_INGREDIENT = gql`
  mutation DeleteIngredient($id: ID!) {
    deleteIngredient(id: $id)
  }
`;
