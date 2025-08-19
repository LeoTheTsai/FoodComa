import { gql } from "@apollo/client";

export const ME = gql`query { me { id email name } }`;
export const HOME = gql`
  query Home($limit: Int, $offset: Int) {
  myIngredients(limit: $limit, offset: $offset) { id name unit image imageLocal imageUrl imageBlurDataUrl }
    myRecipes(limit: $limit, offset: $offset) { id title tags image imageLocal imageUrl imageBlurDataUrl }
    lastViewedRecipes(limit: $limit, offset: $offset) { id title tags image imageLocal imageUrl imageBlurDataUrl }
    favoriteRecipes(limit: $limit, offset: $offset) { id title tags image imageLocal imageUrl imageBlurDataUrl }
  }
`;

export const FAVORITE_RECIPE_IDS = gql`
  query FavoriteRecipeIds($limit: Int, $offset: Int) {
    favoriteRecipes(limit: $limit, offset: $offset) { id }
  }
`;

export const FAVORITES = gql`
  query Favorites($search: String, $limit: Int, $offset: Int) {
    favoriteRecipes(search: $search, limit: $limit, offset: $offset) { id title tags image imageLocal imageUrl imageBlurDataUrl }
    favoriteRecipesCount(search: $search)
  }
`;

export const RECIPES = gql`
  query Recipes($search: String, $tag: String, $limit: Int, $offset: Int) {
  recipes(search: $search, tag: $tag, limit: $limit, offset: $offset) { id title tags image imageLocal imageUrl imageBlurDataUrl }
  recipesCount(search: $search, tag: $tag)
  }
`;

export const RECIPE = gql`
  query Recipe($id: ID!) {
    recipe(id: $id) {
  id title description tags steps image imageLocal imageUrl imageBlurDataUrl
      ingredients { id name unit }
    }
  }
`;

export const INGREDIENTS = gql`
  query Ingredients($search: String, $limit: Int, $offset: Int) {
  ingredients(search: $search, limit: $limit, offset: $offset) { id name unit image imageLocal imageUrl imageBlurDataUrl }
  ingredientsCount(search: $search)
  }
`;

export const INGREDIENTS_BY_IDS = gql`
  query IngredientsByIds($ids: [ID!]!) {
    ingredientsByIds(ids: $ids) { id name unit image imageLocal imageUrl imageBlurDataUrl }
  }
`;
