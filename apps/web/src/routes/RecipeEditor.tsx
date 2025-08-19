import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { RECIPE } from "../graphql/queries";
import RecipeForm from "../components/RecipeForm";

export default function RecipeEditor({ mode, onSaved }: { mode: "create" | "edit"; onSaved: () => void }) {
  const { id } = useParams();
  const { data, loading, error } = useQuery(RECIPE, { variables: { id }, skip: mode === "create" });

  if (mode === "edit") {
    if (loading) return <p>Loading…</p>;
    if (error) return <p className="text-red-600">{error.message}</p>;
    const r = data?.recipe;
    if (!r) return <p>Not found</p>;
    return (
      <RecipeForm
        mode="edit"
        onSaved={onSaved}
        initial={{ id: r.id, title: r.title, description: r.description, tags: r.tags, steps: r.steps, ingredients: r.ingredients }}
      />
    );
  }
  return <RecipeForm mode="create" onSaved={onSaved} />;
}
