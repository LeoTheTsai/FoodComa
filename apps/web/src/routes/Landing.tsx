import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-[calc(100vh-64px)]">
      <section className="mx-auto max-w-6xl grid gap-8 md:grid-cols-2 items-center p-6">
        {/* Left: hero text */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Crave. Click. Cook.
          </h1>
          <p className="text-gray-600 max-w-md">
            FoodComa turns dinnertime dread into delicious momentum. Fresh inspiration,
            effortless decisions, happy plates.
          </p>
          <div>
            <Link to="/register" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white bg-gradient-to-r from-rose-500 to-amber-400 shadow hover:opacity-95">
              Get Started
            </Link>
          </div>
        </div>

        {/* Right: decorative image with gradient ring */}
        <div className="relative">
          {/* subtle ambient glow */}
          <div className="absolute -z-10 -inset-8 rounded-[36px] bg-gradient-to-tr from-rose-100 via-pink-100 to-amber-100 blur-md opacity-70" />
          {/* gradient ring frame */}
          <div className="rounded-[28px] p-[2px] bg-gradient-to-br from-rose-200 via-pink-100 to-indigo-200 shadow-xl">
            <div className="rounded-[26px] bg-white/70 backdrop-blur-sm">
              <img src="/landing.png" alt="Decor" className="rounded-[26px] w-full h-auto object-contain" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
