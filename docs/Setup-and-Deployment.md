# Setup & Deployment

This document covers local development, production build, environment variables, PWA setup, Caddy reverse proxy, and deployment to common platforms.

---

## 1. Prerequisites

| Tool | Version | Required |
|------|---------|----------|
| Node.js | 18+ (20 LTS recommended) | yes |
| Bun | 1.0+ | recommended (faster install/dev) |
| ZAI_API_KEY | valid key from z.ai | yes (for AI tutor) |

---

## 2. Local development

### 2.1 Install dependencies

```bash
# With Bun (recommended)
bun install

# Or with npm
npm install
```

### 2.2 Set environment variables

Create `.env` in the project root:

```bash
ZAI_API_KEY=your_zai_api_key_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
# Optional (for future Prisma backend):
# DATABASE_URL=postgresql://user:pass@localhost:5432/marqai
```

> **Note:** `.env` is gitignored. The repo includes `.env` with a placeholder for convenience in dev sandboxes.

### 2.3 Run the dev server

```bash
bun run dev
# → http://localhost:3000
```

The dev server uses Turbopack (Next.js 16 default) for fast HMR.

### 2.4 Demo accounts

| Role | Email | Notes |
|------|-------|-------|
| Super Admin | `admin@marqai.dev` | Any non-empty password |
| Candidate | `aarav@marqai.dev` | Any non-empty password |
| Human Tutor | `aisha@marqai.dev` | Approved tutor |
| Human Tutor (pending) | `marcus@marqai.dev` | Pending application |

Or use the "Quick admin login" button on the admin portal entry to skip auth.

---

## 3. Production build

### 3.1 Build

```bash
bun run build
```

This runs `next build` (Turbopack) + copies static assets into `.next/standalone/`.

### 3.2 Start

```bash
bun run start
# → NODE_ENV=production bun .next/standalone/server.js
# → http://localhost:3000
```

### 3.3 Build output

- `.next/` — compiled output
- `.next/standalone/` — self-contained server bundle (copy to any Node host)
- `.next/static/` — static assets (JS, CSS, images)
- `public/` — copied alongside standalone

### 3.4 Build performance

| Metric | Value |
|--------|-------|
| Compile time | ~6 seconds |
| Static page generation | ~420ms |
| Bundle size (gzipped) | ~180 KB (first load) |
| Routes | 1 static (`/`) + 2 dynamic (`/api`, `/api/tutor`) |

---

## 4. Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ZAI_API_KEY` | yes | z-ai-web-dev-sdk API key for AI tutor chat |
| `DATABASE_URL` | no | Prisma database URL (future backend) |
| `NEXT_PUBLIC_BASE_URL` | no | Public URL for canonical links (defaults to `http://localhost:3000`) |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | no | Google Analytics 4 Measurement ID (e.g. `G-XXXXXXXX`) |
| `STRIPE_SECRET_KEY` | no | Stripe API key (future checkout) |
| `STRIPE_WEBHOOK_SECRET` | no | Stripe webhook signing secret |
| `SENDGRID_API_KEY` | no | SendGrid API key (future email) |
| `ZOOM_ACCOUNT_ID` | no | Zoom Server-to-Server OAuth account ID |
| `ZOOM_CLIENT_ID` | no | Zoom Server-to-Server OAuth client ID |
| `ZOOM_CLIENT_SECRET` | no | Zoom Server-to-Server OAuth client secret |

---

## 5. PWA setup

### 5.1 Manifest

Located at `public/manifest.json`. Already wired in `src/app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  manifest: '/manifest.json',
  appleWebApp: {
    title: 'Marq AI',
    statusBarStyle: 'default',
    capable: true,
  },
  // ...
};

export const viewport: Viewport = {
  themeColor: '#6366f1',
  // ...
};
```

### 5.2 Service worker

Located at `public/sw.js`. Registered on mount in `src/app/page.tsx`:

```tsx
useEffect(() => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}, []);
```

### 5.3 Icons

- `public/icon-192.png` (192×192)
- `public/icon-512.png` (512×512)
- Apple touch icon (configured in layout)

To regenerate icons, run:

```bash
python3 scripts/make_icons.py
```

### 5.4 Installability

- **Chrome desktop:** Install button appears in address bar on second visit
- **iOS Safari:** Share → Add to Home Screen
- **Android Chrome:** "Add to Home screen" / "Install app"

### 5.5 Offline behavior

- All visited pages load from cache
- Static assets (icons, manifest, logo) are cache-first
- Navigations are network-first with cache fallback
- AI tutor endpoint requires network (graceful error if offline)

---

## 6. Caddy reverse proxy

The repo includes a `Caddyfile` for HTTPS termination:

```caddy
marqai.dev {
  encode gzip zstd
  reverse_proxy localhost:3000
  header Strict-Transport-Security "max-age=31536000; includeSubDomains"
  header X-Content-Type-Options "nosniff"
  header X-Frame-Options "DENY"
  header Referrer-Policy "strict-origin-when-cross-origin"
}
```

### 6.1 Run Caddy

```bash
# Install Caddy (https://caddyserver.com/docs/install)
sudo caddy run --config Caddyfile
```

Caddy automatically provisions a Let's Encrypt certificate on first request to `marqai.dev`.

### 6.2 Service worker HTTPS requirement

Service workers require HTTPS (or `localhost`). Caddy provides this automatically. Without HTTPS, the PWA features will silently no-op.

---

## 7. Deployment targets

### 7.1 Vercel (recommended)

Marq AI is a Next.js 16 app — Vercel is the natural host.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set env vars
vercel env add ZAI_API_KEY
# ... (paste key when prompted)

# Promote to production
vercel --prod
```

**Notes:**
- Vercel handles HTTPS automatically
- Edge runtime works for `/api/tutor` (set `export const runtime = 'edge'`)
- The service worker and PWA manifest work out of the box

### 7.2 Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

railway login
railway init
railway up
```

Set env vars in the Railway dashboard.

### 7.3 Self-hosted (VPS)

```bash
# 1. Build locally
bun run build

# 2. Copy to server
rsync -avz --exclude node_modules --exclude .next/cache \
  ./ user@server:/opt/marqai/

# 3. On the server
cd /opt/marqai
bun install --production
bun run start

# 4. Run Caddy as a systemd service
sudo systemctl enable caddy
sudo systemctl start caddy
```

### 7.4 Docker

```dockerfile
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM oven/bun:1 AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["bun", "server.js"]
```

```bash
docker build -t marqai .
docker run -p 3000:3000 --env-file .env marqai
```

---

## 8. CI/CD (recommended GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install --frozen-lockfile
      - run: bun run lint
      - run: bun run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 9. Database setup (production)

The demo uses localStorage. For production:

### 9.1 PostgreSQL

```bash
# Local Postgres
docker run -d --name marqai-db -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=marqai \
  postgres:16

# Set DATABASE_URL
echo 'DATABASE_URL=postgresql://postgres:postgres@localhost:5432/marqai' >> .env
```

### 9.2 Prisma

```bash
# Generate client
bun run db:generate

# Push schema (no migration files)
bun run db:push

# Or create a migration
bun run db:migrate
```

### 9.3 Seed

After migrating, seed the database from the existing TypeScript seed files:

```bash
bun run scripts/seed-db.ts   # (would need to be created)
```

---

## 10. Monitoring & logging (production target)

### 10.1 Error tracking
- Sentry for frontend + backend errors
- `@sentry/nextjs` plugin

### 10.2 Logging
- Pino for structured JSON logs
- Log drain to Vercel logs / Railway logs / CloudWatch

### 10.3 Uptime monitoring
- Better Stack or Pingdom for synthetic checks
- Alert on `/` returning non-200

### 10.4 Performance monitoring
- Vercel Analytics (built-in)
- Speed Curve for RUM
- Lighthouse CI in GitHub Actions

---

## 11. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `ZAI_API_KEY` missing | Add to `.env` and restart dev server |
| Build fails on Turbopack | Clear `.next/` cache: `rm -rf .next` |
| Service worker not registering | Check HTTPS (or use localhost); check browser console |
| localStorage quota exceeded | Clear via dev tools → Application → Storage → Clear site data |
| AI tutor returns 500 | Verify `ZAI_API_KEY` is set on the server (not just client) |
| Demo accounts not working | Clear localStorage and refresh — seeds re-initialize |
| Production build hangs | Increase Node memory: `NODE_OPTIONS=--max-old-space-size=4096` |

---

## 12. Upgrade path

To upgrade to a new Next.js version:

```bash
# Check current version
bun pm ls | grep next

# Upgrade
bun add next@latest react@latest react-dom@latest

# Run codemods if any
npx @next/codemod@latest upgrade
```

Always review the [Next.js upgrade guide](https://nextjs.org/docs/app/building-your-application/upgrading) for breaking changes.
