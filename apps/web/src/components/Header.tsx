import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

type Props = {
  user?: { id?: string } | null;
  onLogout?: () => void;
};

export default function Header({ user, onLogout }: Props) {
  const loc = useLocation();
  const isAuthPage = loc.pathname === "/login" || loc.pathname === "/register";
  const isLanding = loc.pathname === "/";
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [loc.pathname]);
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
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
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

        {/* Mobile menu button */}
        <button
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md ring-1 ring-emerald-200 text-emerald-700 hover:bg-emerald-50"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            {open ? (
              <path fillRule="evenodd" d="M6.225 4.811a1 1 0 0 1 1.414 0L12 9.172l4.361-4.361a1 1 0 1 1 1.414 1.414L13.414 10.586l4.361 4.361a1 1 0 0 1-1.414 1.414L12 12l-4.361 4.361a1 1 0 1 1-1.414-1.414l4.361-4.361-4.361-4.361a1 1 0 0 1 0-1.414Z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M3.75 5.25a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm0 6a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm0 6a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile dropdown panel with slide animation */}
      <div
        className={`md:hidden border-t border-emerald-100 overflow-hidden transition-all duration-300 ${open ? "max-h-[60vh] opacity-100" : "max-h-0 opacity-0"}`}
        aria-hidden={!open}
      >
        <div className="bg-white/95 backdrop-blur-sm">
          <div className="mx-auto max-w-5xl p-3 grid gap-2">
            {/* Public landing actions */}
            {!user && isLanding && (
              <div className="grid gap-2">
                <Link to="/login" className="block px-3 py-2 rounded-md border border-emerald-200 hover:bg-emerald-50">Login</Link>
                <Link to="/register" className="block px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">Register</Link>
              </div>
            )}

            {/* Authenticated nav */}
            {user && (
              <div className="grid gap-1">
                <Link to="/my" className="block px-3 py-2 rounded-md hover:bg-emerald-50">My</Link>
                <Link to="/recipes" className="block px-3 py-2 rounded-md hover:bg-emerald-50">Recipes</Link>
                <Link to="/ingredients" className="block px-3 py-2 rounded-md hover:bg-emerald-50">Ingredients</Link>
                <Link to="/mixer" className="block px-3 py-2 rounded-md hover:bg-emerald-50">Mixer</Link>
                <Link to="/favorites" className="block px-3 py-2 rounded-md hover:bg-emerald-50">Favorites</Link>
                <button onClick={onLogout} className="mt-1 block text-left px-3 py-2 rounded-md border border-emerald-200 hover:bg-emerald-50">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
