# Marq AI Software Tutor — Wiki Home

**Marq AI Software Tutor** is a Next.js 16 PWA that combines on-demand software courses, an AI tutor, a marketplace of human tutors, role-based access control, and WPLMS-parity engagement features (certificates, badges, discussions, groups, messaging, calendar, analytics, GDPR export, and more).

This wiki is the single source of truth for the platform — covering technical architecture, complete requirements, role-wise and module-wise standard operating procedures (SOPs), the feature inventory, API reference, deployment, and testing.

---

## Table of Contents

### 1. Technical & Architecture
- [Technical Architecture](Technical-Architecture) — stack, file tree, state management, view routing
- [API Reference](API-Reference) — `/api/tutor` endpoint contract
- [Database Schema](Database-Schema) — Zustand persisted store, all entities & relationships
- [Setup & Deployment](Setup-and-Deployment) — local dev, prod build, env vars, PWA, Caddy
- [Feature Inventory](Feature-Inventory) — 48 WPLMS-parity features with implementation status

### 2. Requirements
- [Requirements Specification](Requirements-Specification) — complete PRD-style product spec

### 3. SOPs
- [Role-wise SOPs](Role-wise-SOPs) — Candidate, Human Tutor, AI Tutor, Super Admin, Guest
- [Module-wise SOPs](Module-wise-SOPs) — Auth, Catalog, Learning, AI Tutor, Human Tutors, Pricing, Admin, Notifications, Social, Calendar, Certificates, Badges, Analytics, GDPR, PWA, Integrations

### 4. Operations
- [Testing Checklist](Testing-Checklist) — end-to-end manual test scenarios
- [Worklog](../worklog.md) — running developer work log (in repo root)

---

## Quick Start

```bash
# 1. Install deps
bun install        # or npm install

# 2. Run dev server
bun run dev        # http://localhost:3000

# 3. Production build
bun run build
bun run start
```

## Demo Accounts (mock auth, no password needed)

| Role | Email | Use |
|------|-------|-----|
| Super Admin | `admin@marqai.dev` | Full platform control, 13 admin tabs |
| Candidate | `aarav@marqai.dev` | Learner dashboard, courses, certificates |
| Human Tutor | `aisha@marqai.dev` | Tutor portal, sessions, earnings |
| AI Tutor | n/a | Chat surface only, opens from navbar |

You can also click **"Quick admin login"** on the admin portal entry to skip auth entirely.

---

## Repository Layout

```
marqaitainers/
├── docs/                      # In-repo documentation (this wiki, mirrored)
├── wiki/                      # GitHub Wiki source (push to marqaitainers.wiki.git)
├── src/
│   ├── app/                   # Next.js 16 App Router
│   │   ├── api/tutor/route.ts # AI tutor chat endpoint
│   │   ├── layout.tsx         # Root layout, PWA manifest, theme color
│   │   ├── page.tsx           # Single-route view-state router
│   │   └── globals.css        # Tailwind + custom styles
│   ├── components/
│   │   ├── admin-portal.tsx         # 13-tab super admin portal
│   │   ├── advanced-portal.tsx      # Certificate builder, reg forms, email, analytics, GDPR
│   │   ├── auth-modal.tsx           # Login/register with role selection
│   │   ├── course-detail.tsx        # Course landing page
│   │   ├── dashboard.tsx            # Unified role-aware dashboard
│   │   ├── footer.tsx
│   │   ├── landing.tsx              # Hero, Features, CourseGrid, PricingSection, TutorsPreview, CTA
│   │   ├── lesson-view.tsx          # Step-wise lesson with video + sidebar outline
│   │   ├── my-learning.tsx          # Personal course catalog
│   │   ├── navbar.tsx               # Top nav with notifications bell
│   │   ├── notifications-bell.tsx   # Real-time in-app + browser push notifications
│   │   ├── portal-pages.tsx         # Calendar, Members, Groups, Messages, Certificates, Achievements, Features
│   │   ├── pricing-page.tsx         # Monthly/Annual/Per-course tiers + mock checkout
│   │   ├── quiz-view.tsx            # 8-question-type quiz engine
│   │   ├── tutor-chat.tsx           # AI tutor slide-out Sheet
│   │   ├── tutor-marketplace.tsx    # Browse & book human tutors
│   │   ├── tutor-portal.tsx         # Tutor dashboard (sessions, students, earnings)
│   │   └── ui/                      # shadcn/ui components (60+)
│   └── lib/
│       ├── courses.ts         # 5 on-demand courses with modules/lessons/quizzes
│       ├── db.ts              # Prisma client (optional backend; mock store is primary)
│       ├── seed-data.ts       # Seed: users, integrations, pricing, audit
│       ├── seed-social.ts     # Seed: notifications, badges, certs, groups, DMs, etc.
│       ├── seed-advanced.ts   # Seed: cert templates, reg forms, email schedules, analytics events, GDPR bundles
│       ├── store.ts           # Zustand store (single source of truth, persisted)
│       ├── types.ts           # All domain types
│       └── utils.ts           # cn() helper
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker (cache-first static, network-first nav)
│   ├── icon-192.png, icon-512.png
│   ├── logo.svg, robots.txt
├── prisma/schema.prisma       # (Optional) backend schema
├── scripts/                   # Python helpers (icon gen, course patches)
├── worklog.md                 # Running dev work log
└── package.json
```

---

## License & Acknowledgements

Built by the Marq AI team. Powered by Next.js 16, Tailwind CSS 4, shadcn/ui, Zustand, z-ai-web-dev-sdk.
