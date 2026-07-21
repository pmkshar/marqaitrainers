'use client';

import { useEffect, useState, useMemo, type ReactNode } from 'react';
import {
  Home, BookOpen, MessageSquare, User, Sparkles,
  GraduationCap, CreditCard, Users, Building2,
  Settings, Bell, Search, ArrowLeft, MoreHorizontal,
  Mic, BookMarked, Award, BarChart3, X, Plus
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================
// Mobile App Shell — Bottom Tab Navigation + App Header
// ============================================================
// This provides a native-app-like experience with:
// - Fixed bottom tab bar with 5 primary tabs
// - Contextual header with back navigation
// - Safe area padding for iOS notch/home indicator
// - Smooth page transitions
// - PWA install prompt
// ============================================================

type BottomTab = {
  id: string;
  label: string;
  icon: typeof Home;
  activeColor: string;
  viewName: string;
};

const BOTTOM_TABS: BottomTab[] = [
  { id: 'home', label: 'Home', icon: Home, activeColor: 'text-emerald-600', viewName: 'home' },
  { id: 'courses', label: 'Courses', icon: BookOpen, activeColor: 'text-emerald-600', viewName: 'courses' },
  { id: 'tutor', label: 'MarqAI', icon: Sparkles, activeColor: 'text-purple-600', viewName: '__tutor__' },
  { id: 'learning', label: 'My Learn', icon: BookMarked, activeColor: 'text-amber-600', viewName: 'my_learning' },
  { id: 'profile', label: 'Profile', icon: User, activeColor: 'text-sky-600', viewName: '__profile__' },
];

// More menu items for the profile tab
const PROFILE_MENU_ITEMS = [
  { icon: GraduationCap, label: 'Dashboard', viewName: 'dashboard' },
  { icon: CreditCard, label: 'Pricing', viewName: 'pricing' },
  { icon: Users, label: 'Tutors', viewName: 'tutors' },
  { icon: Building2, label: 'Corporate', viewName: 'corporate' },
  { icon: Award, label: 'Certificates', viewName: 'certificates' },
  { icon: BarChart3, label: 'Achievements', viewName: 'achievements' },
  { icon: Mic, label: 'AI Interview', viewName: 'ai_interview' },
  { icon: BookOpen, label: 'Resume Studio', viewName: 'resume_studio' },
  { icon: Settings, label: 'Settings', viewName: 'settings' },
];

// View titles for the header
function getViewTitle(viewName: string): string {
  const titles: Record<string, string> = {
    home: 'MarqAI Courses',
    courses: 'Courses',
    course: 'Course Details',
    lesson: 'Lesson',
    quiz: 'Quiz',
    pricing: 'Pricing & Plans',
    tutors: 'Human Tutors',
    tutor_portal: 'Tutor Portal',
    admin: 'Admin Portal',
    corporate: 'Corporate Training',
    my_learning: 'My Learning',
    dashboard: 'Dashboard',
    calendar: 'Calendar',
    members: 'Members',
    groups: 'Groups',
    messages: 'Messages',
    certificates: 'Certificates',
    achievements: 'Achievements',
    features: 'Features',
    settings: 'Settings',
    resume_studio: 'Resume Studio',
    ai_interview: 'AI Interview',
  };
  return titles[viewName] || 'MarqAI Courses';
}

// Determine which bottom tab is active based on current view
function getActiveTabId(viewName: string): string {
  if (viewName === 'home') return 'home';
  if (viewName === 'courses' || viewName === 'course' || viewName === 'lesson' || viewName === 'quiz') return 'courses';
  if (viewName === 'my_learning') return 'learning';
  if (['dashboard', 'settings', 'certificates', 'achievements', 'pricing', 'tutors', 'corporate', 'admin', 'tutor_portal', 'features', 'resume_studio', 'ai_interview', 'calendar', 'members', 'groups', 'messages'].includes(viewName)) return 'profile';
  return 'home';
}

// Check if a view has a back button
function hasBackButton(viewName: string): boolean {
  return !['home', 'courses', 'my_learning', '__profile__'].includes(viewName);
}

export function MobileAppShell({ children }: { children: ReactNode }) {
  const view = useAppStore((s) => s.view);
  const goHome = useAppStore((s) => s.goHome);
  const openCourses = useAppStore((s) => s.openCourses);
  const openMyLearning = useAppStore((s) => s.openMyLearning);
  const openDashboard = useAppStore((s) => s.openDashboard);
  const openSettings = useAppStore((s) => s.openSettings);
  const openPricing = useAppStore((s) => s.openPricing);
  const openTutors = useAppStore((s) => s.openTutors);
  const openCorporate = useAppStore((s) => s.openCorporate);
  const openAdmin = useAppStore((s) => s.openAdmin);
  const openTutorPortal = useAppStore((s) => s.openTutorPortal);
  const openFeatures = useAppStore((s) => s.openFeatures);
  const setTutorOpen = useAppStore((s) => s.setTutorOpen);
  const currentUser = useAppStore((s) => s.currentUser);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const notifications = useAppStore((s) => s.notifications) ?? [];
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  const user = currentUser();
  const activeTab = getActiveTabId(view.name);
  const unreadCount = notifications.filter(n => !n.read && n.userId === currentUserId).length;

  // Listen for PWA install prompt + detect standalone mode
  useEffect(() => {
    // Check if already running as installed PWA (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // Listen for beforeinstallprompt (Chrome/Android)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      (window as unknown as Record<string, unknown>)._deferredInstallPrompt = e as BeforeInstallPromptEvent;
      setShowInstallPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // For iOS Safari (no beforeinstallprompt), show install prompt after 8 seconds
    if (!standalone) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isInBrowser = !window.matchMedia('(display-mode: standalone)').matches;
      if (isIOS && isInBrowser) {
        const timer = setTimeout(() => setShowInstallPrompt(true), 8000);
        return () => {
          window.removeEventListener('beforeinstallprompt', handler);
          clearTimeout(timer);
        };
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleTabPress = (tab: BottomTab) => {
    if (tab.id === 'tutor') {
      setTutorOpen(true);
      return;
    }
    if (tab.id === 'home') {
      goHome();
    } else if (tab.id === 'courses') {
      openCourses();
    } else if (tab.id === 'learning') {
      openMyLearning();
    } else if (tab.id === 'profile') {
      setShowProfileMenu(true);
    }
  };

  const handleProfileMenuItem = (viewName: string) => {
    setShowProfileMenu(false);
    const store = useAppStore.getState();
    const actionMap: Record<string, () => void> = {
      dashboard: store.openDashboard,
      pricing: store.openPricing,
      tutors: store.openTutors,
      corporate: store.openCorporate,
      admin: () => store.openAdmin('dashboard'),
      certificates: store.openCertificates,
      achievements: store.openAchievements,
      settings: store.openSettings,
      features: store.openFeatures,
      ai_interview: () => store.openAiInterview(),
      resume_studio: store.openResumeStudio,
      calendar: store.openCalendar,
      members: store.openMembers,
      groups: store.openGroups,
      messages: () => store.openMessages(),
    };
    if (actionMap[viewName]) {
      actionMap[viewName]();
    }
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const isDetailView = ['course', 'lesson', 'quiz', 'pricing', 'tutors', 'tutor_portal', 'admin', 'corporate', 'dashboard', 'calendar', 'members', 'groups', 'messages', 'certificates', 'achievements', 'features', 'settings', 'resume_studio', 'ai_interview'].includes(view.name);

  return (
    <div className="mobile-app-shell flex flex-col overflow-hidden bg-background text-foreground md:hidden">
      {/* ── App Header ────────────────────── */}
      <header className="shrink-0 z-40 flex h-14 items-center gap-3 border-b border-border/60 bg-background/95 px-4 backdrop-blur-lg safe-area-top">
        {isDetailView && hasBackButton(view.name) && (
          <button
            onClick={() => {
              // Smart back navigation
              if (view.name === 'lesson' || view.name === 'quiz') {
                const v = view as { courseId?: string; moduleId?: string; lessonId?: string };
                if (v.courseId) {
                  useAppStore.getState().openCourse(v.courseId);
                  return;
                }
              }
              goHome();
            }}
            className="grid h-9 w-9 place-items-center rounded-full bg-muted/60 active:bg-muted"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          {!isDetailView ? (
            <div className="flex items-center gap-2">
              <img src="/marqai-logo.svg" alt="MarqAI" className="h-8 w-8 rounded-lg" />
              <span className="text-base font-bold tracking-tight truncate">
                MarqAI<span className="text-emerald-600">Courses</span>
              </span>
            </div>
          ) : (
            <h1 className="text-base font-semibold truncate">{getViewTitle(view.name)}</h1>
          )}
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-1">
          {view.name === 'home' && (
            <button
              onClick={() => {/* search */}}
              className="grid h-9 w-9 place-items-center rounded-full bg-muted/60 active:bg-muted"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          )}
          {unreadCount > 0 && (
            <button
              onClick={() => setShowProfileMenu(true)}
              className="relative grid h-9 w-9 place-items-center rounded-full bg-muted/60 active:bg-muted"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </button>
          )}
        </div>
      </header>

      {/* ── Main Content ─────────────────── */}
      <main className="mobile-main-scroll flex-1 overflow-y-auto safe-area-content overscroll-contain">
        {children}
      </main>

      {/* ── Bottom Tab Bar ───────────────── */}
      <nav className="shrink-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-lg safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1">
          {BOTTOM_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabPress(tab)}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 transition-all min-w-[56px]',
                  isActive
                    ? `${tab.activeColor} bg-muted/50`
                    : 'text-muted-foreground active:bg-muted/30'
                )}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="relative">
                  <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
                  {tab.id === 'tutor' && (
                    <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                  )}
                </div>
                <span className={cn(
                  'text-[10px] font-medium leading-tight',
                  isActive && 'font-semibold'
                )}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Profile Menu Sheet ───────────── */}
      {showProfileMenu && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowProfileMenu(false)}
          />
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-background shadow-2xl animate-slide-up safe-area-bottom">
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            {/* User card */}
            {user ? (
              <div className="flex items-center gap-3 px-5 pb-4">
                <div className={cn(
                  'grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br text-xl font-bold text-white',
                  user.avatarColor || 'from-emerald-500 to-teal-600'
                )}>
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <Badge variant="secondary" className="text-[10px] capitalize">{user.role.replace('_', ' ')}</Badge>
              </div>
            ) : (
              <div className="px-5 pb-4">
                <Button
                  onClick={() => {
                    setShowProfileMenu(false);
                    useAppStore.getState().setAuthOpen(true, 'register', 'candidate');
                  }}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" /> Sign Up / Log In
                </Button>
              </div>
            )}

            <div className="border-t" />

            {/* Menu items */}
            <div className="grid grid-cols-4 gap-2 p-4">
              {PROFILE_MENU_ITEMS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleProfileMenuItem(item.viewName)}
                  className="flex flex-col items-center gap-1.5 rounded-xl p-3 active:bg-muted/50 transition-colors"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted/60">
                    <item.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="border-t" />

            {/* Logout / Close */}
            <div className="flex gap-2 p-4">
              {user && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowProfileMenu(false);
                    useAppStore.getState().logout();
                  }}
                >
                  Sign Out
                </Button>
              )}
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowProfileMenu(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── PWA Install Banner (shows on all platforms if not standalone) ───────────── */}
      {showInstallPrompt && !isStandalone && (
        <div className="fixed bottom-20 left-4 right-4 z-[60] rounded-2xl border bg-card p-4 shadow-2xl animate-slide-up">
          <button
            onClick={() => setShowInstallPrompt(false)}
            className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-muted"
          >
            <X className="h-3 w-3" />
          </button>
          <div className="flex items-center gap-3">
            <img src="/marqai-logo.svg" alt="MarqAI" className="h-10 w-10 rounded-xl" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm">Install MarqAI Courses</p>
              <p className="text-xs text-muted-foreground">Add to home screen for app-like experience</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            {deferredPrompt ? (
              <>
                <Button size="sm" className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700" onClick={handleInstallApp}>
                  Install App
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowInstallPrompt(false)}>
                  Not now
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => {
                  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                  if (isIOS) {
                    alert('To install MarqAI Courses:\n\n1. Tap the Share button (\u2B06\uFE0F) at the bottom of Safari\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to install the app\n\nThe app works like a native app with offline support!');
                  } else {
                    alert('To install MarqAI Courses:\n\n1. Tap the 3-dot menu (\u22EE) in Chrome\n2. Tap "Install app" or "Add to Home Screen"\n3. The app will install and work like a native app!');
                  }
                  setShowInstallPrompt(false);
                }}>
                  Install App
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowInstallPrompt(false)}>
                  Not now
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Desktop shell — keeps original layout
export function DesktopAppShell({ children }: { children: ReactNode }) {
  return (
    <div className="hidden md:flex min-h-screen flex-col bg-background text-foreground">
      {children}
    </div>
  );
}

// TypeScript type for beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
