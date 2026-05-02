# NeoFeed Frontend

Terminal-style UI for [NeoFeed](https://github.com/Mukulbanjade/NeoFeed) (FastAPI + Supabase). React, TypeScript, Vite.

## Run locally

```bash
npm ci
npm run dev
```

## Deploy on Vercel

### Required settings

- **Git repo:** connect **`NeoFeedFrontend` only**, not a parent monorepo.
- **Root Directory:** `.` — the folder that contains this `package.json` and [`vercel.json`](vercel.json).
- **Build:** [`vercel.json`](vercel.json) sets `npm ci`, `vite` build, output **`dist`**. Framework preset **Vite** (or rely on detection).
- **Environment:** `VITE_API_URL` = your HTTPS API origin (e.g. `https://neofeed.onrender.com`).

After each deploy, open **Deployments → Production** and note the **Git commit SHA** matches `main` on GitHub. If builds fail, you may keep serving an **older deployment**.

### Verify: “dependency / bundle size ~5000 MB exceeds 500 MB”

A healthy Vite app should **not** near gigabytes at build time.

| Cause | What to fix |
|--------|--------------|
| Wrong **Root Directory** | Point at NeoFeedFrontend root, not workspace root |
| Wrong **repository** linked | Separate monorepo with multiple apps dragging huge trees |
| **Playwright / browser installers** pulled in | Confirm `package.json` has **no** `@playwright/test` on deployed branch |
| Installing with **Bun** + mismatched locks | Repo uses **`package-lock.json` + `npm ci`** ([`vercel.json`](vercel.json)) |

**Do not deploy the Python NeoFeed API on Vercel** — use Render or similar.

## Troubleshooting (“Failed to fetch” vs PIN errors)

| Symptom | Likely layer |
|---------|----------------|
| Browser says **Failed to fetch** | Network blocked, wrong API URL, mixed `http/https`, extension blocking, DNS, or TLS — **before** HTTP body |
| **Invalid PIN** / **PIN required** | Auth: `PIN_HASH` on Render vs PIN you type; or missing `X-Pin` ([`src/lib/api.ts`](src/lib/api.ts)) |
| Wrong or empty feed content | Scraping/database (see NeoFeed `/health`). Read path uses Supabase clusters |

### Browser checks ([`src/lib/api.ts`](src/lib/api.ts))

1. Same browser tab: open `https://<your-api-host>/health` — should return JSON quickly.
2. DevTools → **Network** → reload NeoFeed → inspect **`/auth/verify`** and **`/clusters/`**:
   - **(blocked)** / **failed** → address URL, HTTPS, CORS, blocking extensions.
   - **401** with JSON detail → PIN / session.
3. **Application → Local Storage** on your NeoFeed domain:
   - `neofeed_api_url` — if wrong, Settings → API endpoint or delete key to use `VITE_API_URL` / default.
   - `neofeed_pin`, `neofeed_authenticated` — stale combos can confuse auth; clear and sign in again if needed.

## Environment

See [`.env.example`](.env.example) for `VITE_API_URL`.

## Architecture sketch

```text
NeoFeed SPA (this repo, Vercel)
  → HTTPS + X-Pin
  → NeoFeed API on Render (/auth/verify, /clusters, …)
  → Supabase
```
