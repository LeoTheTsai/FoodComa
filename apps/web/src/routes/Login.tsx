import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client";
import { LOGIN } from "../graphql/mutations";
import { useNavigate, Link, useLocation } from "react-router-dom";

const Schema = z.object({ email: z.string().email(), password: z.string().min(6), remember: z.boolean().optional() });
type Form = z.infer<typeof Schema>;

export default function Login({ onAuth }: { onAuth: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(Schema) });
  const [login, { loading, error }] = useMutation(LOGIN);
  const nav = useNavigate();
  const loc = useLocation();
  const onSubmit = async (values: Form) => {
    await login({ variables: values });
    localStorage.setItem("authed", "1");
    onAuth();
    const to = (loc.state as any)?.from || "/my";
    nav(to);
  };

  return (
    <div className="relative min-h-screen grid md:grid-cols-2">
      {/* Back to landing */}
      <div className="absolute right-4 top-4 z-30">
        <Link to="/" className="px-3 py-1 rounded-full border border-rose-200 text-gray-700 hover:bg-rose-50">← Back</Link>
      </div>
      {/* Left: full-bleed chef image with translucent gradient overlay */}
      <div className="relative overflow-hidden flex items-center min-h-[50vh]">
        <img src="/chef.png" alt="Chef" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-100 via-lime-100 to-amber-100 opacity-85" />
        {/* subtle patterns */}
        <div className="absolute -right-20 -top-16 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-10 -bottom-20 w-80 h-80 rounded-full bg-white/10 blur-2xl" />
        {/* readability scrim */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/30 via-black/10 to-transparent" />
    <div className="relative z-20 w-full px-8 py-16">
          <div className="max-w-lg space-y-4">
      <h1 className="text-4xl font-extrabold leading-tight text-black">Crave. Click. Cook.</h1>
      <p className="text-gray-600">Turn dinnertime dread into delicious momentum.</p>
          </div>
        </div>
      </div>

      {/* Right: login form on white with border */}
      <div className="bg-white flex items-center justify-center p-6">
  <div className="w-full max-w-sm rounded-xl border border-rose-100 bg-white/95 backdrop-blur p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-1">Welcome back</h2>
          <p className="text-sm text-gray-600 mb-4">Sign in to continue</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" aria-label="Login form">
            <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" aria-label="Email" className="border rounded-full w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300" placeholder="you@example.com" {...register("email")} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="current-password" aria-label="Password" className="border rounded-full w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300" placeholder="••••••••" {...register("password")} />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 select-none">
                <input type="checkbox" className="accent-rose-600" {...register("remember")} />
                <span className="text-gray-600">Remember me</span>
              </label>
            </div>
            {error && <p className="text-sm text-red-600">{error.message}</p>}
            <button disabled={loading} className="px-4 py-2 rounded-full w-full text-white bg-gradient-to-r from-rose-500 to-amber-400 shadow hover:opacity-95 disabled:opacity-60">{loading ? "Signing in..." : "Login"}</button>
          </form>
          <p className="text-sm mt-3">No account? <Link to="/register" className="text-rose-600 underline">Register</Link></p>
        </div>
      </div>
    </div>
  );
}
