# NeoFeed Frontend

Terminal-style dashboard for **[NeoFeed](https://github.com/Mukulbanjade/NeoFeed)** — clustered AI & crypto news with trust labels, filters, war-topic keyword view, and optional Gemini-powered feed summaries.

## Stack

- React 18, TypeScript, Vite 5
- Tailwind CSS, shadcn/ui, TanStack Query
- PIN-gated API calls to the FastAPI backend (`X-Pin` header)

## Run locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:8080` (see `vite.config.ts`).

## Environment

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Backend base URL (e.g. `https://your-api.onrender.com`). If unset, defaults to production API in `src/lib/api.ts`. |

Copy `.env.example` to `.env.local` for local overrides (gitignored via `*.local`).

## Deploy

Build: `npm run build` → static output in `dist/`. Host on Vercel, Netlify, or any static CDN. Set `VITE_API_URL` in the host’s environment to match your deployed API.

## Repo layout

- `src/pages/Index.tsx` — main feed, categories, summaries
- `src/lib/api.ts` — base URL, PIN storage, `apiFetch`
- `src/components/` — feed cards, sidebar, PIN login, settings
