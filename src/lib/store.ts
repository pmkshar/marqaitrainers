import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { View, ChatMessage, User, Role, Integration, Booking, PermissionKey, RoleKey, TutorProfile, AuditLog } from '@/lib/types';
import { SEED_USERS, SEED_BOOKINGS, SEED_INTEGRATIONS, DEFAULT_ROLES, SEED_AUDIT_LOGS } from '@/lib/seed-data';

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

  // Learning
  completedLessons: string[];

  // Auth
  currentUserId: string | null;
  users: User[];
  roles: Role[];
  bookings: Booking[];
  integrations: Integration[];
  auditLogs: AuditLog[];

  // ---- selectors ----
  currentUser: () => User | null;
  hasPermission: (perm: PermissionKey) => boolean;

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
      completedLessons: [],

      currentUserId: null,
      users: SEED_USERS,
      roles: DEFAULT_ROLES,
      bookings: SEED_BOOKINGS,
      integrations: SEED_INTEGRATIONS,
      auditLogs: SEED_AUDIT_LOGS,

      currentUser: () => {
        const id = get().currentUserId;
        return id ? get().users.find((u) => u.id === id) ?? null : null;
      },

      hasPermission: (perm) => {
        const user = get().currentUser();
        if (!user) {
          // guests only have guest perms
          const guest = get().roles.find((r) => r.key === 'guest');
          return guest?.permissions.includes(perm) ?? false;
        }
        const role = get().roles.find((r) => r.key === user.role);
        return role?.permissions.includes(perm) ?? false;
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
      setTutorOpen: (open) => set({ isTutorOpen: open }),
      setMenuOpen: (open) => set({ isMenuOpen: open }),
      toggleMenu: () => set((s) => ({ isMenuOpen: !s.isMenuOpen })),

      // ---------- auth ----------
      setAuthOpen: (open, mode = 'login', registerRole = 'candidate') =>
        set({ isAuthOpen: open, authMode: mode, registerRole }),
      login: (email, role) => {
        const user = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
          set({ currentUserId: user.id, isAuthOpen: false });
          get().logAction('Logged in');
          return true;
        }
        return false;
      },
      loginAs: (userId) => {
        set({ currentUserId: userId, isAuthOpen: false });
        const u = get().users.find((x) => x.id === userId);
        if (u) get().logAction('Impersonated user', u.name);
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
        }));
        get().logAction('Registered new account', `${name} (${role})`);
      },
      logout: () => {
        get().logAction('Logged out');
        set({ currentUserId: null, view: { name: 'home' } });
      },

      // ---------- learning ----------
      markLessonComplete: (lessonId) =>
        set((s) =>
          s.completedLessons.includes(lessonId)
            ? s
            : { completedLessons: [...s.completedLessons, lessonId] }
        ),

      // ---------- chat ----------
      addMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
      setMessages: (msgs) => set({ chatMessages: msgs }),
      clearChat: () => set({ chatMessages: [] }),

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
    }),
    {
      name: 'marq-ai-storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : (undefined as never))),
      partialize: (s) => ({
        completedLessons: s.completedLessons,
        chatMessages: s.chatMessages.slice(-20),
        currentUserId: s.currentUserId,
        users: s.users,
        roles: s.roles,
        bookings: s.bookings,
        integrations: s.integrations,
        auditLogs: s.auditLogs.slice(0, 50),
      }),
    }
  )
);
