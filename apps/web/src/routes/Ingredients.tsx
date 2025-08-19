import { useMutation, useQuery } from "@apollo/client";
import { INGREDIENTS } from "../graphql/queries";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImageWithBlur } from "../components";
import RecipeToolbar from "../components/RecipeToolbar";
import { CREATE_INGREDIENT } from "../graphql/mutations";

export default function Ingredients() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const LIMIT = 21;
  const [page, setPage] = useState(0);
  const { data, loading, error, refetch } = useQuery(INGREDIENTS, { variables: { limit: LIMIT, offset: 0, search: "" } });
  const [selected, setSelected] = useState<string[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [createIng, { loading: creating }] = useMutation(CREATE_INGREDIENT);

  // compute and prepare pagination hooks before early returns to keep hook order stable
  const totalCount: number = data?.ingredientsCount ?? 0;
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

  const toggle = (id: string) => setSelected(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]));
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
      <RecipeToolbar
        title="Ingredients"
        search={search}
        setSearch={setSearch}
        onSearch={onSearch}
        onNew={() => setShowNew(true)}
        onMix={() => navigate("/mixer", { state: { ids: selected } })}
        mixCount={selected.length}
      />
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {data.ingredients.map((ing: any) => {
          const srcs = [ing.image, ing.imageLocal, ing.imageUrl];
          const isSelected = selected.includes(ing.id);
          return (
            <li key={ing.id}>
              <div className="rounded-2xl border border-emerald-100 bg-white/80 overflow-hidden backdrop-blur hover:shadow transition-shadow">
                <div className="relative">
                  <button
                    aria-label={isSelected ? "Deselect ingredient" : "Select ingredient"}
                    title={isSelected ? "Deselect" : "Select"}
                    onClick={(e) => { e.stopPropagation(); toggle(ing.id); }}
                    className={`absolute top-2 right-2 z-10 p-2 rounded-full border ${isSelected ? "bg-emerald-600 border-emerald-600 text-white shadow-sm" : "backdrop-blur bg-white/70 border-gray-200 text-gray-700"}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </button>
                  <ImageWithBlur srcs={srcs} blurDataURL={ing.imageBlurDataUrl} alt={ing.name || "Ingredient image"} className="w-full h-40" />
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{ing.name}</div>
                    {ing.unit && <div className="text-sm text-gray-600">{ing.unit}</div>}
                  </div>
                  {/* selection moved to the top-right icon for a consistent style with recipe hearts */}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
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
  {pageItems.map((it: number | string, idx: number) =>
          typeof it === "number" ? (
            <button
              key={`${it}-${idx}`}
              onClick={() => goTo(it - 1)}
              className={`px-3 py-1 border rounded ${it === page + 1 ? "bg-emerald-600 text-white border-emerald-600" : "hover:bg-gray-50 dark:hover:bg-gray-700"}`}
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

      {showNew && (
        <div className="fixed inset-0 z-[9999]">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowNew(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-white/90 backdrop-blur shadow-xl">
              <div className="p-5 space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Add Ingredient</h3>
                <div className="space-y-2">
                  <label className="block text-sm text-gray-700">Name</label>
                  <input value={newName} onChange={e => setNewName(e.target.value)} className="w-full rounded-xl border border-emerald-200 bg-white/90 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300" placeholder="e.g., Basil" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-gray-700">Unit (optional)</label>
                  <input value={newUnit} onChange={e => setNewUnit(e.target.value)} className="w-full rounded-xl border border-emerald-200 bg-white/90 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300" placeholder="e.g., leaves, g, ml" />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-full border border-emerald-200 bg-white text-gray-700 hover:bg-emerald-50">Cancel</button>
                  <button
                    disabled={!newName.trim() || creating}
                    onClick={async () => {
                      if (!newName.trim()) return;
                      try {
                        await createIng({ variables: { name: newName.trim(), unit: newUnit.trim() || null } });
                        setNewName(""); setNewUnit(""); setShowNew(false);
                        await refetch({ search, limit: LIMIT, offset: page * LIMIT });
                      } catch {}
                    }}
                    className="px-4 py-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {creating ? "Adding…" : "Add"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
