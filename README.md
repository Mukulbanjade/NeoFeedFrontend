# NeoFeed Frontend

Terminal-style UI for [NeoFeed](https://github.com/Mukulbanjade/NeoFeed) (FastAPI + Supabase). React, TypeScript, Vite.

## Run locally

```bash
npm ci
npm run dev
```

## Deploy on Vercel

- Connect this **repository** (not a parent monorepo folder). **Root Directory** should be the project root (where `package.json` lives).
- Framework: **Vite** (or leave auto-detect). Build output: **`dist`**.
- `vercel.json` pins `npm ci` + `vite` build so installs stay small (no Playwright/browsers in CI).

Set `VITE_API_URL` in Vercel → Environment Variables to your API base (e.g. `https://neofeed.onrender.com`).

### If you see “dependency size exceeds 500 MB”

That usually means Vercel is installing **too much** (e.g. Playwright browsers, Bun + duplicate trees, or the **wrong root** so it pulls an entire monorepo). This repo removes Playwright from npm dependencies and uses `npm ci` only. Double-check the GitHub repo and Root Directory on Vercel.

**Do not deploy the Python NeoFeed backend on Vercel** — use Render (or similar). Vercel is for this static frontend only.

## Environment

See `.env.example` for `VITE_API_URL`.
