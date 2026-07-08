import type {
  CertificateTemplate, RegistrationFormConfig, EmailSchedule,
  AnalyticsEvent, GdprExportBundle,
} from '@/lib/types';

const now = Date.now();
const day = 24 * 60 * 60 * 1000;
const hour = 60 * 60 * 1000;

// ============================================================
// Certificate templates — drag-and-drop builder seed
// ============================================================

export const SEED_CERT_TEMPLATES: CertificateTemplate[] = [
  {
    id: 'tpl-default',
    name: 'Default — marqaicourses Classic',
    background: 'linear-gradient(135deg, #fafafa 0%, #f0f4ff 100%)',
    borderColor: '#6366f1',
    width: 1200,
    height: 850,
    createdAt: now - 60 * day,
    updatedAt: now - 14 * day,
    elements: [
      { id: 'e1', type: 'logo', x: 8, y: 8, w: 18, fontSize: 14, fontWeight: 700, color: '#6366f1', text: 'MARQAICOURSES', align: 'left' },
      { id: 'e2', type: 'title', x: 50, y: 22, w: 80, fontSize: 48, fontWeight: 700, color: '#1e293b', text: 'Certificate of Completion', align: 'center' },
      { id: 'e3', type: 'subtitle', x: 50, y: 32, w: 80, fontSize: 18, fontWeight: 400, color: '#64748b', text: 'This certifies that', align: 'center' },
      { id: 'e4', type: 'recipient_name', x: 50, y: 42, w: 80, fontSize: 36, fontWeight: 600, color: '#4f46e5', align: 'center' },
      { id: 'e5', type: 'static_text', x: 50, y: 52, w: 80, fontSize: 18, fontWeight: 400, color: '#64748b', text: 'has successfully completed', align: 'center' },
      { id: 'e6', type: 'course_name', x: 50, y: 60, w: 80, fontSize: 28, fontWeight: 600, color: '#1e293b', align: 'center' },
      { id: 'e7', type: 'score', x: 50, y: 70, w: 80, fontSize: 16, fontWeight: 500, color: '#475569', text: 'Final score: {{score}}%', align: 'center' },
      { id: 'e8', type: 'date', x: 25, y: 85, w: 30, fontSize: 14, fontWeight: 500, color: '#475569', text: 'Issued: {{date}}', align: 'left' },
      { id: 'e9', type: 'code', x: 75, y: 85, w: 30, fontSize: 14, fontWeight: 500, color: '#475569', text: 'Code: {{code}}', align: 'right' },
      { id: 'e10', type: 'signature', x: 25, y: 92, w: 30, fontSize: 14, fontWeight: 600, color: '#1e293b', text: 'Mahesh Kumar Parvathareddy, Founder', align: 'left' },
    ],
  },
  {
    id: 'tpl-gold',
    name: 'Gold Tier — Premium',
    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    borderColor: '#d97706',
    width: 1200,
    height: 850,
    createdAt: now - 30 * day,
    updatedAt: now - 7 * day,
    elements: [
      { id: 'e1', type: 'title', x: 50, y: 18, w: 80, fontSize: 44, fontWeight: 700, color: '#78350f', text: 'Certificate of Excellence', align: 'center' },
      { id: 'e2', type: 'recipient_name', x: 50, y: 40, w: 80, fontSize: 38, fontWeight: 600, color: '#b45309', align: 'center' },
      { id: 'e3', type: 'course_name', x: 50, y: 55, w: 80, fontSize: 26, fontWeight: 500, color: '#1e293b', align: 'center' },
      { id: 'e4', type: 'score', x: 50, y: 65, w: 80, fontSize: 18, fontWeight: 500, color: '#92400e', text: 'Achieved {{score}}% — Gold Tier', align: 'center' },
      { id: 'e5', type: 'date', x: 50, y: 85, w: 80, fontSize: 14, fontWeight: 500, color: '#475569', text: 'Issued: {{date}}', align: 'center' },
      { id: 'e6', type: 'code', x: 50, y: 91, w: 80, fontSize: 12, fontWeight: 500, color: '#92400e', text: 'Validation code: {{code}}', align: 'center' },
    ],
  },
  {
    id: 'tpl-platinum',
    name: 'Platinum Tier — Honors',
    background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
    borderColor: '#7c3aed',
    width: 1200,
    height: 850,
    createdAt: now - 14 * day,
    updatedAt: now - 3 * day,
    elements: [
      { id: 'e1', type: 'title', x: 50, y: 18, w: 80, fontSize: 46, fontWeight: 700, color: '#5b21b6', text: 'Certificate of Mastery', align: 'center' },
      { id: 'e2', type: 'recipient_name', x: 50, y: 42, w: 80, fontSize: 40, fontWeight: 600, color: '#7c3aed', align: 'center' },
      { id: 'e3', type: 'course_name', x: 50, y: 58, w: 80, fontSize: 28, fontWeight: 500, color: '#1e293b', align: 'center' },
      { id: 'e4', type: 'score', x: 50, y: 68, w: 80, fontSize: 20, fontWeight: 500, color: '#6d28d9', text: 'Honors — {{score}}%', align: 'center' },
      { id: 'e5', type: 'code', x: 50, y: 90, w: 80, fontSize: 12, fontWeight: 500, color: '#7c3aed', text: 'Verify at marqai.dev/verify — Code: {{code}}', align: 'center' },
    ],
  },
];

// ============================================================
// Custom registration forms — per-role field config
// ============================================================

export const SEED_REG_FORMS: RegistrationFormConfig[] = [
  {
    id: 'form-candidate',
    role: 'candidate',
    name: 'Candidate Registration',
    requireEmailVerification: true,
    requireCaptcha: true,
    requireTosAccept: true,
    updatedAt: now - 10 * day,
    fields: [
      { id: 'f1', kind: 'text', label: 'Full name', placeholder: 'e.g. Aarav Sharma', required: true, width: 'half' },
      { id: 'f2', kind: 'email', label: 'Email', placeholder: 'you@example.com', required: true, width: 'half' },
      { id: 'f3', kind: 'password', label: 'Password', required: true, width: 'half' },
      { id: 'f4', kind: 'tel', label: 'Phone (optional)', placeholder: '+91 90000 00000', required: false, width: 'half' },
      { id: 'f5', kind: 'select', label: 'Primary goal', required: true, width: 'half', options: ['Crack interviews', 'Upskill at work', 'Switch careers', 'Learn a specific tech'] },
      { id: 'f6', kind: 'select', label: 'Experience level', required: true, width: 'half', options: ['Student', '0-2 years', '3-5 years', '5+ years'] },
      { id: 'f7', kind: 'textarea', label: 'Tell us about your goals (optional)', required: false, width: 'full' },
      { id: 'f8', kind: 'checkbox', label: 'I agree to the Terms of Service and Privacy Policy', required: true, width: 'full' },
    ],
  },
  {
    id: 'form-tutor',
    role: 'tutor',
    name: 'Human Tutor Application',
    requireEmailVerification: true,
    requireCaptcha: true,
    requireTosAccept: true,
    updatedAt: now - 7 * day,
    fields: [
      { id: 'f1', kind: 'text', label: 'Full name', required: true, width: 'half' },
      { id: 'f2', kind: 'email', label: 'Email', required: true, width: 'half' },
      { id: 'f3', kind: 'password', label: 'Password', required: true, width: 'half' },
      { id: 'f4', kind: 'tel', label: 'Phone', required: true, width: 'half' },
      { id: 'f5', kind: 'text', label: 'Headline (max 80 chars)', placeholder: 'e.g. Senior Backend Engineer @ Stripe', required: true, width: 'full' },
      { id: 'f6', kind: 'textarea', label: 'Bio — describe your teaching experience', required: true, width: 'full' },
      { id: 'f7', kind: 'number', label: 'Hourly rate (USD)', required: true, width: 'half' },
      { id: 'f8', kind: 'select', label: 'Availability', required: true, width: 'half', options: ['Weekdays only', 'Weekends only', 'Both'] },
      { id: 'f9', kind: 'text', label: 'LinkedIn URL', required: true, width: 'half' },
      { id: 'f10', kind: 'text', label: 'GitHub URL (optional)', required: false, width: 'half' },
      { id: 'f11', kind: 'checkbox', label: 'I agree to the Tutor Agreement, payment terms, and Code of Conduct', required: true, width: 'full' },
    ],
  },
  {
    id: 'form-admin',
    role: 'super_admin',
    name: 'Admin Invite-Only',
    requireEmailVerification: true,
    requireCaptcha: true,
    requireTosAccept: true,
    updatedAt: now - 30 * day,
    fields: [
      { id: 'f1', kind: 'text', label: 'Full name', required: true, width: 'half' },
      { id: 'f2', kind: 'email', label: 'Work email', required: true, width: 'half' },
      { id: 'f3', kind: 'password', label: 'Password', required: true, width: 'half' },
      { id: 'f4', kind: 'text', label: 'Invite code', required: true, width: 'half' },
    ],
  },
];

// ============================================================
// Email schedules — drip content, reminders, inactivity
// ============================================================

export const SEED_EMAIL_SCHEDULES: EmailSchedule[] = [
  {
    id: 'es-welcome',
    kind: 'welcome',
    name: 'Welcome onboarding',
    trigger: 'New user registers',
    delayHours: 0,
    subject: 'Welcome to marqaicourses Online Courses Platform, {{name}}! 🎓',
    bodyTemplate: 'Hi {{name}},\n\nWelcome aboard! Your marqaicourses account is ready. Here are 3 things to do first:\n1. Browse the course catalog\n2. Take a free preview lesson\n3. Say hi to your AI tutor\n\nHappy learning,\nThe marqaicourses Team',
    enabled: true,
    updatedAt: now - 14 * day,
  },
  {
    id: 'es-drip',
    kind: 'drip_unlock',
    name: 'Module 2 drip unlock',
    trigger: 'User completes Module 1',
    delayHours: 24,
    subject: 'Module 2 is now unlocked for {{courseName}}',
    bodyTemplate: 'Hi {{name}},\n\nGreat work finishing Module 1 of {{courseName}}! Module 2 — {{nextModuleTitle}} — is now unlocked. You can access it from your dashboard.\n\nTip: Book a 1:1 with a human tutor if you want a refresher before starting.',
    enabled: true,
    updatedAt: now - 10 * day,
  },
  {
    id: 'es-expiry',
    kind: 'expiry_reminder',
    name: 'Course expiry — 7 days',
    trigger: 'Course access expires in 7 days',
    delayHours: 0,
    subject: 'Your access to {{courseName}} expires in 7 days',
    bodyTemplate: 'Hi {{name}},\n\nYour {{model}} access to {{courseName}} expires on {{expiryDate}}. Renew now to keep your progress, certificates, and notes.\n\nRenew link: {{renewLink}}',
    enabled: true,
    updatedAt: now - 7 * day,
  },
  {
    id: 'es-inactive',
    kind: 'inactivity',
    name: 'Inactivity nudge — 7 days',
    trigger: 'User inactive for 7 days',
    delayHours: 0,
    subject: 'We miss you, {{name}} — pick up where you left off',
    bodyTemplate: 'Hi {{name}},\n\nIt has been a week since your last lesson. Rejoin now to keep your streak alive — even 15 minutes a day adds up.\n\nResume: {{resumeLink}}',
    enabled: true,
    updatedAt: now - 5 * day,
  },
  {
    id: 'es-session',
    kind: 'session_reminder',
    name: 'Tutor session reminder — 1 hour',
    trigger: 'Tutor session starts in 1 hour',
    delayHours: 0,
    subject: 'Your session with {{tutorName}} starts in 1 hour',
    bodyTemplate: 'Hi {{name}},\n\nReminder: your session with {{tutorName}} on {{topic}} starts at {{startTime}}.\n\nJoin link: {{joinLink}}',
    enabled: true,
    updatedAt: now - 3 * day,
  },
  {
    id: 'es-cert',
    kind: 'certificate_issued',
    name: 'Certificate issued',
    trigger: 'User earns certificate',
    delayHours: 0,
    subject: 'Your certificate for {{courseName}} is ready 🎉',
    bodyTemplate: 'Hi {{name}},\n\nCongratulations! You have completed {{courseName}} with a score of {{score}}%. Your certificate (validation code: {{code}}) is ready to share.\n\nView & share: {{certLink}}',
    enabled: true,
    updatedAt: now - 2 * day,
  },
  {
    id: 'es-assign',
    kind: 'assignment_due',
    name: 'Assignment due — 24 hours',
    trigger: 'Assignment due in 24 hours',
    delayHours: 0,
    subject: 'Assignment "{{assignTitle}}" is due tomorrow',
    bodyTemplate: 'Hi {{name}},\n\nReminder: your assignment "{{assignTitle}}" for {{courseName}} is due in 24 hours. Submit before {{dueAt}} to avoid late penalty.',
    enabled: false,
    updatedAt: now - 1 * day,
  },
  {
    id: 'es-weekly',
    kind: 'weekly_progress',
    name: 'Weekly progress digest',
    trigger: 'Every Monday 9am',
    delayHours: 0,
    subject: 'Your weekly progress — {{lessonsCompleted}} lessons completed',
    bodyTemplate: 'Hi {{name}},\n\nLast week you completed {{lessonsCompleted}} lessons, scored {{avgScore}}% on quizzes, and earned {{badgesEarned}} new badges.\n\nKeep going!',
    enabled: true,
    updatedAt: now - 1 * day,
  },
];

// ============================================================
// Analytics events — last 30 days synthetic feed
// ============================================================

function generateAnalyticsEvents(): AnalyticsEvent[] {
  const events: AnalyticsEvent[] = [];
  const COURSE_IDS = ['ai-ml', 'fullstack-java', 'dotnet', 'mobile-dev', 'flutter'];
  let id = 0;
  const nextId = () => `ev-${++id}`;

  // 7-day signup & login series
  for (let i = 30; i >= 0; i--) {
    const ts = now - i * day;
    const signups = 4 + Math.floor(Math.sin(i / 3) * 3) + Math.floor(Math.random() * 4);
    for (let j = 0; j < signups; j++) {
      events.push({ id: nextId(), kind: 'signup', ts: ts + j * hour, userId: `anon-${id}`, meta: { source: j % 3 === 0 ? 'google' : 'direct' } });
    }
    const logins = 18 + Math.floor(Math.random() * 14);
    for (let j = 0; j < logins; j++) {
      events.push({ id: nextId(), kind: 'login', ts: ts + j * hour * 0.7 });
    }
  }

  // 60 enrollments + ~30 completions + ~20 payments spread over 30 days
  for (let i = 0; i < 60; i++) {
    const ts = now - Math.floor(Math.random() * 30) * day;
    const cid = COURSE_IDS[i % COURSE_IDS.length];
    events.push({ id: nextId(), kind: 'course_enrolled', ts, courseId: cid, userId: `u-${i}`, value: i % 3 === 0 ? 159 : 39 });
    events.push({ id: nextId(), kind: 'payment_completed', ts: ts + 60_000, courseId: cid, value: i % 3 === 0 ? 159 : 39 });
    if (i % 2 === 0) {
      events.push({ id: nextId(), kind: 'lesson_completed', ts: ts + 2 * day, courseId: cid });
    }
    if (i % 4 === 0) {
      events.push({ id: nextId(), kind: 'quiz_attempted', ts: ts + 3 * day, courseId: cid, value: 60 + Math.floor(Math.random() * 40) });
      events.push({ id: nextId(), kind: 'quiz_passed', ts: ts + 3 * day, courseId: cid, value: 70 + Math.floor(Math.random() * 30) });
    }
    if (i % 8 === 0) {
      events.push({ id: nextId(), kind: 'course_completed', ts: ts + 14 * day, courseId: cid });
      events.push({ id: nextId(), kind: 'certificate_earned', ts: ts + 14 * day, courseId: cid });
    }
  }

  // 30 AI tutor messages + 12 tutor bookings
  for (let i = 0; i < 30; i++) {
    events.push({ id: nextId(), kind: 'ai_tutor_message', ts: now - Math.floor(Math.random() * 7) * day });
  }
  for (let i = 0; i < 12; i++) {
    events.push({ id: nextId(), kind: 'tutor_session_booked', ts: now - Math.floor(Math.random() * 14) * day, value: 60 });
  }

  return events.sort((a, b) => b.ts - a.ts);
}

export const SEED_ANALYTICS_EVENTS: AnalyticsEvent[] = generateAnalyticsEvents();

export const SEED_GDPR_BUNDLES: GdprExportBundle[] = [
  {
    id: 'gb-1',
    userId: 'u-cand-1',
    requestedAt: now - 5 * day,
    status: 'ready',
    downloadUrl: '/download/gdpr-u-cand-1.zip',
    expiresAt: now + 2 * day,
  },
  {
    id: 'gb-2',
    userId: 'u-tutor-1',
    requestedAt: now - 2 * hour,
    status: 'pending',
    expiresAt: now + 28 * day,
  },
];
