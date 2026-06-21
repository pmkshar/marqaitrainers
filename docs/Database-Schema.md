# Database Schema

Marq AI Software Tutor uses an **in-browser Zustand store** persisted to `localStorage` as its primary data layer. There is no real database in this demo, but the store shape mirrors what a production Prisma schema would look like — making the migration path straightforward.

This document catalogs every entity, its fields, relationships, and seed location.

---

## 1. Persistence layer

- **Storage:** `localStorage` (browser)
- **Key:** `marq-ai-storage`
- **Library:** Zustand `persist` middleware with `createJSONStorage(() => localStorage)`
- **Quota:** ~5MB per origin; `partialize()` caps collections (e.g. last 20 chat messages, last 100 notifications, last 2000 analytics events)

### 1.1 Partialize strategy

```ts
partialize: (s) => ({
  completedLessons: s.completedLessons,
  chatMessages: s.chatMessages.slice(-20),
  currentUserId: s.currentUserId,
  users: s.users,
  roles: s.roles,
  bookings: s.bookings,
  integrations: s.integrations,
  auditLogs: s.auditLogs.slice(0, 50),
  notifications: s.notifications.slice(0, 100),
  activities: s.activities.slice(0, 100),
  certificates: s.certificates,
  userBadges: s.userBadges,
  notes: s.notes,
  discussions: s.discussions,
  announcements: s.announcements,
  assignments: s.assignments,
  groups: s.groups,
  messages: s.messages.slice(-200),
  calendarEvents: s.calendarEvents,
  friendships: s.friendships,
  certTemplates: s.certTemplates,
  registrationForms: s.registrationForms,
  emailSchedules: s.emailSchedules,
  analyticsEvents: s.analyticsEvents.slice(0, 2000),
  gdprBundles: s.gdprBundles,
})
```

---

## 2. Entity catalog

### 2.1 User

```ts
interface User {
  id: string;                    // e.g. 'u-cand-1'
  name: string;
  email: string;
  role: RoleKey;                 // 'super_admin' | 'tutor' | 'candidate' | 'guest'
  avatarColor: string;           // tailwind gradient class
  enrolledCourseIds: string[];
  createdAt: number;             // epoch ms
  tutorProfile?: TutorProfile;   // present only for tutors
  permissions?: PermissionKey[]; // for custom admin sub-roles
  status: 'active' | 'suspended' | 'pending';
}
```

**Relationships:**
- Has many `Booking` (as candidate or tutor)
- Has many `ActivityEntry`, `AppNotification`, `Certificate`, `UserBadge`, `LessonNote`, `CalendarEvent`, `DirectMessage`, `Friendship`
- Has one `TutorProfile` (if role === 'tutor')

**Seed location:** `src/lib/seed-data.ts` → `SEED_USERS` (5 users: 1 admin, 2 candidates, 2 tutors)

### 2.2 TutorProfile

```ts
interface TutorProfile {
  headline: string;
  bio: string;
  expertise: string[];       // course IDs
  hourlyRate: number;        // USD
  rating: number;            // 0-5
  sessionsCompleted: number;
  availability: 'available' | 'busy' | 'offline';
  paymentTerms: {
    platformFeePct: number;  // admin-set commission (e.g. 20)
    payoutSchedule: 'weekly' | 'monthly';
  };
  approved: boolean;
}
```

**Seed location:** Embedded in `SEED_USERS` for tutor users.

### 2.3 Role

```ts
interface Role {
  key: RoleKey;
  name: string;
  description: string;
  permissions: PermissionKey[];
  isSystem: boolean;   // system roles cannot be deleted
}
```

**Seed location:** `src/lib/seed-data.ts` → `DEFAULT_ROLES` (4 system roles)

### 2.4 PermissionKey

```ts
type PermissionKey =
  | 'users.read' | 'users.write' | 'users.delete'
  | 'courses.read' | 'courses.write' | 'courses.delete'
  | 'pricing.read' | 'pricing.write'
  | 'tutors.approve' | 'tutors.payment.write'
  | 'integrations.read' | 'integrations.write'
  | 'roles.read' | 'roles.write'
  | 'sessions.read' | 'sessions.write'
  | 'analytics.read'
  | 'chat.aitutor' | 'chat.humantutor'
  | 'content.learn';
```

**Seed location:** `src/lib/seed-data.ts` → `ALL_PERMISSIONS` (20 permissions grouped by domain)

### 2.5 Booking

```ts
interface Booking {
  id: string;
  tutorId: string;
  candidateId: string;
  courseContext?: string;
  scheduledAt: number;
  durationMinutes: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  topic: string;
  price: number;
}
```

**Seed location:** `src/lib/seed-data.ts` → `SEED_BOOKINGS`

### 2.6 Integration

```ts
interface Integration {
  id: string;
  name: string;
  category: 'payment' | 'video' | 'calendar' | 'communication' | 'analytics' | 'auth' | 'email';
  description: string;
  icon: string;
  connected: boolean;
  config: Record<string, string>;
  requiredScopes: string[];
}
```

**Seed location:** `src/lib/seed-data.ts` → `SEED_INTEGRATIONS` (14 integrations)

### 2.7 AuditLog

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

**Seed location:** `src/lib/seed-data.ts` → `SEED_AUDIT_LOGS`

### 2.8 AppNotification

```ts
interface AppNotification {
  id: string;
  userId: string;       // recipient
  type: NotificationType;
  title: string;
  body: string;
  link?: string;        // navigation hint (e.g. "course:ai-ml", "messages", "calendar")
  read: boolean;
  createdAt: number;
}

type NotificationType =
  | 'info' | 'success' | 'warning' | 'error'
  | 'course' | 'session' | 'social' | 'system' | 'announcement';
```

**Seed location:** `src/lib/seed-social.ts` → `SEED_NOTIFICATIONS`

### 2.9 ActivityEntry

```ts
interface ActivityEntry {
  id: string;
  userId: string;
  kind: ActivityKind;
  courseId?: string;
  lessonId?: string;
  text: string;
  meta?: Record<string, string | number>;
  createdAt: number;
}

type ActivityKind =
  | 'lesson_completed' | 'quiz_passed' | 'quiz_failed'
  | 'course_enrolled' | 'course_completed' | 'badge_earned'
  | 'certificate_earned' | 'session_booked' | 'session_completed'
  | 'note_saved' | 'discussion_posted' | 'announcement_posted'
  | 'group_joined' | 'friend_added' | 'message_sent';
```

**Seed location:** `src/lib/seed-social.ts` → `SEED_ACTIVITIES`

### 2.10 Certificate

```ts
interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  code: string;          // unique validation code (e.g. "MARQ-2026-A1B2C3")
  issuedAt: number;
  scorePct: number;
  template: 'default' | 'gold' | 'platinum';
}
```

**Seed location:** `src/lib/seed-social.ts` → `SEED_CERTIFICATES`

### 2.11 Badge & UserBadge

```ts
interface Badge {
  id: string;
  slug: string;          // e.g. 'first-lesson'
  title: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  icon: string;          // emoji
  criteria: string;
}

interface UserBadge {
  userId: string;
  badgeSlug: string;
  awardedAt: number;
}
```

**Seed location:** `src/lib/seed-social.ts` → `SEED_BADGES` (11 badges), `SEED_USER_BADGES`

### 2.12 LessonNote

```ts
interface LessonNote {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  body: string;
  isPrivate: boolean;     // private to student, or visible to instructor
  createdAt: number;
  updatedAt: number;
}
```

**Seed location:** `src/lib/seed-social.ts` → `SEED_NOTES`

### 2.13 DiscussionPost

```ts
interface DiscussionPost {
  id: string;
  courseId: string;
  lessonId?: string;
  authorId: string;
  body: string;
  upvotes: string[];      // user IDs
  replyToId?: string;
  createdAt: number;
}
```

**Seed location:** `src/lib/seed-social.ts` → `SEED_DISCUSSIONS`

### 2.14 Announcement

```ts
interface Announcement {
  id: string;
  courseId: string;
  authorId: string;
  title: string;
  body: string;
  createdAt: number;
}
```

**Seed location:** `src/lib/seed-social.ts` → `SEED_ANNOUNCEMENTS`

### 2.15 Assignment

```ts
interface Assignment {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  prompt: string;
  maxMarks: number;
  dueAt: number;
  submissions: Record<string, {  // keyed by userId
    status: 'pending' | 'submitted' | 'graded';
    fileName?: string;
    submittedAt?: number;
    marks?: number;
    feedback?: string;
  }>;
}
```

**Seed location:** `src/lib/seed-social.ts` → `SEED_ASSIGNMENTS`

### 2.16 CourseCategory

```ts
interface CourseCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  courseIds: string[];
}
```

**Seed location:** `src/lib/seed-social.ts` → `SEED_CATEGORIES` (6 categories)

### 2.17 CourseBundle

```ts
interface CourseBundle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  courseIds: string[];
  price: number;
  originalPrice: number;
  highlight: string;
}
```

**Seed location:** `src/lib/seed-social.ts` → `SEED_BUNDLES` (3 bundles)

### 2.18 Group

```ts
interface Group {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: 'study' | 'cohort' | 'tutor' | 'regional' | 'interest';
  memberIds: string[];
  adminIds: string[];
  createdAt: number;
}
```

**Seed location:** `src/lib/seed-social.ts` → `SEED_GROUPS` (5 groups)

### 2.19 DirectMessage

```ts
interface DirectMessage {
  id: string;
  threadId: string;       // sorted pair "u-a__u-b"
  fromId: string;
  toId: string;
  body: string;
  read: boolean;
  createdAt: number;
}
```

**Seed location:** `src/lib/seed-social.ts` → `SEED_MESSAGES`

### 2.20 CalendarEvent

```ts
interface CalendarEvent {
  id: string;
  userId: string;        // owner
  title: string;
  type: 'session' | 'deadline' | 'live_class' | 'reminder' | 'meeting';
  startsAt: number;
  durationMinutes: number;
  courseId?: string;
  link?: string;
}
```

**Seed location:** `src/lib/seed-social.ts` → `SEED_CALENDAR_EVENTS`

### 2.21 Friendship

```ts
interface Friendship {
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted';
  createdAt: number;
}
```

**Seed location:** `src/lib/seed-social.ts` → `SEED_FRIENDSHIPS`

### 2.22 CourseEnrollmentMeta

```ts
interface CourseEnrollmentMeta {
  userId: string;
  courseId: string;
  enrolledAt: number;
  expiresAt?: number;       // course expiration support
  model: 'one_time' | 'subscription_monthly' | 'subscription_annual' | 'bundle' | 'free';
  progressPct: number;
  lastAccessedAt: number;
}
```

**Seed location:** Derived from `User.enrolledCourseIds` + `User.createdAt` (not separately seeded)

### 2.23 CertificateTemplate & CertificateElement

```ts
interface CertificateTemplate {
  id: string;
  name: string;
  elements: CertificateElement[];
  background: string;     // gradient or color
  borderColor: string;
  width: number;          // px (render scale, e.g. 1200)
  height: number;         // px (e.g. 850)
  createdAt: number;
  updatedAt: number;
}

interface CertificateElement {
  id: string;
  type: 'title' | 'subtitle' | 'recipient_name' | 'course_name'
       | 'score' | 'date' | 'code' | 'signature' | 'logo' | 'static_text';
  x: number;              // 0-100 (percent)
  y: number;              // 0-100 (percent)
  w: number;              // 0-100 (percent)
  fontSize: number;       // 8-80
  fontWeight: 400 | 500 | 600 | 700;
  color: string;
  text?: string;          // for static_text / signature / logo
  align: 'left' | 'center' | 'right';
}
```

**Seed location:** `src/lib/seed-advanced.ts` → `SEED_CERT_TEMPLATES` (3 templates)

### 2.24 RegistrationFormConfig & RegistrationFormField

```ts
interface RegistrationFormConfig {
  id: string;
  role: RoleKey;
  name: string;
  fields: RegistrationFormField[];
  requireEmailVerification: boolean;
  requireCaptcha: boolean;
  requireTosAccept: boolean;
  updatedAt: number;
}

interface RegistrationFormField {
  id: string;
  kind: 'text' | 'email' | 'password' | 'select' | 'checkbox'
       | 'radio' | 'textarea' | 'date' | 'tel' | 'number';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];     // for select / radio / checkbox
  helpText?: string;
  width: 'half' | 'full';
}
```

**Seed location:** `src/lib/seed-advanced.ts` → `SEED_REG_FORMS` (3 forms: candidate, tutor, admin)

### 2.25 EmailSchedule

```ts
interface EmailSchedule {
  id: string;
  kind: 'welcome' | 'drip_unlock' | 'expiry_reminder'
       | 'inactivity' | 'session_reminder' | 'certificate_issued'
       | 'assignment_due' | 'weekly_progress';
  name: string;
  trigger: string;          // human-readable trigger description
  delayHours: number;       // hours after the trigger event (0 = immediate)
  subject: string;
  bodyTemplate: string;     // markdown template with {{vars}}
  enabled: boolean;
  updatedAt: number;
}
```

**Seed location:** `src/lib/seed-advanced.ts` → `SEED_EMAIL_SCHEDULES` (8 schedules)

### 2.26 AnalyticsEvent & AnalyticsSummary

```ts
interface AnalyticsEvent {
  id: string;
  kind: 'page_view' | 'lesson_started' | 'lesson_completed'
       | 'quiz_attempted' | 'quiz_passed' | 'course_enrolled'
       | 'course_completed' | 'tutor_session_booked' | 'payment_completed'
       | 'certificate_earned' | 'signup' | 'login' | 'ai_tutor_message';
  userId?: string;
  courseId?: string;
  lessonId?: string;
  value?: number;             // e.g. quiz score pct, payment amount
  meta?: Record<string, string | number>;
  ts: number;                 // event timestamp
}

interface AnalyticsSummary {
  totalUsers: number;
  activeUsers7d: number;
  enrollments30d: number;
  courseCompletions30d: number;
  revenue30d: number;
  avgQuizScore: number;
  enrollmentsSeries: { ts: number; count: number }[];     // 8 buckets
  revenueSeries: { ts: number; amount: number }[];         // 8 buckets
  topCourses: { courseId: string; enrollments: number; completions: number; revenue: number }[];
  funnel: { stage: string; count: number; pct: number }[]; // 4 stages
}
```

**Seed location:** `src/lib/seed-advanced.ts` → `SEED_ANALYTICS_EVENTS` (~250 synthetic events across 30 days)

### 2.27 GdprExportBundle

```ts
interface GdprExportBundle {
  id: string;
  userId: string;
  requestedAt: number;
  status: 'pending' | 'ready' | 'expired';
  downloadUrl?: string;
  expiresAt: number;       // 30 days after request
}
```

**Seed location:** `src/lib/seed-advanced.ts` → `SEED_GDPR_BUNDLES`

---

## 3. Learning content (read-only)

### 3.1 Course, Module, Lesson, LessonStep, QuizQuestion

See `src/lib/courses.ts` for the full type definitions and 5 seeded courses. These are static data (not user-editable in this demo).

```ts
interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  icon: string;
  color: string;
  gradient: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  duration: string;
  lessonsCount: number;
  studentsCount: string;
  rating: number;
  instructor: string;
  instructorTitle: string;
  tags: string[];
  whatYouLearn: string[];
  prerequisites: string[];
  modules: Module[];
  oneTimePrice: number;
  monthlyPrice: number;
  annualPrice: number;
  onDemand: boolean;
  categoryIds: string[];
  expiresAfterDays?: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  steps: LessonStep[];
  quiz: QuizQuestion[];
}

interface LessonStep {
  title: string;
  content: string;
  code?: string;
  codeLanguage?: string;
  tip?: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}
```

---

## 4. Migration to Prisma (production)

The optional Prisma schema at `prisma/schema.prisma` is ready to be expanded. The migration path:

1. For each entity above, add a Prisma `model` block.
2. Replace Zustand actions with Prisma client calls.
3. Add a `/api/*` endpoint per resource (see [API Reference](API-Reference)).
4. Hydrate the store from the API on mount (`useEffect` + `fetch`).
5. Keep the store for client-side state only (view, modals, optimistic UI).

**Estimated effort:** ~2 weeks for a single developer.

---

## 5. Backup & restore (production target)

In production:
- **Backup:** Nightly Postgres dumps to S3, 30-day retention
- **Restore:** Point-in-time recovery via RDS automated backups
- **Disaster recovery:** Multi-AZ replication, RTO 1 hour, RPO 15 minutes

For the demo, users can export their state manually via browser dev tools:

```js
// Export
copy(JSON.stringify(JSON.parse(localStorage.getItem('marq-ai-storage')), null, 2))

// Import
localStorage.setItem('marq-ai-storage', JSON.stringify(/* pasted JSON */))
location.reload()
```
