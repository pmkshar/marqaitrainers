import type { User, TutorProfile, Booking, Integration, PricingPlan, Role, PermissionKey, AuditLog } from './types';

// ============================================================
// RBAC — Role definitions with permissions
// ============================================================

export const ALL_PERMISSIONS: { key: PermissionKey; label: string; group: string }[] = [
  { key: 'users.read', label: 'View users', group: 'Users' },
  { key: 'users.write', label: 'Create / edit users', group: 'Users' },
  { key: 'users.delete', label: 'Delete users', group: 'Users' },
  { key: 'courses.read', label: 'View courses', group: 'Courses' },
  { key: 'courses.write', label: 'Create / edit courses', group: 'Courses' },
  { key: 'courses.delete', label: 'Delete courses', group: 'Courses' },
  { key: 'pricing.read', label: 'View pricing', group: 'Pricing' },
  { key: 'pricing.write', label: 'Edit pricing', group: 'Pricing' },
  { key: 'tutors.approve', label: 'Approve tutors', group: 'Tutors' },
  { key: 'tutors.payment.write', label: 'Set tutor payouts', group: 'Tutors' },
  { key: 'integrations.read', label: 'View integrations', group: 'Integrations' },
  { key: 'integrations.write', label: 'Configure integrations', group: 'Integrations' },
  { key: 'roles.read', label: 'View roles', group: 'Roles' },
  { key: 'roles.write', label: 'Edit roles & permissions', group: 'Roles' },
  { key: 'sessions.read', label: 'View sessions', group: 'Sessions' },
  { key: 'sessions.write', label: 'Schedule / cancel sessions', group: 'Sessions' },
  { key: 'analytics.read', label: 'View analytics', group: 'Analytics' },
  { key: 'chat.aitutor', label: 'Use AI tutor', group: 'Chat' },
  { key: 'chat.humantutor', label: 'Book human tutors', group: 'Chat' },
  { key: 'content.learn', label: 'Access lessons & quizzes', group: 'Content' },
];

export const DEFAULT_ROLES: Role[] = [
  {
    key: 'super_admin',
    name: 'Super Admin',
    description: 'Full platform control — users, courses, pricing, integrations, roles, and analytics.',
    permissions: ALL_PERMISSIONS.map((p) => p.key),
    isSystem: true,
  },
  {
    key: 'tutor',
    name: 'Human Tutor',
    description: 'Enrolled human tutor — teaches 1:1 sessions, manages own students and earnings.',
    permissions: ['sessions.read', 'sessions.write', 'chat.humantutor', 'content.learn'],
    isSystem: true,
  },
  {
    key: 'candidate',
    name: 'Candidate',
    description: 'Registered learner — enrolls in courses, takes tests, books human tutors, uses AI tutor.',
    permissions: ['content.learn', 'chat.aitutor', 'chat.humantutor', 'sessions.read', 'sessions.write'],
    isSystem: true,
  },
  {
    key: 'guest',
    name: 'Guest',
    description: 'Unregistered visitor — can browse the catalog and pricing but cannot access lessons.',
    permissions: ['courses.read', 'pricing.read'],
    isSystem: true,
  },
];

// ============================================================
// Seed users (mock)
// ============================================================

const tutorProfile1: TutorProfile = {
  headline: 'Senior AI/ML Engineer · ex-Google',
  bio: '10 years building production ML systems at Google and Stripe. I love mentoring career-switchers into AI roles. Specialize in PyTorch, LLMs, and RAG pipelines.',
  expertise: ['ai-ml'],
  hourlyRate: 85,
  rating: 4.9,
  sessionsCompleted: 312,
  availability: 'available',
  paymentTerms: { platformFeePct: 20, payoutSchedule: 'weekly' },
  approved: true,
};

const tutorProfile2: TutorProfile = {
  headline: 'Full Stack Java Architect · 12 yrs',
  bio: 'Built Spring Boot platforms serving millions of users at Flipkart and Razorpay. I help students crack Java backend interviews and ship production apps.',
  expertise: ['java-fullstack'],
  hourlyRate: 70,
  rating: 4.8,
  sessionsCompleted: 198,
  availability: 'busy',
  paymentTerms: { platformFeePct: 18, payoutSchedule: 'monthly' },
  approved: true,
};

const tutorProfile3: TutorProfile = {
  headline: 'Flutter GDE · Mobile Lead',
  bio: 'Google Developer Expert in Flutter. Shipped 8 apps to App Store + Play Store with 4M+ downloads. Passionate about clean Riverpod architecture.',
  expertise: ['flutter-dev', 'mobile-dev'],
  hourlyRate: 75,
  rating: 5.0,
  sessionsCompleted: 145,
  availability: 'available',
  paymentTerms: { platformFeePct: 20, payoutSchedule: 'weekly' },
  approved: true,
};

const tutorProfile4: TutorProfile = {
  headline: '.NET MVP · Cloud Architect',
  bio: 'Microsoft MVP in .NET for 6 years. I teach modern ASP.NET Core, EF Core, and Azure deployment. Specialize in legacy migration to .NET 8.',
  expertise: ['dotnet-fullstack'],
  hourlyRate: 80,
  rating: 4.7,
  sessionsCompleted: 89,
  availability: 'offline',
  paymentTerms: { platformFeePct: 22, payoutSchedule: 'monthly' },
  approved: true,
};

const tutorProfile5: TutorProfile = {
  headline: 'Mobile Engineer · ex-Shopify',
  bio: 'Shipped React Native apps at scale. I help learners go from zero to App Store in 8 weeks. Big on testing and CI/CD.',
  expertise: ['mobile-dev'],
  hourlyRate: 65,
  rating: 4.6,
  sessionsCompleted: 56,
  availability: 'available',
  paymentTerms: { platformFeePct: 18, payoutSchedule: 'weekly' },
  approved: false, // pending approval
};

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

export const SEED_USERS: User[] = [
  // Super admin
  {
    id: 'u-admin-1',
    name: 'Maya Iyer',
    email: 'admin@marqai.dev',
    role: 'super_admin',
    avatarColor: 'from-rose-500 to-pink-600',
    enrolledCourseIds: [],
    createdAt: now - 365 * day,
    status: 'active',
  },
  // Human tutors
  {
    id: 'u-tutor-1',
    name: 'Dr. Anika Sharma',
    email: 'anika@marqai.dev',
    role: 'tutor',
    avatarColor: 'from-emerald-500 to-teal-600',
    enrolledCourseIds: ['ai-ml'],
    createdAt: now - 220 * day,
    status: 'active',
    tutorProfile: tutorProfile1,
  },
  {
    id: 'u-tutor-2',
    name: 'Ravi Menon',
    email: 'ravi@marqai.dev',
    role: 'tutor',
    avatarColor: 'from-amber-500 to-orange-600',
    enrolledCourseIds: ['java-fullstack'],
    createdAt: now - 180 * day,
    status: 'active',
    tutorProfile: tutorProfile2,
  },
  {
    id: 'u-tutor-3',
    name: 'Aisha Patel',
    email: 'aisha@marqai.dev',
    role: 'tutor',
    avatarColor: 'from-sky-500 to-cyan-600',
    enrolledCourseIds: ['flutter-dev', 'mobile-dev'],
    createdAt: now - 150 * day,
    status: 'active',
    tutorProfile: tutorProfile3,
  },
  {
    id: 'u-tutor-4',
    name: 'Linda Park',
    email: 'linda@marqai.dev',
    role: 'tutor',
    avatarColor: 'from-violet-500 to-purple-600',
    enrolledCourseIds: ['dotnet-fullstack'],
    createdAt: now - 95 * day,
    status: 'active',
    tutorProfile: tutorProfile4,
  },
  {
    id: 'u-tutor-5',
    name: 'Marcus Lee',
    email: 'marcus@marqai.dev',
    role: 'tutor',
    avatarColor: 'from-fuchsia-500 to-pink-600',
    enrolledCourseIds: ['mobile-dev'],
    createdAt: now - 5 * day,
    status: 'pending',
    tutorProfile: tutorProfile5,
  },
  // Candidates
  {
    id: 'u-cand-1',
    name: 'Priya Nair',
    email: 'priya@example.com',
    role: 'candidate',
    avatarColor: 'from-teal-500 to-emerald-600',
    enrolledCourseIds: ['ai-ml', 'flutter-dev'],
    createdAt: now - 60 * day,
    status: 'active',
  },
  {
    id: 'u-cand-2',
    name: 'Daniel Wu',
    email: 'daniel@example.com',
    role: 'candidate',
    avatarColor: 'from-indigo-500 to-blue-600',
    enrolledCourseIds: ['java-fullstack'],
    createdAt: now - 30 * day,
    status: 'active',
  },
  {
    id: 'u-cand-3',
    name: 'Sara Kim',
    email: 'sara@example.com',
    role: 'candidate',
    avatarColor: 'from-orange-500 to-red-600',
    enrolledCourseIds: [],
    createdAt: now - 3 * day,
    status: 'active',
  },
];

// ============================================================
// Seed bookings (mock)
// ============================================================

export const SEED_BOOKINGS: Booking[] = [
  {
    id: 'b-1',
    tutorId: 'u-tutor-1',
    candidateId: 'u-cand-1',
    courseContext: 'ai-ml',
    scheduledAt: now + 2 * day,
    durationMinutes: 60,
    status: 'upcoming',
    topic: 'Backprop through a transformer — intuition',
    price: 85,
  },
  {
    id: 'b-2',
    tutorId: 'u-tutor-3',
    candidateId: 'u-cand-1',
    courseContext: 'flutter-dev',
    scheduledAt: now + 5 * day,
    durationMinutes: 90,
    status: 'upcoming',
    topic: 'Riverpod architecture review for my app',
    price: 112,
  },
  {
    id: 'b-3',
    tutorId: 'u-tutor-2',
    candidateId: 'u-cand-2',
    courseContext: 'java-fullstack',
    scheduledAt: now - 2 * day,
    durationMinutes: 60,
    status: 'completed',
    topic: 'Spring Security JWT — production hardening',
    price: 70,
  },
  {
    id: 'b-4',
    tutorId: 'u-tutor-1',
    candidateId: 'u-cand-3',
    courseContext: 'ai-ml',
    scheduledAt: now + 1 * day,
    durationMinutes: 60,
    status: 'upcoming',
    topic: 'Choosing between RAG and fine-tuning',
    price: 85,
  },
];

// ============================================================
// Integrations catalog
// ============================================================

export const SEED_INTEGRATIONS: Integration[] = [
  {
    id: 'int-stripe',
    name: 'Stripe',
    category: 'payment',
    description: 'Accept subscription and one-time payments from candidates. Powers monthly/annual billing.',
    icon: '💳',
    connected: true,
    config: { publishableKey: 'pk_live_••••••••', webhookSecret: 'whsec_••••' },
    requiredScopes: ['payments:write', 'customers:read'],
  },
  {
    id: 'int-paypal',
    name: 'PayPal',
    category: 'payment',
    description: 'Alternative payment rail for international candidates.',
    icon: '🅿️',
    connected: false,
    config: {},
    requiredScopes: ['payments:write'],
  },
  {
    id: 'int-zoom',
    name: 'Zoom',
    category: 'video',
    description: 'Auto-generate Zoom meeting links for human tutor 1:1 sessions.',
    icon: '🎥',
    connected: true,
    config: { accountId: 'acc_••••', clientId: 'zoom_••••' },
    requiredScopes: ['meetings:write', 'users:read'],
  },
  {
    id: 'int-google-meet',
    name: 'Google Meet',
    category: 'video',
    description: 'Fallback video provider for tutor sessions.',
    icon: '📞',
    connected: false,
    config: {},
    requiredScopes: ['meetings:write'],
  },
  {
    id: 'int-google-cal',
    name: 'Google Calendar',
    category: 'calendar',
    description: 'Sync tutor availability and push session invites to candidates.',
    icon: '📅',
    connected: true,
    config: { serviceAccountEmail: 'marqai@cal.iam.gserviceaccount.com' },
    requiredScopes: ['calendar:write'],
  },
  {
    id: 'int-slack',
    name: 'Slack',
    category: 'communication',
    description: 'Push platform notifications — new enrollments, tutor applications, failed payments.',
    icon: '💬',
    connected: true,
    config: { webhookUrl: 'https://hooks.slack.com/services/••••' },
    requiredScopes: ['messages:write'],
  },
  {
    id: 'int-sendgrid',
    name: 'SendGrid',
    category: 'email',
    description: 'Transactional email — receipts, password resets, session reminders.',
    icon: '✉️',
    connected: true,
    config: { apiKey: 'SG.••••', fromEmail: 'hello@marqai.dev' },
    requiredScopes: ['email:send'],
  },
  {
    id: 'int-auth0',
    name: 'Auth0',
    category: 'auth',
    description: 'SSO and social login (Google, GitHub, Microsoft) for candidates and tutors.',
    icon: '🔐',
    connected: false,
    config: {},
    requiredScopes: ['users:read', 'users:write'],
  },
  {
    id: 'int-segment',
    name: 'Segment',
    category: 'analytics',
    description: 'Unified analytics pipeline — funnel, retention, course completion tracking.',
    icon: '📊',
    connected: false,
    config: {},
    requiredScopes: ['track:write'],
  },
  {
    id: 'int-github',
    name: 'GitHub Classroom',
    category: 'communication',
    description: 'Auto-create starter repos for coding exercises and grade via PRs.',
    icon: '🐙',
    connected: false,
    config: {},
    requiredScopes: ['repos:write', 'orgs:read'],
  },
  {
    id: 'int-bbb',
    name: 'BigBlueButton',
    category: 'video',
    description: 'Self-hosted virtual classroom with shared whiteboard, breakout rooms, polling, and recording for live cohort classes.',
    icon: '🔵',
    connected: false,
    config: { serverUrl: 'https://bbb.marqai.dev/bigbluebutton/' },
    requiredScopes: ['meetings:write', 'recordings:read'],
  },
  {
    id: 'int-jitsi',
    name: 'Jitsi Meet',
    category: 'video',
    description: 'Open-source video conferencing — drop-in rooms for tutor 1:1s, no participant limit, end-to-end encryption.',
    icon: '🟢',
    connected: false,
    config: { serverUrl: 'https://meet.jit.si' },
    requiredScopes: ['meetings:write'],
  },
  {
    id: 'int-moodle',
    name: 'Moodle LMS',
    category: 'communication',
    description: 'Sync course rosters and grades with an existing Moodle installation for hybrid deployments.',
    icon: '🎓',
    connected: false,
    config: { moodleUrl: 'https://lms.marqai.dev' },
    requiredScopes: ['courses:read', 'grades:write'],
  },
  {
    id: 'int-ga4',
    name: 'Google Analytics 4',
    category: 'analytics',
    description: 'Deep product analytics — funnel tracking, retention cohorts, course completion events, marketing attribution.',
    icon: '📈',
    connected: true,
    config: { measurementId: 'G-XXXXXXXX', apiSecret: 'ga4_••••' },
    requiredScopes: ['analytics:write'],
  },
];

// ============================================================
// Pricing plans (global — for the pricing page)
// ============================================================

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'plan-monthly',
    name: 'Marq All-Access · Monthly',
    model: 'subscription_monthly',
    price: 39,
    period: 'month',
    description: 'Unlimited access to every course, every test, and the AI tutor. Cancel anytime.',
    features: [
      'All 5 current courses + future releases',
      'Step-wise lessons with video walkthroughs',
      'Auto-graded sample tests',
      '24/7 AI tutor chat',
      'Progress tracking across devices',
      'Community Q&A forum',
    ],
    highlighted: true,
    ctaLabel: 'Start monthly subscription',
  },
  {
    id: 'plan-annual',
    name: 'Marq All-Access · Annual',
    model: 'subscription_annual',
    price: 349,
    period: 'year',
    description: 'Best value — save 25% vs monthly. Everything in Monthly, plus priority human tutor booking.',
    features: [
      'Everything in Monthly',
      '25% savings vs monthly',
      'Priority booking for human tutor sessions',
      'Early access to new courses',
      'Downloadable certificate of completion',
      'Monthly 1:1 career mentor call',
    ],
    ctaLabel: 'Start annual subscription',
  },
  {
    id: 'plan-payg',
    name: 'Pay-per-Course',
    model: 'one_time',
    price: 159,
    period: 'one-time',
    description: 'Buy individual courses forever. No subscription. Prices vary by course — see catalog.',
    features: [
      'Lifetime access to one course',
      'All lessons, videos, and tests',
      'AI tutor for that course',
      'Free updates to that course',
      'No auto-renewal',
      '30-day money-back guarantee',
    ],
    ctaLabel: 'Browse courses',
  },
];

// ============================================================
// Audit log seed
// ============================================================

export const SEED_AUDIT_LOGS: AuditLog[] = [
  { id: 'a-1', actorId: 'u-admin-1', actorName: 'Maya Iyer', action: 'Approved tutor application', target: 'Aisha Patel', timestamp: now - 30 * day },
  { id: 'a-2', actorId: 'u-admin-1', actorName: 'Maya Iyer', action: 'Updated pricing', target: 'Marq Annual → $349', timestamp: now - 21 * day },
  { id: 'a-3', actorId: 'u-admin-1', actorName: 'Maya Iyer', action: 'Connected integration', target: 'Slack', timestamp: now - 14 * day },
  { id: 'a-4', actorId: 'u-admin-1', actorName: 'Maya Iyer', action: 'Suspended user', target: 'spam@example.com', timestamp: now - 7 * day },
  { id: 'a-5', actorId: 'u-admin-1', actorName: 'Maya Iyer', action: 'Edited role permissions', target: 'Tutor role', timestamp: now - 2 * day },
];
