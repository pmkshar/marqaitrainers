# Marq AI Software Tutor

> A Next.js 16 PWA that combines on-demand software courses, a 24/7 AI tutor, a marketplace of vetted human tutors, role-based access control, and WPLMS-parity engagement features (certificates, badges, discussions, groups, messaging, calendar, analytics, GDPR tools, and more).

![Next.js](https://img.shields.io/badge/Next.js-16.1.3-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-New_York-black)
![Zustand](https://img.shields.io/badge/Zustand-5-orange)
![PWA](https://img.shields.io/badge/PWA-installable-purple)

---

## Quick start

```bash
bun install         # or npm install
bun run dev         # http://localhost:3000
```

Set `ZAI_API_KEY` in `.env` (for AI tutor chat).

## Demo accounts

| Role | Email | Notes |
|------|-------|-------|
| Super Admin | `admin@marqai.dev` | Any password; or use "Quick admin login" |
| Candidate | `aarav@marqai.dev` | Any password |
| Human Tutor | `aisha@marqai.dev` | Approved tutor |

## Production

```bash
bun run build
bun run start
```

See [Setup & Deployment](docs/Setup-and-Deployment.md) for Vercel, Railway, Docker, and Caddy instructions.

---

## What's inside

### Tech stack
- **Next.js 16** (App Router, Turbopack) + **TypeScript 5** + **React 19**
- **Tailwind CSS 4** + **shadcn/ui** (New York style, 60+ components)
- **Zustand 5** with `persist` middleware (localStorage-backed)
- **z-ai-web-dev-sdk** for AI tutor chat
- **react-syntax-highlighter** (Prism/oneDark) for code rendering
- **PWA** (manifest + service worker + offline app-shell)

### Features
- ✅ 5 on-demand courses with modules, lessons, step-wise training, quizzes
- ✅ AI tutor (24/7 LLM chat, course-aware context, streaming)
- ✅ Human tutor marketplace (apply → admin approve → book → live session)
- ✅ 3 pricing tiers (monthly, annual, per-course) + mock checkout
- ✅ Role-aware dashboards (candidate, tutor, admin)
- ✅ 13-tab super admin portal (users, courses, pricing, tutors, integrations, roles, audit, certificate builder, registration forms, email scheduling, analytics, GDPR)
- ✅ PWA — installable, offline-capable, app-shell fallback
- ✅ Real-time notifications (in-app + browser push)
- ✅ Activity tracking, certificates with validation codes, badges (4 tiers)
- ✅ Discussions, notes, announcements, assignments with grading
- ✅ Members directory, friends, groups, direct messages, calendar
- ✅ Course categories, bundles, subscriptions, expiration
- ✅ 14 third-party integrations (Zoom, BBB, Jitsi, Stripe, SendGrid, GA4, etc.)
- ✅ GDPR export bundles + right-to-erasure + consent log
- ✅ Deep analytics (KPIs, 8-week series, conversion funnel, top courses)
- ✅ Custom registration forms per role (10 field kinds)
- ✅ Email scheduling (8 automated drip types with {{vars}} templates)
- ✅ Drag-drop certificate builder (10 element types)
- ✅ 4-role RBAC with editable permission matrix (20 permissions)

See [Feature Inventory](docs/Feature-Inventory.md) for the full 48-feature WPLMS-parity audit.

---

## Repository layout

```
marqaitainers/
├── docs/                       # In-repo documentation (mirrors wiki)
├── wiki/                       # GitHub Wiki source (push to marqaitainers.wiki.git)
├── src/
│   ├── app/
│   │   ├── api/tutor/route.ts  # AI tutor endpoint (streaming)
│   │   ├── layout.tsx          # Root layout + PWA manifest + theme
│   │   └── page.tsx            # Single-route view-state router
│   ├── components/             # 18 feature components + 60 shadcn/ui
│   └── lib/                    # store, types, courses, seed files
├── public/                     # PWA manifest, service worker, icons
├── prisma/                     # (Optional) backend schema
├── scripts/                    # Python helpers
├── worklog.md                  # Running dev work log
└── package.json
```

---

## Documentation

Full documentation lives in [`docs/`](docs/) (mirrored to the [GitHub Wiki](https://github.com/pmkshar/marqaitainers/wiki)):

### Technical
- [Home / Overview](docs/Home.md)
- [Technical Architecture](docs/Technical-Architecture.md) — stack, file tree, state, routing, PWA, AI tutor, RBAC
- [API Reference](docs/API-Reference.md) — `/api/tutor` endpoint contract
- [Database Schema](docs/Database-Schema.md) — all 27 entities + relationships
- [Setup & Deployment](docs/Setup-and-Deployment.md) — local, prod, Vercel, Docker, Caddy
- [Feature Inventory](docs/Feature-Inventory.md) — 48 WPLMS-parity features audit

### Requirements
- [Requirements Specification](docs/Requirements-Specification.md) — complete PRD

### SOPs
- [Role-wise SOPs](docs/Role-wise-SOPs.md) — Candidate, Tutor, AI Tutor, Super Admin, Guest
- [Module-wise SOPs](docs/Module-wise-SOPs.md) — 18 modules documented

### Operations
- [Testing Checklist](docs/Testing-Checklist.md) — 18-section manual test scenarios

---

## Key concepts

### Single-route view-state navigation
The entire app lives at `/`. Navigation between "pages" is done by mutating `view: View` in the Zustand store — no client-side router. This keeps state in one place and works perfectly offline.

### Mock data layer
All data lives in browser localStorage via Zustand `persist`. There is no real backend in this demo. See [Database Schema](docs/Database-Schema.md) for the entity catalog and the Prisma migration path.

### Mock auth
Any non-empty password accepts seeded demo accounts. Use "Quick admin login" to bypass entirely.

### RBAC
4 system roles (`super_admin`, `tutor`, `candidate`, `guest`) × 20 fine-grained permissions. Super admins can toggle any permission per role from the **Roles & Permissions** tab.

---

## Production migration targets

| Concern | Demo | Production |
|---------|------|------------|
| Data layer | localStorage | PostgreSQL + Prisma |
| Auth | Mock (any password) | NextAuth.js + Google/GitHub OAuth |
| AI tutor | z-ai-web-dev-sdk streaming | Same + rate limiting |
| Notifications | in-app + Browser Notification API | + Web Push API + SendGrid email |
| Video | mock URLs | Zoom OAuth + Jitsi iframe + BBB API |
| Payments | mock checkout | Stripe Checkout + webhook |
| Analytics | in-store events | Segment + GA4 |
| Email | mock schedules | SendGrid + cron worker |

See [Technical Architecture → §11 Future Architecture Decisions](docs/Technical-Architecture.md#11-future-architecture-decisions) for details.

---

## Contributing

1. Read [Technical Architecture](docs/Technical-Architecture.md) first
2. Read [Module-wise SOPs](docs/Module-wise-SOPs.md) for the module you're touching
3. Make changes; run `npx tsc --noEmit` and `bun run build` before committing
4. Update `worklog.md` with what you did
5. Open a PR with a clear description

---

## License

Proprietary — © Marq AI. All rights reserved.

Built with ❤️ on Next.js, Tailwind, shadcn/ui, Zustand, and the z-ai-web-dev-sdk.
