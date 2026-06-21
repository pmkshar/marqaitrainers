// ============================================================
// Core domain types for Marq AI Software Tutor
// ============================================================

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
  | 'my_learning';

export interface View {
  name: ViewName;
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  adminTab?: AdminTab;
  tutorTab?: TutorTab;
}

export type AdminTab =
  | 'dashboard'
  | 'users'
  | 'courses'
  | 'pricing'
  | 'tutors'
  | 'integrations'
  | 'roles'
  | 'audit';

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
