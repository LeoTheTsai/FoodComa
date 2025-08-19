import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { CREATE_RECIPE, MIX_INGREDIENTS } from "../graphql/mutations";
import { useLocation } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { ImageWithBlur, Select, Dropdown } from "../components";
import { HOME, INGREDIENTS, INGREDIENTS_BY_IDS } from "../graphql/queries";

export default function Mixer() {
  const loc = useLocation() as any;
  const presetIngredientIds: string[] = loc.state?.ids || loc.state?.ingredientIds || [];
  const [selected, setSelected] = useState<string[]>(presetIngredientIds);
  const [cuisine, setCuisine] = useState<string>("");
  const [time, setTime] = useState<number>(30);
  const [diet, setDiet] = useState<string[]>([]);
  const [dietText, setDietText] = useState("");
  const [exclude, setExclude] = useState<string[]>([]);
  const [excludeText, setExcludeText] = useState("");
  const [skillLevel, setSkillLevel] = useState<string>("");
  const [budget, setBudget] = useState<string>("");
  const [mix, { data, loading, error }] = useMutation(MIX_INGREDIENTS);
  const [createRecipe, { loading: saving, error: saveError, data: saveData }] = useMutation(CREATE_RECIPE);
  const [search, setSearch] = useState("");
  const [openSuggest, setOpenSuggest] = useState(false);
  const suggestWrapRef = useRef<HTMLDivElement | null>(null);
  const [fetchIngredients, { data: searchData }] = useLazyQuery(INGREDIENTS);
  const ingList = useMemo(() => searchData?.ingredients || [], [searchData]);
  const [ingMap, setIngMap] = useState<Record<string, { name: string; unit?: string | null }>>({});
  useEffect(() => {
    if (ingList?.length) {
      setIngMap(prev => {
        const next = { ...prev };
        ingList.forEach((i: any) => { next[i.id] = { name: i.name, unit: i.unit }; });
        return next;
      });
    }
  }, [ingList]);

  // hydrate preset chips
  const { data: presetData } = useQuery(INGREDIENTS_BY_IDS, { skip: !selected.length, variables: { ids: selected } });
  useEffect(() => {
    const arr = presetData?.ingredientsByIds || [];
    if (!arr.length) return;
    setIngMap(prev => {
      const next = { ...prev };
      arr.forEach((i: any) => { next[i.id] = { name: i.name, unit: i.unit }; });
      return next;
    });
  }, [presetData]);

  useEffect(() => {
    const s = search.trim();
    if (s) {
      setOpenSuggest(true);
      fetchIngredients({ variables: { search: s, limit: 10, offset: 0 } });
    } else {
      setOpenSuggest(false);
    }
  }, [search]);

  // close suggestions when clicking outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!suggestWrapRef.current) return;
      if (!suggestWrapRef.current.contains(e.target as Node)) {
        setOpenSuggest(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const idList = selected;
  const addIngredient = (id: string) => {
    if (!selected.includes(id)) setSelected(prev => [...prev, id]);
    // Clear search box after selecting an ingredient
    setSearch("");
    setOpenSuggest(false);
  };
  const removeIngredient = (id: string) => setSelected(prev => prev.filter(x => x !== id));
  const addFirstSuggestion = () => {
    const first = ingList?.[0];
    if (first) {
      addIngredient(first.id);
      // search is cleared by addIngredient
    }
  };

  const addDiet = (raw?: string) => {
    const v = (raw ?? dietText).trim().toLowerCase();
    if (!v) return; if (diet.includes(v)) { setDietText(""); return; }
    setDiet(prev => [...prev, v]); setDietText("");
  };
  const removeDiet = (i: number) => setDiet(prev => prev.filter((_, idx) => idx !== i));

  const addExclude = (raw?: string) => {
    const v = (raw ?? excludeText).trim().toLowerCase();
    if (!v) return; if (exclude.includes(v)) { setExcludeText(""); return; }
    setExclude(prev => [...prev, v]); setExcludeText("");
  };
  const removeExclude = (i: number) => setExclude(prev => prev.filter((_, idx) => idx !== i));

  const onMix = () => {
    const constraints: any = {
      maxTimeMinutes: time || undefined,
      cuisine: cuisine || undefined,
      diet: diet.length ? diet : undefined,
      exclude: exclude.length ? exclude : undefined,
      skillLevel: skillLevel || undefined,
      budget: budget || undefined,
    };
  return mix({ variables: { ids: idList, c: constraints } });
  };

  return (
    <div className="space-y-4">
      {/* Input Card */}
      <div className="rounded-2xl border border-emerald-100 bg-white/80 backdrop-blur p-4 md:p-6 shadow space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Mixer</h2>
          <div className="text-sm text-gray-500">Pick ingredients, press Enter to chip</div>
        </div>

        {/* Ingredient chips and search */}
  <div className="space-y-2" ref={suggestWrapRef}>
          <div className="w-full rounded-xl border border-emerald-200 bg-white/90 px-2 py-2">
            <div className="flex flex-wrap gap-2">
              {selected.map((id) => {
                const meta = ingMap[id];
                const label = meta?.name || id;
                const unit = meta?.unit ? ` (${meta.unit})` : "";
                return (
                  <span key={id} className="inline-flex items-center h-8 px-3 rounded-full bg-emerald-50 border border-emerald-100 text-sm text-emerald-800 leading-none">
                    <span className="mr-2">{label}{unit}</span>
                    <button type="button" onClick={() => removeIngredient(id)} aria-label="Remove" className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                );
              })}
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => { if ((ingList?.length || 0) > 0 && search.trim()) setOpenSuggest(true); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFirstSuggestion(); setOpenSuggest(false); } }}
                placeholder="Search ingredients and press Enter"
                className="flex-1 min-w-[12rem] bg-transparent outline-none px-2 py-1 text-sm text-gray-700"
              />
            </div>
          </div>
          {openSuggest && ingList.length > 0 && (
            <div className="max-h-48 overflow-auto border border-emerald-100 rounded-xl thin-scroll">
              {ingList.map((i: any) => (
                <button key={i.id} onClick={() => addIngredient(i.id)} className="w-full flex items-center justify-between px-3 py-2 border-b last:border-0 hover:bg-emerald-50/40 text-left">
                  <span className="text-sm text-gray-800">{i.name}{i.unit ? ` (${i.unit})` : ""}</span>
                  <span className="text-xs text-emerald-700">Add</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Constraints */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Cuisine</label>
            <input
              className="w-full rounded-xl border border-emerald-200 bg-white/90 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="e.g., Italian, Thai"
              value={cuisine}
              onChange={e => setCuisine(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Max Time (minutes)</label>
            <input
              type="number"
              min={5}
              className="w-full rounded-xl border border-emerald-200 bg-white/90 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              value={time}
              onChange={e => setTime(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Diet (chips)</label>
            <div className="w-full rounded-xl border border-emerald-200 bg-white/90 px-2 py-2">
              <div className="flex flex-wrap gap-2">
                {diet.map((t, i) => (
                  <span key={`${t}-${i}`} className="inline-flex items-center h-8 px-3 rounded-full bg-emerald-50 border border-emerald-100 text-sm text-emerald-800 leading-none">
                    <span className="mr-2">#{t}</span>
                    <button type="button" onClick={() => removeDiet(i)} aria-label={`Remove ${t}`} className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                ))}
                <input
                  value={dietText}
                  onChange={(e) => setDietText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addDiet(); } }}
                  placeholder="Type a diet tag and Enter"
                  className="flex-1 min-w-[8rem] bg-transparent outline-none px-2 py-1 text-sm text-gray-700"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Exclude (chips)</label>
            <div className="w-full rounded-xl border border-emerald-200 bg-white/90 px-2 py-2">
              <div className="flex flex-wrap gap-2">
                {exclude.map((t, i) => (
                  <span key={`${t}-${i}`} className="inline-flex items-center h-8 px-3 rounded-full bg-emerald-50 border border-emerald-100 text-sm text-emerald-800 leading-none">
                    <span className="mr-2">#{t}</span>
                    <button type="button" onClick={() => removeExclude(i)} aria-label={`Remove ${t}`} className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                ))}
                <input
                  value={excludeText}
                  onChange={(e) => setExcludeText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addExclude(); } }}
                  placeholder="Type an exclude tag and Enter"
                  className="flex-1 min-w-[8rem] bg-transparent outline-none px-2 py-1 text-sm text-gray-700"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Skill Level</label>
            <Dropdown
              value={skillLevel}
              onChange={setSkillLevel}
              options={[
                { value: "", label: "Any" },
                { value: "beginner", label: "Beginner" },
                { value: "intermediate", label: "Intermediate" },
                { value: "advanced", label: "Advanced" },
              ]}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Budget</label>
            <Dropdown
              value={budget}
              onChange={setBudget}
              options={[
                { value: "", label: "Any" },
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
              ]}
            />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button
            onClick={onMix}
            disabled={loading || idList.length < 2}
            className="px-5 py-2.5 rounded-full text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Mixing..." : `Mix (${idList.length || 0})`}
          </button>
        </div>
      </div>

      {/* Result section below the form: loading → error → result */}
      {loading ? (
        <div className="rounded-2xl border border-emerald-100 bg-white/80 backdrop-blur p-6 flex items-center gap-4" aria-busy="true">
          <svg className="w-6 h-6 animate-spin text-emerald-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <div>
            <p className="font-semibold text-gray-900">Generating your recipe…</p>
            <p className="text-sm text-gray-600">This may take a few seconds. Hang tight while we mix and render the image.</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 p-4">
          Error mixing ingredients. Please try again.
        </div>
      ) : (() => {
        const result = data?.mixIngredients ?? data?.mixRecipes;
        if (!data) return null;
        if (!result) {
          return (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 p-4">
              No recipe result returned.
            </div>
          );
        }
        return (
          <div className="rounded-2xl border border-emerald-100 bg-white/80 backdrop-blur shadow overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="bg-gray-50">
                <ImageWithBlur srcs={[result.imageUrl]} alt={result.title || "Mixed recipe image"} className="w-full h-72 md:h-full" />
              </div>
              <div className="p-6 md:p-8 space-y-4 md:overflow-y-auto md:h-full thin-scroll">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-2xl font-extrabold text-gray-900 flex-1">{result.title}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          try {
                            await createRecipe({
                              variables: {
                                title: result.title || "Untitled",
                                desc: null,
                                ingredients: idList,
                                tags: Array.isArray(result.tags) ? result.tags : [],
                                ingredientsText: Array.isArray(result.ingredients) ? result.ingredients : [],
                                steps: Array.isArray(result.steps) ? result.steps : [],
                              },
                              refetchQueries: [{ query: HOME, variables: { limit: 6, offset: 0 } }],
                              awaitRefetchQueries: false,
                            });
                          } catch {}
                        }}
                        disabled={saving}
                        className="px-4 py-2 rounded-full bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-60"
                        aria-disabled={saving}
                      >
                        {saving ? "Saving…" : saveData ? "Saved" : "Save to My Recipes"}
                      </button>
                    </div>
                  </div>
                  {Array.isArray(result.tags) && result.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {result.tags.map((t: string, i: number) => (
                        <span key={`${t}-${i}`} className="inline-flex items-center h-8 px-3 rounded-full text-sm leading-none font-medium bg-emerald-50 border border-emerald-100 text-emerald-800 whitespace-nowrap">#{t}</span>
                      ))}
                    </div>
                  )}
                  {result.timeMinutes && <p className="text-gray-600">~{result.timeMinutes} min</p>}
                  {saveError && (
                    <p className="text-sm text-rose-600">Failed to save recipe. Please try again.</p>
                  )}
                </div>

                {Array.isArray(result.ingredients) && result.ingredients.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Ingredients</h4>
                    <ul className="list-disc pl-5 space-y-1 text-gray-800">
                      {result.ingredients.map((x: string, i: number) => <li key={i}>{x}</li>)}
                    </ul>
                  </div>
                )}

                {Array.isArray(result.steps) && result.steps.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Steps</h4>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-800">
                      {result.steps.map((x: string, i: number) => <li key={i}>{x}</li>)}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
