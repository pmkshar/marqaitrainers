# Deployment Guide — Marq AI Software Tutor

This guide walks you through pushing the code to GitHub and deploying it live on Vercel.

---

## Step 1 — Push the code to GitHub

The repository is **already initialized locally** with `origin` pointing to:

```
https://github.com/pmkshar/marqaitainers.git
```

Two commits are ready on `main`:

| Commit | Description |
|--------|-------------|
| `078642c` | chore: make project Vercel-ready |
| `76751cd` | feat: Marq AI Software Tutor — full WPLMS-parity platform |

### Option A — Push from this sandbox (you provide a PAT)

If you want me to push it directly from this session, share a GitHub Personal Access Token (PAT) with **repo** scope. I will then run:

```bash
cd /home/z/my-project
git remote set-url origin https://<PAT>@github.com/pmkshar/marqaitainers.git
git push -u origin main
```

Create a PAT here: <https://github.com/settings/tokens/new?scopes=repo&description=marqaitainers-push>

The PAT can be deleted immediately after the push.

### Option B — Push from your own machine

```bash
# 1. Clone the project from this sandbox (or copy the workspace files)
git clone https://github.com/pmkshar/marqaitainers.git   # if repo exists
# OR: scp/rsync the /home/z/my-project folder over

# 2. Inside the project
cd marqaitainers
git remote add origin https://github.com/pmkshar/marqaitainers.git
git push -u origin main
```

### Option C — Use the helper script

```bash
./scripts/push-to-github.sh           # commits + pushes code + wiki
./scripts/push-to-github.sh --code    # code only
./scripts/push-to-github.sh --wiki    # wiki only
```

The wiki push will fail unless the wiki repo has been initialized first — visit
<https://github.com/pmkshar/marqaitainers/wiki> and click **"Create the first page"**
(any content) to initialize it, then re-run `--wiki`.

---

## Step 2 — Push the wiki documentation

The 10 wiki markdown files live in `wiki/` at the repo root. They get pushed as
a **separate git repo** to `marqaitainers.wiki.git`.

```bash
./scripts/push-to-github.sh --wiki
```

After the push, the wiki is visible at:
<https://github.com/pmkshar/marqaitainers/wiki>

Wiki pages:
1. **Home** — overview + table of contents
2. **Technical-Architecture** — stack, file tree, state, routing, PWA, AI tutor, RBAC
3. **Requirements-Specification** — complete PRD (100+ functional requirements)
4. **Role-wise-SOPs** — Candidate, Human Tutor, AI Tutor, Super Admin, Guest
5. **Module-wise-SOPs** — 18 modules documented end-to-end
6. **API-Reference** — `/api/tutor` endpoint contract + future endpoints
7. **Database-Schema** — all 27 entities + relationships
8. **Setup-and-Deployment** — local, prod, Vercel, Docker, Caddy
9. **Feature-Inventory** — 48 WPLMS-parity features audit (41 live, 7 roadmap)
10. **Testing-Checklist** — 18-section manual test scenarios

---

## Step 3 — Deploy to Vercel

### Prerequisites

- A free [Vercel account](https://vercel.com/signup) (sign in with GitHub)
- The repo pushed to GitHub (Step 1 done)
- A [ZAI API key](https://z.ai) for the AI tutor chat (optional — the build works without it; tutor chat just won't respond)

### Deploy via Vercel Dashboard (recommended)

1. Go to <https://vercel.com/new>
2. Import the GitHub repo: **pmkshar/marqaitainers**
3. Vercel auto-detects Next.js — defaults are correct:
   - **Framework:** Next.js
   - **Build command:** `next build` (already in `package.json`)
   - **Install command:** `bun install` (already in `vercel.json`)
   - **Output directory:** `.next` (auto)
4. **Environment Variables** (optional but recommended):
   | Name | Value | Required? |
   |------|-------|-----------|
   | `ZAI_API_KEY` | your z.ai API key | Only for AI tutor chat |
   | `DATABASE_URL` | `file:/tmp/prod.db` (or a Postgres URL) | Only if using Prisma |
5. Click **Deploy**. Vercel builds in ~60 seconds and gives you a live URL like:
   ```
   https://marqaitainers.vercel.app
   ```
6. (Optional) Add a custom domain under **Settings → Domains**

### Deploy via Vercel CLI

```bash
npm i -g vercel
cd /home/z/my-project
vercel login
vercel --prod
```

### Post-deploy checklist

- [ ] Landing page loads at the Vercel URL
- [ ] Click "Sign In" → log in as `admin@marqai.dev` (any password)
- [ ] Confirm Dashboard renders with KPIs and quick actions
- [ ] Open any course → start a lesson → walk through steps
- [ ] Open AI Tutor chat (right-side Sheet) → send a message
- [ ] Test PWA: open Chrome DevTools → Application → Manifest should be valid
- [ ] On mobile Chrome, "Install app" should appear in the menu
- [ ] Notifications bell shows the seeded notifications

---

## Step 4 — Wire up continuous deployment

Once Vercel is connected to the GitHub repo, every push to `main` auto-deploys.
Pull requests get preview URLs automatically.

To change the production branch: **Vercel → Project → Settings → Git → Production Branch**.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `fatal: could not read Username` | No GitHub credentials — use a PAT (Option A above) |
| Build fails on Vercel | Check Vercel build logs; the local `bun run build` passes, so the issue is usually a missing env var |
| AI tutor returns 500 | `ZAI_API_KEY` env var missing on Vercel — add it under Project Settings → Environment Variables |
| PWA install missing | Manifest must be served with `Content-Type: application/manifest+json` — already configured in `vercel.json` |
| Wiki push rejected | Initialize the wiki first by visiting the wiki URL and creating the first page |

---

## What's already Vercel-ready in this repo

- `vercel.json` — framework=nextjs, install=bun, BOM region, PWA-aware headers
- `package.json` — `build` script is the plain `next build` (no Docker-only cp steps)
- `.gitignore` — node_modules, .next, .env, .vercel, tsbuildinfo all excluded
- `public/manifest.json`, `public/sw.js`, `public/icon-192.png`, `public/icon-512.png` — PWA assets
- No `.env` files committed (secrets stay in Vercel env vars)
