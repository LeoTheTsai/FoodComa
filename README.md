# FoodComa Monorepo

Ingredient-driven recipe generator and manager.

- Web: React + TypeScript + Vite + Tailwind + Apollo Client (PWA)
- API: Express + Apollo Server (GraphQL) + MongoDB (Mongoose) + OpenAI

## Monorepo layout
- `apps/web` — SPA, routes, components, GraphQL client, PWA manifest
- `apps/api` — GraphQL schema/resolvers, models, AI helpers, seed/import scripts
- `packages/tsconfig` — shared TS config base

## Features
- Mixer: generate a recipe from selected ingredients and constraints (cuisine, diet, time, skill, budget). Save result to “My Recipes”.
- Ingredients: browse/search/select; create your own ingredients. “My Ingredients” shows owned items.
- Recipes: create/update, favorites, last viewed; delete your own items with a custom confirmation dialog.
- Robust image handling: cached source images under `/images`, generated images under `/uploads`, and an icon fallback in the UI when images are missing.
- Auth: cookie-based JWT, protected routes in the web app, landing redirect when authenticated.

## Prerequisites
- Node.js 18+ and pnpm 8+
- A MongoDB instance and connection string
- Optional: OpenAI API Key (for real AI generation). You can run in mock mode without it.

## Quick start (development)
1) Install dependencies (from repo root):

	pnpm install

2) Create API environment file at `apps/api/.env`:

	MONGODB_URI=mongodb://localhost:27017/foodcoma
	JWT_SECRET=replace-with-a-long-random-string
	WEB_ORIGIN=http://localhost:5173
	PORT=4000
	# Use real AI (requires OPENAI_API_KEY) or mock responses for dev
	MOCK_AI=true
	# Only needed when MOCK_AI=false
	# OPENAI_API_KEY=sk-...

3) Start the API (in one terminal at repo root):

	pnpm dev:api

4) Start the Web app (in another terminal at repo root):

	pnpm dev:web

The web app proxies `/graphql`, `/images`, and `/uploads` to the API. Open http://localhost:5173.

Notes:
- If port 5173 is busy, Vite will move to 5174 (the app still works). Ensure `WEB_ORIGIN` stays in sync with the actual dev origin if you enforce it strictly.
- If port 4000 is busy, change `PORT` in `apps/api/.env` or free the port (see Troubleshooting).

## Environment variables (API)
Place these in `apps/api/.env`.

- `MONGODB_URI` (required): Mongo connection string
- `JWT_SECRET` (required): secret for signing JWTs
- `WEB_ORIGIN` (default: `http://localhost:5173`): allowed CORS origin for the web app
- `PORT` (default: `4000`): API port
- `ACCESS_TTL_MIN` (default: `15`): access token TTL in minutes
- `REFRESH_TTL_DAYS` (default: `7`): refresh token TTL in days
- `OPENAI_API_KEY` (required when `MOCK_AI=false`): OpenAI key for recipe JSON and image generation
- `MOCK_AI` (`true`/`false`, default: `false`): return deterministic mock recipes instead of calling OpenAI

## Scripts
At repo root:
- `pnpm dev:api` — start API in watch mode
- `pnpm dev:web` — start Vite dev server
- `pnpm build` — build all packages
- `pnpm lint` — run eslint across packages
- `pnpm typecheck` — TypeScript typecheck across packages

API package (`apps/api`):
- `pnpm -F @foodcoma/api seed` — run the full seed script (see below)
- Import/seed helpers are available for TheMealDB ingredients/recipes and image caching:
  - `import:ingredients`, `images:ingredients`, `seed:ingredients`
  - `import:mealdb`, `images:recipes`, `seed:mealdb`
  - `link:recipe-ingredients`, `seed:personalization`

## Data seeding (optional)
The API includes scripts to import data and cache images to disk for faster local dev. Typical flow:

1) Import ingredient/recipe data (from TheMealDB importers):
	- Ingredients: `pnpm -F @foodcoma/api import:ingredients`
	- Recipes: `pnpm -F @foodcoma/api import:mealdb`

2) Cache images to disk (so the API can serve them from `/images`):
	- Ingredients: `pnpm -F @foodcoma/api images:ingredients`
	- Recipes: `pnpm -F @foodcoma/api images:recipes`

3) Seed MongoDB collections:
	- Ingredients: `pnpm -F @foodcoma/api seed:ingredients`
	- Recipes: `pnpm -F @foodcoma/api seed:mealdb`

4) Optional linking/personalization:
	- Link recipe ↔ ingredient refs: `pnpm -F @foodcoma/api link:recipe-ingredients`
	- Personalization: `pnpm -F @foodcoma/api seed:personalization`

You can also run the aggregate `pnpm -F @foodcoma/api seed` script where available.

## API details
- GraphQL endpoint: `POST /graphql`
- CORS: `WEB_ORIGIN` must match the web client origin; credentials (cookies) are enabled.
- Auth: cookies `fc_access` and `fc_refresh` are set by the API; protected resolvers require a valid access token.
- Static assets: the API serves cached images at `/images` and generated images at `/uploads`.

## Web app details
- Dev server: Vite serves on `http://localhost:5173` by default.
- Proxy: `/graphql`, `/images`, and `/uploads` are proxied to the API (see `apps/web/vite.config.ts`).
- PWA: installable with offline manifest; icons under `apps/web/public/icons`.

## Troubleshooting
Port already in use (API 4000):
- Either change `PORT` in `apps/api/.env` to a free port, or stop the process using 4000.
- Windows (PowerShell):
  - Find PID: `netstat -ano | findstr :4000`
  - Kill: `taskkill /PID <pid> /F`

OpenAI errors:
- Set `MOCK_AI=true` to bypass OpenAI during development, or provide `OPENAI_API_KEY` and set `MOCK_AI=false`.

CORS or cookies not working:
- Ensure `WEB_ORIGIN` matches the web dev URL actually in use (5173 vs 5174).
- The web client uses `credentials: include` for GraphQL; the API must be started with the correct origin and cookies enabled.

Images not loading:
- Verify the API logs that it’s serving `/images` and `/uploads` folders.
- Confirm your seed/image-cache steps populated the `apps/api/public/images` directory.

## Notes
- This codebase includes a custom confirmation dialog, robust image fallback UI, and an ingredient-centric mixer aligned to the current product direction.
- Feel free to switch between mock and real AI as needed for demos vs. production-like testing.
