import { useMutation, useQuery } from "@apollo/client";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FAVORITES, HOME, FAVORITE_RECIPE_IDS } from "../graphql/queries";
import { RECORD_RECIPE_VIEW, TOGGLE_FAVORITE_RECIPE } from "../graphql/mutations";
import RecipeCard from "../components/RecipeCard";
import RecipeToolbar from "../components/RecipeToolbar";
import RecipeModal from "../components/RecipeModal";

export default function Favorites() {
  const LIMIT = 21;
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const { data, loading, error, refetch } = useQuery(FAVORITES, { variables: { search: "", limit: LIMIT, offset: 0 } });
  const [toggleFavorite] = useMutation(TOGGLE_FAVORITE_RECIPE);
  const [recordView] = useMutation(RECORD_RECIPE_VIEW);
  const nav = useNavigate();
  const [openId, setOpenId] = useState<string | null>(null);

  const totalCount: number = data?.favoriteRecipesCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / LIMIT));

  const pageItems = useMemo<(number | string)[]>(() => {
    const items: (number | string)[] = [];
    const current = page + 1;
    const siblings = 1;
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

  const canPrev = page > 0;
  const canNext = page + 1 < totalPages;

  const goTo = async (p: number) => {
    const next = Math.max(0, Math.min(totalPages - 1, p));
    setPage(next);
    await refetch({ search, limit: LIMIT, offset: next * LIMIT });
  };

  const pageBack = async () => { if (!canPrev) return; await goTo(page - 1); };
  const pageNext = async () => { if (!canNext) return; await goTo(page + 1); };

  const favSet = new Set<string>((data?.favoriteRecipes || []).map((r: any) => r.id));

  return (
    <div className="space-y-3">
  <RecipeToolbar title="Favorites" search={search} setSearch={setSearch} onSearch={async () => { setPage(0); await refetch({ search, limit: LIMIT, offset: 0 }); }} placeholder="Tag or Name" />
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {data.favoriteRecipes.map((r: any) => (
          <RecipeCard
            key={r.id}
            food={r}
            selectable={false}
            isFavorite={favSet.has(r.id)}
            onToggleFavorite={async (id) => {
              try {
                await toggleFavorite({
                  variables: { id },
                  refetchQueries: [
                    { query: FAVORITES, variables: { search, limit: LIMIT, offset: page * LIMIT } },
                    { query: HOME, variables: { limit: 6, offset: 0 } },
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
