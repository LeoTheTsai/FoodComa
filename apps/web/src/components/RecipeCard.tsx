import ImageWithBlur from "./ImageWithBlur";
type Props = {
    food: any;
    selected?: string[];
    toggle?: (id: string) => void;
    selectable?: boolean;
    isFavorite?: boolean;
    onToggleFavorite?: (id: string) => void;
    onView?: (id: string) => void;
    onDelete?: (id: string) => void;
    hideFavorite?: boolean;
};

export default function RecipeCard({ food, selected, toggle, selectable = true, isFavorite, onToggleFavorite, onView, onDelete, hideFavorite = false }: Props) {
    const { id, title, image, imageLocal, imageUrl, imageBlurDataUrl, description, tags } = food;
    const srcs = [image, imageLocal, imageUrl];
    const isSelected = !!selected?.includes?.(id);
    return (
    <div className="max-w-sm rounded-2xl overflow-hidden shadow hover:shadow-lg transition-shadow border border-emerald-100/80 bg-white/80 backdrop-blur-md">
            {selectable && selected && toggle && (
                <div className="flex items-center p-2">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggle(food.id)}
                        className="w-4 h-4 accent-emerald-600"
                    />
                </div>
            )}
                        <div className="relative">
                            {onDelete && (
                                <button
                                    aria-label="Delete recipe"
                                    onClick={(e) => { e.stopPropagation(); onDelete?.(id); }}
                                    className="absolute top-2 left-2 z-10 p-2 rounded-full backdrop-blur bg-white/70 border border-rose-200 hover:bg-rose-50"
                                    title="Delete"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-rose-600">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 7h12M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m-8 0l1 12a2 2 0 002 2h2a2 2 0 002-2l1-12" />
                                    </svg>
                                </button>
                            )}
                            {!hideFavorite && (
                                <button
                                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                                    onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(id); }}
                                    className={`absolute top-2 right-2 z-10 p-2 rounded-full backdrop-blur bg-white/70 border ${isFavorite ? "border-amber-300" : "border-gray-200"}`}
                                    title={isFavorite ? "Unfavorite" : "Favorite"}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFavorite ? "#f59e0b" : "none"} stroke={isFavorite ? "#f59e0b" : "currentColor"} className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                    </svg>
                                </button>
                            )}
                            <div onClick={() => onView?.(id)}>
                                <ImageWithBlur
                                    srcs={srcs}
                                    blurDataURL={imageBlurDataUrl}
                                    alt={title || "Recipe photo"}
                                    className="w-full h-40"
                                />
                            </div>
                        </div>
            <div className="px-6 py-4">
                <div className="font-bold text-lg mb-1 text-gray-900 title-2l">{title}</div>
                {description && <p className="text-gray-600 text-sm">{description}</p>}
            </div>
            {Array.isArray(tags) && tags.length > 0 && (
                <div className="px-6 pt-4 pb-2">
                    {tags.map((tag: string, index: number) => (
                        <span
                            key={index}
                            className="inline-flex items-center h-8 px-3 bg-emerald-50/70 backdrop-blur-sm border border-emerald-100 rounded-full text-sm leading-none font-medium text-emerald-800 mr-2 mb-2 whitespace-nowrap"
                        >
                            {`#${tag}`}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
