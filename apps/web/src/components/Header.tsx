import { Link, useLocation } from "react-router-dom";

type Props = {
  user?: { id?: string } | null;
  onLogout?: () => void;
};

export default function Header({ user, onLogout }: Props) {
  const loc = useLocation();
  const isAuthPage = loc.pathname === "/login" || loc.pathname === "/register";
  const isLanding = loc.pathname === "/";
  if (isAuthPage) return null;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-emerald-100">
      <nav className="mx-auto max-w-5xl flex items-center justify-between p-4">
  <Link to={user ? "/my" : "/"} className="group flex items-center gap-2" aria-label="FoodComa home">
    <img
      src="/logo.png"
      alt="FoodComa logo"
      className="h-7 w-7 rounded-md shadow-sm ring-1 ring-emerald-200/50 shrink-0"
      loading="eager"
      decoding="async"
    />
    <span className="font-bold bg-gradient-to-r from-emerald-600 to-amber-500 bg-clip-text text-transparent group-hover:from-emerald-700 group-hover:to-amber-600">
      FoodComa
    </span>
  </Link>
        <div className="flex items-center gap-2">
          {/* Public landing: only Login/Register */}
          {!user && isLanding && (
            <>
              <Link to="/login" className="px-3 py-1 rounded-full border border-emerald-200 hover:bg-emerald-50">Login</Link>
              <Link to="/register" className="px-3 py-1 rounded-full bg-emerald-600 text-white hover:bg-emerald-700">Register</Link>
            </>
          )}

          {/* App navigation for authenticated users */}
          {user && (
            <>
              <Link to="/my" className="px-3 py-1 rounded-full text-gray-700 hover:text-emerald-700 hover:bg-emerald-50">My</Link>
              <Link to="/recipes" className="px-3 py-1 rounded-full text-gray-700 hover:text-emerald-700 hover:bg-emerald-50">Recipes</Link>
              <Link to="/ingredients" className="px-3 py-1 rounded-full text-gray-700 hover:text-emerald-700 hover:bg-emerald-50">Ingredients</Link>
              <Link to="/mixer" className="px-3 py-1 rounded-full text-gray-700 hover:text-emerald-700 hover:bg-emerald-50">Mixer</Link>
              <Link to="/favorites" className="px-3 py-1 rounded-full text-gray-700 hover:text-emerald-700 hover:bg-emerald-50">Favorites</Link>
              <button onClick={onLogout} className="px-3 py-1 rounded-full border border-emerald-200 hover:bg-emerald-50">Logout</button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
