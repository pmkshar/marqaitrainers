// ============================================================
// Core domain types for Marq AI Software Tutor
// ============================================================

// ============================================================
// Activity / Social / Engagement features (WPLMS-parity)
// ============================================================

export type NotificationType =
  | 'info' | 'success' | 'warning' | 'error'
  | 'course' | 'session' | 'social' | 'system' | 'announcement';

export interface AppNotification {
  id: string;
  userId: string;       // recipient
  type: NotificationType;
  title: string;
  body: string;
  link?: string;        // navigation hint (e.g. "course:ai-ml")
  read: boolean;
  createdAt: number;
}

export type ActivityKind =
  | 'lesson_completed' | 'quiz_passed' | 'quiz_failed'
  | 'course_enrolled' | 'course_completed' | 'badge_earned'
  | 'certificate_earned' | 'session_booked' | 'session_completed'
  | 'note_saved' | 'discussion_posted' | 'announcement_posted'
  | 'group_joined' | 'friend_added' | 'message_sent';

export interface ActivityEntry {
  id: string;
  userId: string;
  kind: ActivityKind;
  courseId?: string;
  lessonId?: string;
  text: string;
  meta?: Record<string, string | number>;
  createdAt: number;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  code: string;          // unique validation code
  issuedAt: number;
  scorePct: number;
  template: 'default' | 'gold' | 'platinum';
}

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Badge {
  id: string;
  slug: string;           // e.g. 'first-lesson'
  title: string;
  description: string;
  tier: BadgeTier;
  icon: string;           // emoji
  criteria: string;
}

export interface UserBadge {
  userId: string;
  badgeSlug: string;
  awardedAt: number;
}

export interface LessonNote {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  body: string;
  isPrivate: boolean;     // private to student, or visible to instructor
  createdAt: number;
  updatedAt: number;
}

export interface DiscussionPost {
  id: string;
  courseId: string;
  lessonId?: string;
  authorId: string;
  body: string;
  upvotes: string[];      // user IDs
  replyToId?: string;
  createdAt: number;
}

export interface Announcement {
  id: string;
  courseId: string;
  authorId: string;
  title: string;
  body: string;
  createdAt: number;
}

export type AssignmentStatus = 'pending' | 'submitted' | 'graded';

export interface Assignment {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  prompt: string;
  maxMarks: number;
  dueAt: number;
  // per-student state
  submissions: Record<string, {
    status: AssignmentStatus;
    fileName?: string;
    submittedAt?: number;
    marks?: number;
    feedback?: string;
  }>;
}

export interface CourseCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  courseIds: string[];
}

export interface CourseBundle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  courseIds: string[];
  price: number;
  originalPrice: number;
  highlight: string;
}

export interface Group {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: 'study' | 'cohort' | 'tutor' | 'regional' | 'interest';
  memberIds: string[];
  adminIds: string[];
  createdAt: number;
}

export interface DirectMessage {
  id: string;
  threadId: string;       // sorted pair "u-a__u-b"
  fromId: string;
  toId: string;
  body: string;
  read: boolean;
  createdAt: number;
}

export interface CalendarEvent {
  id: string;
  userId: string;        // owner
  title: string;
  type: 'session' | 'deadline' | 'live_class' | 'reminder' | 'meeting';
  startsAt: number;
  durationMinutes: number;
  courseId?: string;
  link?: string;
}

export interface Friendship {
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted';
  createdAt: number;
}

export interface CourseEnrollmentMeta {
  userId: string;
  courseId: string;
  enrolledAt: number;
  expiresAt?: number;       // course expiration support
  model: 'one_time' | 'subscription_monthly' | 'subscription_annual' | 'bundle' | 'free';
  progressPct: number;
  lastAccessedAt: number;
}

export type RoleKey = 'super_admin' | 'tutor' | 'candidate' | 'guest';

export type PermissionKey =
  | 'users.read' | 'users.write' | 'users.delete'
  | 'courses.read' | 'courses.write' | 'courses.delete'
  | 'pricing.read' | 'pricing.write'
  | 'tutors.approve' | 'tutors.payment.write'
  | 'integrations.read' | 'integrations.write'
  | 'roles.read' | 'roles.write'
  | 'sessions.read' | 'sessions.write'
  | 'analytics.read'
  | 'chat.aitutor'           // anyone can chat with AI tutor
  | 'chat.humantutor'        // anyone can book a human tutor
  | 'content.learn';         // candidate can access lessons

export interface Role {
  key: RoleKey;
  name: string;
  description: string;
  permissions: PermissionKey[];
  isSystem: boolean; // system roles cannot be deleted
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleKey;
  avatarColor: string;
  enrolledCourseIds: string[];
  createdAt: number;
  // tutor-only fields
  tutorProfile?: TutorProfile;
  // admin-only fields
  permissions?: PermissionKey[]; // for custom admin sub-roles
  status: 'active' | 'suspended' | 'pending';
}

export interface TutorProfile {
  headline: string;
  bio: string;
  expertise: string[];       // course IDs
  hourlyRate: number;        // USD
  rating: number;
  sessionsCompleted: number;
  availability: 'available' | 'busy' | 'offline';
  paymentTerms: {
    platformFeePct: number;  // admin-set commission
    payoutSchedule: 'weekly' | 'monthly';
  };
  approved: boolean;
}

export interface Booking {
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

export type PricingModel = 'one_time' | 'subscription_monthly' | 'subscription_annual';

export interface PricingPlan {
  id: string;
  name: string;
  model: PricingModel;
  price: number;       // USD
  period: string;      // 'one-time' | 'month' | 'year'
  description: string;
  features: string[];
  highlighted?: boolean;
  courseId?: string;   // null = all-access
  ctaLabel: string;
}

export interface Integration {
  id: string;
  name: string;
  category: 'payment' | 'video' | 'calendar' | 'communication' | 'analytics' | 'auth' | 'email';
  description: string;
  icon: string;        // emoji or short label
  connected: boolean;
  config: Record<string, string>;
  requiredScopes: string[];
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  target?: string;
  timestamp: number;
}

// ============================================================
// Advanced WPLMS-parity: Certificate Builder, Custom Registration
// Forms, Email Scheduling, Deep Analytics, GDPR export bundles
// ============================================================

export interface CertificateTemplate {
  id: string;
  name: string;
  // canvas elements positioned in percentages (0-100)
  elements: CertificateElement[];
  background: string;   // gradient or color
  borderColor: string;
  width: number;        // px (render scale)
  height: number;       // px
  createdAt: number;
  updatedAt: number;
}

export type CertificateElementType =
  | 'title' | 'subtitle' | 'recipient_name' | 'course_name'
  | 'score' | 'date' | 'code' | 'signature' | 'logo' | 'static_text';

export interface CertificateElement {
  id: string;
  type: CertificateElementType;
  x: number;            // 0-100 (percent)
  y: number;            // 0-100 (percent)
  w: number;            // 0-100 (percent)
  fontSize: number;
  fontWeight: 400 | 500 | 600 | 700;
  color: string;
  text?: string;        // for static_text / signature label
  align: 'left' | 'center' | 'right';
}

export type RegistrationFieldKind =
  | 'text' | 'email' | 'password' | 'select' | 'checkbox'
  | 'radio' | 'textarea' | 'date' | 'tel' | 'number';

export interface RegistrationFormField {
  id: string;
  kind: RegistrationFieldKind;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];   // for select / radio / checkbox
  helpText?: string;
  width: 'half' | 'full';
}

export interface RegistrationFormConfig {
  id: string;
  role: RoleKey;
  name: string;
  fields: RegistrationFormField[];
  requireEmailVerification: boolean;
  requireCaptcha: boolean;
  requireTosAccept: boolean;
  updatedAt: number;
}

export type EmailScheduleKind =
  | 'welcome' | 'drip_unlock' | 'expiry_reminder'
  | 'inactivity' | 'session_reminder' | 'certificate_issued'
  | 'assignment_due' | 'weekly_progress';

export interface EmailSchedule {
  id: string;
  kind: EmailScheduleKind;
  name: string;
  trigger: string;          // human-readable trigger description
  delayHours: number;       // hours after the trigger event (0 = immediate)
  subject: string;
  bodyTemplate: string;     // markdown template with {{vars}}
  enabled: boolean;
  updatedAt: number;
}

export type AnalyticsEventKind =
  | 'page_view' | 'lesson_started' | 'lesson_completed'
  | 'quiz_attempted' | 'quiz_passed' | 'course_enrolled'
  | 'course_completed' | 'tutor_session_booked' | 'payment_completed'
  | 'certificate_earned' | 'signup' | 'login' | 'ai_tutor_message';

export interface AnalyticsEvent {
  id: string;
  kind: AnalyticsEventKind;
  userId?: string;
  courseId?: string;
  lessonId?: string;
  value?: number;             // e.g. quiz score pct, payment amount
  meta?: Record<string, string | number>;
  ts: number;                 // event timestamp
}

export interface AnalyticsSummary {
  totalUsers: number;
  activeUsers7d: number;
  enrollments30d: number;
  courseCompletions30d: number;
  revenue30d: number;
  avgQuizScore: number;
  // weekly time-series buckets (oldest -> newest)
  enrollmentsSeries: { ts: number; count: number }[];
  revenueSeries: { ts: number; amount: number }[];
  topCourses: { courseId: string; enrollments: number; completions: number; revenue: number }[];
  funnel: { stage: string; count: number; pct: number }[];
}

export interface GdprExportBundle {
  id: string;
  userId: string;
  requestedAt: number;
  status: 'pending' | 'ready' | 'expired';
  downloadUrl?: string;
  expiresAt: number;
}

// ============================================================
// Existing learning content types (kept from before)
// ============================================================

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface LessonStep {
  title: string;
  content: string;
  code?: string;
  codeLanguage?: string;
  tip?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  steps: LessonStep[];
  quiz: QuizQuestion[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Course {
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
  // pricing
  oneTimePrice: number;
  monthlyPrice: number;
  annualPrice: number;
  onDemand: boolean; // available on demand
  categoryIds: string[]; // course categories
  expiresAfterDays?: number; // course expiration window (e.g. 180 = 6 months)
}

export type ViewName =
  | 'home'
  | 'course'
  | 'lesson'
  | 'quiz'
  | 'pricing'
  | 'tutors'         // human tutor marketplace
  | 'tutor_portal'   // logged-in tutor dashboard
  | 'admin'          // super admin portal
  | 'my_learning'
  | 'dashboard'      // unified post-login dashboard (all roles)
  | 'certificates'
  | 'achievements'
  | 'calendar'
  | 'members'
  | 'groups'
  | 'messages'
  | 'features';      // WPLMS-parity features showcase

export interface View {
  name: ViewName;
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  adminTab?: AdminTab;
  tutorTab?: TutorTab;
  dmThreadId?: string;   // for messages view
}

export type AdminTab =
  | 'dashboard'
  | 'users'
  | 'courses'
  | 'pricing'
  | 'tutors'
  | 'integrations'
  | 'roles'
  | 'audit'
  | 'certificate_builder'
  | 'registration_forms'
  | 'email_scheduling'
  | 'analytics'
  | 'gdpr';

export type TutorTab =
  | 'overview'
  | 'sessions'
  | 'students'
  | 'earnings'
  | 'profile';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

// ============================================================
// Multi-lingual / Multi-country support
// ============================================================

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'INR' | 'AUD' | 'CAD';

export type LanguageCode = 'en' | 'es' | 'de' | 'ja' | 'hi' | 'fr';

export interface LocaleConfig {
  language: LanguageCode;
  currency: CurrencyCode;
  country: string;
  timezone: string;
}

// ============================================================
// Resume Studio types
// ============================================================

export type ResumeTemplateId = 'modern' | 'classic' | 'tech' | 'minimal';

export interface ResumeTemplate {
  id: ResumeTemplateId;
  name: string;
  description: string;
  accentGradient: string;
  styleHint: string;
  fontFamily: string;
}

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  { id: 'modern', name: 'Modern', description: 'Two-column with sidebar', accentGradient: 'from-emerald-500 to-teal-600', styleHint: 'modern two-column layout with a colored sidebar, bold sans-serif headings, and chips for skills', fontFamily: "'Inter', sans-serif" },
  { id: 'classic', name: 'Classic', description: 'Traditional single-column ATS-friendly', accentGradient: 'from-slate-700 to-slate-900', styleHint: 'classic single-column ATS-friendly layout with serif typography, centered name header, and conservative spacing', fontFamily: "'Georgia', serif" },
  { id: 'tech', name: 'Tech', description: 'Developer-focused layout', accentGradient: 'from-indigo-500 to-purple-600', styleHint: 'developer-focused layout with monospace headings, tech-stack badges, and project cards highlighting impact metrics', fontFamily: "'JetBrains Mono', monospace" },
  { id: 'minimal', name: 'Minimal', description: 'Clean, lots of whitespace', accentGradient: 'from-zinc-500 to-zinc-700', styleHint: 'minimal layout with generous whitespace, thin horizontal rules, small uppercase labels, and no sidebar', fontFamily: "'Helvetica Neue', sans-serif" },
];
