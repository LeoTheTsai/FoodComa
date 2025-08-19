import { useMutation, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { FAVORITES, FAVORITE_RECIPE_IDS, HOME, RECIPES } from "../graphql/queries";
import { RECORD_RECIPE_VIEW, TOGGLE_FAVORITE_RECIPE } from "../graphql/mutations";
import { useMemo, useState } from "react";
import RecipeCard from "../components/RecipeCard";
import RecipeModal from "../components/RecipeModal";
import RecipeToolbar from "../components/RecipeToolbar";

export default function Recipes() {
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const LIMIT = 21;
  const [page, setPage] = useState(0);
  const { data, loading, error, refetch } = useQuery(RECIPES, { variables: { limit: LIMIT, offset: 0, search: "" } });
  const favQ = useQuery(FAVORITE_RECIPE_IDS, { variables: { limit: 100, offset: 0 } });
  const [toggleFavorite] = useMutation(TOGGLE_FAVORITE_RECIPE);
  const [recordView] = useMutation(RECORD_RECIPE_VIEW);
  const nav = useNavigate();
  const [selected] = useState<string[]>([]);

  // compute totals safely before any early returns
  const totalCount: number = data?.recipesCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / LIMIT));

  // Build page items with ellipses (hook must not be conditional)
  const pageItems = useMemo<(number | string)[]>(() => {
    const items: (number | string)[] = [];
    const current = page + 1;
    const siblings = 1; // how many pages on each side of current
    const first = 1;
    const last = totalPages;
    if (last <= 1) return [1];

    items.push(first);
    const left = Math.max(current - siblings, first + 1);
    const right = Math.min(current + siblings, last - 1);

    if (left > first + 1) items.push("…");
    for (let i = left; i <= right; i++) items.push(i);
    if (right < last - 1) items.push("…");
    if (last > first) items.push(last);
    return Array.from(new Set(items));
  }, [page, totalPages]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">Error: {error.message}</p>;

  const onSearch = async () => { setPage(0); await refetch({ search, limit: LIMIT, offset: 0 }); };

  const canPrev = page > 0;
  const canNext = page + 1 < totalPages;

  const goTo = async (p: number) => {
    const next = Math.max(0, Math.min(totalPages - 1, p));
    setPage(next);
    await refetch({ search, limit: LIMIT, offset: next * LIMIT });
  };

  const pageBack = async () => { if (!canPrev) return; await goTo(page - 1); };
  const pageNext = async () => { if (!canNext) return; await goTo(page + 1); };

  return (
    <div className="space-y-3">
  <RecipeToolbar title="Recipes" search={search} setSearch={setSearch} onSearch={onSearch} newHref="/recipes/new" placeholder="Tag or Name" />
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {data.recipes.map((r: any) => (
          <RecipeCard
            key={r.id}
            food={r}
            selectable={false}
            isFavorite={new Set<string>((favQ.data?.favoriteRecipes || []).map((x: any) => x.id)).has(r.id)}
            onToggleFavorite={async (id) => {
              try {
                await toggleFavorite({
                  variables: { id },
                  refetchQueries: [
                    { query: RECIPES, variables: { limit: LIMIT, offset: page * LIMIT, search } },
                    { query: FAVORITE_RECIPE_IDS, variables: { limit: 100, offset: 0 } },
                    { query: HOME, variables: { limit: 6, offset: 0 } },
                    { query: FAVORITES, variables: { limit: 21, offset: 0 } },
                  ],
                  awaitRefetchQueries: true,
                });
              } catch (e: any) {
                const msg = e?.message || "";
                if (msg.includes("Unauthorized")) nav("/");
              }
            }}
            onView={async (id) => { 
              try { await recordView({ variables: { id } }); } catch {}
              setOpenId(id);
            }}
          />
        ))}
      </ul>
      {openId && <RecipeModal id={openId} onClose={() => setOpenId(null)} />}
      <div className="flex items-center justify-center gap-2">
        <button
          disabled={!canPrev}
          onClick={pageBack}
          aria-label="Previous page"
          title="Previous"
          className="p-2 border rounded-full disabled:opacity-50 hover:bg-gray-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        {pageItems.map((it, idx) =>
          typeof it === "number" ? (
            <button
              key={`${it}-${idx}`}
              onClick={() => goTo(it - 1)}
              className={`px-3 py-1 border rounded ${it === page + 1 ? "bg-emerald-600 text-white border-emerald-600" : "hover:bg-gray-50"}`}
            >
              {it}
            </button>
          ) : (
            <span key={`dots-${idx}`} className="px-2 text-gray-500">{it}</span>
          )
        )}
        <button
          disabled={!canNext}
          onClick={pageNext}
          aria-label="Next page"
          title="Next"
          className="p-2 border rounded-full disabled:opacity-50 hover:bg-gray-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
