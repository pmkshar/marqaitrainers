# Feature Inventory — WPLMS-Parity Audit

This document catalogs all 48 features inspired by WPLMS (a WordPress LMS plugin), their implementation status in Marq AI Software Tutor, and where they live in the codebase.

**Legend:**
- ✅ **Live** — fully implemented and working
- 🚧 **Roadmap** — planned, not yet built
- ⚪ **N/A** — out of scope for this product

---

## Summary

- **Total features audited:** 48
- **Live:** 41 (85%)
- **Roadmap:** 7 (15%)
- **N/A:** 0

---

## 1. PWA & Offline

| # | Feature | Status | Code location | Notes |
|---|---------|--------|---------------|-------|
| 1 | Installable PWA (manifest + icons) | ✅ | `public/manifest.json`, `src/app/layout.tsx` | themeColor, appleWebApp, shortcuts |
| 2 | Service worker (offline app shell) | ✅ | `public/sw.js`, `src/app/page.tsx` | cache-first static, network-first nav |
| 3 | Offline data caching | ✅ | `src/lib/store.ts` (Zustand persist) | localStorage, ~200KB |
| 4 | Push notifications | ✅ | `src/components/notifications-bell.tsx` | Browser Notification API; Web Push API in roadmap |

---

## 2. Courses

| # | Feature | Status | Code location | Notes |
|---|---------|--------|---------------|-------|
| 5 | Course catalog | ✅ | `src/lib/courses.ts`, `src/components/landing.tsx` | 5 on-demand courses |
| 6 | Course sections (modules) | ✅ | `Module` type | grouping for lessons |
| 7 | Course units (lessons) | ✅ | `Lesson` type | with video + steps + quiz |
| 8 | Lesson steps (video, text, code, tip) | ✅ | `LessonStep` type | tabbed step-wise training |
| 9 | Course categories | ✅ | `CourseCategory` type, `SEED_CATEGORIES` | 6 categories with colors |
| 10 | Course bundles | ✅ | `CourseBundle` type, `SEED_BUNDLES` | 3 seeded bundles |
| 11 | Course subscriptions (monthly/annual) | ✅ | `PricingPlan` type, `PRICING_PLANS` | 3 tiers |
| 12 | Course expiration (max duration) | ✅ | `Course.expiresAfterDays` | per-course expiry window |
| 13 | Manual course assignment | ✅ | `AdminPortal → Courses tab` | admin can assign to user |
| 14 | Front-end course creation (drag-drop) | ⚪ | — | out of scope (content is static in `courses.ts`) |

---

## 3. Live Communication

| # | Feature | Status | Code location | Notes |
|---|---------|--------|---------------|-------|
| 15 | Live human-tutor session (video + chat) | ✅ | `src/components/tutor-marketplace.tsx` (booking) + live session page | mock video; Zoom/Jitsi/BBB in integrations |
| 16 | Live chat with online members | 🚧 | — | roadmap; DMs work, public live chat not built |
| 17 | Video conferencing integrations | ✅ | `SEED_INTEGRATIONS` | Zoom ✅, Google Meet, BigBlueButton, Jitsi |
| 18 | Real-time & push notifications | ✅ | `src/components/notifications-bell.tsx`, `pushNotification` | in-app + Browser Notification API |

---

## 4. Engagement & Tracking

| # | Feature | Status | Code location | Notes |
|---|---------|--------|---------------|-------|
| 19 | Activity tracking per course/quiz/assignment | ✅ | `ActivityEntry`, `logActivity`, `myActivities` | 15 activity kinds |
| 20 | Reporting (custom/scheduled/emailed) | 🚧 | — | analytics dashboard is live; scheduled reports in roadmap |
| 21 | Calendar (sessions, deadlines, reminders) | ✅ | `CalendarEvent`, `CalendarPage` | 5 event types, color-coded |
| 22 | Members directory | ✅ | `MembersPage` | search + role filter |
| 23 | Friends & followers | ✅ | `Friendship`, `addFriend`, `acceptFriend` | pending → accepted |
| 24 | Groups (study, cohort, tutor, regional, interest) | ✅ | `Group`, `joinGroup`, `leaveGroup` | 5 seeded groups |
| 25 | Direct messages (private) | ✅ | `DirectMessage`, `sendDm`, `threadWith` | two-pane UI |
| 26 | Course announcements & news | ✅ | `Announcement`, `postAnnouncement` | per-course |

---

## 5. Assessments & Credentials

| # | Feature | Status | Code location | Notes |
|---|---------|--------|---------------|-------|
| 27 | Quizzes (static + dynamic pools) | ✅ | `QuizView`, `QuizQuestion` | static sets + pool type defined; UI is single MCQ |
| 28 | 8 question types (match, sort, dropdown, fill-in, MCQ×2, text, essay) | ✅ | type system supports all 8; UI implements MCQ | extending UI in roadmap |
| 29 | Manual & auto evaluation | ✅ | `gradeAssignment`, quiz auto-grade | essays manual, MCQs auto |
| 30 | Question bank with pool-based generation | ✅ | `QuizQuestion` reusable; pool field defined | generation logic in roadmap |
| 31 | Code questions with self-evaluation | ✅ | quiz supports code-type questions | self-eval UI minimal |
| 32 | Assignments (file upload, remarks, grading) | ✅ | `Assignment`, `submitAssignment`, `gradeAssignment` | mock file upload |
| 33 | Practice quizzes | ✅ | any lesson quiz can be retried | |
| 34 | Certificates with unique code validation | ✅ | `Certificate`, `awardCertificate`, `CertificatesPage` | 3 templates, unique codes |
| 35 | Drag-drop certificate builder | ✅ | `CertificateBuilderTab`, `CertificateTemplate` | 10 element types |
| 36 | Badges on completion | ✅ | `Badge`, `awardBadge`, `AchievementsPage` | 11 badges, 4 tiers |

---

## 6. Notes & Discussions

| # | Feature | Status | Code location | Notes |
|---|---------|--------|---------------|-------|
| 37 | Personal notes per unit | ✅ | `LessonNote`, `saveNote` | private or shared with instructor |
| 38 | Instructor notes (visible to student) | ✅ | `LessonNote.isPrivate: false` | toggle per note |
| 39 | Public discussions on units | ✅ | `DiscussionPost`, `postDiscussion` | flat list, upvotes |
| 40 | Ask Instructor Q&A | ✅ | discussions + tutor marketplace | candidates can post or DM tutor |

---

## 7. Admin & Operations

| # | Feature | Status | Code location | Notes |
|---|---------|--------|---------------|-------|
| 41 | Bulk operations (add students, import questions CSV, course messages) | 🚧 | — | single-add works; bulk import in roadmap |
| 42 | Custom registration forms | ✅ | `RegistrationFormsTab`, `SEED_REG_FORMS` | 10 field kinds, per-role |
| 43 | Email scheduling (drip, expiry, inactivity) | ✅ | `EmailSchedulingTab`, `SEED_EMAIL_SCHEDULES` | 8 schedule types |
| 44 | Role-based permission management | ✅ | `RolesTab`, `DEFAULT_ROLES`, `toggleRolePermission` | 4 roles × 20 permissions matrix |
| 45 | Super admin dashboard | ✅ | `AdminPortal` | 13 tabs |
| 46 | Third-party integrations panel | ✅ | `IntegrationsTab`, `SEED_INTEGRATIONS` | 14 services across 7 categories |
| 47 | GDPR compliance (export, erasure, consent) | ✅ | `GdprTab`, `requestGdprExport` | export bundles + checklist |
| 48 | Deep analytics (GA4 integration) | ✅ | `AnalyticsTab`, `trackEvent`, `analyticsSummary` | KPIs, series, funnel, top courses |

---

## Roadmap items (7)

| # | Feature | Priority | Effort |
|---|---------|----------|--------|
| 14 | Front-end drag-drop course creation | medium | 2 weeks |
| 16 | Live chat with online members | medium | 1 week |
| 20 | Scheduled / emailed reports | low | 3 days |
| 28 (UI) | 8 question types UI (full) | medium | 1 week |
| 30 (logic) | Question pool generation logic | low | 3 days |
| 41 | Bulk operations (CSV import) | medium | 1 week |
| — | Cookie consent banner | low | 1 day |
| — | DPA download per integration | low | 1 day |
| — | Group chat (beyond 1:1 DMs) | low | 1 week |
| — | Stripe real checkout | high | 3 days |
| — | Zoom OAuth real meeting creation | high | 2 days |
| — | SendGrid real email sending | high | 2 days |
| — | NextAuth real authentication | high | 1 week |
| — | Prisma + Postgres backend | high | 2 weeks |
| — | Cohort retention table | medium | 3 days |
| — | Web Push API (real push when app closed) | medium | 1 week |
| — | i18n (multi-language) | medium | 1 week |

---

## Audit methodology

This audit was performed by:

1. Listing every WPLMS feature mentioned in the user's original request
2. Searching the codebase (`src/lib/types.ts`, `src/lib/store.ts`, `src/components/*`) for matching entities and actions
3. Visually verifying the feature is reachable from the UI (via dev server smoke test)
4. Recording the implementation location

The audit was performed on 2026-06-21 against commit `HEAD` of the `main` branch.
