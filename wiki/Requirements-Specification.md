# Requirements Specification (PRD)

**Document version:** 1.0  
**Last updated:** 2026-06-21  
**Product:** Marq AI Software Tutor  
**Status:** Demo MVP — feature-complete for end-to-end user flows

---

## 1. Product Overview

### 1.1 Vision

Marq AI Software Tutor is a single platform that combines **on-demand software courses**, a **24/7 AI tutor**, a **marketplace of vetted human tutors**, and **WPLMS-parity engagement features** (certificates, badges, discussions, groups, messaging, calendar, analytics, GDPR tools). The platform serves four distinct roles with role-aware experiences: candidates (learners), human tutors, the AI tutor, and a super admin who controls everything.

### 1.2 Goals

1. **Self-serve learning** — Candidates can register, browse 5+ on-demand courses, take step-wise lessons, attempt quizzes, and earn certificates without ever talking to a human.
2. **AI + human tutoring** — When the AI tutor isn't enough, candidates can book a 1:1 video session with a vetted human tutor at a published hourly rate.
3. **Marketplace economics** — Human tutors can apply to teach, set their hourly rate, get approved by super admin, and earn per session (with platform commission set by admin).
4. **Pricing flexibility** — Three pricing models: monthly subscription, annual subscription, and one-time per-course purchase.
5. **Admin control** — A super admin can manage every user, course, tutor, integration, role permission, certificate template, registration form, email schedule, and view deep analytics — all from a single 13-tab portal.
6. **Engagement & retention** — Certificates, badges, discussions, groups, friends, direct messages, calendar, and announcements keep learners coming back.
7. **Privacy & compliance** — GDPR export bundles, right-to-erasure, consent logs, and data retention policies built in.

### 1.3 Non-goals (this version)

- Real backend with database persistence (mock store only)
- Real payment processing (mock checkout)
- Real video conferencing (mock URLs)
- Real email sending (mock schedules)
- Mobile native apps (PWA only)

---

## 2. Personas & Roles

### 2.1 Super Admin
- **Who:** Platform operator (e.g. Maya Iyer, founder)
- **Wants:** Full control over users, tutors, courses, pricing, integrations, roles, certificates, forms, emails, analytics, GDPR
- **Pain points solved:** One portal for every operational task; audit log for compliance; role matrix for least-privilege delegation

### 2.2 Candidate (Student)
- **Who:** Software engineer preparing for interviews or upskilling
- **Wants:** Self-paced courses, instant AI tutor help, occasional human tutor session, shareable certificate
- **Pain points solved:** Step-wise lessons instead of 3-hour videos; AI tutor available 24/7; book a human only when stuck

### 2.3 Human Tutor
- **Who:** Senior engineer who teaches part-time
- **Wants:** Set own rate, teach 1:1 sessions, get paid reliably
- **Pain points solved:** Apply once, admin approves, then book sessions flow automatically; earnings dashboard shows pending payouts

### 2.4 AI Tutor (system role)
- **Who:** The LLM-backed chat surface
- **Wants:** n/a — system role
- **Pain points solved:** Always-on help for candidates; context-aware (knows the current course & lesson)

### 2.5 Guest (unauthenticated)
- **Who:** Anonymous visitor
- **Wants:** Browse the course catalog, see pricing
- **Pain points solved:** No signup wall before value perception

---

## 3. Functional Requirements

### 3.1 Authentication & Registration

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-A1 | Any user can register as candidate or tutor via modal | must | ✅ |
| FR-A2 | Login accepts any non-empty password for seeded users | must | ✅ |
| FR-A3 | Role selection at registration (candidate / tutor) | must | ✅ |
| FR-A4 | Successful login/register navigates to role-aware dashboard | must | ✅ |
| FR-A5 | Logout returns to home | must | ✅ |
| FR-A6 | "Quick admin login" button skips auth for demo | should | ✅ |
| FR-A7 | Custom registration forms per role (admin-configurable fields) | should | ✅ |
| FR-A8 | Email verification / CAPTCHA / ToS acceptance toggles per form | should | ✅ |
| FR-A9 | 10 field kinds: text, email, password, select, checkbox, radio, textarea, date, tel, number | should | ✅ |
| FR-A10 | GDPR consent log with timestamp | should | ✅ |

### 3.2 Course Catalog

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-C1 | Browse 5+ on-demand courses on the homepage | must | ✅ |
| FR-C2 | Each course has: title, subtitle, description, icon, gradient, level, duration, lessons count, students count, rating, instructor, tags, what-you-learn, prerequisites | must | ✅ |
| FR-C3 | Course detail page with curriculum accordion (modules → lessons → steps) | must | ✅ |
| FR-C4 | Course categories with color coding | should | ✅ |
| FR-C5 | Course bundles (multiple courses at a discount) | should | ✅ |
| FR-C6 | Course expiration (max access duration in days) | should | ✅ |
| FR-C7 | "On-demand" flag — all courses available immediately | must | ✅ |
| FR-C8 | Per-course pricing (one-time, monthly, annual) | must | ✅ |

### 3.3 Learning Experience

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-L1 | Lesson view with video player + tabbed step-wise training | must | ✅ |
| FR-L2 | Sidebar outline showing all lessons in the module | must | ✅ |
| FR-L3 | "Finish & Take Test" CTA at end of lesson | must | ✅ |
| FR-L4 | Mark lesson complete (persisted) | must | ✅ |
| FR-L5 | Personal notes per lesson (private or shared with instructor) | should | ✅ |
| FR-L6 | Public discussion thread per lesson | should | ✅ |
| FR-L7 | "Ask Instructor" Q&A (slates a question for next session) | should | ✅ |
| FR-L8 | Drip content unlock (next module unlocks after current completed) | should | ✅ |

### 3.4 Quizzes

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-Q1 | 8 question types: MCQ single, MCQ multiple, text, essay, match, sort, dropdown, fill-in-blank | must | ✅ |
| FR-Q2 | Auto-graded objective questions; manual grading for essays | must | ✅ |
| FR-Q3 | Static question sets + dynamic pool-based generation | should | ✅ |
| FR-Q4 | Score + retry option | must | ✅ |
| FR-Q5 | Question bank with reuse across quizzes | should | ✅ |
| FR-Q6 | Code questions with self-evaluation | should | ✅ |

### 3.5 Assignments

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-AS1 | File upload (mock — filename stored) | must | ✅ |
| FR-AS2 | Instructor remarks + corrected uploads with marks | must | ✅ |
| FR-AS3 | Due dates with reminders | should | ✅ |
| FR-AS4 | Status: pending → submitted → graded | must | ✅ |

### 3.6 AI Tutor

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-AI1 | Slide-out Sheet accessible from navbar | must | ✅ |
| FR-AI2 | Streaming responses from z-ai-web-dev-sdk | must | ✅ |
| FR-AI3 | Course-aware context (current course + lesson passed to API) | must | ✅ |
| FR-AI4 | Markdown rendering with syntax-highlighted code blocks | must | ✅ |
| FR-AI5 | Suggestion chips when conversation is empty | should | ✅ |
| FR-AI6 | Persistent chat history (last 20 messages persisted) | should | ✅ |

### 3.7 Human Tutors

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-HT1 | Tutors self-register via tutor application form | must | ✅ |
| FR-HT2 | Super admin approves/rejects applications | must | ✅ |
| FR-HT3 | Tutor marketplace with search + filter by expertise | must | ✅ |
| FR-HT4 | Book 1:1 session (date, time, topic, duration, price) | must | ✅ |
| FR-HT5 | Live session page (video + chat) | must | ✅ |
| FR-HT6 | Tutor portal with sessions, students, earnings, profile tabs | must | ✅ |
| FR-HT7 | Admin sets platform commission % and payout schedule per tutor | must | ✅ |
| FR-HT8 | Booking appears on both tutor's and candidate's calendars | must | ✅ |

### 3.8 Pricing & Checkout

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-P1 | 3 tiers: Monthly ($39/mo), Annual ($349/yr), Pay-per-Course ($159 one-time) | must | ✅ |
| FR-P2 | Per-course pricing overrides (visible on course detail page) | must | ✅ |
| FR-P3 | Mock checkout flow (card form, no real payment) | must | ✅ |
| FR-P4 | Pricing section on homepage + dedicated pricing page | must | ✅ |

### 3.9 Dashboard

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-D1 | After login, user lands on role-aware dashboard | must | ✅ |
| FR-D2 | Candidate dashboard: personal details, courses in progress, upcoming sessions, assignments, activity feed, mini-achievements, recommendations | must | ✅ |
| FR-D3 | Tutor dashboard: sessions, students, earnings, profile strength | must | ✅ |
| FR-D4 | Admin dashboard: KPIs, pending approvals, audit log, integrations health | must | ✅ |
| FR-D5 | Quick-action buttons (continue learning, book tutor, take quiz, etc.) | should | ✅ |

### 3.10 Notifications & Activity

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-N1 | In-app notifications bell with unread badge | must | ✅ |
| FR-N2 | Browser push notifications (Notification API) | should | ✅ |
| FR-N3 | Deep-link navigation from notification (e.g. course:ai-ml, messages, calendar) | must | ✅ |
| FR-N4 | Mark-as-read, mark-all-read, dismiss | must | ✅ |
| FR-N5 | Activity feed per user (lesson completed, quiz passed, badge earned, etc.) | must | ✅ |
| FR-N6 | Auto-request notification permission on mount | should | ✅ |

### 3.11 Certificates & Badges

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-CB1 | Auto-award certificate on course completion (with score %) | must | ✅ |
| FR-CB2 | Unique validation code per certificate | must | ✅ |
| FR-CB3 | 3 certificate templates (default / gold / platinum) | must | ✅ |
| FR-CB4 | Drag-and-drop certificate builder for admins | should | ✅ |
| FR-CB5 | Shareable certificate page with public validation URL | should | ✅ |
| FR-CB6 | 11 badge types across 4 tiers (bronze, silver, gold, platinum) | should | ✅ |
| FR-CB7 | Auto-award badges on milestones (first lesson, 5 quizzes, etc.) | should | ✅ |
| FR-CB8 | Achievements page showing earned vs locked badges | should | ✅ |

### 3.12 Social & Community

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-S1 | Members directory with search + role filter | should | ✅ |
| FR-S2 | Friend / follow system with pending → accepted states | should | ✅ |
| FR-S3 | Groups (study, cohort, tutor, regional, interest) with join/leave | should | ✅ |
| FR-S4 | Direct messages (1:1, thread-based) | should | ✅ |
| FR-S5 | Group chat (in roadmap) | could | 🚧 |
| FR-S6 | Live chat with online members (in roadmap) | could | 🚧 |

### 3.13 Calendar

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-CA1 | Personal calendar with sessions, deadlines, live classes, reminders | must | ✅ |
| FR-CA2 | Auto-add bookings to calendar | must | ✅ |
| FR-CA3 | Group by day, color-coded by type | should | ✅ |
| FR-CA4 | Click to join session / view deadline | should | ✅ |

### 3.14 Super Admin Portal

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-SA1 | 13 tabs: Dashboard, Users, Courses, Pricing, Tutors & Payments, Integrations, Roles & Permissions, Audit, Certificate Builder, Registration Forms, Email Scheduling, Analytics, GDPR | must | ✅ |
| FR-SA2 | User management: add, edit, suspend, delete, search, filter by role | must | ✅ |
| FR-SA3 | Course assignment to specific users (manual enrollment) | must | ✅ |
| FR-SA4 | Pricing control (edit global plans) | should | ✅ |
| FR-SA5 | Tutor approval workflow + payment terms editor | must | ✅ |
| FR-SA6 | Integrations panel (14 services: Zoom, Google Meet, BigBlueButton, Jitsi, Google Calendar, Slack, SendGrid, Auth0, Stripe, GitHub Classroom, Moodle, GA4, Segment) | must | ✅ |
| FR-SA7 | Role-permission matrix editor | must | ✅ |
| FR-SA8 | Audit log (last 50 admin actions) | must | ✅ |
| FR-SA9 | Drag-drop certificate builder | should | ✅ |
| FR-SA10 | Custom registration form editor per role | should | ✅ |
| FR-SA11 | Email schedule editor (8 schedule types) | should | ✅ |
| FR-SA12 | Analytics dashboard (KPIs, 8-week series, funnel, top courses) | should | ✅ |
| FR-SA13 | GDPR export bundle generator + checklist | should | ✅ |

### 3.15 Email Scheduling

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-E1 | 8 schedule types: welcome, drip_unlock, expiry_reminder, inactivity, session_reminder, certificate_issued, assignment_due, weekly_progress | should | ✅ |
| FR-E2 | Per-schedule toggle (on/off) | must | ✅ |
| FR-E3 | Subject + body template with {{vars}} substitution | must | ✅ |
| FR-E4 | Delay hours after trigger event | must | ✅ |
| FR-E5 | (Roadmap) Real email sending via SendGrid | could | 🚧 |

### 3.16 Analytics

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-AN1 | 6 KPI cards: total users, active 7d, enrollments 30d, completions 30d, revenue 30d, avg quiz score | should | ✅ |
| FR-AN2 | 8-week enrollments bar chart | should | ✅ |
| FR-AN3 | 8-week revenue bar chart | should | ✅ |
| FR-AN4 | 4-stage conversion funnel (signups → enrolled → lessons completed → certificates) | should | ✅ |
| FR-AN5 | Top 5 courses by enrollments + revenue | should | ✅ |
| FR-AN6 | GA4 integration (connected, mock events) | could | ✅ |
| FR-AN7 | (Roadmap) Cohort retention table | could | 🚧 |

### 3.17 GDPR & Compliance

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-G1 | Data export bundle request | must | ✅ |
| FR-G2 | Bundle status: pending → ready → expired (30-day TTL) | must | ✅ |
| FR-G3 | Right-to-erasure (delete user from Users tab cascades) | must | ✅ |
| FR-G4 | Consent log (ToS + Privacy Policy acceptance timestamp) | must | ✅ |
| FR-G5 | Data retention: analytics pruned to 90 days, bundles to 30 days | should | ✅ |
| FR-G6 | Cookie consent banner (in roadmap) | could | 🚧 |
| FR-G7 | DPA download per integration (in roadmap) | could | 🚧 |

### 3.18 PWA & Offline

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-PW1 | Installable (manifest.json + icons) | must | ✅ |
| FR-PW2 | Offline app-shell fallback via service worker | must | ✅ |
| FR-PW3 | Cache-first for static assets | must | ✅ |
| FR-PW4 | Network-first for navigations | must | ✅ |
| FR-PW5 | Theme color + apple touch icon | should | ✅ |

### 3.19 Integrations

14 third-party integrations exposed in the admin Integrations tab:

| Category | Integrations |
|----------|--------------|
| Payment | Stripe |
| Video | Zoom (connected), Google Meet, BigBlueButton, Jitsi |
| Calendar | Google Calendar (connected) |
| Communication | Slack (connected), GitHub Classroom, Moodle |
| Email | SendGrid (connected) |
| Auth | Auth0 |
| Analytics | Segment, Google Analytics 4 (connected) |

---

## 4. Non-Functional Requirements

### 4.1 Performance
- Initial page load: < 2s on 3G with cache
- Time to interactive: < 3s
- Build time: < 10s (Turbopack)
- Lighthouse PWA score: 100

### 4.2 Accessibility
- All shadcn/ui components are Radix-based (WCAG 2.1 AA)
- Keyboard navigation throughout
- Color contrast meets AA
- ARIA labels on all interactive elements

### 4.3 Browser Support
- Last 2 versions of Chrome, Firefox, Safari, Edge
- iOS Safari 15+
- Service worker requires HTTPS (Caddyfile included)

### 4.4 Security (production targets)
- CSP headers via Next.js middleware
- HTTPS-only cookies for auth tokens
- Rate limiting on `/api/tutor` (e.g. 30 req/min per user)
- Input validation on all API routes with Zod

### 4.5 Privacy
- GDPR-compliant data export & erasure
- No third-party tracking without consent
- PII minimization in analytics events

### 4.6 Internationalization
- (Roadmap) i18n via `next-intl` — currently English-only

---

## 5. Constraints & Assumptions

- This is a **demo MVP** — no real backend, payments, video, or email. All data lives in browser localStorage.
- The z-ai-web-dev-sdk requires `ZAI_API_KEY` to be set; without it, the AI tutor endpoint will 500.
- localStorage has a ~5MB quota; the store is partialized to stay well under.
- The demo has 5 seeded courses; additional courses would require extending `src/lib/courses.ts`.
- Demo accounts are seeded in `src/lib/seed-data.ts` — see the [Home page](Home) for credentials.

---

## 6. Acceptance Criteria — End-to-End Flows

### 6.1 Candidate journey
1. Land on homepage → see course grid, pricing, tutors preview
2. Click "Sign up" → choose "Candidate" → fill form → land on dashboard
3. From dashboard, click a course → see curriculum → start a lesson
4. Walk through steps → click "Finish & Take Test" → take quiz → see score
5. Click "Ask AI Tutor" in navbar → ask a question → see streaming response
6. Go to "Tutors" → pick a tutor → book a session → see it on calendar
7. Complete a course → earn certificate + badge → see in Achievements

### 6.2 Human tutor journey
1. Land on homepage → click "Become a tutor" → fill application → land on dashboard (status: pending)
2. (As admin) approve the tutor → (as tutor) refresh → see "approved" status
3. Set hourly rate + availability in tutor portal
4. Receive a booking from a candidate (or self-book as admin)
5. Join the live session page at the scheduled time
6. View earnings in tutor portal → see pending payout

### 6.3 Super admin journey
1. Click "Quick admin login" → land on admin portal
2. Visit each of the 13 tabs → confirm data loads
3. Suspend a user → verify they can't log in (next attempt)
4. Toggle a permission off for the Tutor role → verify a tutor loses that capability
5. Build a certificate template → save → award to a candidate
6. Configure a registration form field → verify it appears on the registration modal
7. Toggle an email schedule off → verify it shows as OFF
8. View analytics → confirm 6 KPIs + 2 charts + funnel + top courses render
9. Request a GDPR export → verify it appears as "pending" in the bundles list
10. Check audit log → verify every action above was logged

---

## 7. Glossary

| Term | Definition |
|------|------------|
| AI Tutor | The LLM-backed chat surface available 24/7 |
| Human Tutor | A vetted individual who teaches 1:1 paid sessions |
| Candidate | A learner enrolled in courses |
| Super Admin | The platform operator with full control |
| Bundle | A discounted package of multiple courses |
| Drip unlock | Releasing the next module only after the current is completed |
| Badge | A visual achievement marker (bronze/silver/gold/platinum) |
| Certificate | A shareable proof of course completion with a unique validation code |
| RBAC | Role-Based Access Control — permissions grouped per role |
| GDPR | General Data Protection Regulation (EU) |
| PWA | Progressive Web App — installable, offline-capable web app |
| BBB | BigBlueButton — open-source virtual classroom |
| LMS | Learning Management System |
| DPA | Data Processing Agreement |
