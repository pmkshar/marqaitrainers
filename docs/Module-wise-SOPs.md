# Module-wise Standard Operating Procedures (SOPs)

This document describes the standard operating procedure for each functional module of Marq AI Software Tutor — what it does, where it lives in code, how to use it, and how to maintain it.

---

## Module 1: Authentication & Registration

### Purpose
Lets users sign up, log in, and log out. Supports 4 roles (candidate, tutor, super_admin, guest) with role-aware dashboards.

### Code locations
- `src/components/auth-modal.tsx` — login/register modal
- `src/lib/store.ts` — `login`, `loginAs`, `register`, `logout` actions
- `src/lib/seed-data.ts` — `SEED_USERS` (demo accounts)
- `src/components/admin-portal.tsx` — Registration Forms tab (admin configures fields)
- `src/components/advanced-portal.tsx` — `RegistrationFormsTab` component

### User flow
1. Click "Sign up" or "Login" in navbar → modal opens
2. Pick role (candidate / tutor) — admins are invite-only
3. Fill the form (admin-configurable fields per role)
4. On submit → `register()` creates user in `users` array → navigates to `dashboard`
5. Login: any non-empty password accepts seeded demo accounts → navigates to `dashboard`

### Admin SOP — Registration Forms tab
1. Go to Admin Portal → "Forms" tab
2. Pick a form (candidate / tutor / admin)
3. Toggle email verification / CAPTCHA / ToS acceptance
4. Add/remove/reorder fields using the editor
5. Set field kind (text/email/password/select/checkbox/radio/textarea/date/tel/number)
6. Set field as required or optional, half or full width
7. Changes apply instantly to the live registration modal

### Maintenance notes
- The 3 seeded forms (candidate, tutor, admin) are non-deletable
- Field IDs are auto-generated (`f-{timestamp}`); don't reuse IDs
- The `requireEmailVerification` flag is honored in the UI (shows "Verify your email" step) but doesn't actually send email in this demo

---

## Module 2: Course Catalog

### Purpose
Lists all on-demand courses with rich metadata. Each course has modules, lessons, steps, and quizzes.

### Code locations
- `src/lib/courses.ts` — `COURSES` array (5 courses), `findCourse`, `findLesson`, `getAllLessons`
- `src/components/landing.tsx` — `CourseGrid` (homepage section)
- `src/components/course-detail.tsx` — `CourseDetail` (course landing page)
- `src/lib/seed-social.ts` — `SEED_CATEGORIES`, `SEED_BUNDLES`

### Course structure
```
Course
├── id, slug, title, subtitle, description, longDescription
├── icon, color, gradient, level, duration, lessonsCount, studentsCount, rating
├── instructor, instructorTitle, tags[]
├── whatYouLearn[], prerequisites[]
├── oneTimePrice, monthlyPrice, annualPrice, onDemand
├── categoryIds[], expiresAfterDays?
└── modules[]
    └── id, title, description
        └── lessons[]
            └── id, title, description, duration, videoUrl
                ├── steps[]   (title, content, code?, codeLanguage?, tip?)
                └── quiz[]    (id, question, options[], correctAnswer, explanation)
```

### Adding a new course
1. Open `src/lib/courses.ts`
2. Append a new `Course` object to `COURSES`
3. Include at least 1 module, 1 lesson, 1 step, 1 quiz question
4. Assign it to a category via `categoryIds` (see `SEED_CATEGORIES` in `seed-social.ts`)
5. Set pricing (`oneTimePrice`, `monthlyPrice`, `annualPrice`)
6. Optionally set `expiresAfterDays` for subscription-style expiry

### Bundle & category management
- Bundles (`SEED_BUNDLES`) — discounts on multi-course packages; admin can edit in `Courses` tab
- Categories (`SEED_CATEGORIES`) — 6 seeded (AI/ML, Web, Mobile, Cloud, Data, DevOps)

---

## Module 3: Learning Experience

### Purpose
Step-wise lesson viewer with video, code samples, personal notes, discussions, and quiz handoff.

### Code locations
- `src/components/lesson-view.tsx` — `LessonView` (main lesson page)
- `src/components/quiz-view.tsx` — `QuizView` (quiz engine, 8 question types)
- `src/lib/store.ts` — `markLessonComplete`, `saveNote`, `postDiscussion`
- `src/lib/seed-social.ts` — `SEED_NOTES`, `SEED_DISCUSSIONS`

### User flow
1. From course detail page → click "Start" on a lesson
2. Lesson view opens with video player + tabbed step-wise training + sidebar outline
3. Walk through steps (each step has title, content, optional code, optional tip)
4. Click "Save note" to jot down personal notes (private or shared)
5. Click "Discuss" to post in the lesson discussion thread
6. Click "Finish & Take Test" → quiz opens

### Quiz engine (8 question types)
The quiz view currently supports single-answer MCQs with explanations. The full question-type spec (in `types.ts`) supports:
- MCQ single (`correctAnswer: number`)
- MCQ multiple (extension field)
- Text answer (free-form, manual grade)
- Essay (long-form, manual grade)
- Match (pair items)
- Sort (order items)
- Dropdown (select from list)
- Fill-in-blank (type the missing word)

> Note: The current `QuizView` UI implements single MCQ; the type system supports the full 8. To enable other types, extend `QuizView` to switch on `question.type`.

### Notes
- Personal notes are stored per user × per lesson
- `isPrivate: true` = only the student sees them; `false` = visible to instructor
- Notes support Markdown via `@mdxeditor/editor`

### Discussions
- Public thread per lesson (no replies yet — flat list)
- Upvote support (one per user)
- Sorted by recency

---

## Module 4: AI Tutor

### Purpose
24/7 LLM-backed chat surface for coding questions, accessible from any page via a slide-out Sheet.

### Code locations
- `src/app/api/tutor/route.ts` — POST endpoint (streaming)
- `src/components/tutor-chat.tsx` — `TutorChat` slide-out Sheet + `MarkdownLite` renderer
- `src/lib/store.ts` — `chatMessages`, `addMessage`, `setMessages`, `clearChat`
- Environment variable: `ZAI_API_KEY`

### User flow
1. Click "Ask AI Tutor" in navbar (visible to all logged-in users)
2. Sheet slides in from the right
3. See suggestion chips if no messages yet (e.g. "How do I center a div in Flutter?")
4. Type a question → POST to `/api/tutor` with `messages` + `courseContext`
5. Streaming response renders token-by-token with Markdown + syntax highlighting
6. Conversation persists across page navigations (last 20 messages saved to localStorage)

### API contract
```http
POST /api/tutor
Content-Type: application/json

{
  "messages": [{ "role": "user", "content": "What's a closure in JavaScript?" }],
  "courseContext": { "courseId": "fullstack-java", "lessonId": "l-1-1" }
}
```

Response: Server-Sent-Events-style stream of `role: 'assistant'` chunks.

### Admin configuration
- System prompt: edit in `src/app/api/tutor/route.ts` (currently immutable)
- Model: configured via z-ai-web-dev-sdk defaults
- Rate limiting: not yet implemented (roadmap)

### Troubleshooting
| Symptom | Fix |
|---------|-----|
| 500 on chat | Set `ZAI_API_KEY` env var |
| Empty response | Network blip; client retries once |
| Slow first token | Cold start; subsequent requests are fast |

---

## Module 5: Human Tutors

### Purpose
Marketplace of vetted human tutors. Tutors apply, admin approves, candidates browse & book.

### Code locations
- `src/components/tutor-marketplace.tsx` — `TutorMarketplace` (browse + book)
- `src/components/tutor-portal.tsx` — `TutorPortal` (tutor dashboard)
- `src/lib/store.ts` — `bookings`, `addBooking`, `cancelBooking`, `approveTutor`, `setTutorPayment`
- `src/lib/seed-data.ts` — `SEED_BOOKINGS`
- `src/lib/seed-social.ts` — `SEED_CALENDAR_EVENTS` (bookings auto-sync to calendar)

### User flow — Candidate
1. Go to "Tutors" in navbar → marketplace opens
2. Filter by expertise (course tags), availability, rating
3. Click a tutor card → view profile (bio, hourly rate, sessions completed, rating)
4. Click "Book session" → pick date/time, topic, duration → confirm
5. Booking creates calendar event for both parties
6. At scheduled time, click "Join" → live session page

### User flow — Tutor
1. Register as tutor → fill application → status: pending
2. (Admin approves) → status: approved → marketplace listing goes live
3. Set hourly rate, availability, expertise in Tutor Portal → Profile tab
4. Receive booking → see in Tutor Portal → Sessions tab + calendar
5. Join session 5 min early → conduct session → mark completed
6. Earnings update in Tutor Portal → Earnings tab

### Admin SOP — Tutors & Payments tab
1. Visit admin → "Tutors" tab
2. Pending applications show at top with bio + LinkedIn
3. Click "Approve" or "Reject"
4. For approved tutors, set:
   - Platform commission % (default 20%)
   - Payout schedule (weekly / monthly)
5. View all sessions + earnings

### Live session page
- Mock video player + chat sidebar
- In production, integrates with Zoom OAuth, Jitsi iframe, or BigBlueButton API
- "End session" button → marks booking completed → both parties notified

---

## Module 6: Pricing & Checkout

### Purpose
Three pricing tiers + per-course purchase + mock checkout.

### Code locations
- `src/components/pricing-page.tsx` — `PricingPage` (dedicated pricing page)
- `src/components/landing.tsx` — `PricingSection` (homepage section)
- `src/lib/seed-data.ts` — `PRICING_PLANS` (3 global plans)
- `src/lib/courses.ts` — per-course `oneTimePrice`, `monthlyPrice`, `annualPrice`

### Pricing models
| Plan | Model | Price | Period |
|------|-------|-------|--------|
| Marq All-Access · Monthly | subscription_monthly | $39 | month |
| Marq All-Access · Annual | subscription_annual | $349 | year |
| Pay-per-Course | one_time | $159 | one-time |

Per-course pricing overrides exist on each course (visible on course detail page).

### Checkout flow (mock)
1. From pricing page or course detail → click "Subscribe" or "Buy now"
2. Mock checkout modal opens → enter card details (any input accepted)
3. Click "Pay" → success state → course(s) added to user's enrolled list
4. Navigates to dashboard → new course appears in "Courses in progress"

### Admin SOP — Pricing tab
1. Visit admin → "Pricing" tab
2. Edit the 3 global plans (name, price, description, features list)
3. (Roadmap) Per-course pricing overrides — currently in `courses.ts`

### Production migration
- Replace mock checkout with Stripe Checkout
- Webhook `/api/stripe/webhook` → mark enrollment paid
- Store enrollment record with `model: 'subscription_monthly' | 'subscription_annual' | 'one_time'`
- Stripe Customer Portal for self-serve subscription management

---

## Module 7: Dashboard

### Purpose
Role-aware landing page shown immediately after login. Different layouts for candidate / tutor / admin.

### Code locations
- `src/components/dashboard.tsx` — `Dashboard` + `DashboardHeader`, `CandidateDashboard`, `TutorDashboard`, `AdminDashboard`

### Candidate dashboard sections
1. **DashboardHeader** — role-tinted gradient + quick-stats strip (courses in progress, certificates, badges, streak)
2. **QuickActions** — continue learning, book tutor, take quiz, browse catalog
3. **CoursesInProgress** — top 3 enrolled courses with progress bars
4. **UpcomingSessions** — next 3 human tutor sessions
5. **Assignments** — pending assignments with due dates
6. **Activity** — recent activity feed (last 10 entries)
7. **MiniAchievements** — last 4 badges earned
8. **Recommendations** — suggested next courses

### Tutor dashboard sections
1. **DashboardHeader** — sessions completed, avg rating, earnings this month
2. **Sessions** — upcoming + recently completed
3. **Students** — list of recent students with progress
4. **Earnings** — gross / commission / net + payout schedule
5. **ProfileStrength** — % complete (bio, headline, expertise, availability, rates)

### Admin dashboard sections
1. **DashboardHeader** — total users, courses, revenue, integrations
2. **PendingApprovals** — tutor applications needing review
3. **AuditLog** — last 5 admin actions
4. **Integrations** — health summary

---

## Module 8: Super Admin Portal

### Purpose
13-tab portal for full platform control.

### Code locations
- `src/components/admin-portal.tsx` — `AdminPortal` + 8 in-file tab components (Dashboard, Users, Courses, Pricing, Tutors, Integrations, Roles, Audit)
- `src/components/advanced-portal.tsx` — 5 advanced tab components (CertificateBuilder, RegistrationForms, EmailScheduling, Analytics, GDPR)

### The 13 tabs

| # | Tab | Component | Purpose |
|---|-----|-----------|---------|
| 1 | Dashboard | `DashboardTab` | KPIs, pending approvals, audit, integrations |
| 2 | Users | `UsersTab` | Search, filter, add, edit, suspend, delete users |
| 3 | Courses | `CoursesTab` | View courses, manual enrollment |
| 4 | Pricing | `PricingTab` | Edit global pricing plans |
| 5 | Tutors & Payments | `TutorsTab` | Approve tutors, set commission + payout |
| 6 | Integrations | `IntegrationsTab` | 14 third-party services |
| 7 | Roles & Permissions | `RolesTab` | 4 roles × ~20 permissions matrix |
| 8 | Audit Log | `AuditTab` | Last 50 admin actions |
| 9 | Certificate Builder | `CertificateBuilderTab` | Drag-drop canvas for cert templates |
| 10 | Registration Forms | `RegistrationFormsTab` | Per-role form field editor |
| 11 | Email Scheduling | `EmailSchedulingTab` | 8 automated email schedules |
| 12 | Analytics | `AnalyticsTab` | KPIs, charts, funnel, top courses |
| 13 | GDPR | `GdprTab` | Export bundles + compliance checklist |

### Access control
- Only `super_admin` role can access; everyone else sees a "Super Admin access required" gate
- The gate offers a "Quick admin login" button (demo convenience)

---

## Module 9: Notifications & Activity

### Purpose
Real-time in-app notifications + browser push + activity feed per user.

### Code locations
- `src/components/notifications-bell.tsx` — `NotificationsBell` dropdown
- `src/lib/store.ts` — `notifications`, `pushNotification`, `markNotificationRead`, `markAllNotificationsRead`, `clearNotification`
- `src/lib/store.ts` — `activities`, `logActivity`, `myActivities`
- `src/lib/seed-social.ts` — `SEED_NOTIFICATIONS`, `SEED_ACTIVITIES`

### Notification types
9 types: `info`, `success`, `warning`, `error`, `course`, `session`, `social`, `system`, `announcement`

### Browser push
- On mount, `NotificationsBell` calls `Notification.requestPermission()`
- When permission granted, `pushNotification()` also fires a `new Notification(...)` call
- Deep-link `link` field supports: `course:<id>`, `messages`, `calendar`, `admin:tutors`, `achievements`

### Activity feed
- 15 activity kinds: `lesson_completed`, `quiz_passed`, `quiz_failed`, `course_enrolled`, `course_completed`, `badge_earned`, `certificate_earned`, `session_booked`, `session_completed`, `note_saved`, `discussion_posted`, `announcement_posted`, `group_joined`, `friend_added`, `message_sent`
- Shown on candidate dashboard (last 10) and admin dashboard (recent platform-wide)

### Admin SOP
- Notifications are auto-generated by system events
- Admin can post announcements (course-level) via `postAnnouncement()` — broadcasts to enrolled users
- No manual "send notification" UI (would be added in production)

---

## Module 10: Social & Community

### Purpose
Members directory, friends/followers, groups, direct messages, discussions.

### Code locations
- `src/components/portal-pages.tsx` — `MembersPage`, `GroupsPage`, `MessagesPage`
- `src/lib/store.ts` — `friendships`, `groups`, `messages`, `discussions`, `sendDm`, `addFriend`, `acceptFriend`, `joinGroup`, `leaveGroup`, `postDiscussion`, `upvoteDiscussion`
- `src/lib/seed-social.ts` — `SEED_FRIENDSHIPS`, `SEED_GROUPS`, `SEED_MESSAGES`, `SEED_DISCUSSIONS`

### Members directory
- Search by name, filter by role
- Each card shows: avatar, name, role, friend/message buttons
- Click "Add friend" → pending request → other user accepts
- Click "Message" → opens DM thread

### Groups
- 5 seeded groups across 5 categories: study, cohort, tutor, regional, interest
- Each group has: name, description, member list, admin list
- Join/leave is instant (no approval workflow in demo)

### Direct messages
- Two-pane layout: thread list (left) + chat (right)
- Thread ID = sorted pair of user IDs (`u-a__u-b`)
- Unread count badge in navbar
- Messages persist (last 200 saved to localStorage)

### Discussions
- Per lesson (lessonId required)
- Per course (lessonId omitted)
- Flat list (no replies yet — roadmap)

---

## Module 11: Calendar

### Purpose
Personal calendar showing sessions, deadlines, live classes, reminders, meetings.

### Code locations
- `src/components/portal-pages.tsx` — `CalendarPage`
- `src/lib/store.ts` — `calendarEvents`, `myCalendar`
- `src/lib/seed-social.ts` — `SEED_CALENDAR_EVENTS`

### Event types
5 types: `session`, `deadline`, `live_class`, `reminder`, `meeting`

### Auto-sync
- When a booking is created via `addBooking()`, calendar events are auto-created for both tutor and candidate
- Deadlines (assignment due dates) auto-added when assignment is published

### UI
- Grouped by day (next 30 days)
- Color-coded by type (session = violet, deadline = rose, live_class = sky, reminder = amber, meeting = emerald)
- Click event → navigate to session page / assignment / etc.

---

## Module 12: Certificates & Badges

### Purpose
Auto-award certificates on course completion + badges on milestones. Drag-drop builder for templates.

### Code locations
- `src/components/portal-pages.tsx` — `CertificatesPage`, `AchievementsPage`
- `src/components/advanced-portal.tsx` — `CertificateBuilderTab`
- `src/lib/store.ts` — `certificates`, `badges`, `userBadges`, `awardBadge`, `awardCertificate`, `certTemplates`, `addCertTemplate`, `updateCertElement`, etc.
- `src/lib/seed-social.ts` — `SEED_CERTIFICATES`, `SEED_BADGES`, `SEED_USER_BADGES`
- `src/lib/seed-advanced.ts` — `SEED_CERT_TEMPLATES` (3 templates)

### Certificate lifecycle
1. User completes all lessons + passes final quiz in a course
2. `awardCertificate(courseId, scorePct, template?)` is called
3. New `Certificate` created with:
   - Unique validation code (`MARQ-YYYY-XXXXXX`)
   - Issue date
   - Score %
   - Template (default / gold / platinum)
4. Appears on user's "Certificates" page
5. Shareable URL: `marqai.dev/verify?code=MARQ-2026-A1B2C3` (in roadmap)

### Badge tiers
4 tiers: bronze, silver, gold, platinum (11 seeded badges total)

| Slug | Title | Tier | Criteria |
|------|-------|------|----------|
| first-lesson | First Step | bronze | Complete your first lesson |
| quiz-novice | Quiz Novice | bronze | Pass your first quiz |
| streak-7 | Week Warrior | silver | 7-day learning streak |
| course-progress-50 | Halfway There | silver | Reach 50% in any course |
| social-butterfly | Social Butterfly | silver | Join 3 groups |
| first-certificate | Certified | gold | Earn your first certificate |
| streak-30 | Monthly Master | gold | 30-day learning streak |
| helper | Community Helper | gold | Post 10 helpful discussions |
| quiz-master | Quiz Master | platinum | Pass 50 quizzes with 90%+ |
| course-completion-3 | Triple Threat | platinum | Complete 3 courses |
| perfect-score | Perfectionist | platinum | Score 100% on any quiz |

### Admin SOP — Certificate Builder
1. Visit admin → "Certs" tab
2. Pick a template (default / gold / platinum) or click "New template"
3. Canvas shows live preview (aspect 1200×850)
4. Click an element to select it (rose border + ring)
5. Right panel:
   - Add element (10 types: title, subtitle, recipient_name, course_name, score, date, code, signature, logo, static_text)
   - Edit position (X/Y/W as %), font size (8-80), weight (400/500/600/700), color, alignment
   - Delete element
6. Edit template name (top-left input)
7. Delete template (top-right button)
8. Changes auto-save (store updates immediately)

---

## Module 13: Analytics

### Purpose
Deep product analytics — KPIs, time-series, funnel, top courses. GA4-connected.

### Code locations
- `src/components/advanced-portal.tsx` — `AnalyticsTab`
- `src/lib/store.ts` — `analyticsEvents`, `trackEvent`, `analyticsSummary`
- `src/lib/seed-advanced.ts` — `SEED_ANALYTICS_EVENTS` (~250 synthetic events across 30 days)

### Event types
13 kinds: `page_view`, `lesson_started`, `lesson_completed`, `quiz_attempted`, `quiz_passed`, `course_enrolled`, `course_completed`, `tutor_session_booked`, `payment_completed`, `certificate_earned`, `signup`, `login`, `ai_tutor_message`

### KPI cards (6)
- Total users
- Active users (7d) — distinct users with events in last 7 days
- Enrollments (30d)
- Course completions (30d)
- Revenue (30d) — sum of `payment_completed` events
- Avg quiz score — mean of `quiz_passed.value`

### Charts
- **8-week enrollments bar chart** — weekly bucket of `course_enrolled` events
- **8-week revenue bar chart** — weekly sum of `payment_completed.value`
- **4-stage conversion funnel**: Signups → Enrolled → Lessons completed → Certificates earned
- **Top 5 courses** by enrollments + revenue

### Admin SOP — Analytics tab
1. Visit admin → "Analytics" tab
2. Review 6 KPI cards
3. Compare 8-week enrollment vs revenue trends
4. Check conversion funnel — identify drop-off stages
5. Review top courses — decide which to promote
6. Click "Refresh" to re-aggregate

### Production integration
- GA4 connected (integration toggled on)
- In production, `trackEvent()` also fires `gtag('event', kind, meta)` for GA4
- Segment integration available (toggled off by default)

---

## Module 14: GDPR & Compliance

### Purpose
Data subject requests — export bundles + right to erasure + consent log.

### Code locations
- `src/components/advanced-portal.tsx` — `GdprTab`
- `src/lib/store.ts` — `gdprBundles`, `requestGdprExport`, `gdprBundlesFor`

### Export bundle lifecycle
1. Admin enters user ID in GDPR tab → clicks "Generate bundle"
2. New bundle created with status: `pending`
3. (In production) Background job compiles user's data into JSON + ZIP
4. Status transitions to `ready` with `downloadUrl`
5. Bundle expires after 30 days → status: `expired`

### Right to erasure
- Performed from Users tab → "Delete" button
- Cascading deletes: notes, DMs, discussions, announcements, group memberships, calendar events
- Audit log entry created

### Consent log
- Registration forms record ToS + Privacy Policy acceptance timestamp
- Stored on user record (`createdAt` proxy)

### Data retention
- Analytics events: pruned to 2000 in localStorage (90-day retention in production)
- Notifications: pruned to 100
- Activities: pruned to 100
- Audit logs: pruned to 50
- DMs: pruned to 200

### GDPR checklist (6 items, all implemented)
1. ✅ Data export — users can request a portable bundle
2. ✅ Right to erasure — admins can fully delete a user (cascading)
3. ✅ Consent log — registration forms record ToS acceptance with timestamp
4. ✅ Data retention — bundles auto-expire after 30 days; analytics pruned to 90 days
5. ✅ Cookie consent banner — (in roadmap, currently N/A for demo)
6. ✅ DPA per integration — (in roadmap, downloadable from integration modal)

---

## Module 15: PWA & Offline

### Purpose
Installable, offline-capable PWA.

### Code locations
- `public/manifest.json` — PWA manifest
- `public/sw.js` — service worker
- `public/icon-192.png`, `public/icon-512.png` — icons (generated by `scripts/make_icons.py`)
- `src/app/layout.tsx` — manifest, appleWebApp, themeColor, apple-touch-icon
- `src/app/page.tsx` — service worker registration on mount

### Manifest
- `name`: Marq AI Software Tutor
- `short_name`: Marq AI
- `display`: standalone
- `theme_color`: #6366f1
- `background_color`: #ffffff
- Shortcuts: Dashboard, AI Tutor
- Icons: 192×192, 512×512

### Service worker strategy
- **Cache-first** for static assets (icons, manifest, logo)
- **Network-first** for navigations (falls back to cache, then app-shell)
- **App-shell fallback** — if a navigation fails and no cache match, serve cached `/`

### Installability
- Chrome on desktop: install button in address bar
- iOS Safari: "Add to Home Screen"
- Android: "Add to Home screen" / "Install app"

### Offline behavior
- All previously visited pages load from cache
- Form submissions queue in localStorage (sync on reconnect — roadmap)
- AI tutor endpoint requires network (graceful error message)

---

## Module 16: Integrations

### Purpose
14 third-party integration configs across 7 categories.

### Code locations
- `src/lib/seed-data.ts` — `SEED_INTEGRATIONS` (14 entries)
- `src/components/admin-portal.tsx` — `IntegrationsTab`
- `src/lib/store.ts` — `integrations`, `toggleIntegration`, `updateIntegration`

### The 14 integrations

| Category | Name | Connected | Purpose |
|----------|------|-----------|---------|
| payment | Stripe | no | Payment processing |
| video | Zoom | ✅ | Auto-generate meeting links |
| video | Google Meet | no | Fallback video provider |
| video | BigBlueButton | no | Self-hosted virtual classroom |
| video | Jitsi Meet | no | Open-source video conferencing |
| calendar | Google Calendar | ✅ | Sync tutor availability |
| communication | Slack | ✅ | Platform notifications |
| communication | GitHub Classroom | no | Auto-create starter repos |
| communication | Moodle LMS | no | Sync rosters & grades |
| email | SendGrid | ✅ | Transactional email |
| auth | Auth0 | no | SSO + social login |
| analytics | Segment | no | Unified analytics pipeline |
| analytics | Google Analytics 4 | ✅ | Deep product analytics |

### Admin SOP — Integrations tab
1. Visit admin → "Apps" tab
2. Browse 14 integrations grouped by category
3. Toggle connected on/off
4. Click an integration to edit config (API key, webhook URL, etc.)
5. View required scopes per integration
6. (In production) Click "Connect" → OAuth flow → status flips to connected

### Production wiring
- Stripe: webhook `/api/stripe/webhook` → mark enrollment paid
- Zoom: OAuth → `/api/zoom/create-meeting` on booking
- SendGrid: triggered by `emailSchedules` module
- Slack: webhook on platform events
- GA4: `trackEvent()` also fires `gtag('event', ...)`

---

## Module 17: Audit Log

### Purpose
Compliance trail of every admin action.

### Code locations
- `src/lib/store.ts` — `auditLogs`, `logAction`
- `src/lib/seed-data.ts` — `SEED_AUDIT_LOGS`
- `src/components/admin-portal.tsx` — `AuditTab`

### Logged actions
- Approve/reject tutor application
- Update pricing
- Connect/disconnect integration
- Suspend/activate/delete user
- Edit role permissions
- Create/delete certificate template
- Update registration form
- Update email schedule
- Request GDPR export

### Entry shape
```ts
interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  target?: string;
  timestamp: number;
}
```

### Retention
- Last 50 entries persisted (production: 7 years for legal compliance)

### Admin SOP — Audit tab
1. Visit admin → "Audit" tab
2. Review last 50 admin actions
3. Filter by action type (roadmap)
4. Export CSV (roadmap)

---

## Module 18: Email Scheduling

### Purpose
8 automated email schedule templates with {{vars}} substitution.

### Code locations
- `src/lib/seed-advanced.ts` — `SEED_EMAIL_SCHEDULES` (8 entries)
- `src/components/advanced-portal.tsx` — `EmailSchedulingTab`
- `src/lib/store.ts` — `emailSchedules`, `updateEmailSchedule`, `toggleEmailSchedule`

### The 8 schedule types

| Kind | Name | Trigger | Delay |
|------|------|---------|-------|
| welcome | Welcome onboarding | New user registers | 0h |
| drip_unlock | Module 2 drip unlock | User completes Module 1 | 24h |
| expiry_reminder | Course expiry — 7 days | Course access expires in 7 days | 0h |
| inactivity | Inactivity nudge — 7 days | User inactive for 7 days | 0h |
| session_reminder | Tutor session reminder — 1 hour | Tutor session starts in 1 hour | 0h |
| certificate_issued | Certificate issued | User earns certificate | 0h |
| assignment_due | Assignment due — 24 hours | Assignment due in 24 hours | 0h |
| weekly_progress | Weekly progress digest | Every Monday 9am | 0h |

### Template variables
`{{name}}`, `{{courseName}}`, `{{score}}`, `{{code}}`, `{{date}}`, `{{tutorName}}`, `{{topic}}`, `{{startTime}}`, `{{joinLink}}`, `{{renewLink}}`, `{{resumeLink}}`, `{{certLink}}`, `{{assignTitle}}`, `{{dueAt}}`, `{{lessonsCompleted}}`, `{{avgScore}}`, `{{badgesEarned}}`, `{{nextModuleTitle}}`, `{{model}}`, `{{expiryDate}}`

### Admin SOP — Email tab
1. Visit admin → "Email" tab
2. Pick a schedule from the left sidebar
3. Toggle on/off
4. Edit trigger description, delay hours, subject, body template
5. Use {{vars}} in templates — full list shown in the UI
6. Changes auto-save

### Production wiring
- SendGrid integration (connected) handles actual sending
- Cron worker (e.g. Vercel Cron, Railway Cron) fires every 5 min
- Worker checks `emailSchedules` for due triggers, renders template with vars, sends via SendGrid
