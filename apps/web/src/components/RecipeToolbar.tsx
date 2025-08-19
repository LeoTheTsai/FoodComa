import { Link } from "react-router-dom";

type Props = {
  title: string;
  search: string;
  setSearch: (v: string) => void;
  onSearch: () => void;
  newHref?: string;
  onNew?: () => void;
  onMix?: () => void;
  mixCount?: number;
  placeholder?: string;
};

export default function RecipeToolbar({ title, search, setSearch, onSearch, newHref, onNew, onMix, mixCount, placeholder }: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-3">
      <h2 className="text-xl font-semibold flex-shrink-0">{title}</h2>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
        <input
          className="border rounded-full px-3 py-2 bg-white/90 border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 flex-1 min-w-0 w-full sm:w-64 md:w-80"
          placeholder={placeholder || "search…"}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button
          className="px-3 py-2 border rounded-full border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 w-full sm:w-auto"
          onClick={onSearch}
        >
          Search
        </button>
        {(onNew || newHref) && (
          onNew ? (
            <button
              onClick={onNew}
              className="px-3 py-2 rounded-full bg-amber-100 text-amber-900 border border-amber-200 hover:bg-amber-200 w-full sm:w-auto"
            >
              + New
            </button>
          ) : (
            <Link
              to={newHref!}
              className="px-3 py-2 rounded-full bg-amber-100 text-amber-900 border border-amber-200 hover:bg-amber-200 w-full sm:w-auto text-center"
            >
              + New
            </Link>
          )
        )}
        {onMix && (
          <button
            onClick={onMix}
            disabled={(mixCount || 0) < 2}
            className="px-3 py-2 border rounded-full border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            Mix {mixCount ? `(${mixCount})` : ""}
          </button>
        )}
      </div>
    </div>
  );
}
