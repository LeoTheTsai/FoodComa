import { Link, Route, Routes, useNavigate, Navigate } from "react-router-dom";
import Home from "./routes";
import Landing from "./routes/Landing";
import Mixer from "./routes/Mixer";
import Recipes from "./routes/Recipes";
import Ingredients from "./routes/Ingredients";
import Favorites from "./routes/Favorites";
// Dark theme removed
import Login from "./routes/Login";
import Register from "./routes/Register";
import RecipeEditor from "./routes/RecipeEditor";
import { useQuery, useMutation } from "@apollo/client";
import { ME } from "./graphql/queries";
import { LOGOUT, REFRESH } from "./graphql/mutations";
import RequireAuth from "./components/RequireAuth";
import Header from "./components/Header";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function App() {
  const { data, refetch } = useQuery(ME, { fetchPolicy: "cache-and-network" });
  const [logout] = useMutation(LOGOUT);
  const [refresh] = useMutation(REFRESH);
  const nav = useNavigate();
  const loc = useLocation();
  const user = data?.me;

  useEffect(() => { (async () => { try { await refresh(); await refetch(); } catch {} })(); }, []);
  // Keep auth state fresh on route changes (helps header reflect real session quickly)
  useEffect(() => { (async () => { try { await refetch(); } catch {} })(); }, [loc.pathname]);
  const onLogout = async () => { await logout(); localStorage.removeItem("authed"); await refetch(); nav("/"); };

  const isAuthPage = loc.pathname === "/login" || loc.pathname === "/register";
  const isLanding = loc.pathname === "/";
  const showHeader = (!isAuthPage) && (isLanding ? true : !!user);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-lime-50 to-amber-50 text-gray-900">
    {showHeader && (<Header user={user} onLogout={onLogout} />)}
    <main className={showHeader && !isLanding ? "mx-auto max-w-5xl p-4" : ""}>
        <Routes>
      <Route path="/" element={user ? <Navigate to="/my" replace /> : <Landing />} />
      <Route path="/my" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/recipes" element={<RequireAuth><Recipes /></RequireAuth>} />
          <Route path="/ingredients" element={<RequireAuth><Ingredients /></RequireAuth>} />
          <Route path="/favorites" element={<RequireAuth><Favorites /></RequireAuth>} />
          <Route path="/recipes/new" element={<RequireAuth><RecipeEditor mode="create" onSaved={() => nav("/recipes")} /></RequireAuth>} />
          <Route path="/recipes/:id/edit" element={<RequireAuth><RecipeEditor mode="edit" onSaved={() => nav("/recipes")} /></RequireAuth>} />
          <Route path="/mixer" element={<RequireAuth><Mixer /></RequireAuth>} />
          <Route path="/login" element={<Login onAuth={() => refetch()} />} />
          <Route path="/register" element={<Register onAuth={() => refetch()} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
