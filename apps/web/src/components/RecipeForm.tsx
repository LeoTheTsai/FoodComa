import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLazyQuery, useMutation } from "@apollo/client";
import { INGREDIENTS } from "../graphql/queries";
import { CREATE_INGREDIENT, CREATE_RECIPE, UPDATE_RECIPE } from "../graphql/mutations";

const Schema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  ingredientIds: z.array(z.string()),
  ingredientsText: z.array(z.string()).default([]),
  steps: z.array(z.string()).default([]),
});
type Form = z.infer<typeof Schema>;

export default function RecipeForm({
  mode, initial, onSaved
}: {
  mode: "create" | "edit";
  initial?: any;
  onSaved: () => void;
}) {
  const { register, handleSubmit, control, setValue, watch } = useForm<Form>({
    resolver: zodResolver(Schema) as any,
    defaultValues: mode === "edit" && initial ? {
      id: initial.id,
      title: initial.title,
      description: initial.description || "",
      tags: (initial.tags || []),
      ingredientIds: initial.ingredients.map((i: any) => i.id),
      ingredientsText: [],
      steps: initial.steps.length ? initial.steps : [""],
    } : { title: "", description: "", tags: [], ingredientIds: [], ingredientsText: [""], steps: [""] },
  });

  const { fields: stepsFields, append: stepsAppend, remove: stepsRemove } = (useFieldArray as any)({ control, name: "steps" });
  const { fields: ingTextFields, append: ingTextAppend, remove: ingTextRemove } = (useFieldArray as any)({ control, name: "ingredientsText" });

  const [search, setSearch] = useState("");
  const [fetchIngredients, { data: searchData }] = useLazyQuery(INGREDIENTS);
  const [createIngredient] = useMutation(CREATE_INGREDIENT);
  const [createRecipe, { loading: creating }] = useMutation(CREATE_RECIPE);
  const [updateRecipe, { loading: updating }] = useMutation(UPDATE_RECIPE);

  // Map of ingredient id -> { name, unit } so we can render nice chips for selected items
  const [ingMap, setIngMap] = useState<Record<string, { name: string; unit?: string | null }>>({});

  // Seed from initial (edit mode)
  useEffect(() => {
    if (mode === "edit" && initial?.ingredients?.length) {
      setIngMap(prev => {
        const next = { ...prev };
        (initial.ingredients || []).forEach((i: any) => { next[i.id] = { name: i.name, unit: i.unit }; });
        return next;
      });
    }
  }, [mode, initial]);

  // Merge in latest search results
  useEffect(() => {
    const list = searchData?.ingredients || [];
    if (!list.length) return;
    setIngMap(prev => {
      const next = { ...prev };
      list.forEach((i: any) => { next[i.id] = { name: i.name, unit: i.unit }; });
      return next;
    });
  }, [searchData]);

  useEffect(() => { if (search.trim()) fetchIngredients({ variables: { search, limit: 20 } }); }, [search]);
  const ingredientIds = watch("ingredientIds");
  const available = searchData?.ingredients || [];
  const onAddId = (id: string) => !ingredientIds.includes(id) && setValue("ingredientIds", [...ingredientIds, id]);
  const onRemoveId = (id: string) => setValue("ingredientIds", ingredientIds.filter(x => x !== id));

  const submit = async (values: Form) => {
    const tags = (values.tags || []).map(s => s.trim()).filter(Boolean).map(s => s.toLowerCase());
    if (mode === "create") {
      await createRecipe({ variables: {
        title: values.title, desc: values.description, ingredients: values.ingredientIds, tags,
        ingredientsText: values.ingredientsText?.filter(Boolean) || [],
        steps: values.steps?.filter(Boolean) || [],
      }, refetchQueries: ["Recipes"] });
    } else {
      await updateRecipe({ variables: {
        id: values.id!, title: values.title, desc: values.description, ingredients: values.ingredientIds, tags,
        ingredientsText: values.ingredientsText?.filter(Boolean) || [],
        steps: values.steps?.filter(Boolean) || [],
      }, refetchQueries: ["Recipe","Recipes"] });
    }
    onSaved();
  };

  const [newIngName, setNewIngName] = useState("");
  const [newIngUnit, setNewIngUnit] = useState("");
  const addNewIngredient = async () => {
    if (!newIngName.trim()) return;
    const res = await createIngredient({ variables: { name: newIngName.trim(), unit: newIngUnit || null } });
    const id = res.data.createIngredient.id as string;
    setValue("ingredientIds", [...ingredientIds, id]);
  // capture label for the new ingredient so the chip shows a friendly name
  setIngMap(prev => ({ ...prev, [id]: { name: newIngName.trim(), unit: newIngUnit || undefined } }));
    setNewIngName(""); setNewIngUnit("");
  };

  const [tagText, setTagText] = useState("");
  const tags = watch("tags");
  const addTag = (raw?: string) => {
    const t = (raw ?? tagText).trim();
    if (!t) return;
    const val = t.toLowerCase();
    if (tags.includes(val)) { setTagText(""); return; }
    setValue("tags", [...tags, val], { shouldDirty: true, shouldValidate: true });
    setTagText("");
  };
  const removeTag = (idx: number) => {
    setValue("tags", tags.filter((_: string, i: number) => i !== idx), { shouldDirty: true, shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6 rounded-2xl border border-emerald-100 bg-white/80 backdrop-blur-md p-6 shadow">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input className="w-full rounded-xl border border-emerald-200 bg-white/90 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300" {...register("title")} placeholder="e.g., Weeknight Stir-Fry" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Tags</label>
          <div className="w-full rounded-xl border border-emerald-200 bg-white/90 px-2 py-2">
            <div className="flex flex-wrap gap-2">
              {tags.map((t: string, idx: number) => (
                <span key={`${t}-${idx}`} className="inline-flex items-center h-8 px-3 rounded-full bg-emerald-50 border border-emerald-100 text-sm text-emerald-800 leading-none">
                  <span className="mr-2">#{t}</span>
                  <button type="button" onClick={() => removeTag(idx)} aria-label={`Remove ${t}`} className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              <input
                value={tagText}
                onChange={(e) => setTagText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Type a tag and press Enter"
                className="flex-1 min-w-[8rem] bg-transparent outline-none px-2 py-1 text-sm text-gray-700"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea className="w-full rounded-xl border border-emerald-200 bg-white/90 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300" rows={3} {...register("description")} placeholder="Short overview, flavors, or tips" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Pick Ingredients</label>
          <input className="w-full rounded-xl border border-emerald-200 bg-white/90 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ingredients..." />
          <div className="max-h-40 overflow-auto border border-emerald-100 rounded-xl thin-scroll">
            {available.map((i: any) => (
              <div key={i.id} className="flex items-center justify-between px-3 py-2 border-b last:border-0">
                <span className="text-sm text-gray-800">{i.name}{i.unit ? ` (${i.unit})` : ""}</span>
                <button type="button" onClick={() => onAddId(i.id)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  aria-label="Add ingredient"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>
            ))}
            {!available.length && <div className="px-3 py-2 text-sm text-gray-500">No results</div>}
          </div>

          <div className="flex gap-2 mt-2">
            <input className="rounded-xl border border-emerald-200 bg-white/90 px-2 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-300" placeholder="New ingredient name" value={newIngName} onChange={e => setNewIngName(e.target.value)} />
            <input className="rounded-xl border border-emerald-200 bg-white/90 px-2 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-emerald-300" placeholder="unit: cups/g/clove" value={newIngUnit} onChange={e => setNewIngUnit(e.target.value)} />
            <button type="button" onClick={addNewIngredient} className="px-3 py-2 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100">Create</button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Selected Ingredients</label>
          <div className="min-h-[3rem] border border-emerald-100 rounded-xl p-2">
            {ingredientIds.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {ingredientIds.map((id) => {
                  const meta = ingMap[id];
                  const label = meta?.name || id;
                  const unit = meta?.unit ? ` (${meta.unit})` : "";
                  return (
                    <span key={id} className="inline-flex items-center h-8 px-3 rounded-full bg-emerald-50 border border-emerald-100 text-sm text-emerald-800">
                      <span className="mr-2">{label}{unit}</span>
                    <button type="button" onClick={() => onRemoveId(id)} aria-label="Remove" className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500">None selected</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Ingredient Text (optional)</label>
          {ingTextFields.map((f: { id: string }, idx: number) => (
            <div key={f.id} className="flex gap-2">
              <input className="rounded-xl border border-emerald-200 bg-white/90 px-2 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-300" {...register(`ingredientsText.${idx}` as const)} placeholder="e.g., 200 g rice, cooked" />
              <button type="button" onClick={() => ingTextRemove(idx)} className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-emerald-200 hover:bg-emerald-50" aria-label="Remove line">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-gray-700">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 12h12" />
                </svg>
              </button>
            </div>
          ))}
          <button type="button" onClick={() => ingTextAppend("")} className="px-3 py-2 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100">+ Add line</button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Steps</label>
          {stepsFields.map((f: { id: string }, idx: number) => (
            <div key={f.id} className="flex gap-2">
              <input className="rounded-xl border border-emerald-200 bg-white/90 px-2 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-300" {...register(`steps.${idx}` as const)} placeholder={`Step ${idx + 1}`} />
              <button type="button" onClick={() => stepsRemove(idx)} className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-emerald-200 hover:bg-emerald-50" aria-label="Remove step">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-gray-700">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 12h12" />
                </svg>
              </button>
            </div>
          ))}
          <button type="button" onClick={() => stepsAppend("")} className="px-3 py-2 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100">+ Add step</button>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={creating || updating} className="px-5 py-2.5 rounded-full text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60">
          {mode === "create" ? (creating ? "Creating..." : "Create Recipe") : (updating ? "Saving..." : "Save Changes")}
        </button>
      </div>
    </form>
  );
}
