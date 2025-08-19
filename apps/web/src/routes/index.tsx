import { useMutation, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FAVORITES, FAVORITE_RECIPE_IDS, HOME } from "../graphql/queries";
import RecipeCard from "../components/RecipeCard";
import { DELETE_INGREDIENT, DELETE_RECIPE, RECORD_RECIPE_VIEW, TOGGLE_FAVORITE_RECIPE } from "../graphql/mutations";
import RecipeModal from "../components/RecipeModal";
import { ConfirmDialog } from "../components";

export default function Home() {
  const { data, loading, error } = useQuery(HOME, { variables: { limit: 6, offset: 0 }, fetchPolicy: "cache-and-network" });
  const nav = useNavigate();
  const [toggleFavorite] = useMutation(TOGGLE_FAVORITE_RECIPE);
  const [recordView] = useMutation(RECORD_RECIPE_VIEW);
  const [deleteRecipe] = useMutation(DELETE_RECIPE);
  const [deleteIngredient] = useMutation(DELETE_INGREDIENT);
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">Error: {error.message}</p>;

  const favSet = new Set<string>((data?.favoriteRecipes || []).map((r: any) => r.id));
  const sections = [
    { title: "My Ingredients", items: (data?.myIngredients || []).map((ing: any) => ({
      id: ing.id,
      title: ing.name,
      tags: ing.unit ? [ing.unit] : [],
      image: ing.image,
      imageLocal: ing.imageLocal,
      imageUrl: ing.imageUrl,
      imageBlurDataUrl: ing.imageBlurDataUrl,
    })) },
    { title: "My Recipes", items: data?.myRecipes || [] },
    { title: "Last viewed", items: data?.lastViewedRecipes || [] },
    { title: "My Favorites", items: data?.favoriteRecipes || [] },
  ];

  return (
    <div className="space-y-8">
      {sections.map(s => (
        <section key={s.title} className="space-y-3">
          <h2 className="text-xl font-semibold">{s.title}</h2>
          {s.items.length === 0 ? (
            <p className="text-gray-500">{s.title === "My Ingredients" ? "No ingredients yet." : "No recipes yet."}</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {s.items.map((r: any) => (
                <RecipeCard
                  key={r.id}
                  food={r}
                  selectable={false}
                  isFavorite={favSet.has(r.id)}
                  hideFavorite={s.title === "My Ingredients"}
                  onDelete={s.title === "My Recipes" || s.title === "My Ingredients" ? (id) => setConfirmId(`${s.title}:${id}`) : undefined}
                  onToggleFavorite={async (id) => {
                    try {
                      await toggleFavorite({
                        variables: { id },
                        refetchQueries: [
                          { query: HOME, variables: { limit: 6, offset: 0 } },
                          { query: FAVORITES, variables: { limit: 21, offset: 0 } },
                          { query: FAVORITE_RECIPE_IDS, variables: { limit: 100, offset: 0 } },
                        ],
                        awaitRefetchQueries: true,
                      });
                    } catch (e: any) {
                      const msg = e?.message || "";
                      if (msg.includes("Unauthorized")) nav("/");
                    }
                  }}
                  onView={async (id) => { try { await recordView({ variables: { id } }); } catch {}; setOpenId(id); }}
                />
              ))}
            </ul>
          )}
        </section>
      ))}
      {/* Delete controls under My Recipes */}
      {sections[0].items.length > 0 && (
        <div className="hidden" />
      )}
      {openId && <RecipeModal id={openId} onClose={() => setOpenId(null)} />}
      <ConfirmDialog
        open={!!confirmId}
        title={confirmId?.startsWith("My Ingredients:") ? "Delete ingredient?" : "Delete recipe?"}
        message={confirmId?.startsWith("My Ingredients:") ? "This action cannot be undone. The ingredient will be permanently removed." : "This action cannot be undone. The recipe will be permanently removed."}
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setConfirmId(null)}
        onConfirm={async () => {
          const token = confirmId!;
          setConfirmId(null);
          const [section, id] = token.split(":");
          try {
            if (section === "My Ingredients") {
              await deleteIngredient({
                variables: { id },
                refetchQueries: [{ query: HOME, variables: { limit: 6, offset: 0 } }],
                awaitRefetchQueries: true,
              });
            } else {
              await deleteRecipe({
                variables: { id },
                refetchQueries: [{ query: HOME, variables: { limit: 6, offset: 0 } }],
                awaitRefetchQueries: true,
              });
            }
          } catch (e: any) {
            const msg = e?.message || "";
            if (msg.includes("Unauthorized")) nav("/");
          }
        }}
      />
    </div>
  );
}