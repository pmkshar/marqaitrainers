import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  View, ChatMessage, User, Role, Integration, Booking, PermissionKey, RoleKey,
  TutorProfile, AuditLog,
  AppNotification, ActivityEntry, Certificate, Badge, UserBadge,
  LessonNote, DiscussionPost, Announcement, Assignment,
  CourseCategory, CourseBundle, Group, DirectMessage, CalendarEvent, Friendship,
  CertificateTemplate, CertificateElement,
  RegistrationFormConfig, RegistrationFormField,
  EmailSchedule, AnalyticsEvent, AnalyticsSummary, GdprExportBundle,
  LanguageCode, CurrencyCode, LocaleConfig,
  Corporate, CorporateSubscription, CorporatePlanModel, CorporatePlanTier, CorporateStatus,
  SkillLevel, SkillMatrixEntry, AiInterviewReport,
  InterviewSession, InterviewQuestion, InterviewTurn, InterviewReport,
  ProctoringSnapshot, ProctoringIncident,
} from '@/lib/types';
import {
  SEED_USERS, SEED_BOOKINGS, SEED_INTEGRATIONS, DEFAULT_ROLES, SEED_AUDIT_LOGS,
} from '@/lib/seed-data';
import {
  SEED_CATEGORIES, SEED_BUNDLES, SEED_BADGES, SEED_USER_BADGES,
  SEED_CERTIFICATES, SEED_NOTIFICATIONS, SEED_ACTIVITIES, SEED_NOTES,
  SEED_DISCUSSIONS, SEED_ANNOUNCEMENTS, SEED_ASSIGNMENTS, SEED_GROUPS,
  SEED_MESSAGES, SEED_CALENDAR_EVENTS, SEED_FRIENDSHIPS,
} from '@/lib/seed-social';
import {
  SEED_CERT_TEMPLATES, SEED_REG_FORMS, SEED_EMAIL_SCHEDULES,
  SEED_ANALYTICS_EVENTS, SEED_GDPR_BUNDLES,
} from '@/lib/seed-advanced';

// ============================================================
// Corporate seed data
// ============================================================
const SEED_CORPORATES: Corporate[] = [
  {
    id: 'corp-1',
    name: 'TechNova Solutions',
    domain: 'technova.com',
    industry: 'Software',
    country: 'IN',
    contactName: 'Priya Sharma',
    contactEmail: 'hr@technova.com',
    adminUserId: 'u-corp-admin-1',
    employeeUserIds: ['u-corp-emp-1', 'u-corp-emp-2'],
    planTier: 'growth',
    status: 'approved',
    subscriptions: [
      {
        id: 'sub-1',
        corporateId: 'corp-1',
        planModel: 'monthly',
        planTier: 'growth',
        courseIds: ['ai-ml', 'fullstack-java', 'python'],
        pricePerSeat: 1999,
        employeeLimit: 100,
        startedAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
        expiresAt: Date.now() + 315 * 24 * 60 * 60 * 1000,
        status: 'active',
      },
    ],
    subscribedCourseIds: ['ai-ml', 'fullstack-java', 'python'],
    employeeRestrictedCourseIds: ['ai-ml', 'fullstack-java', 'python'],
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
  },
];

const SEED_SKILL_MATRIX: SkillMatrixEntry[] = [
  { id: 'sm-1', userId: 'u-corp-emp-1', courseId: 'ai-ml', level: 'intermediate', scorePct: 72, certified: false, assessedAt: Date.now() - 5 * 24 * 60 * 60 * 1000 },
  { id: 'sm-2', userId: 'u-corp-emp-1', courseId: 'python', level: 'advanced', scorePct: 85, certified: true, assessedAt: Date.now() - 10 * 24 * 60 * 60 * 1000 },
  { id: 'sm-3', userId: 'u-corp-emp-2', courseId: 'fullstack-java', level: 'beginner', scorePct: 45, certified: false, assessedAt: Date.now() - 2 * 24 * 60 * 60 * 1000 },
  { id: 'sm-4', userId: 'u-corp-emp-2', courseId: 'ai-ml', level: 'intermediate', scorePct: 68, certified: false, assessedAt: Date.now() - 7 * 24 * 60 * 60 * 1000 },
];

const SEED_AI_INTERVIEW_REPORTS: AiInterviewReport[] = [
  {
    id: 'air-1', userId: 'u-corp-emp-1', corporateId: 'corp-1', courseId: 'ai-ml',
    overallScore: 78, technicalScore: 82, communicationScore: 70, problemSolvingScore: 75,
    summary: 'Strong technical fundamentals in ML concepts. Good understanding of gradient descent and neural networks.',
    strengths: ['Deep understanding of backpropagation', 'Clear code structure', 'Good problem decomposition'],
    improvements: ['Could improve communication of complex ideas', 'Needs more practice with production ML pipelines'],
    completedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'air-2', userId: 'u-corp-emp-2', corporateId: 'corp-1', courseId: 'fullstack-java',
    overallScore: 62, technicalScore: 58, communicationScore: 68, problemSolvingScore: 60,
    summary: 'Basic Java knowledge demonstrated. Needs improvement in Spring Boot and microservices patterns.',
    strengths: ['Good understanding of OOP concepts', 'Enthusiastic learner'],
    improvements: ['Needs stronger Spring Boot knowledge', 'Improve REST API design patterns', 'Practice system design problems'],
    completedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
];

interface AppState {
  // Navigation
  view: View;
  isTutorOpen: boolean;
  isMenuOpen: boolean;
  isAuthOpen: boolean;
  authMode: 'login' | 'register';
  registerRole: 'candidate' | 'tutor';

  // Chat
  chatMessages: ChatMessage[];

  // AI Tutor Sidebar State
  tutorSidebarExpanded: boolean; // expanded (400px) vs collapsed (320px)
  tutorSidebarChatOpen: boolean; // chat section visible
  tutorVoicePausedPosition: number; // position in speech when paused
  tutorVoiceProgress: number; // overall progress percentage
  tutorVoiceLastText: string; // last spoken text for resume
  tutorVoiceLang: string; // preferred TTS language
  setTutorSidebarExpanded: (expanded: boolean) => void;
  setTutorSidebarChatOpen: (open: boolean) => void;
  setTutorVoiceState: (pausedPosition: number, progress: number, lastText: string) => void;
  setTutorVoiceLang: (lang: string) => void;

  // Learning
  completedLessons: string[];
  passedLessonTests: string[];

  // Auth
  currentUserId: string | null;
  users: User[];
  roles: Role[];
  bookings: Booking[];
  integrations: Integration[];
  auditLogs: AuditLog[];

  // ---- social / engagement ----
  notifications: AppNotification[];
  activities: ActivityEntry[];
  certificates: Certificate[];
  badges: Badge[];
  userBadges: UserBadge[];
  notes: LessonNote[];
  discussions: DiscussionPost[];
  announcements: Announcement[];
  assignments: Assignment[];
  categories: CourseCategory[];
  bundles: CourseBundle[];
  groups: Group[];
  messages: DirectMessage[];
  calendarEvents: CalendarEvent[];
  friendships: Friendship[];

  // ---- advanced WPLMS-parity ----
  certTemplates: CertificateTemplate[];
  registrationForms: RegistrationFormConfig[];
  emailSchedules: EmailSchedule[];
  analyticsEvents: AnalyticsEvent[];
  gdprBundles: GdprExportBundle[];

  // ---- selectors ----
  currentUser: () => User | null;
  hasPermission: (perm: PermissionKey) => boolean;
  unreadNotificationCount: () => number;
  myActivities: (limit?: number) => ActivityEntry[];
  myBadges: () => (UserBadge & { badge: Badge })[];
  myCertificates: () => Certificate[];
  myNotes: (courseId: string, lessonId: string) => LessonNote[];
  myCalendar: () => CalendarEvent[];
  myFriends: () => User[];
  myGroups: () => Group[];
  threadWith: (otherUserId: string) => DirectMessage[];
  unreadDmCount: () => number;

  // ---- navigation ----
  navigate: (view: View) => void;
  goHome: () => void;
  openCourse: (courseId: string) => void;
  openLesson: (courseId: string, moduleId: string, lessonId: string) => void;
  openQuiz: (courseId: string, moduleId: string, lessonId: string) => void;
  openPricing: () => void;
  openTutors: () => void;
  openTutorPortal: () => void;
  openAdmin: (tab?: View['adminTab']) => void;
  openMyLearning: () => void;
  openDashboard: () => void;
  openFeatures: () => void;
  openCertificates: () => void;
  openAchievements: () => void;
  openCalendar: () => void;
  openMembers: () => void;
  openGroups: () => void;
  openMessages: (threadId?: string) => void;
  setTutorOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  toggleMenu: () => void;

  // ---- auth ----
  setAuthOpen: (open: boolean, mode?: 'login' | 'register', registerRole?: 'candidate' | 'tutor') => void;
  login: (email: string, role?: RoleKey) => boolean;
  loginAs: (userId: string) => void;
  register: (name: string, email: string, role: 'candidate' | 'tutor', tutorHeadline?: string) => void;
  logout: () => void;

  // ---- learning ----
  markLessonComplete: (lessonId: string) => void;
  markLessonTestPassed: (lessonId: string) => void;

  // ---- chat ----
  addMessage: (msg: ChatMessage) => void;
  setMessages: (msgs: ChatMessage[]) => void;
  clearChat: () => void;

  // ---- admin: users ----
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  deleteUser: (id: string) => void;
  setUserStatus: (id: string, status: User['status']) => void;

  // ---- admin: roles ----
  updateRole: (key: RoleKey, patch: Partial<Role>) => void;
  toggleRolePermission: (key: RoleKey, perm: PermissionKey) => void;

  // ---- admin: tutors ----
  approveTutor: (id: string) => void;
  setTutorPayment: (id: string, patch: Partial<TutorProfile['paymentTerms']>) => void;

  // ---- admin: bookings ----
  addBooking: (b: Omit<Booking, 'id'>) => string;
  cancelBooking: (id: string) => void;

  // ---- admin: integrations ----
  toggleIntegration: (id: string) => void;
  updateIntegration: (id: string, patch: Partial<Integration>) => void;

  // ---- audit ----
  logAction: (action: string, target?: string) => void;

  // ---- notifications ----
  pushNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotification: (id: string) => void;

  // ---- activity ----
  logActivity: (entry: Omit<ActivityEntry, 'id' | 'createdAt' | 'userId'>) => void;

  // ---- achievements ----
  awardBadge: (slug: string) => void;
  awardCertificate: (courseId: string, scorePct: number, template?: Certificate['template']) => void;

  // ---- notes ----
  saveNote: (courseId: string, lessonId: string, body: string, isPrivate?: boolean) => void;
  deleteNote: (id: string) => void;

  // ---- discussions ----
  postDiscussion: (courseId: string, body: string, lessonId?: string) => void;
  upvoteDiscussion: (id: string) => void;

  // ---- announcements ----
  postAnnouncement: (courseId: string, title: string, body: string) => void;

  // ---- assignments ----
  submitAssignment: (assignmentId: string, fileName: string) => void;
  gradeAssignment: (assignmentId: string, userId: string, marks: number, feedback: string) => void;

  // ---- social ----
  sendDm: (toId: string, body: string) => void;
  markDmRead: (fromId: string) => void;
  addFriend: (friendId: string) => void;
  acceptFriend: (friendId: string) => void;
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;

  // ---- advanced: certificate builder ----
  addCertTemplate: (tpl: Omit<CertificateTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCertTemplate: (id: string, patch: Partial<CertificateTemplate>) => void;
  deleteCertTemplate: (id: string) => void;
  addCertElement: (tplId: string, element: Omit<CertificateElement, 'id'>) => void;
  updateCertElement: (tplId: string, elementId: string, patch: Partial<CertificateElement>) => void;
  deleteCertElement: (tplId: string, elementId: string) => void;

  // ---- advanced: registration forms ----
  updateRegistrationForm: (id: string, patch: Partial<RegistrationFormConfig>) => void;
  addRegField: (formId: string, field: Omit<RegistrationFormField, 'id'>) => void;
  updateRegField: (formId: string, fieldId: string, patch: Partial<RegistrationFormField>) => void;
  deleteRegField: (formId: string, fieldId: string) => void;

  // ---- advanced: email schedules ----
  updateEmailSchedule: (id: string, patch: Partial<EmailSchedule>) => void;
  toggleEmailSchedule: (id: string) => void;

  // ---- advanced: analytics ----
  trackEvent: (e: Omit<AnalyticsEvent, 'id' | 'ts'>) => void;
  analyticsSummary: () => AnalyticsSummary;

  // ---- advanced: GDPR ----
  requestGdprExport: (userId: string) => void;
  gdprBundlesFor: (userId: string) => GdprExportBundle[];

  // ---- corporate / B2B ----
  corporates: Corporate[];
  skillMatrix: SkillMatrixEntry[];
  aiInterviewReports: AiInterviewReport[];
  registerCorporate: (data: { name: string; domain: string; industry: string; country: string; contactEmail: string; contactName: string; adminUserId: string; planTier: CorporatePlanTier }) => string;
  approveCorporate: (corpId: string) => void;
  rejectCorporate: (corpId: string) => void;
  enrollCorporateEmployee: (corpId: string, userId: string) => void;
  exportCorporateProfiles: (corpId: string) => string;
  addCorporateSubscription: (corpId: string, planModel: CorporatePlanModel, courseIds: string[], pricePerSeat: number, employeeLimit: number) => void;
  cancelCorporateSubscription: (corpId: string, subId: string) => void;
  registerCorporateEmployee: (corpId: string, name: string, email: string) => string;
  approveEmployeeCourse: (corpId: string, userId: string, courseId: string) => void;
  removeCorporateEmployee: (corpId: string, userId: string) => void;
  openCorporate: () => void;

  // ---- AI Interview sessions ----
  interviewSessions: InterviewSession[];
  createInterviewSession: (userId: string, courseId: string, courseTitle: string, questions: InterviewQuestion[]) => string;
  appendInterviewTurn: (sessionId: string, turn: InterviewTurn) => void;
  advanceInterviewQuestion: (sessionId: string) => void;
  completeInterviewSession: (sessionId: string, report: InterviewReport) => void;
  abandonInterviewSession: (sessionId: string) => void;
  openInterviewReport: (sessionId: string) => void;
  addProctoringSnapshot: (sessionId: string, snapshot: ProctoringSnapshot) => void;
  addProctoringIncident: (sessionId: string, incident: ProctoringIncident) => void;
  updateProctoringData: (sessionId: string, data: { lastFaceDetectedAt: number; noFaceDuration: number; autoPauseCount: number }) => void;

  // ---- locale / i18n ----
  language: LanguageCode;
  currency: CurrencyCode;
  country: string;
  timezone: string;
  localeDetected: boolean;
  setLanguage: (lang: LanguageCode) => void;
  setCurrency: (cur: CurrencyCode) => void;
  setLocale: (patch: Partial<LocaleConfig>) => void;
  detectLocaleFromGps: () => void;
}

const AVATAR_COLORS = [
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-violet-500 to-purple-600',
  'from-sky-500 to-cyan-600',
  'from-rose-500 to-pink-600',
  'from-indigo-500 to-blue-600',
  'from-fuchsia-500 to-pink-600',
];

function threadIdFor(a: string, b: string) {
  return [a, b].sort().join('__');
}

// Helper function to calculate proctoring report from session data
function calculateProctoringReport(
  proctoringData: InterviewSession['proctoringData'],
  startedAt: number
): import('@/lib/types').ProctoringReport {
  const snapshots = proctoringData?.snapshots ?? [];
  const incidents = proctoringData?.incidents ?? [];
  
  if (snapshots.length === 0) {
    return {
      avgConcentrationScore: 0,
      minConcentrationScore: 0,
      maxConcentrationScore: 0,
      faceDetectedPct: 0,
      gazeCenterPct: 0,
      incidents: [],
      totalIncidents: 0,
      faceMissingIncidents: 0,
      lookingAwayIncidents: 0,
      snapshots: [],
      autoPauseEvents: [],
      proctoringPassed: false,
      proctoringNote: 'No proctoring data available.',
    };
  }
  
  // Calculate averages
  const avgConcentration = snapshots.reduce((s, sn) => s + sn.concentrationScore, 0) / snapshots.length;
  const minConcentration = Math.min(...snapshots.map((sn) => sn.concentrationScore));
  const maxConcentration = Math.max(...snapshots.map((sn) => sn.concentrationScore));
  const faceDetectedCount = snapshots.filter((sn) => sn.faceDetected).length;
  const faceDetectedPct = Math.round((faceDetectedCount / snapshots.length) * 100);
  const gazeCenterCount = snapshots.filter((sn) => sn.gazeDirection === 'center').length;
  const gazeCenterPct = Math.round((gazeCenterCount / snapshots.length) * 100);
  
  // Count incidents by type
  const faceMissingIncidents = incidents.filter((i) => i.type === 'face_missing').length;
  const lookingAwayIncidents = incidents.filter((i) => i.type === 'looking_away').length;
  
  // Build auto-pause events from incidents
  const autoPauseEvents = incidents
    .filter((i) => i.type === 'face_missing' && i.duration && i.duration >= 10)
    .map((i) => ({
      timestamp: i.timestamp,
      duration: i.duration ?? 0,
      reason: 'Face not detected for extended period',
    }));
  
  // Determine if proctoring passed
  const hasCriticalIncidents = faceMissingIncidents > 3 || autoPauseEvents.length > 0;
  const avgScorePasses = avgConcentration >= 50;
  const facePresencePasses = faceDetectedPct >= 80;
  const proctoringPassed = !hasCriticalIncidents && avgScorePasses && facePresencePasses;
  
  // Generate note
  let proctoringNote = '';
  if (proctoringPassed) {
    proctoringNote = `Candidate maintained good focus throughout the interview. Average concentration: ${Math.round(avgConcentration)}%. Face detected ${faceDetectedPct}% of the time.`;
  } else {
    const issues: string[] = [];
    if (faceDetectedPct < 80) issues.push(`Face detected only ${faceDetectedPct}% of time`);
    if (avgConcentration < 50) issues.push(`Average concentration only ${Math.round(avgConcentration)}%`);
    if (faceMissingIncidents > 3) issues.push(`${faceMissingIncidents} face-missing incidents`);
    if (autoPauseEvents.length > 0) issues.push('Interview was auto-paused due to missing face');
    proctoringNote = `Proctoring concerns detected: ${issues.join(', ')}.`;
  }
  
  return {
    avgConcentrationScore: Math.round(avgConcentration),
    minConcentrationScore: minConcentration,
    maxConcentrationScore: maxConcentration,
    faceDetectedPct,
    gazeCenterPct,
    incidents,
    totalIncidents: incidents.length,
    faceMissingIncidents,
    lookingAwayIncidents,
    snapshots: snapshots.slice(-20), // Keep last 20 snapshots for report
    autoPauseEvents,
    proctoringPassed,
    proctoringNote,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      view: { name: 'home' },
      isTutorOpen: false,
      isMenuOpen: false,
      isAuthOpen: false,
      authMode: 'login',
      registerRole: 'candidate',

      chatMessages: [],
      tutorSidebarExpanded: false, // default collapsed (320px)
      tutorSidebarChatOpen: false, // chat section hidden by default
      tutorVoicePausedPosition: 0,
      tutorVoiceProgress: 0,
      tutorVoiceLastText: '',
      tutorVoiceLang: 'en',
      completedLessons: [],
      passedLessonTests: [],

      currentUserId: null,
      users: SEED_USERS,
      roles: DEFAULT_ROLES,
      bookings: SEED_BOOKINGS,
      integrations: SEED_INTEGRATIONS,
      auditLogs: SEED_AUDIT_LOGS,

      // social
      notifications: SEED_NOTIFICATIONS,
      activities: SEED_ACTIVITIES,
      certificates: SEED_CERTIFICATES,
      badges: SEED_BADGES,
      userBadges: SEED_USER_BADGES,
      notes: SEED_NOTES,
      discussions: SEED_DISCUSSIONS,
      announcements: SEED_ANNOUNCEMENTS,
      assignments: SEED_ASSIGNMENTS,
      categories: SEED_CATEGORIES,
      bundles: SEED_BUNDLES,
      groups: SEED_GROUPS,
      messages: SEED_MESSAGES,
      calendarEvents: SEED_CALENDAR_EVENTS,
      friendships: SEED_FRIENDSHIPS,

      // advanced
      certTemplates: SEED_CERT_TEMPLATES,
      registrationForms: SEED_REG_FORMS,
      emailSchedules: SEED_EMAIL_SCHEDULES,
      analyticsEvents: SEED_ANALYTICS_EVENTS,
      gdprBundles: SEED_GDPR_BUNDLES,

      // ---- corporate / B2B seed ----
      corporates: SEED_CORPORATES,
      skillMatrix: SEED_SKILL_MATRIX,
      aiInterviewReports: SEED_AI_INTERVIEW_REPORTS,

      // ---- AI Interview sessions ----
      interviewSessions: [],

      // ---- locale defaults: Indian English, India, INR, Asia/Kolkata ----
      language: 'en',
      currency: 'INR',
      country: 'IN',
      timezone: 'Asia/Kolkata',
      localeDetected: false,

      currentUser: () => {
        const id = get().currentUserId;
        return id ? get().users.find((u) => u.id === id) ?? null : null;
      },

      hasPermission: (perm) => {
        const user = get().currentUser();
        if (!user) {
          const guest = get().roles.find((r) => r.key === 'guest');
          return guest?.permissions.includes(perm) ?? false;
        }
        const role = get().roles.find((r) => r.key === user.role);
        return role?.permissions.includes(perm) ?? false;
      },

      unreadNotificationCount: () => {
        const uid = get().currentUserId;
        if (!uid) return 0;
        return get().notifications.filter((n) => n.userId === uid && !n.read).length;
      },

      myActivities: (limit) => {
        const uid = get().currentUserId;
        if (!uid) return [];
        const list = get().activities
          .filter((a) => a.userId === uid)
          .sort((a, b) => b.createdAt - a.createdAt);
        return limit ? list.slice(0, limit) : list;
      },

      myBadges: () => {
        const uid = get().currentUserId;
        if (!uid) return [];
        return get().userBadges
          .filter((ub) => ub.userId === uid)
          .map((ub) => {
            const badge = get().badges.find((b) => b.slug === ub.badgeSlug);
            return { ...ub, badge: badge! };
          })
          .filter((ub) => ub.badge);
      },

      myCertificates: () => {
        const uid = get().currentUserId;
        if (!uid) return [];
        return get().certificates.filter((c) => c.userId === uid);
      },

      myNotes: (courseId, lessonId) => {
        const uid = get().currentUserId;
        if (!uid) return [];
        return get().notes.filter((n) => n.userId === uid && n.courseId === courseId && n.lessonId === lessonId);
      },

      myCalendar: () => {
        const uid = get().currentUserId;
        if (!uid) return [];
        return get().calendarEvents
          .filter((e) => e.userId === uid)
          .sort((a, b) => a.startsAt - b.startsAt);
      },

      myFriends: () => {
        const uid = get().currentUserId;
        if (!uid) return [];
        const friends = get().friendships.filter(
          (f) => (f.userId === uid || f.friendId === uid) && f.status === 'accepted'
        );
        const friendIds = friends.map((f) => (f.userId === uid ? f.friendId : f.userId));
        return get().users.filter((u) => friendIds.includes(u.id));
      },

      myGroups: () => {
        const uid = get().currentUserId;
        if (!uid) return [];
        return get().groups.filter((g) => g.memberIds.includes(uid));
      },

      threadWith: (otherUserId) => {
        const uid = get().currentUserId;
        if (!uid) return [];
        const tid = threadIdFor(uid, otherUserId);
        return get().messages
          .filter((m) => m.threadId === tid)
          .sort((a, b) => a.createdAt - b.createdAt);
      },

      unreadDmCount: () => {
        const uid = get().currentUserId;
        if (!uid) return 0;
        return get().messages.filter((m) => m.toId === uid && !m.read).length;
      },

      // ---------- navigation ----------
      navigate: (view) => {
        set({ view, isMenuOpen: false });
        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      goHome: () => set({ view: { name: 'home' }, isMenuOpen: false }),
      openCourse: (courseId) => set({ view: { name: 'course', courseId }, isMenuOpen: false }),
      openLesson: (courseId, moduleId, lessonId) =>
        set({ view: { name: 'lesson', courseId, moduleId, lessonId }, isMenuOpen: false }),
      openQuiz: (courseId, moduleId, lessonId) =>
        set({ view: { name: 'quiz', courseId, moduleId, lessonId }, isMenuOpen: false }),
      openPricing: () => set({ view: { name: 'pricing' }, isMenuOpen: false }),
      openTutors: () => set({ view: { name: 'tutors' }, isMenuOpen: false }),
      openTutorPortal: () => set({ view: { name: 'tutor_portal' }, isMenuOpen: false }),
      openAdmin: (tab) => set({ view: { name: 'admin', adminTab: tab ?? 'dashboard' }, isMenuOpen: false }),
      openMyLearning: () => set({ view: { name: 'my_learning' }, isMenuOpen: false }),
      openDashboard: () => set({ view: { name: 'dashboard' }, isMenuOpen: false }),
      openFeatures: () => set({ view: { name: 'features' }, isMenuOpen: false }),
      openCorporate: () => set({ view: { name: 'corporate' }, isMenuOpen: false }),
      openCertificates: () => set({ view: { name: 'certificates' }, isMenuOpen: false }),
      openAchievements: () => set({ view: { name: 'achievements' }, isMenuOpen: false }),
      openCalendar: () => set({ view: { name: 'calendar' }, isMenuOpen: false }),
      openMembers: () => set({ view: { name: 'members' }, isMenuOpen: false }),
      openGroups: () => set({ view: { name: 'groups' }, isMenuOpen: false }),
      openMessages: (threadId) => set({ view: { name: 'messages', dmThreadId: threadId }, isMenuOpen: false }),
      setTutorOpen: (open) => set({ isTutorOpen: open }),
      setMenuOpen: (open) => set({ isMenuOpen: open }),
      toggleMenu: () => set((s) => ({ isMenuOpen: !s.isMenuOpen })),

      // ---------- auth ----------
      setAuthOpen: (open, mode = 'login', registerRole = 'candidate') =>
        set({ isAuthOpen: open, authMode: mode, registerRole }),

      login: (email, role) => {
        const user = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
          set({ currentUserId: user.id, isAuthOpen: false, view: { name: 'dashboard' } });
          get().logAction('Logged in');
          get().pushNotification({
            userId: user.id,
            type: 'success',
            title: `Welcome back, ${user.name.split(' ')[0]}!`,
            body: 'You\'re now signed in. Your dashboard has the latest on your courses, sessions, and badges.',
            link: 'dashboard',
          });
          return true;
        }
        return false;
      },

      loginAs: (userId) => {
        const u = get().users.find((x) => x.id === userId);
        set({ currentUserId: userId, isAuthOpen: false, view: { name: 'dashboard' } });
        if (u) {
          get().logAction('Impersonated user', u.name);
          get().pushNotification({
            userId,
            type: 'info',
            title: `Signed in as ${u.name}`,
            body: `Role: ${u.role}. You can switch roles anytime via the avatar menu.`,
            link: 'dashboard',
          });
        }
      },

      register: (name, email, role, tutorHeadline) => {
        const id = `u-${role}-${Date.now()}`;
        const newUser: User = {
          id,
          name,
          email,
          role,
          avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
          enrolledCourseIds: [],
          approvedCourseIds: [],
          createdAt: Date.now(),
          status: role === 'tutor' ? 'pending' : 'active',
          tutorProfile: role === 'tutor'
            ? {
                headline: tutorHeadline || 'New tutor — pending review',
                bio: '',
                expertise: [],
                hourlyRate: 50,
                rating: 0,
                sessionsCompleted: 0,
                availability: 'offline',
                paymentTerms: { platformFeePct: 20, payoutSchedule: 'monthly' },
                approved: false,
              }
            : undefined,
        };
        set((s) => ({
          users: [...s.users, newUser],
          currentUserId: id,
          isAuthOpen: false,
          view: { name: 'dashboard' },
        }));
        get().logAction('Registered new account', `${name} (${role})`);
        get().pushNotification({
          userId: id,
          type: 'success',
          title: `Welcome to marqaicourses, ${name.split(' ')[0]}! 🎉`,
          body: role === 'tutor'
            ? 'Your tutor application is pending review by the Super Admin. You\'ll be notified once approved.'
            : 'Your candidate account is ready. Browse the catalog and enroll in your first course to get started.',
          link: 'dashboard',
        });
        if (role === 'tutor') {
          get().pushNotification({
            userId: 'u-admin-1',
            type: 'system',
            title: `New tutor application — ${name}`,
            body: `${name} applied to teach on marqaicourses. Review their application in the Admin Portal.`,
            link: 'admin:tutors',
          });
        }
      },

      logout: () => {
        get().logAction('Logged out');
        set({ currentUserId: null, view: { name: 'home' } });
      },

      // ---------- learning ----------
      markLessonComplete: (lessonId) => {
        const alreadyDone = get().completedLessons.includes(lessonId);
        if (!alreadyDone) {
          set((s) => ({ completedLessons: [...s.completedLessons, lessonId] }));
          // Award first-lesson badge if applicable
          if (get().completedLessons.length === 1) {
            get().awardBadge('first-lesson');
          }
          // Log activity
          get().logActivity({
            kind: 'lesson_completed',
            lessonId,
            text: 'Completed a lesson',
          });
        }
      },
      markLessonTestPassed: (lessonId) => {
        const alreadyPassed = get().passedLessonTests.includes(lessonId);
        if (!alreadyPassed) {
          set((s) => ({ passedLessonTests: [...s.passedLessonTests, lessonId] }));
        }
      },

      // ---------- chat ----------
      addMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
      setMessages: (msgs) => set({ chatMessages: msgs }),
      clearChat: () => set({ chatMessages: [] }),

      // ---------- AI Tutor Sidebar ----------
      setTutorSidebarExpanded: (expanded) => set({ tutorSidebarExpanded: expanded }),
      setTutorSidebarChatOpen: (open) => set({ tutorSidebarChatOpen: open }),
      setTutorVoiceState: (pausedPosition, progress, lastText) =>
        set({ tutorVoicePausedPosition: pausedPosition, tutorVoiceProgress: progress, tutorVoiceLastText: lastText }),
      setTutorVoiceLang: (lang) => set({ tutorVoiceLang: lang }),

      // ---------- admin: users ----------
      addUser: (user) => {
        const id = `u-${user.role}-${Date.now()}`;
        const newUser: User = { ...user, id, createdAt: Date.now() };
        set((s) => ({ users: [...s.users, newUser] }));
        get().logAction('Created user', newUser.name);
      },
      updateUser: (id, patch) => {
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) }));
        const u = get().users.find((x) => x.id === id);
        get().logAction('Updated user', u?.name);
      },
      deleteUser: (id) => {
        const u = get().users.find((x) => x.id === id);
        set((s) => ({ users: s.users.filter((x) => x.id !== id) }));
        get().logAction('Deleted user', u?.name);
      },
      setUserStatus: (id, status) => {
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, status } : u)) }));
        const u = get().users.find((x) => x.id === id);
        get().logAction(`Set user status → ${status}`, u?.name);
      },

      // ---------- admin: roles ----------
      updateRole: (key, patch) => {
        set((s) => ({ roles: s.roles.map((r) => (r.key === key ? { ...r, ...patch } : r)) }));
        get().logAction('Updated role', key);
      },
      toggleRolePermission: (key, perm) => {
        set((s) => ({
          roles: s.roles.map((r) => {
            if (r.key !== key) return r;
            const has = r.permissions.includes(perm);
            return {
              ...r,
              permissions: has ? r.permissions.filter((p) => p !== perm) : [...r.permissions, perm],
            };
          }),
        }));
        get().logAction('Toggled permission', `${key} → ${perm}`);
      },

      // ---------- admin: tutors ----------
      approveTutor: (id) => {
        set((s) => ({
          users: s.users.map((u) =>
            u.id === id && u.role === 'tutor' && u.tutorProfile
              ? { ...u, status: 'active', tutorProfile: { ...u.tutorProfile, approved: true } }
              : u
          ),
        }));
        const u = get().users.find((x) => x.id === id);
        get().logAction('Approved tutor', u?.name);
        if (u) {
          get().pushNotification({
            userId: id,
            type: 'success',
            title: '🎉 You\'re approved as a marqaicourses tutor!',
            body: 'You can now set your availability, accept bookings, and start teaching. Visit your Tutor Dashboard to complete your profile.',
            link: 'tutor_portal',
          });
        }
      },
      setTutorPayment: (id, patch) => {
        set((s) => ({
          users: s.users.map((u) =>
            u.id === id && u.tutorProfile
              ? { ...u, tutorProfile: { ...u.tutorProfile, paymentTerms: { ...u.tutorProfile.paymentTerms, ...patch } } }
              : u
          ),
        }));
        const u = get().users.find((x) => x.id === id);
        get().logAction('Updated tutor payment terms', u?.name);
      },

      // ---------- admin: bookings ----------
      addBooking: (b) => {
        const id = `b-${Date.now()}`;
        set((s) => ({ bookings: [...s.bookings, { ...b, id }] }));
        get().logAction('Booked session', `${b.topic}`);
        // push notifications to both parties
        get().pushNotification({
          userId: b.candidateId,
          type: 'session',
          title: 'Session booked ✅',
          body: `Your session "${b.topic}" is scheduled. Add it to your calendar.`,
          link: 'calendar',
        });
        get().pushNotification({
          userId: b.tutorId,
          type: 'session',
          title: 'New booking received',
          body: `A candidate booked "${b.topic}". Check your tutor dashboard.`,
          link: 'tutor_portal',
        });
        // auto-add to calendars
        set((s) => ({
          calendarEvents: [
            ...s.calendarEvents,
            {
              id: `ce-${Date.now()}`,
              userId: b.candidateId,
              title: `1:1 — ${b.topic}`,
              type: 'session',
              startsAt: b.scheduledAt,
              durationMinutes: b.durationMinutes,
              courseContext: b.courseContext,
            } as CalendarEvent,
            {
              id: `ce-${Date.now() + 1}`,
              userId: b.tutorId,
              title: `Session: ${b.topic}`,
              type: 'session',
              startsAt: b.scheduledAt,
              durationMinutes: b.durationMinutes,
            } as CalendarEvent,
          ],
        }));
        return id;
      },
      cancelBooking: (id) => {
        set((s) => ({
          bookings: s.bookings.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)),
        }));
        get().logAction('Cancelled booking', id);
      },

      // ---------- admin: integrations ----------
      toggleIntegration: (id) => {
        set((s) => ({
          integrations: s.integrations.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i)),
        }));
        const i = get().integrations.find((x) => x.id === id);
        get().logAction(i?.connected ? 'Connected integration' : 'Disconnected integration', i?.name);
      },
      updateIntegration: (id, patch) => {
        set((s) => ({
          integrations: s.integrations.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        }));
        const i = get().integrations.find((x) => x.id === id);
        get().logAction('Updated integration', i?.name);
      },

      // ---------- audit ----------
      logAction: (action, target) => {
        const user = get().currentUser();
        const log: AuditLog = {
          id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          actorId: user?.id ?? 'system',
          actorName: user?.name ?? 'System',
          action,
          target,
          timestamp: Date.now(),
        };
        set((s) => ({ auditLogs: [log, ...s.auditLogs].slice(0, 100) }));
      },

      // ---------- notifications ----------
      pushNotification: (n) => {
        const notif: AppNotification = {
          id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          read: false,
          createdAt: Date.now(),
          ...n,
        };
        set((s) => ({ notifications: [notif, ...s.notifications].slice(0, 200) }));
        // Browser push notification (best-effort, only when permitted & user is recipient & page visible)
        if (typeof window !== 'undefined' && 'Notification' in window) {
          const cur = get().currentUserId;
          if (cur === n.userId && Notification.permission === 'granted') {
            try {
              new Notification(n.title, { body: n.body });
            } catch { /* noop */ }
          }
        }
      },
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      markAllNotificationsRead: () => {
        const uid = get().currentUserId;
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.userId === uid ? { ...n, read: true } : n
          ),
        }));
      },
      clearNotification: (id) =>
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

      // ---------- activity ----------
      logActivity: (entry) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const a: ActivityEntry = {
          id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          userId: uid,
          createdAt: Date.now(),
          ...entry,
        };
        set((s) => ({ activities: [a, ...s.activities].slice(0, 500) }));
      },

      // ---------- achievements ----------
      awardBadge: (slug) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const exists = get().userBadges.some((ub) => ub.userId === uid && ub.badgeSlug === slug);
        if (exists) return;
        const badge = get().badges.find((b) => b.slug === slug);
        if (!badge) return;
        set((s) => ({
          userBadges: [...s.userBadges, { userId: uid, badgeSlug: slug, awardedAt: Date.now() }],
        }));
        get().logActivity({ kind: 'badge_earned', text: `Unlocked the ${badge.title} badge`, meta: { badge: slug } });
        get().pushNotification({
          userId: uid,
          type: 'success',
          title: `New badge unlocked — ${badge.title} ${badge.icon}`,
          body: `${badge.description}. ${badge.criteria}.`,
          link: 'achievements',
        });
      },

      awardCertificate: (courseId, scorePct, template = 'default') => {
        const uid = get().currentUserId;
        if (!uid) return;
        const exists = get().certificates.some((c) => c.userId === uid && c.courseId === courseId);
        if (exists) return;
        const code = `MARQ-${courseId.toUpperCase().slice(0, 6)}-${Date.now().toString(36).toUpperCase()}`;
        const cert: Certificate = {
          id: `cert-${Date.now()}`,
          userId: uid,
          courseId,
          code,
          issuedAt: Date.now(),
          scorePct,
          template,
        };
        set((s) => ({ certificates: [...s.certificates, cert] }));
        get().logActivity({
          kind: 'certificate_earned',
          courseId,
          text: `Earned a certificate (${scorePct}%)`,
          meta: { code },
        });
        get().pushNotification({
          userId: uid,
          type: 'success',
          title: '🎓 Certificate earned!',
          body: `Congratulations! You earned a certificate. Validation code: ${code}.`,
          link: 'certificates',
        });
      },

      // ---------- notes ----------
      saveNote: (courseId, lessonId, body, isPrivate = true) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const id = `note-${Date.now()}`;
        const note: LessonNote = {
          id, userId: uid, courseId, lessonId, body, isPrivate,
          createdAt: Date.now(), updatedAt: Date.now(),
        };
        set((s) => ({ notes: [...s.notes, note] }));
        get().logActivity({ kind: 'note_saved', courseId, lessonId, text: 'Saved a lesson note' });
      },
      deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      // ---------- discussions ----------
      postDiscussion: (courseId, body, lessonId) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const post: DiscussionPost = {
          id: `d-${Date.now()}`,
          courseId, lessonId, authorId: uid, body, upvotes: [], createdAt: Date.now(),
        };
        set((s) => ({ discussions: [...s.discussions, post] }));
        get().logActivity({ kind: 'discussion_posted', courseId, text: 'Posted a discussion reply' });
      },
      upvoteDiscussion: (id) => {
        const uid = get().currentUserId;
        if (!uid) return;
        set((s) => ({
          discussions: s.discussions.map((d) => {
            if (d.id !== id) return d;
            const has = d.upvotes.includes(uid);
            return { ...d, upvotes: has ? d.upvotes.filter((u) => u !== uid) : [...d.upvotes, uid] };
          }),
        }));
      },

      // ---------- announcements ----------
      postAnnouncement: (courseId, title, body) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const an: Announcement = {
          id: `an-${Date.now()}`,
          courseId, authorId: uid, title, body, createdAt: Date.now(),
        };
        set((s) => ({ announcements: [an, ...s.announcements] }));
        get().logActivity({ kind: 'announcement_posted', courseId, text: `Posted announcement: ${title}` });
        // notify all enrolled candidates
        const course = courseId;
        const enrolled = get().users.filter((u) => u.enrolledCourseIds.includes(course) && u.id !== uid);
        enrolled.forEach((u) => {
          get().pushNotification({
            userId: u.id,
            type: 'announcement',
            title: `New announcement — ${title}`,
            body: body.slice(0, 140) + (body.length > 140 ? '...' : ''),
            link: `course:${courseId}`,
          });
        });
      },

      // ---------- assignments ----------
      submitAssignment: (assignmentId, fileName) => {
        const uid = get().currentUserId;
        if (!uid) return;
        set((s) => ({
          assignments: s.assignments.map((a) =>
            a.id === assignmentId
              ? {
                  ...a,
                  submissions: {
                    ...a.submissions,
                    [uid]: { status: 'submitted', fileName, submittedAt: Date.now() },
                  },
                }
              : a
          ),
        }));
        get().logActivity({ kind: 'lesson_completed', text: `Submitted assignment: ${fileName}` });
      },
      gradeAssignment: (assignmentId, userId, marks, feedback) => {
        set((s) => ({
          assignments: s.assignments.map((a) =>
            a.id === assignmentId
              ? {
                  ...a,
                  submissions: {
                    ...a.submissions,
                    [userId]: { ...(a.submissions[userId] ?? {}), status: 'graded', marks, feedback },
                  },
                }
              : a
          ),
        }));
        get().pushNotification({
          userId,
          type: 'info',
          title: 'Assignment graded',
          body: `You scored ${marks}/100. Feedback: "${feedback.slice(0, 80)}"`,
        });
      },

      // ---------- social ----------
      sendDm: (toId, body) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const msg: DirectMessage = {
          id: `m-${Date.now()}`,
          threadId: threadIdFor(uid, toId),
          fromId: uid, toId, body, read: false, createdAt: Date.now(),
        };
        set((s) => ({ messages: [...s.messages, msg] }));
        get().pushNotification({
          userId: toId,
          type: 'social',
          title: 'New message',
          body: `${get().currentUser()?.name}: ${body.slice(0, 80)}`,
          link: 'messages',
        });
      },
      markDmRead: (fromId) => {
        const uid = get().currentUserId;
        if (!uid) return;
        set((s) => ({
          messages: s.messages.map((m) =>
            m.toId === uid && m.fromId === fromId ? { ...m, read: true } : m
          ),
        }));
      },
      addFriend: (friendId) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const exists = get().friendships.some(
          (f) => (f.userId === uid && f.friendId === friendId) || (f.userId === friendId && f.friendId === uid)
        );
        if (exists) return;
        set((s) => ({
          friendships: [...s.friendships, { userId: uid, friendId, status: 'pending', createdAt: Date.now() }],
        }));
        get().pushNotification({
          userId: friendId,
          type: 'social',
          title: 'New friend request',
          body: `${get().currentUser()?.name} wants to connect.`,
          link: 'members',
        });
      },
      acceptFriend: (friendId) => {
        const uid = get().currentUserId;
        if (!uid) return;
        set((s) => ({
          friendships: s.friendships.map((f) =>
            f.userId === friendId && f.friendId === uid
              ? { ...f, status: 'accepted' }
              : f
          ),
        }));
        get().logActivity({ kind: 'friend_added', text: 'Accepted a friend request' });
      },
      joinGroup: (groupId) => {
        const uid = get().currentUserId;
        if (!uid) return;
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId && !g.memberIds.includes(uid)
              ? { ...g, memberIds: [...g.memberIds, uid] }
              : g
          ),
        }));
        get().logActivity({ kind: 'group_joined', text: `Joined a group` });
      },
      leaveGroup: (groupId) => {
        const uid = get().currentUserId;
        if (!uid) return;
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId ? { ...g, memberIds: g.memberIds.filter((m) => m !== uid) } : g
          ),
        }));
      },

      // ---------- advanced: certificate builder ----------
      addCertTemplate: (tpl) => {
        const id = `tpl-${Date.now()}`;
        const now2 = Date.now();
        set((s) => ({
          certTemplates: [...s.certTemplates, { ...tpl, id, createdAt: now2, updatedAt: now2 }],
        }));
        get().logAction('Created certificate template', tpl.name);
      },
      updateCertTemplate: (id, patch) => {
        set((s) => ({
          certTemplates: s.certTemplates.map((t) =>
            t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t
          ),
        }));
      },
      deleteCertTemplate: (id) => {
        set((s) => ({ certTemplates: s.certTemplates.filter((t) => t.id !== id) }));
        get().logAction('Deleted certificate template', id);
      },
      addCertElement: (tplId, element) => {
        const id = `el-${Date.now()}`;
        set((s) => ({
          certTemplates: s.certTemplates.map((t) =>
            t.id === tplId
              ? { ...t, elements: [...t.elements, { ...element, id }], updatedAt: Date.now() }
              : t
          ),
        }));
      },
      updateCertElement: (tplId, elementId, patch) => {
        set((s) => ({
          certTemplates: s.certTemplates.map((t) =>
            t.id === tplId
              ? {
                  ...t,
                  updatedAt: Date.now(),
                  elements: t.elements.map((e) => (e.id === elementId ? { ...e, ...patch } : e)),
                }
              : t
          ),
        }));
      },
      deleteCertElement: (tplId, elementId) => {
        set((s) => ({
          certTemplates: s.certTemplates.map((t) =>
            t.id === tplId
              ? { ...t, updatedAt: Date.now(), elements: t.elements.filter((e) => e.id !== elementId) }
              : t
          ),
        }));
      },

      // ---------- advanced: registration forms ----------
      updateRegistrationForm: (id, patch) => {
        set((s) => ({
          registrationForms: s.registrationForms.map((f) =>
            f.id === id ? { ...f, ...patch, updatedAt: Date.now() } : f
          ),
        }));
        get().logAction('Updated registration form', id);
      },
      addRegField: (formId, field) => {
        const id = `f-${Date.now()}`;
        set((s) => ({
          registrationForms: s.registrationForms.map((f) =>
            f.id === formId
              ? { ...f, updatedAt: Date.now(), fields: [...f.fields, { ...field, id }] }
              : f
          ),
        }));
      },
      updateRegField: (formId, fieldId, patch) => {
        set((s) => ({
          registrationForms: s.registrationForms.map((f) =>
            f.id === formId
              ? {
                  ...f,
                  updatedAt: Date.now(),
                  fields: f.fields.map((fld) => (fld.id === fieldId ? { ...fld, ...patch } : fld)),
                }
              : f
          ),
        }));
      },
      deleteRegField: (formId, fieldId) => {
        set((s) => ({
          registrationForms: s.registrationForms.map((f) =>
            f.id === formId
              ? { ...f, updatedAt: Date.now(), fields: f.fields.filter((fld) => fld.id !== fieldId) }
              : f
          ),
        }));
      },

      // ---------- advanced: email schedules ----------
      updateEmailSchedule: (id, patch) => {
        set((s) => ({
          emailSchedules: s.emailSchedules.map((e) =>
            e.id === id ? { ...e, ...patch, updatedAt: Date.now() } : e
          ),
        }));
        get().logAction('Updated email schedule', id);
      },
      toggleEmailSchedule: (id) => {
        set((s) => ({
          emailSchedules: s.emailSchedules.map((e) =>
            e.id === id ? { ...e, enabled: !e.enabled, updatedAt: Date.now() } : e
          ),
        }));
      },

      // ---------- advanced: analytics ----------
      trackEvent: (e) => {
        const event: AnalyticsEvent = { ...e, id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, ts: Date.now() };
        set((s) => ({ analyticsEvents: [event, ...s.analyticsEvents].slice(0, 5000) }));
      },
      analyticsSummary: () => {
        const events = get().analyticsEvents;
        const now2 = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        const users = get().users;
        const totalUsers = users.length;
        const active7d = new Set(
          events.filter((e) => e.ts > now2 - 7 * dayMs && e.userId).map((e) => e.userId!)
        ).size;
        const enrollments30d = events.filter((e) => e.kind === 'course_enrolled' && e.ts > now2 - 30 * dayMs).length;
        const completions30d = events.filter((e) => e.kind === 'course_completed' && e.ts > now2 - 30 * dayMs).length;
        const revenue30d = events
          .filter((e) => e.kind === 'payment_completed' && e.ts > now2 - 30 * dayMs)
          .reduce((sum, e) => sum + (e.value ?? 0), 0);
        const quizScores = events.filter((e) => e.kind === 'quiz_passed' && typeof e.value === 'number').map((e) => e.value!);
        const avgQuizScore = quizScores.length ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : 0;

        // 8-week series
        const enrollmentsSeries: { ts: number; count: number }[] = [];
        const revenueSeries: { ts: number; amount: number }[] = [];
        for (let w = 7; w >= 0; w--) {
          const start = now2 - (w + 1) * 7 * dayMs;
          const end = now2 - w * 7 * dayMs;
          const weekEvents = events.filter((e) => e.ts >= start && e.ts < end);
          enrollmentsSeries.push({ ts: end, count: weekEvents.filter((e) => e.kind === 'course_enrolled').length });
          revenueSeries.push({
            ts: end,
            amount: weekEvents.filter((e) => e.kind === 'payment_completed').reduce((s, e) => s + (e.value ?? 0), 0),
          });
        }

        // top courses
        const courseIdSet = new Set(events.filter((e) => e.courseId).map((e) => e.courseId!));
        const topCourses = Array.from(courseIdSet).map((cid) => {
          const courseEvents = events.filter((e) => e.courseId === cid);
          return {
            courseId: cid,
            enrollments: courseEvents.filter((e) => e.kind === 'course_enrolled').length,
            completions: courseEvents.filter((e) => e.kind === 'course_completed').length,
            revenue: courseEvents.filter((e) => e.kind === 'payment_completed').reduce((s, e) => s + (e.value ?? 0), 0),
          };
        }).sort((a, b) => b.enrollments - a.enrollments).slice(0, 5);

        // funnel
        const signups = events.filter((e) => e.kind === 'signup').length;
        const enrolled = events.filter((e) => e.kind === 'course_enrolled').length;
        const completedLessons = events.filter((e) => e.kind === 'lesson_completed').length;
        const certs = events.filter((e) => e.kind === 'certificate_earned').length;
        const funnel = [
          { stage: 'Signups', count: signups, pct: 100 },
          { stage: 'Enrolled', count: enrolled, pct: signups ? Math.round((enrolled / signups) * 100) : 0 },
          { stage: 'Lessons completed', count: completedLessons, pct: signups ? Math.round((completedLessons / signups) * 100) : 0 },
          { stage: 'Certificates earned', count: certs, pct: signups ? Math.round((certs / signups) * 100) : 0 },
        ];

        return {
          totalUsers, activeUsers7d: active7d, enrollments30d, courseCompletions30d: completions30d,
          revenue30d, avgQuizScore,
          enrollmentsSeries, revenueSeries, topCourses, funnel,
        };
      },

      // ---------- advanced: GDPR ----------
      requestGdprExport: (userId) => {
        const id = `gb-${Date.now()}`;
        const now2 = Date.now();
        set((s) => ({
          gdprBundles: [
            { id, userId, requestedAt: now2, status: 'pending', expiresAt: now2 + 30 * 24 * 60 * 60 * 1000 },
            ...s.gdprBundles,
          ],
        }));
        get().logAction('Requested GDPR export', userId);
      },
      gdprBundlesFor: (userId) => get().gdprBundles.filter((b) => b.userId === userId),

      // ---------- corporate / B2B ----------
      registerCorporate: (data) => {
        const id = `corp-${Date.now()}`;
        const now = Date.now();
        const corp: Corporate = {
          id,
          name: data.name,
          domain: data.domain,
          industry: data.industry,
          country: data.country,
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          adminUserId: data.adminUserId,
          employeeUserIds: [],
          planTier: data.planTier,
          status: 'pending',
          subscriptions: [],
          subscribedCourseIds: [],
          employeeRestrictedCourseIds: [],
          createdAt: now,
        };
        set((s) => ({
          corporates: [...s.corporates, corp],
        }));
        // Also set the user's role to corporate_admin and link corporateId
        set((s) => ({
          users: s.users.map((u) =>
            u.id === data.adminUserId
              ? { ...u, role: 'corporate_admin' as RoleKey, corporateId: id }
              : u
          ),
        }));
        get().logAction('Registered corporate', data.name);
        return id;
      },
      approveCorporate: (corpId) => {
        set((s) => ({
          corporates: s.corporates.map((c) =>
            c.id === corpId ? { ...c, status: 'approved' as CorporateStatus } : c
          ),
        }));
        get().logAction('Approved corporate', corpId);
      },
      rejectCorporate: (corpId) => {
        set((s) => ({
          corporates: s.corporates.map((c) =>
            c.id === corpId ? { ...c, status: 'rejected' as CorporateStatus } : c
          ),
        }));
        get().logAction('Rejected corporate', corpId);
      },
      enrollCorporateEmployee: (corpId, userId) => {
        set((s) => {
          const corp = s.corporates.find((c) => c.id === corpId);
          if (!corp || corp.employeeUserIds.includes(userId)) return s;
          return {
            corporates: s.corporates.map((c) =>
              c.id === corpId
                ? { ...c, employeeUserIds: [...c.employeeUserIds, userId] }
                : c
            ),
            users: s.users.map((u) =>
              u.id === userId
                ? { ...u, corporateId: corpId, role: 'corporate_user' as RoleKey }
                : u
            ),
          };
        });
        get().logAction('Enrolled employee to corporate', `${corpId}/${userId}`);
      },
      exportCorporateProfiles: (corpId) => {
        const corp = get().corporates.find((c) => c.id === corpId);
        if (!corp) return '';
        const emps = get().users.filter((u) => corp.employeeUserIds.includes(u.id));
        const header = 'Name,Email,Courses,Status\n';
        const rows = emps.map((e) =>
          `"${e.name}","${e.email}","${e.enrolledCourseIds.join('; ')}","${e.status}"`
        ).join('\n');
        return header + rows;
      },
      addCorporateSubscription: (corpId, planModel, courseIds, pricePerSeat, employeeLimit) => {
        const id = `sub-${Date.now()}`;
        const now = Date.now();
        const expiresAt = planModel === 'annual'
          ? now + 365 * 24 * 60 * 60 * 1000
          : planModel === 'monthly'
          ? now + 30 * 24 * 60 * 60 * 1000
          : now + 180 * 24 * 60 * 60 * 1000; // single_course = 6 months
        const sub: CorporateSubscription = {
          id,
          corporateId: corpId,
          planModel,
          planTier: get().corporates.find((c) => c.id === corpId)?.planTier ?? 'growth',
          courseIds,
          pricePerSeat,
          employeeLimit,
          startedAt: now,
          expiresAt,
          status: 'active',
        };
        set((s) => ({
          corporates: s.corporates.map((c) =>
            c.id === corpId
              ? {
                  ...c,
                  subscriptions: [...c.subscriptions, sub],
                  subscribedCourseIds: [...new Set([...c.subscribedCourseIds, ...courseIds])],
                  employeeRestrictedCourseIds: [...new Set([...c.employeeRestrictedCourseIds, ...courseIds])],
                }
              : c
          ),
        }));
        get().logAction('Added corporate subscription', `${corpId}/${planModel}`);
      },
      cancelCorporateSubscription: (corpId, subId) => {
        set((s) => ({
          corporates: s.corporates.map((c) =>
            c.id === corpId
              ? {
                  ...c,
                  subscriptions: c.subscriptions.map((sub) =>
                    sub.id === subId ? { ...sub, status: 'cancelled' as const } : sub
                  ),
                }
              : c
          ),
        }));
        get().logAction('Cancelled corporate subscription', `${corpId}/${subId}`);
      },
      registerCorporateEmployee: (corpId, name, email) => {
        const id = `u-corp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const corp = get().corporates.find((c) => c.id === corpId);
        const newUser: User = {
          id,
          name,
          email,
          role: 'corporate_user',
          avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
          enrolledCourseIds: [],
          approvedCourseIds: [],
          corporateId: corpId,
          createdAt: Date.now(),
          status: 'active',
        };
        set((s) => ({
          users: [...s.users, newUser],
          corporates: s.corporates.map((c) =>
            c.id === corpId
              ? { ...c, employeeUserIds: [...c.employeeUserIds, id] }
              : c
          ),
        }));
        get().logAction('Registered corporate employee', `${corpId}/${name}`);
        return id;
      },
      approveEmployeeCourse: (corpId, userId, courseId) => {
        set((s) => ({
          users: s.users.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  approvedCourseIds: [...new Set([...u.approvedCourseIds, courseId])],
                  enrolledCourseIds: [...new Set([...u.enrolledCourseIds, courseId])],
                }
              : u
          ),
        }));
        get().logAction('Approved employee course', `${corpId}/${userId}/${courseId}`);
      },
      removeCorporateEmployee: (corpId, userId) => {
        set((s) => ({
          corporates: s.corporates.map((c) =>
            c.id === corpId
              ? { ...c, employeeUserIds: c.employeeUserIds.filter((id) => id !== userId) }
              : c
          ),
          users: s.users.map((u) =>
            u.id === userId
              ? { ...u, corporateId: undefined, role: 'candidate' as RoleKey, approvedCourseIds: [] }
              : u
          ),
        }));
        get().logAction('Removed corporate employee', `${corpId}/${userId}`);
      },

      // ---- AI Interview session methods ----
      createInterviewSession: (userId, courseId, courseTitle, questions) => {
        const id = `int-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const session: InterviewSession = {
          id,
          userId,
          courseId,
          courseTitle,
          status: 'in_progress',
          questions,
          currentQuestionIdx: 0,
          turns: [],
          startedAt: Date.now(),
          proctoringData: {
            snapshots: [],
            incidents: [],
            autoPauseCount: 0,
            lastFaceDetectedAt: Date.now(),
            noFaceDuration: 0,
          },
        };
        set((s) => ({ interviewSessions: [...s.interviewSessions, session] }));
        get().logAction('Created interview session', `${courseId}/${userId}`);
        return id;
      },
      appendInterviewTurn: (sessionId, turn) => {
        set((s) => ({
          interviewSessions: s.interviewSessions.map((sess) =>
            sess.id === sessionId
              ? { ...sess, turns: [...sess.turns, turn] }
              : sess
          ),
        }));
      },
      advanceInterviewQuestion: (sessionId) => {
        set((s) => ({
          interviewSessions: s.interviewSessions.map((sess) =>
            sess.id === sessionId
              ? { ...sess, currentQuestionIdx: sess.currentQuestionIdx + 1 }
              : sess
          ),
        }));
      },
      completeInterviewSession: (sessionId, report) => {
        set((s) => ({
          interviewSessions: s.interviewSessions.map((sess) =>
            sess.id === sessionId
              ? {
                  ...sess,
                  status: 'completed',
                  completedAt: Date.now(),
                  report,
                  // Calculate proctoring report if we have proctoring data
                  proctoring: sess.proctoringData ? calculateProctoringReport(sess.proctoringData, sess.startedAt) : undefined,
                }
              : sess
          ),
        }));
        get().logAction('Completed interview session', sessionId);
      },
      abandonInterviewSession: (sessionId) => {
        set((s) => ({
          interviewSessions: s.interviewSessions.map((sess) =>
            sess.id === sessionId
              ? { ...sess, status: 'abandoned', completedAt: Date.now() }
              : sess
          ),
        }));
        get().logAction('Abandoned interview session', sessionId);
      },
      openInterviewReport: (sessionId) => {
        // Navigate to a view showing the interview report
        const session = get().interviewSessions.find((s) => s.id === sessionId);
        if (session?.report) {
          // For now, just log - could be expanded to open a dedicated report view
          get().logAction('Opened interview report', sessionId);
        }
      },
      addProctoringSnapshot: (sessionId, snapshot) => {
        set((s) => ({
          interviewSessions: s.interviewSessions.map((sess) =>
            sess.id === sessionId && sess.proctoringData
              ? {
                  ...sess,
                  proctoringData: {
                    ...sess.proctoringData,
                    snapshots: [...sess.proctoringData.snapshots, snapshot],
                  },
                }
              : sess
          ),
        }));
      },
      addProctoringIncident: (sessionId, incident) => {
        set((s) => ({
          interviewSessions: s.interviewSessions.map((sess) =>
            sess.id === sessionId && sess.proctoringData
              ? {
                  ...sess,
                  proctoringData: {
                    ...sess.proctoringData,
                    incidents: [...sess.proctoringData.incidents, incident],
                  },
                }
              : sess
          ),
        }));
      },
      updateProctoringData: (sessionId, data) => {
        set((s) => ({
          interviewSessions: s.interviewSessions.map((sess) =>
            sess.id === sessionId && sess.proctoringData
              ? {
                  ...sess,
                  proctoringData: {
                    ...sess.proctoringData,
                    lastFaceDetectedAt: data.lastFaceDetectedAt,
                    noFaceDuration: data.noFaceDuration,
                    autoPauseCount: data.autoPauseCount,
                  },
                }
              : sess
          ),
        }));
      },

      // ---- locale / i18n methods ----
      setLanguage: (lang) => set({ language: lang }),
      setCurrency: (cur) => set({ currency: cur }),
      setLocale: (patch) => set((s) => ({
        ...(patch.language !== undefined ? { language: patch.language } : {}),
        ...(patch.currency !== undefined ? { currency: patch.currency } : {}),
        ...(patch.country !== undefined ? { country: patch.country } : {}),
        ...(patch.timezone !== undefined ? { timezone: patch.timezone } : {}),
      })),
      detectLocaleFromGps: () => {
        // Only detect once
        if (get().localeDetected) return;

        // Try timezone-based detection first (no permission needed)
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const tzToCountry: Record<string, { country: string; currency: CurrencyCode; language: LanguageCode }> = {
            'Asia/Kolkata':       { country: 'IN', currency: 'INR', language: 'en' },
            'America/New_York':   { country: 'US', currency: 'USD', language: 'en' },
            'America/Chicago':    { country: 'US', currency: 'USD', language: 'en' },
            'America/Denver':     { country: 'US', currency: 'USD', language: 'en' },
            'America/Los_Angeles': { country: 'US', currency: 'USD', language: 'en' },
            'America/Toronto':    { country: 'CA', currency: 'CAD', language: 'en' },
            'America/Vancouver':  { country: 'CA', currency: 'CAD', language: 'en' },
            'Europe/London':      { country: 'GB', currency: 'GBP', language: 'en' },
            'Europe/Paris':       { country: 'FR', currency: 'EUR', language: 'fr' },
            'Europe/Berlin':      { country: 'DE', currency: 'EUR', language: 'de' },
            'Europe/Madrid':      { country: 'ES', currency: 'EUR', language: 'es' },
            'Asia/Tokyo':         { country: 'JP', currency: 'JPY', language: 'ja' },
            'Australia/Sydney':   { country: 'AU', currency: 'AUD', language: 'en' },
            'Australia/Melbourne': { country: 'AU', currency: 'AUD', language: 'en' },
          };
          const detected = tzToCountry[tz];
          if (detected) {
            set({
              timezone: tz,
              country: detected.country,
              currency: detected.currency,
              language: detected.language,
              localeDetected: true,
            });
            return;
          }
          // Timezone recognized but not in our mapping — just set timezone
          set({ timezone: tz, localeDetected: true });
          return;
        } catch {
          // Intl not available, fall through
        }

        // Try GPS geolocation as fallback
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                // Use free reverse geocoding
                const { latitude, longitude } = position.coords;
                const res = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                );
                const data = await res.json();
                const code = data.countryCode as string | undefined;
                if (code) {
                  const { COUNTRY_TIMEZONES } = await import('@/lib/currency');
                  const info = COUNTRY_TIMEZONES[code];
                  if (info) {
                    set({
                      country: code,
                      timezone: info.timezone,
                      currency: info.currency,
                      localeDetected: true,
                    });
                    return;
                  }
                }
                set({ localeDetected: true });
              } catch {
                set({ localeDetected: true });
              }
            },
            () => {
              // GPS denied or errored — keep India defaults
              set({ localeDetected: true });
            },
            { timeout: 5000, maximumAge: 600000 }
          );
        } else {
          set({ localeDetected: true });
        }
      },
    }),
    {
      name: 'marq-ai-storage',
      version: 11,
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : (undefined as never))),
      // Drop any persisted state from an older schema version. This prevents
      // crashes when the seeded data shape changes (e.g. new fields like
      // `enrolledCourseIds`, `tutorProfile`, `categoryIds`, etc.).
      migrate: (_persistedState, version) => {
        if (version < 11) {
          // Returning the seed-state shape triggers a fresh re-init.
          // This clears stale localStorage that may be missing fields
          // like passedLessonTests, corporates, skillMatrix, etc.
          return {} as Partial<AppState>;
        }
        return (_persistedState as Partial<AppState>) ?? {};
      },
      partialize: (s) => ({
        completedLessons: s.completedLessons,
        passedLessonTests: s.passedLessonTests,
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
        // ---- corporate ----
        corporates: s.corporates,
        skillMatrix: s.skillMatrix,
        aiInterviewReports: s.aiInterviewReports,
        // ---- AI Interview sessions ----
        interviewSessions: s.interviewSessions.slice(-10), // Keep last 10 sessions
        // ---- locale preferences ----
        language: s.language,
        currency: s.currency,
        country: s.country,
        timezone: s.timezone,
        localeDetected: s.localeDetected,
        // ---- AI Tutor sidebar state ----
        tutorSidebarExpanded: s.tutorSidebarExpanded,
        tutorSidebarChatOpen: s.tutorSidebarChatOpen,
        tutorVoicePausedPosition: s.tutorVoicePausedPosition,
        tutorVoiceProgress: s.tutorVoiceProgress,
        tutorVoiceLastText: s.tutorVoiceLastText,
        tutorVoiceLang: s.tutorVoiceLang,
      }),
      // Defensive merge — never let a corrupted persisted state crash the app
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState>;
        // Helper: safely get an array, falling back to current default
        const arr = <K extends keyof AppState>(key: K): AppState[K] => {
          const val = p[key];
          return Array.isArray(val) ? val : current[key];
        };
        return {
          ...current,
          ...p,
          // Always ensure critical arrays exist (defensive against partial persistence)
          users: Array.isArray(p.users) && p.users.length > 0 ? p.users : current.users,
          roles: Array.isArray(p.roles) && p.roles.length > 0 ? p.roles : current.roles,
          bookings: arr('bookings'),
          integrations: arr('integrations'),
          auditLogs: arr('auditLogs'),
          notifications: arr('notifications'),
          activities: arr('activities'),
          certificates: arr('certificates'),
          userBadges: arr('userBadges'),
          notes: arr('notes'),
          discussions: arr('discussions'),
          announcements: arr('announcements'),
          assignments: arr('assignments'),
          groups: arr('groups'),
          messages: arr('messages'),
          calendarEvents: arr('calendarEvents'),
          friendships: arr('friendships'),
          completedLessons: arr('completedLessons'),
          passedLessonTests: arr('passedLessonTests'),
          chatMessages: arr('chatMessages'),
          // ---- corporate ----
          corporates: arr('corporates'),
          skillMatrix: arr('skillMatrix'),
          aiInterviewReports: arr('aiInterviewReports'),
          // ---- AI Interview sessions ----
          interviewSessions: arr('interviewSessions'),
          // ---- advanced ----
          certTemplates: arr('certTemplates'),
          registrationForms: arr('registrationForms'),
          emailSchedules: arr('emailSchedules'),
          analyticsEvents: arr('analyticsEvents'),
          gdprBundles: arr('gdprBundles'),
          badges: arr('badges'),
          categories: arr('categories'),
          bundles: arr('bundles'),
          // ---- locale: fall back to India defaults if not persisted ----
          language: p.language ?? current.language,
          currency: p.currency ?? current.currency,
          country: p.country ?? current.country,
          timezone: p.timezone ?? current.timezone,
          localeDetected: p.localeDetected ?? current.localeDetected,
          // ---- AI Tutor sidebar state: fall back to defaults ----
          tutorSidebarExpanded: p.tutorSidebarExpanded ?? current.tutorSidebarExpanded,
          tutorSidebarChatOpen: p.tutorSidebarChatOpen ?? current.tutorSidebarChatOpen,
          tutorVoicePausedPosition: p.tutorVoicePausedPosition ?? current.tutorVoicePausedPosition,
          tutorVoiceProgress: p.tutorVoiceProgress ?? current.tutorVoiceProgress,
          tutorVoiceLastText: p.tutorVoiceLastText ?? current.tutorVoiceLastText,
          tutorVoiceLang: p.tutorVoiceLang ?? current.tutorVoiceLang,
        };
      },
    }
  )
);
