import { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { RECIPE } from "../graphql/queries";
import ImageWithBlur from "./ImageWithBlur";

export default function RecipeModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { data, loading, error } = useQuery(RECIPE, { variables: { id } });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const r = data?.recipe;

  return (
    <div className="fixed inset-0 z-[200]" aria-modal="true" role="dialog">
      {/* Fullscreen backdrop above any sticky headers */}
      <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm supports-[backdrop-filter]:backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 z-[210] p-4 md:p-8 flex items-center justify-center">
        <div
          className="relative w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 md:h-[80vh] max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            aria-label="Close"
            className="absolute top-3 right-3 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/80 border border-gray-200 hover:bg-white shadow-sm"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="grid md:grid-cols-2 h-full">
            <div className="bg-gray-50 md:h-full">
              {loading ? (
                <div className="h-72 md:h-full min-h-[18rem] animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
              ) : error ? (
                <div className="p-6 text-red-600">{error.message}</div>
              ) : r ? (
                <ImageWithBlur
                  srcs={[r.image, r.imageLocal, r.imageUrl]}
                  blurDataURL={r.imageBlurDataUrl}
                  alt={r.title || "Recipe"}
                  className="w-full h-72 md:h-full"
                />
              ) : (
                <div className="p-6 text-gray-600">Recipe not found.</div>
              )}
            </div>

            <div className="p-6 md:p-8 space-y-4 md:overflow-y-auto md:h-full thin-scroll">
              {r ? (
                <>
                  <div className="space-y-2">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">{r.title}</h2>
                    {Array.isArray(r.tags) && r.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {r.tags.map((t: string, i: number) => (
                          <span key={i} className="inline-flex items-center h-8 px-3 rounded-full text-sm leading-none font-medium bg-emerald-50 border border-emerald-100 text-emerald-800 whitespace-nowrap">#{t}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {r.description && (
                    <p className="text-gray-700 leading-relaxed">{r.description}</p>
                  )}

                  {Array.isArray(r.ingredients) && r.ingredients.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Ingredients</h3>
                      <ul className="list-disc pl-5 space-y-1 text-gray-800">
                        {r.ingredients.map((ing: any) => (
                          <li key={ing.id}>
                            {ing.name}
                            {ing.unit ? <span className="text-gray-500"> {` – ${ing.unit}`}</span> : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {r.steps && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Steps</h3>
                      {Array.isArray(r.steps) ? (
                        <ol className="list-decimal pl-5 space-y-2 text-gray-800">
                          {r.steps.map((s: string, i: number) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ol>
                      ) : (
                        <p className="whitespace-pre-line text-gray-800">{String(r.steps)}</p>
                      )}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
