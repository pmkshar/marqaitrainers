import type {
  AppNotification,
  ActivityEntry,
  Certificate,
  Badge,
  UserBadge,
  LessonNote,
  DiscussionPost,
  Announcement,
  Assignment,
  CourseCategory,
  CourseBundle,
  Group,
  DirectMessage,
  CalendarEvent,
  Friendship,
} from './types';

const now = Date.now();
const day = 24 * 60 * 60 * 1000;
const hour = 60 * 60 * 1000;

// ============================================================
// Course categories
// ============================================================

export const SEED_CATEGORIES: CourseCategory[] = [
  { id: 'cat-python', name: 'Python & Scripting', description: 'Python, automation, data engineering', color: 'from-amber-500 to-orange-600', courseIds: ['python-pro'] },
  { id: 'cat-ai', name: 'AI & Machine Learning', description: 'ML, deep learning, LLMs, RAG, MLOps', color: 'from-violet-500 to-purple-600', courseIds: ['ai-ml'] },
  { id: 'cat-backend', name: 'Backend Engineering', description: 'Server-side frameworks, APIs, databases', color: 'from-emerald-500 to-teal-600', courseIds: ['ai-ml', 'java-fullstack', 'dotnet-fullstack'] },
  { id: 'cat-frontend', name: 'Frontend & UI', description: 'Web & mobile UI frameworks', color: 'from-rose-500 to-pink-600', courseIds: ['flutter-dev', 'mobile-dev'] },
  { id: 'cat-mobile', name: 'Mobile Development', description: 'iOS, Android, cross-platform', color: 'from-sky-500 to-cyan-600', courseIds: ['flutter-dev', 'mobile-dev'] },
  { id: 'cat-web', name: 'Full Stack Web', description: 'End-to-end web apps', color: 'from-amber-500 to-orange-600', courseIds: ['java-fullstack'] },
  { id: 'cat-cloud', name: 'Cloud & DevOps', description: 'Azure, AWS, GCP, CI/CD', color: 'from-indigo-500 to-blue-600', courseIds: ['dotnet-fullstack'] },
];

// ============================================================
// Course bundles
// ============================================================

export const SEED_BUNDLES: CourseBundle[] = [
  {
    id: 'bundle-fullstack',
    slug: 'fullstack-mastery',
    title: 'Full Stack Mastery Bundle',
    subtitle: 'Java + .NET + AI/ML — become a T-shaped engineer',
    courseIds: ['java-fullstack', 'dotnet-fullstack', 'ai-ml'],
    price: 399,
    originalPrice: 477,
    highlight: 'Save $78 · 3 courses · 12 months access',
  },
  {
    id: 'bundle-mobile',
    slug: 'mobile-pro',
    title: 'Mobile Pro Bundle',
    subtitle: 'Flutter + React Native — ship to both stores',
    courseIds: ['flutter-dev', 'mobile-dev'],
    price: 249,
    originalPrice: 318,
    highlight: 'Save $69 · 2 courses · 6 months access',
  },
  {
    id: 'bundle-all',
    slug: 'marq-everything',
    title: 'marqaicourses Everything',
    subtitle: 'All 5 courses + priority human tutors + AI tutor',
    courseIds: ['ai-ml', 'java-fullstack', 'dotnet-fullstack', 'mobile-dev', 'flutter-dev'],
    price: 599,
    originalPrice: 795,
    highlight: 'Save $196 · Best value · 18 months access',
  },
];

// ============================================================
// Badges
// ============================================================

export const SEED_BADGES: Badge[] = [
  { id: 'b-first-lesson', slug: 'first-lesson', title: 'First Steps', description: 'Complete your first lesson', tier: 'bronze', icon: '👟', criteria: 'Complete 1 lesson' },
  { id: 'b-quiz-master', slug: 'quiz-master', title: 'Quiz Master', description: 'Pass 5 quizzes with 80%+', tier: 'silver', icon: '🧠', criteria: 'Pass 5 quizzes ≥ 80%' },
  { id: 'b-streak-7', slug: 'streak-7', title: 'Week Warrior', description: '7-day learning streak', tier: 'silver', icon: '🔥', criteria: 'Learn 7 days in a row' },
  { id: 'b-course-complete', slug: 'course-complete', title: 'Course Conqueror', description: 'Finish an entire course', tier: 'gold', icon: '🏆', criteria: 'Complete all lessons in 1 course' },
  { id: 'b-ai-whisperer', slug: 'ai-whisperer', title: 'AI Whisperer', description: 'Asked the AI tutor 25 questions', tier: 'silver', icon: '🤖', criteria: 'Send 25 messages to AI tutor' },
  { id: 'b-tutor-session', slug: 'tutor-session', title: 'Mentee', description: 'Booked your first human tutor session', tier: 'bronze', icon: '📅', criteria: 'Book 1 human tutor session' },
  { id: 'b-night-owl', slug: 'night-owl', title: 'Night Owl', description: 'Studied after 10pm 5 times', tier: 'bronze', icon: '🦉', criteria: '5 sessions after 10pm' },
  { id: 'b-social', slug: 'social-butterfly', title: 'Social Butterfly', description: 'Posted 10 discussion replies', tier: 'silver', icon: '💬', criteria: 'Post 10 discussion replies' },
  { id: 'b-five-courses', slug: 'five-courses', title: 'Polymath', description: 'Enrolled in 5 courses', tier: 'gold', icon: '🎓', criteria: 'Enroll in 5 courses' },
  { id: 'b-perfect-score', slug: 'perfect-score', title: 'Perfectionist', description: 'Score 100% on any quiz', tier: 'gold', icon: '💯', criteria: '100% on any quiz' },
  { id: 'b-platinum', slug: 'platinum-scholar', title: 'Platinum Scholar', description: 'Complete 3 courses with 90%+ avg', tier: 'platinum', icon: '💎', criteria: '3 courses completed ≥ 90% avg' },
];

export const SEED_USER_BADGES: UserBadge[] = [
  { userId: 'u-cand-1', badgeSlug: 'first-lesson', awardedAt: now - 50 * day },
  { userId: 'u-cand-1', badgeSlug: 'quiz-master', awardedAt: now - 40 * day },
  { userId: 'u-cand-1', badgeSlug: 'streak-7', awardedAt: now - 30 * day },
  { userId: 'u-cand-1', badgeSlug: 'ai-whisperer', awardedAt: now - 20 * day },
  { userId: 'u-cand-1', badgeSlug: 'tutor-session', awardedAt: now - 15 * day },
  { userId: 'u-cand-1', badgeSlug: 'night-owl', awardedAt: now - 10 * day },
  { userId: 'u-cand-1', badgeSlug: 'social-butterfly', awardedAt: now - 5 * day },
  { userId: 'u-cand-1', badgeSlug: 'perfect-score', awardedAt: now - 2 * day },
  { userId: 'u-cand-2', badgeSlug: 'first-lesson', awardedAt: now - 25 * day },
  { userId: 'u-cand-2', badgeSlug: 'tutor-session', awardedAt: now - 2 * day },
];

// ============================================================
// Certificates
// ============================================================

export const SEED_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-1',
    userId: 'u-cand-1',
    courseId: 'flutter-dev',
    code: 'MARQ-FLT-2024-8F3K2',
    issuedAt: now - 8 * day,
    scorePct: 94,
    template: 'gold',
  },
];

// ============================================================
// Notifications
// ============================================================

export const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-1', userId: 'u-cand-1', type: 'session',
    title: 'Upcoming session with Dr. Anika Sharma',
    body: 'Your 1:1 on "Backprop through a transformer" starts in 2 days. Add it to your calendar.',
    link: 'calendar',
    read: false, createdAt: now - 2 * hour,
  },
  {
    id: 'n-2', userId: 'u-cand-1', type: 'success',
    title: 'New badge unlocked — Perfectionist 💯',
    body: 'You scored 100% on the Flutter Layouts quiz. Keep it up!',
    link: 'achievements',
    read: false, createdAt: now - 1 * day,
  },
  {
    id: 'n-3', userId: 'u-cand-1', type: 'announcement',
    title: 'New announcement in Flutter Developer Bootcamp',
    body: 'Aisha Patel just posted: "Live Q&A on Riverpod 2.0 this Friday."',
    link: 'course:flutter-dev',
    read: true, createdAt: now - 2 * day,
  },
  {
    id: 'n-4', userId: 'u-cand-1', type: 'course',
    title: 'Course expiring soon',
    body: 'Your access to "AI/ML Engineering Bootcamp" expires in 14 days. Renew to keep your progress.',
    link: 'pricing',
    read: false, createdAt: now - 3 * day,
  },
  {
    id: 'n-5', userId: 'u-cand-1', type: 'social',
    title: 'Daniel Wu sent you a message',
    body: '"Hey Priya — how did you approach the transformer backprop quiz?"',
    link: 'messages',
    read: true, createdAt: now - 4 * day,
  },
  {
    id: 'n-6', userId: 'u-cand-1', type: 'system',
    title: 'Welcome to your marqaicourses dashboard!',
    body: 'Track courses, badges, certificates, and live sessions all in one place.',
    read: false, createdAt: now - 30 * 60 * 1000,
  },
  // Notifications for tutor
  {
    id: 'n-t1', userId: 'u-tutor-3', type: 'session',
    title: 'New booking — Priya Nair',
    body: 'Priya booked a 90-min Riverpod architecture review in 5 days.',
    link: 'tutor_portal',
    read: false, createdAt: now - 1 * hour,
  },
  {
    id: 'n-t2', userId: 'u-tutor-3', type: 'social',
    title: 'New 5-star review',
    body: 'A learner left you a 5-star review after your last session.',
    read: false, createdAt: now - 1 * day,
  },
  // Notifications for admin
  {
    id: 'n-a1', userId: 'u-admin-1', type: 'system',
    title: 'New tutor application — Marcus Lee',
    body: 'Marcus applied to teach Mobile Development. Review his application.',
    link: 'admin:tutors',
    read: false, createdAt: now - 5 * hour,
  },
  {
    id: 'n-a2', userId: 'u-admin-1', type: 'success',
    title: 'Daily revenue: $1,847',
    body: 'Up 23% vs yesterday. 12 new subscriptions, 3 course purchases.',
    link: 'admin:dashboard',
    read: false, createdAt: now - 8 * hour,
  },
  {
    id: 'n-a3', userId: 'u-admin-1', type: 'warning',
    title: 'Stripe webhook latency elevated',
    body: 'p95 latency is 2.4s (threshold 1s). Investigate the events queue.',
    link: 'admin:integrations',
    read: true, createdAt: now - 1 * day,
  },
];

// ============================================================
// Activity feed
// ============================================================

export const SEED_ACTIVITIES: ActivityEntry[] = [
  { id: 'act-1', userId: 'u-cand-1', kind: 'quiz_passed', courseId: 'flutter-dev', lessonId: 'fl-m1-l1', text: 'Passed quiz "Flutter Layouts Basics" with 100%', meta: { score: 100 }, createdAt: now - 2 * day },
  { id: 'act-2', userId: 'u-cand-1', kind: 'badge_earned', text: 'Unlocked the Perfectionist badge', meta: { badge: 'perfect-score' }, createdAt: now - 2 * day },
  { id: 'act-3', userId: 'u-cand-1', kind: 'lesson_completed', courseId: 'flutter-dev', lessonId: 'fl-m1-l1', text: 'Completed lesson "Flutter Layouts Basics"', createdAt: now - 2 * day },
  { id: 'act-4', userId: 'u-cand-1', kind: 'session_booked', text: 'Booked "Riverpod architecture review" with Aisha Patel', meta: { tutor: 'u-tutor-3' }, createdAt: now - 3 * day },
  { id: 'act-5', userId: 'u-cand-1', kind: 'note_saved', courseId: 'ai-ml', lessonId: 'ai-m1-l1', text: 'Saved a note on "Introduction to Tensors"', createdAt: now - 4 * day },
  { id: 'act-6', userId: 'u-cand-1', kind: 'discussion_posted', courseId: 'flutter-dev', text: 'Replied in "Best practices for StatefulWidget disposal"', createdAt: now - 5 * day },
  { id: 'act-7', userId: 'u-cand-1', kind: 'certificate_earned', courseId: 'flutter-dev', text: 'Earned certificate "Flutter Developer Bootcamp" (94%)', createdAt: now - 8 * day },
  { id: 'act-8', userId: 'u-cand-1', kind: 'course_completed', courseId: 'flutter-dev', text: 'Completed course "Flutter Developer Bootcamp"', createdAt: now - 8 * day },
  { id: 'act-9', userId: 'u-cand-1', kind: 'group_joined', text: 'Joined the "Flutter India" study group', createdAt: now - 12 * day },
  { id: 'act-10', userId: 'u-cand-1', kind: 'friend_added', text: 'Added Daniel Wu as a friend', createdAt: now - 18 * day },
  { id: 'act-11', userId: 'u-cand-1', kind: 'course_enrolled', courseId: 'ai-ml', text: 'Enrolled in "AI/ML Engineering Bootcamp"', createdAt: now - 60 * day },
  { id: 'act-12', userId: 'u-cand-1', kind: 'course_enrolled', courseId: 'flutter-dev', text: 'Enrolled in "Flutter Developer Bootcamp"', createdAt: now - 60 * day },
];

// ============================================================
// Lesson notes
// ============================================================

export const SEED_NOTES: LessonNote[] = [
  {
    id: 'note-1', userId: 'u-cand-1', courseId: 'ai-ml', lessonId: 'ai-m1-l1',
    body: 'Key intuition: a tensor is just an n-dim array. PyTorch tensors carry gradients via `requires_grad=True` — this is what powers autograd.',
    isPrivate: true, createdAt: now - 4 * day, updatedAt: now - 4 * day,
  },
  {
    id: 'note-2', userId: 'u-cand-1', courseId: 'flutter-dev', lessonId: 'fl-m1-l1',
    body: 'Remember: Column has main-axis vertical, Row has main-axis horizontal. Use MainAxisAlignment for main, CrossAxisAlignment for cross.',
    isPrivate: true, createdAt: now - 6 * day, updatedAt: now - 6 * day,
  },
];

// ============================================================
// Discussions
// ============================================================

export const SEED_DISCUSSIONS: DiscussionPost[] = [
  {
    id: 'd-1', courseId: 'flutter-dev', authorId: 'u-cand-2',
    body: 'Has anyone gotten the `flutter pub get` step to work on Apple Silicon? I keep getting an SDK mismatch.',
    upvotes: ['u-cand-1', 'u-tutor-3'], createdAt: now - 6 * day,
  },
  {
    id: 'd-2', courseId: 'flutter-dev', lessonId: 'fl-m1-l1', authorId: 'u-cand-1',
    body: 'Tip: if your Column overflows, wrap it in a SingleChildScrollView — solves most yellow-black stripe errors.',
    upvotes: ['u-cand-2', 'u-cand-3'], createdAt: now - 4 * day,
  },
  {
    id: 'd-3', courseId: 'flutter-dev', authorId: 'u-tutor-3',
    body: '📢 Live Q&A on Riverpod 2.0 this Friday at 5pm IST. Bring your architecture questions!',
    upvotes: ['u-cand-1', 'u-cand-2', 'u-cand-3'], createdAt: now - 2 * day,
  },
];

// ============================================================
// Announcements
// ============================================================

export const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'an-1', courseId: 'flutter-dev', authorId: 'u-tutor-3',
    title: 'Live Q&A on Riverpod 2.0 — Friday 5pm IST',
    body: 'Join me this Friday for a 60-min live Q&A on Riverpod 2.0 architecture. We\'ll cover AsyncNotifier, code generation, and testing patterns. Calendar invite attached.',
    createdAt: now - 2 * day,
  },
  {
    id: 'an-2', courseId: 'ai-ml', authorId: 'u-tutor-1',
    title: 'New module added — RAG with vector databases',
    body: 'I\'ve just added Module 5 covering Retrieval-Augmented Generation with Pinecone and Weaviate. Existing students get it free. Happy learning!',
    createdAt: now - 10 * day,
  },
  {
    id: 'an-3', courseId: 'java-fullstack', authorId: 'u-tutor-2',
    title: 'Assignment 2 deadline extended',
    body: 'Based on your feedback, the Spring Security assignment deadline is extended by 7 days. New deadline: next Sunday 11:59pm IST.',
    createdAt: now - 5 * day,
  },
];

// ============================================================
// Assignments
// ============================================================

export const SEED_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-1', courseId: 'flutter-dev', moduleId: 'fl-m1',
    title: 'Build a Responsive Login Screen',
    prompt: 'Create a Flutter login screen that adapts to phone and tablet. Must include form validation, loading state, and error handling. Submit a GitHub repo link.',
    maxMarks: 100,
    dueAt: now + 7 * day,
    submissions: {
      'u-cand-1': { status: 'graded', fileName: 'priya-flutter-login.zip', submittedAt: now - 3 * day, marks: 92, feedback: 'Excellent state management. Add unit tests for the form validator.' },
      'u-cand-2': { status: 'submitted', fileName: 'daniel-login.zip', submittedAt: now - 1 * day },
    },
  },
  {
    id: 'asg-2', courseId: 'ai-ml', moduleId: 'ai-m1',
    title: 'Implement a Linear Classifier from Scratch',
    prompt: 'Implement a binary linear classifier in pure NumPy (no sklearn). Train on the Iris dataset. Submit a Jupyter notebook with markdown explanations.',
    maxMarks: 100,
    dueAt: now + 14 * day,
    submissions: {},
  },
  {
    id: 'asg-3', courseId: 'java-fullstack', moduleId: 'java-m1',
    title: 'REST API for a Todo App with Spring Boot',
    prompt: 'Build a CRUD REST API for todos using Spring Boot 3, Spring Data JPA, and an H2 in-memory DB. Include request validation and global exception handling. Submit GitHub repo.',
    maxMarks: 100,
    dueAt: now + 10 * day,
    submissions: {
      'u-cand-2': { status: 'pending' },
    },
  },
];

// ============================================================
// Groups
// ============================================================

export const SEED_GROUPS: Group[] = [
  {
    id: 'g-1', slug: 'flutter-india', name: 'Flutter India',
    description: 'Indian Flutter community — meetups, job referrals, and study buddies. All levels welcome.',
    category: 'regional', memberIds: ['u-cand-1', 'u-cand-2', 'u-tutor-3'], adminIds: ['u-tutor-3'],
    createdAt: now - 120 * day,
  },
  {
    id: 'g-2', slug: 'ml-career-switch', name: 'ML Career Switchers',
    description: 'For folks transitioning into ML/AI from other fields. Weekly coffee chats and resume reviews.',
    category: 'study', memberIds: ['u-cand-1', 'u-cand-3', 'u-tutor-1'], adminIds: ['u-tutor-1'],
    createdAt: now - 90 * day,
  },
  {
    id: 'g-3', slug: 'marq-cohort-2024', name: 'marqaicourses Cohort 2024',
    description: 'Official cohort group for everyone who enrolled in 2024. Cohort-only live sessions and discounts.',
    category: 'cohort', memberIds: ['u-cand-1', 'u-cand-2', 'u-cand-3'], adminIds: ['u-admin-1'],
    createdAt: now - 60 * day,
  },
  {
    id: 'g-4', slug: 'java-interview-prep', name: 'Java Interview Prep',
    description: 'Mock interviews, LeetCode grind sessions, and system design drills. Lead by Ravi.',
    category: 'interest', memberIds: ['u-cand-2', 'u-tutor-2'], adminIds: ['u-tutor-2'],
    createdAt: now - 45 * day,
  },
  {
    id: 'g-5', slug: 'night-owls', name: 'Night Owls Study Club',
    description: 'For learners who code after midnight. Async-only — no scheduled meetings.',
    category: 'interest', memberIds: ['u-cand-1', 'u-cand-3'], adminIds: ['u-cand-1'],
    createdAt: now - 30 * day,
  },
];

// ============================================================
// Direct messages
// ============================================================

const threadId = (a: string, b: string) => [a, b].sort().join('__');

export const SEED_MESSAGES: DirectMessage[] = [
  { id: 'm-1', threadId: threadId('u-cand-1', 'u-cand-2'), fromId: 'u-cand-2', toId: 'u-cand-1', body: 'Hey Priya — how did you approach the transformer backprop quiz?', read: false, createdAt: now - 4 * day },
  { id: 'm-2', threadId: threadId('u-cand-1', 'u-cand-2'), fromId: 'u-cand-1', toId: 'u-cand-2', body: 'I drew out the computational graph first — that made the chain rule super clear. Want me to send a photo?', read: true, createdAt: now - 4 * day + 30 * 60 * 1000 },
  { id: 'm-3', threadId: threadId('u-cand-1', 'u-cand-2'), fromId: 'u-cand-2', toId: 'u-cand-1', body: 'Yes please! 🙏', read: true, createdAt: now - 4 * day + 45 * 60 * 1000 },
  { id: 'm-4', threadId: threadId('u-cand-1', 'u-tutor-3'), fromId: 'u-cand-1', toId: 'u-tutor-3', body: 'Hi Aisha — looking forward to our Riverpod session on Friday!', read: true, createdAt: now - 1 * day },
  { id: 'm-5', threadId: threadId('u-cand-1', 'u-tutor-3'), fromId: 'u-tutor-3', toId: 'u-cand-1', body: 'Me too! Bring your current architecture diagram and we\'ll refactor it live.', read: false, createdAt: now - 23 * hour },
];

// ============================================================
// Calendar events
// ============================================================

export const SEED_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'ce-1', userId: 'u-cand-1', title: '1:1 with Dr. Anika Sharma — Transformer backprop',
    type: 'session', startsAt: now + 2 * day, durationMinutes: 60,
    courseId: 'ai-ml', link: 'tutors',
  },
  {
    id: 'ce-2', userId: 'u-cand-1', title: '1:1 with Aisha Patel — Riverpod architecture review',
    type: 'session', startsAt: now + 5 * day, durationMinutes: 90,
    courseId: 'flutter-dev', link: 'tutors',
  },
  {
    id: 'ce-3', userId: 'u-cand-1', title: 'Live Q&A: Riverpod 2.0 (Group session)',
    type: 'live_class', startsAt: now + 3 * day, durationMinutes: 60,
    courseId: 'flutter-dev',
  },
  {
    id: 'ce-4', userId: 'u-cand-1', title: 'Assignment due: Build a Responsive Login Screen',
    type: 'deadline', startsAt: now + 7 * day, durationMinutes: 0,
    courseId: 'flutter-dev',
  },
  {
    id: 'ce-5', userId: 'u-cand-1', title: 'Reminder: Review Linear Classifier notes',
    type: 'reminder', startsAt: now + 1 * day, durationMinutes: 30,
    courseId: 'ai-ml',
  },
  // Tutor calendar
  {
    id: 'ce-t1', userId: 'u-tutor-3', title: 'Session: Priya Nair — Riverpod review',
    type: 'session', startsAt: now + 5 * day, durationMinutes: 90,
    courseId: 'flutter-dev',
  },
  {
    id: 'ce-t2', userId: 'u-tutor-3', title: 'Live Q&A: Riverpod 2.0',
    type: 'live_class', startsAt: now + 3 * day, durationMinutes: 60,
    courseId: 'flutter-dev',
  },
  // Admin calendar
  {
    id: 'ce-a1', userId: 'u-admin-1', title: 'Weekly platform review with engineering',
    type: 'meeting', startsAt: now + 1 * day, durationMinutes: 60,
  },
];

// ============================================================
// Friendships
// ============================================================

export const SEED_FRIENDSHIPS: Friendship[] = [
  { userId: 'u-cand-1', friendId: 'u-cand-2', status: 'accepted', createdAt: now - 18 * day },
  { userId: 'u-cand-1', friendId: 'u-cand-3', status: 'accepted', createdAt: now - 14 * day },
  { userId: 'u-cand-1', friendId: 'u-tutor-3', status: 'accepted', createdAt: now - 30 * day },
  { userId: 'u-cand-2', friendId: 'u-cand-3', status: 'pending', createdAt: now - 1 * day },
];
