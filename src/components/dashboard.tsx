'use client';

import { useState, useMemo } from 'react';
import {
  ArrowLeft, ArrowRight, BookOpen, Clock, Award, Sparkles, Calendar, Video,
  TrendingUp, Users, MessageSquare, Bell, CheckCircle2, PlayCircle, FileQuestion,
  Trophy, Target, Flame, ChevronRight, Settings, ShieldCheck, DollarSign,
  GraduationCap, BarChart3, Star, Zap, BookMarked, Activity as ActivityIcon,
  Building2, Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { COURSES, findCourse, getAllLessons } from '@/lib/courses';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { SUPPORTED_CURRENCIES, COUNTRY_TIMEZONES } from '@/lib/currency';
import { CourseIcon } from './navbar';
import type { LanguageCode, CurrencyCode, User, UserBadge, Badge, Certificate, ActivityEntry } from '@/lib/types';

// ============================================================
// Stable selectors — avoid calling derived store functions inside
// useAppStore selectors because they create new references on
// every call, causing useSyncExternalStore to infinite-loop.
// Instead, select raw primitives/arrays and derive with useMemo.
// ============================================================

/** Select the current user object with a stable reference. */
function useCurrentUser() {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);
  return useMemo(
    () => (currentUserId ? users.find((u) => u.id === currentUserId) ?? null : null),
    [currentUserId, users],
  );
}

/** Select badges for the current user with a stable reference. */
function useMyBadges(): (UserBadge & { badge: Badge })[] {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const userBadges = useAppStore((s) => s.userBadges);
  const badges = useAppStore((s) => s.badges);
  return useMemo(() => {
    if (!currentUserId) return [];
    return userBadges
      .filter((ub) => ub.userId === currentUserId)
      .map((ub) => {
        const badge = badges.find((b) => b.slug === ub.badgeSlug);
        return { ...ub, badge: badge! };
      })
      .filter((ub) => ub.badge);
  }, [currentUserId, userBadges, badges]);
}

/** Select certificates for the current user with a stable reference. */
function useMyCertificates(): Certificate[] {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const certificates = useAppStore((s) => s.certificates);
  return useMemo(
    () => (currentUserId ? certificates.filter((c) => c.userId === currentUserId) : []),
    [currentUserId, certificates],
  );
}

/** Select recent activities for the current user with a stable reference. */
function useMyActivities(limit?: number): ActivityEntry[] {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const activities = useAppStore((s) => s.activities);
  return useMemo(() => {
    if (!currentUserId) return [];
    const list = activities
      .filter((a) => a.userId === currentUserId)
      .sort((a, b) => b.createdAt - a.createdAt);
    return limit ? list.slice(0, limit) : list;
  }, [currentUserId, activities, limit]);
}

// ============================================================
// Helpers
// ============================================================

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  return `${mo}mo ago`;
}

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

// ============================================================
// Main dashboard entry
// ============================================================

export function Dashboard() {
  const user = useCurrentUser();
  const goHome = useAppStore((s) => s.goHome);

  if (!user) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4">
        <Card className="max-w-md text-center">
          <CardContent className="p-8">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Sign in to view your dashboard</h2>
            <p className="mt-2 text-sm text-muted-foreground">Sign in or create an account to access your personalized dashboard.</p>
            <Button onClick={() => useAppStore.getState().setAuthOpen(true, 'login')} className="mt-4 bg-emerald-600 text-white hover:bg-emerald-700">Sign in</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <DashboardHeader />
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <button onClick={goHome} className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Home
        </button>

        {user.role === 'candidate' && <CandidateDashboard />}
        {user.role === 'tutor' && <TutorDashboard />}
        {user.role === 'super_admin' && <AdminDashboard />}
        {(user.role === 'corporate_admin' || user.role === 'corporate_user') && <CorporateUserDashboard />}
        <LocaleSettingsSection />
      </div>
    </div>
  );
}

// ============================================================
// Header (shared)
// ============================================================

function DashboardHeader() {
  const user = useCurrentUser();
  const completedLessons = useAppStore((s) => s.completedLessons);
  if (!user) return null;

  const roleLabel = user.role === 'super_admin' ? 'Super Admin'
    : user.role === 'corporate_admin' ? 'Corporate Admin'
    : user.role === 'corporate_user' ? 'Corporate Employee'
    : user.role === 'tutor' ? 'Human Tutor' : 'Candidate';
  const roleGradient =
    user.role === 'super_admin' ? 'from-rose-500 to-pink-600'
    : user.role === 'corporate_admin' ? 'from-indigo-500 to-purple-600'
    : user.role === 'corporate_user' ? 'from-amber-500 to-orange-600'
    : user.role === 'tutor' ? 'from-sky-500 to-cyan-600'
    : 'from-emerald-500 to-teal-600';

  return (
    <section className={`bg-gradient-to-br ${roleGradient} text-white`}>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-5">
          <Avatar className="h-20 w-20 ring-4 ring-white/20">
            <AvatarFallback className="bg-white/15 text-3xl font-bold text-white backdrop-blur">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{user.name}</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur">
                {user.role === 'super_admin' && <ShieldCheck className="h-3 w-3" />}
                {user.role === 'tutor' && <Users className="h-3 w-3" />}
                {user.role === 'candidate' && <GraduationCap className="h-3 w-3" />}
                {roleLabel}
              </span>
              {user.status === 'pending' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/30 px-2.5 py-0.5 text-xs font-semibold">
                  <Clock className="h-3 w-3" /> Pending approval
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-white/85">{user.email}</p>
            <p className="mt-0.5 text-xs text-white/70">
              Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              {user.role === 'candidate' && ` · ${completedLessons.length} lessons completed · ${user.enrolledCourseIds?.length ?? 0} courses enrolled`}
              {user.role === 'tutor' && user.tutorProfile && ` · ${user.tutorProfile.sessionsCompleted} sessions · ★ ${user.tutorProfile.rating}`}
              {user.role === 'super_admin' && ' · Full platform access'}
            </p>
          </div>
          <div className="flex gap-2">
            {user.role === 'candidate' && (
              <Button onClick={() => useAppStore.getState().setTutorOpen(true)} className="bg-white/15 text-white hover:bg-white/25 backdrop-blur">
                <Sparkles className="mr-1.5 h-4 w-4" /> Ask AI Tutor
              </Button>
            )}
            {user.role === 'tutor' && (
              <Button onClick={() => useAppStore.getState().openTutorPortal()} className="bg-white/15 text-white hover:bg-white/25 backdrop-blur">
                <BarChart3 className="mr-1.5 h-4 w-4" /> Tutor Portal
              </Button>
            )}
            {user.role === 'super_admin' && (
              <Button onClick={() => useAppStore.getState().openAdmin('dashboard')} className="bg-white/15 text-white hover:bg-white/25 backdrop-blur">
                <ShieldCheck className="mr-1.5 h-4 w-4" /> Admin Portal
              </Button>
            )}
            {(user.role === 'corporate_admin' || user.role === 'corporate_user') && (
              <Button onClick={() => useAppStore.getState().openCorporate()} className="bg-white/15 text-white hover:bg-white/25 backdrop-blur">
                <Building2 className="mr-1.5 h-4 w-4" /> Corporate Portal
              </Button>
            )}
          </div>
        </div>

        {/* Quick stats strip */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {user.role === 'candidate' && <CandidateQuickStats />}
          {user.role === 'tutor' && <TutorQuickStats />}
          {user.role === 'super_admin' && <AdminQuickStats />}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Candidate dashboard
// ============================================================

function CandidateDashboard() {
  return (
    <div className="space-y-6 pt-6">
      {/* Quick actions row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction icon={PlayCircle} label="Continue learning" desc="Pick up where you left off" color="from-emerald-500 to-teal-600" onClick={() => useAppStore.getState().openMyLearning()} />
        <QuickAction icon={Calendar} label="My calendar" desc="Sessions, deadlines, live classes" color="from-sky-500 to-cyan-600" onClick={() => useAppStore.getState().openCalendar()} />
        <QuickAction icon={Trophy} label="Achievements" desc="Badges & certificates" color="from-amber-500 to-orange-600" onClick={() => useAppStore.getState().openAchievements()} />
        <QuickAction icon={Users} label="Community" desc="Members, groups, messages" color="from-violet-500 to-purple-600" onClick={() => useAppStore.getState().openMembers()} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: courses in progress + upcoming sessions */}
        <div className="space-y-6 lg:col-span-2">
          <CoursesInProgressPanel />
          <UpcomingSessionsPanel />
          <AssignmentsPanel />
        </div>

        {/* Right column: activity + achievements + recommendations */}
        <div className="space-y-6">
          <ActivityPanel />
          <MiniAchievementsPanel />
          <RecommendationsPanel />
        </div>
      </div>
    </div>
  );
}

function CandidateQuickStats() {
  const user = useCurrentUser();
  const completedLessons = useAppStore((s) => s.completedLessons);
  const myBadges = useMyBadges();
  const myCerts = useMyCertificates();
  const bookings = useAppStore((s) => s.bookings);
  if (!user) return null;
  const enrolledCourseIds = user.enrolledCourseIds ?? [];
  const upcoming = bookings.filter((b) => b.candidateId === user.id && b.status === 'upcoming');

  // compute total lessons across enrolled courses
  const totalLessons = enrolledCourseIds.reduce((sum, cid) => sum + getAllLessons(cid).length, 0);
  const completionPct = totalLessons ? Math.round((completedLessons.length / totalLessons) * 100) : 0;

  const stats = [
    { label: 'Courses', value: enrolledCourseIds.length, icon: BookOpen },
    { label: 'Lessons done', value: completedLessons.length, icon: CheckCircle2 },
    { label: 'Badges', value: myBadges.length, icon: Trophy },
    { label: 'Certificates', value: myCerts.length, icon: Award },
  ];
  return (
    <>
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl bg-white/10 p-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <s.icon className="h-4 w-4 text-white/70" />
            <span className="text-xs font-medium text-white/70">{s.label}</span>
          </div>
          <p className="mt-1 text-2xl font-bold">{s.value}</p>
        </div>
      ))}
    </>
  );
}

function QuickAction({ icon: Icon, label, desc, color, onClick }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="group relative overflow-hidden rounded-xl border bg-card p-4 text-left transition-all hover:shadow-md hover:border-foreground/20">
      <span className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${color} opacity-10 transition-opacity group-hover:opacity-20`} />
      <span className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${color} text-white`}>
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-2 font-semibold text-sm">{label}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </button>
  );
}

function CoursesInProgressPanel() {
  const user = useCurrentUser();
  const completedLessons = useAppStore((s) => s.completedLessons);
  const openLesson = useAppStore((s) => s.openLesson);
  const openCourse = useAppStore((s) => s.openCourse);

  if (!user) return null;
  const enrolledCourseIds = user.enrolledCourseIds ?? [];
  const enrolled = COURSES.filter((c) => enrolledCourseIds.includes(c.id));

  if (enrolled.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base"><BookOpen className="h-4 w-4 text-emerald-600" /> My courses</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 font-medium">No courses enrolled yet</p>
          <p className="text-sm text-muted-foreground">Browse the catalog and pick your first course.</p>
          <Button onClick={() => useAppStore.getState().goHome()} className="mt-3 bg-emerald-600 text-white hover:bg-emerald-700">Browse catalog</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base"><BookOpen className="h-4 w-4 text-emerald-600" /> Continue learning</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => useAppStore.getState().openMyLearning()} className="text-xs">View all <ChevronRight className="h-3 w-3" /></Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {enrolled.map((c) => {
          const lessons = getAllLessons(c.id);
          const done = lessons.filter((l) => completedLessons.includes(l.lessonId)).length;
          const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
          const next = lessons.find((l) => !completedLessons.includes(l.lessonId));
          return (
            <div key={c.id} className="rounded-lg border bg-card p-4">
              <div className="flex items-start gap-3">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${c.gradient} text-white`}>
                  <CourseIcon name={c.icon} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{c.title}</p>
                    <span className="text-xs font-medium text-muted-foreground">{pct}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{done}/{lessons.length} lessons · {c.duration}</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full bg-gradient-to-r ${c.gradient}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={() => next ? openLesson(next.courseId, next.moduleId, next.lessonId) : openCourse(c.id)}
                    >
                      {next ? <><PlayCircle className="mr-1.5 h-3.5 w-3.5" /> Continue</> : <><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Review</>}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openCourse(c.id)}>Course page</Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function UpcomingSessionsPanel() {
  const user = useCurrentUser();
  const bookings = useAppStore((s) => s.bookings);
  const users = useAppStore((s) => s.users);
  if (!user) return null;
  const myBookings = bookings.filter((b) => b.candidateId === user.id && b.status === 'upcoming');

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base"><Video className="h-4 w-4 text-sky-600" /> Upcoming tutor sessions</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => useAppStore.getState().openCalendar()} className="text-xs">Calendar <ChevronRight className="h-3 w-3" /></Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {myBookings.length === 0 ? (
          <div className="py-6 text-center">
            <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No upcoming sessions. Book a 1:1 with a human tutor.</p>
            <Button onClick={() => useAppStore.getState().openTutors()} variant="outline" size="sm" className="mt-2">Browse tutors</Button>
          </div>
        ) : (
          myBookings.map((b) => {
            const tutor = users.find((u) => u.id === b.tutorId);
            return (
              <div key={b.id} className="flex items-center gap-3 rounded-lg border p-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className={`bg-gradient-to-br ${tutor?.avatarColor ?? 'from-slate-500 to-slate-700'} text-white text-xs font-bold`}>
                    {tutor?.name.charAt(0) ?? '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{b.topic}</p>
                  <p className="text-xs text-muted-foreground">{tutor?.name} · {formatDateTime(b.scheduledAt)} · {b.durationMinutes}min</p>
                </div>
                <Badge variant="secondary" className="bg-sky-500/15 text-sky-700 dark:text-sky-300">${b.price}</Badge>
                <Button size="sm" className="bg-sky-600 text-white hover:bg-sky-700"><Video className="mr-1 h-3.5 w-3.5" /> Join</Button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function AssignmentsPanel() {
  const user = useCurrentUser();
  const assignments = useAppStore((s) => s.assignments);

  if (!user) return null;
  const enrolledCourseIds = user.enrolledCourseIds ?? [];
  const myAssignments = assignments.filter((a) => {
    // show assignments for courses the user is enrolled in
    return enrolledCourseIds.includes(a.courseId);
  }).slice(0, 3);

  if (myAssignments.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><FileQuestion className="h-4 w-4 text-violet-600" /> Assignments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {myAssignments.map((a) => {
          const c = findCourse(a.courseId);
          const sub = a.submissions?.[user.id];
          const status = sub?.status ?? 'pending';
          const statusColor =
            status === 'graded' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
            : status === 'submitted' ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
            : 'bg-amber-500/15 text-amber-700 dark:text-amber-300';
          const overdue = status === 'pending' && a.dueAt < Date.now();
          return (
            <div key={a.id} className="flex items-center gap-3 rounded-lg border p-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-violet-500/15 text-violet-700 dark:text-violet-300">
                <FileQuestion className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">
                  {c?.title} · Due {formatDateTime(a.dueAt)} · /{a.maxMarks}
                </p>
              </div>
              <Badge variant="secondary" className={statusColor}>{status}{overdue ? ' · overdue' : ''}</Badge>
              {status === 'graded' && <span className="text-sm font-bold">{sub?.marks}/100</span>}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function ActivityPanel() {
  const activities = useMyActivities(8);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><ActivityIcon className="h-4 w-4 text-emerald-600" /> Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[260px] pr-3">
          {activities.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No activity yet. Start learning to see your timeline here.</p>
          ) : (
            <ol className="relative space-y-3 border-l border-border pl-4">
              {activities.map((a) => (
                <li key={a.id} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                  <p className="text-sm">{a.text}</p>
                  <p className="text-[11px] text-muted-foreground">{timeAgo(a.createdAt)}</p>
                </li>
              ))}
            </ol>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function MiniAchievementsPanel() {
  const myBadges = useMyBadges();
  const myCerts = useMyCertificates();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base"><Trophy className="h-4 w-4 text-amber-500" /> Achievements</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => useAppStore.getState().openAchievements()} className="text-xs">All <ChevronRight className="h-3 w-3" /></Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Badges ({myBadges.length})</p>
          {myBadges.length === 0 ? (
            <p className="text-xs text-muted-foreground">No badges yet — complete lessons to earn them!</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {myBadges.slice(0, 6).map((ub) => (
                <span key={ub.badgeSlug} className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-xs" title={ub.badge.description}>
                  <span>{ub.badge.icon}</span>
                  <span className="font-medium">{ub.badge.title}</span>
                </span>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Certificates ({myCerts.length})</p>
          {myCerts.length === 0 ? (
            <p className="text-xs text-muted-foreground">Complete a course to earn your first certificate.</p>
          ) : (
            <div className="space-y-1.5">
              {myCerts.slice(0, 3).map((c) => {
                const course = findCourse(c.courseId);
                return (
                  <div key={c.id} className="flex items-center gap-2 rounded-md border bg-amber-500/5 p-2">
                    <Award className="h-4 w-4 text-amber-600" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{course?.title}</p>
                      <p className="text-[10px] text-muted-foreground">{c.code} · {c.scorePct}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RecommendationsPanel() {
  const user = useCurrentUser();
  const openCourse = useAppStore((s) => s.openCourse);
  if (!user) return null;
  const enrolledCourseIds = user.enrolledCourseIds ?? [];
  const recommended = COURSES.filter((c) => !enrolledCourseIds.includes(c.id)).slice(0, 3);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-emerald-600" /> Recommended for you</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {recommended.map((c) => (
          <button key={c.id} onClick={() => openCourse(c.id)} className="flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-colors hover:bg-accent">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-md bg-gradient-to-br ${c.gradient} text-white`}>
              <CourseIcon name={c.icon} className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{c.title}</p>
              <p className="text-xs text-muted-foreground">★ {c.rating} · ${c.oneTimePrice} or ${c.monthlyPrice}/mo</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================================
// Tutor dashboard
// ============================================================

function TutorDashboard() {
  return (
    <div className="space-y-6 pt-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction icon={Video} label="My sessions" desc="Upcoming & past bookings" color="from-sky-500 to-cyan-600" onClick={() => useAppStore.getState().openTutorPortal()} />
        <QuickAction icon={Users} label="My students" desc="Track their progress" color="from-violet-500 to-purple-600" onClick={() => useAppStore.getState().openTutorPortal()} />
        <QuickAction icon={DollarSign} label="Earnings" desc="Payouts & commission" color="from-emerald-500 to-teal-600" onClick={() => useAppStore.getState().openTutorPortal()} />
        <QuickAction icon={Settings} label="Profile & rates" desc="Edit headline, bio, hourly rate" color="from-amber-500 to-orange-600" onClick={() => useAppStore.getState().openTutorPortal()} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <TutorSessionsPanel />
          <TutorStudentsPanel />
        </div>
        <div className="space-y-6">
          <TutorEarningsPanel />
          <TutorProfilePanel />
        </div>
      </div>
    </div>
  );
}

function TutorQuickStats() {
  const user = useCurrentUser();
  const bookings = useAppStore((s) => s.bookings);
  if (!user) return null;
  const myUpcoming = bookings.filter((b) => b.tutorId === user.id && b.status === 'upcoming');
  const myCompleted = bookings.filter((b) => b.tutorId === user.id && b.status === 'completed');
  const myStudents = new Set(bookings.filter((b) => b.tutorId === user.id).map((b) => b.candidateId));
  const tp = user.tutorProfile;
  const earnings = myCompleted.reduce((sum, b) => sum + (b.price * (1 - (tp?.paymentTerms.platformFeePct ?? 20) / 100)), 0);

  const stats = [
    { label: 'Upcoming', value: myUpcoming.length, icon: Video },
    { label: 'Completed', value: tp?.sessionsCompleted ?? myCompleted.length, icon: CheckCircle2 },
    { label: 'Students', value: myStudents.size, icon: Users },
    { label: 'Earnings', value: `$${Math.round(earnings)}`, icon: DollarSign },
  ];
  return (
    <>
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl bg-white/10 p-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <s.icon className="h-4 w-4 text-white/70" />
            <span className="text-xs font-medium text-white/70">{s.label}</span>
          </div>
          <p className="mt-1 text-2xl font-bold">{s.value}</p>
        </div>
      ))}
    </>
  );
}

function TutorSessionsPanel() {
  const user = useCurrentUser();
  const bookings = useAppStore((s) => s.bookings);
  const users = useAppStore((s) => s.users);
  if (!user) return null;
  const myUpcoming = bookings.filter((b) => b.tutorId === user.id && b.status === 'upcoming').slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><Video className="h-4 w-4 text-sky-600" /> Upcoming sessions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {myUpcoming.length === 0 ? (
          <div className="py-6 text-center">
            <Video className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No upcoming sessions. Candidates can book you from the marketplace.</p>
          </div>
        ) : (
          myUpcoming.map((b) => {
            const cand = users.find((u) => u.id === b.candidateId);
            return (
              <div key={b.id} className="flex items-center gap-3 rounded-lg border p-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className={`bg-gradient-to-br ${cand?.avatarColor ?? 'from-slate-500 to-slate-700'} text-white text-xs font-bold`}>
                    {cand?.name.charAt(0) ?? '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{b.topic}</p>
                  <p className="text-xs text-muted-foreground">{cand?.name} · {formatDateTime(b.scheduledAt)} · {b.durationMinutes}min</p>
                </div>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+${Math.round(b.price * (1 - (user.tutorProfile?.paymentTerms.platformFeePct ?? 20) / 100))}</span>
                <Button size="sm" className="bg-sky-600 text-white hover:bg-sky-700"><Video className="mr-1 h-3.5 w-3.5" /> Start</Button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function TutorStudentsPanel() {
  const user = useCurrentUser();
  const bookings = useAppStore((s) => s.bookings);
  const users = useAppStore((s) => s.users);
  if (!user) return null;
  const myBookings = bookings.filter((b) => b.tutorId === user.id);
  const studentIds = Array.from(new Set(myBookings.map((b) => b.candidateId)));
  const students = users.filter((u) => studentIds.includes(u.id)).slice(0, 6);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4 text-violet-600" /> My students</CardTitle>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No students yet.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {students.map((s) => {
              const sessions = myBookings.filter((b) => b.candidateId === s.id).length;
              return (
                <button key={s.id} onClick={() => useAppStore.getState().openMessages(undefined)} className="flex items-center gap-3 rounded-lg border p-2.5 text-left transition-colors hover:bg-accent">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={`bg-gradient-to-br ${s.avatarColor} text-white text-xs font-bold`}>{s.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{sessions} session{sessions !== 1 ? 's' : ''}</p>
                  </div>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TutorEarningsPanel() {
  const user = useCurrentUser();
  const bookings = useAppStore((s) => s.bookings);
  if (!user) return null;
  const completed = bookings.filter((b) => b.tutorId === user.id && b.status === 'completed');
  const tp = user.tutorProfile;
  const feePct = tp?.paymentTerms.platformFeePct ?? 20;
  const gross = completed.reduce((sum, b) => sum + b.price, 0);
  const net = gross * (1 - feePct / 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><DollarSign className="h-4 w-4 text-emerald-600" /> Earnings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white">
          <p className="text-xs text-white/80">Net this month (after {feePct}% platform fee)</p>
          <p className="mt-1 text-3xl font-bold">${Math.round(net)}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg border p-2">
            <p className="text-xs text-muted-foreground">Gross</p>
            <p className="text-sm font-bold">${gross}</p>
          </div>
          <div className="rounded-lg border p-2">
            <p className="text-xs text-muted-foreground">Payout</p>
            <p className="text-sm font-bold capitalize">{tp?.paymentTerms.payoutSchedule}</p>
          </div>
        </div>
        <Button onClick={() => useAppStore.getState().openTutorPortal()} variant="outline" size="sm" className="w-full">View earnings details</Button>
      </CardContent>
    </Card>
  );
}

function TutorProfilePanel() {
  const user = useCurrentUser();
  if (!user) return null;
  const tp = user.tutorProfile;
  if (!tp) return null;

  const completeness = [
    !!tp.headline, !!tp.bio, (tp.expertise?.length ?? 0) > 0, tp.hourlyRate > 0, (user.enrolledCourseIds?.length ?? 0) > 0,
  ].filter(Boolean).length;
  const pct = Math.round((completeness / 5) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><Star className="h-4 w-4 text-amber-500" /> Profile strength</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-muted-foreground">Completeness</span>
            <span className="font-semibold">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Rating</span><span className="font-medium">★ {tp.rating}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Hourly rate</span><span className="font-medium">${tp.hourlyRate}/hr</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Availability</span><span className="font-medium capitalize">{tp.availability}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className={`font-medium ${tp.approved ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{tp.approved ? 'Approved' : 'Pending'}</span></div>
        </div>
        <Button onClick={() => useAppStore.getState().openTutorPortal()} variant="outline" size="sm" className="w-full">Edit profile</Button>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Admin dashboard
// ============================================================

function AdminDashboard() {
  return (
    <div className="space-y-6 pt-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction icon={Users} label="Users" desc="Manage all roles & permissions" color="from-rose-500 to-pink-600" onClick={() => useAppStore.getState().openAdmin('users')} />
        <QuickAction icon={BookOpen} label="Courses" desc="Catalog, bundles, categories" color="from-emerald-500 to-teal-600" onClick={() => useAppStore.getState().openAdmin('courses')} />
        <QuickAction icon={DollarSign} label="Pricing" desc="Subscriptions & one-time" color="from-amber-500 to-orange-600" onClick={() => useAppStore.getState().openAdmin('pricing')} />
        <QuickAction icon={Users} label="Tutors" desc="Approve, set payouts" color="from-sky-500 to-cyan-600" onClick={() => useAppStore.getState().openAdmin('tutors')} />
        <QuickAction icon={Zap} label="Integrations" desc="Stripe, Zoom, Slack" color="from-violet-500 to-purple-600" onClick={() => useAppStore.getState().openAdmin('integrations')} />
        <QuickAction icon={ShieldCheck} label="Roles & permissions" desc="Full RBAC matrix" color="from-indigo-500 to-blue-600" onClick={() => useAppStore.getState().openAdmin('roles')} />
        <QuickAction icon={BarChart3} label="Audit log" desc="Every platform action" color="from-fuchsia-500 to-pink-600" onClick={() => useAppStore.getState().openAdmin('audit')} />
        <QuickAction icon={Sparkles} label="Features" desc="WPLMS-parity feature list" color="from-emerald-500 to-teal-600" onClick={() => useAppStore.getState().openFeatures()} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <AdminKpiPanel />
          <AdminPendingPanel />
        </div>
        <div className="space-y-6">
          <AdminAuditPanel />
          <AdminIntegrationsPanel />
        </div>
      </div>
    </div>
  );
}

function AdminQuickStats() {
  const users = useAppStore((s) => s.users);
  const bookings = useAppStore((s) => s.bookings);
  const integrations = useAppStore((s) => s.integrations);
  const candidates = users.filter((u) => u.role === 'candidate').length;
  const tutors = users.filter((u) => u.role === 'tutor').length;
  const liveSessions = bookings.filter((b) => b.status === 'upcoming').length;
  const connectedIntegrations = integrations.filter((i) => i.connected).length;

  const stats = [
    { label: 'Candidates', value: candidates, icon: GraduationCap },
    { label: 'Tutors', value: tutors, icon: Users },
    { label: 'Live sessions', value: liveSessions, icon: Video },
    { label: 'Integrations', value: `${connectedIntegrations}/${integrations.length}`, icon: Zap },
  ];
  return (
    <>
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl bg-white/10 p-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <s.icon className="h-4 w-4 text-white/70" />
            <span className="text-xs font-medium text-white/70">{s.label}</span>
          </div>
          <p className="mt-1 text-2xl font-bold">{s.value}</p>
        </div>
      ))}
    </>
  );
}

function AdminKpiPanel() {
  const users = useAppStore((s) => s.users);
  const bookings = useAppStore((s) => s.bookings);
  const candidates = users.filter((u) => u.role === 'candidate');
  const tutors = users.filter((u) => u.role === 'tutor');
  const pendingTutors = tutors.filter((t) => t.status === 'pending');
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const revenue = completedBookings.reduce((sum, b) => sum + b.price, 0);
  const avgTutorRating = tutors.filter((t) => t.tutorProfile).reduce((sum, t) => sum + (t.tutorProfile?.rating ?? 0), 0) / (tutors.length || 1);

  const kpis = [
    { label: 'Total revenue (sessions)', value: `$${revenue}`, icon: DollarSign, color: 'text-emerald-600' },
    { label: 'Active candidates', value: candidates.filter((c) => c.status === 'active').length, icon: GraduationCap, color: 'text-sky-600' },
    { label: 'Avg tutor rating', value: `★ ${avgTutorRating.toFixed(2)}`, icon: Star, color: 'text-amber-500' },
    { label: 'Completed sessions', value: completedBookings.length, icon: CheckCircle2, color: 'text-violet-600' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4 text-rose-600" /> Platform KPIs</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-lg border bg-card p-3">
            <k.icon className={`h-5 w-5 ${k.color}`} />
            <p className="mt-1 text-xl font-bold">{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AdminPendingPanel() {
  const users = useAppStore((s) => s.users);
  const approveTutor = useAppStore((s) => s.approveTutor);
  const pendingTutors = users.filter((u) => u.role === 'tutor' && u.status === 'pending');

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><Clock className="h-4 w-4 text-amber-500" /> Pending approvals ({pendingTutors.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {pendingTutors.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No pending items. You&apos;re all caught up!</p>
        ) : (
          <div className="space-y-2">
            {pendingTutors.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-lg border p-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className={`bg-gradient-to-br ${t.avatarColor} text-white text-xs font-bold`}>{t.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.email} · {t.tutorProfile?.headline}</p>
                </div>
                <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => approveTutor(t.id)}>
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => useAppStore.getState().openAdmin('tutors')}>Review</Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AdminAuditPanel() {
  const auditLogs = useAppStore((s) => s.auditLogs).slice(0, 6);
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base"><ActivityIcon className="h-4 w-4 text-rose-600" /> Audit log</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => useAppStore.getState().openAdmin('audit')} className="text-xs">All <ChevronRight className="h-3 w-3" /></Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[260px] pr-3">
          <ol className="space-y-2">
            {auditLogs.map((log) => (
              <li key={log.id} className="rounded-md border p-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{log.actorName}</span>
                  <span className="text-muted-foreground">{timeAgo(log.timestamp)}</span>
                </div>
                <p className="text-muted-foreground">{log.action}{log.target ? ` · ${log.target}` : ''}</p>
              </li>
            ))}
          </ol>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function AdminIntegrationsPanel() {
  const integrations = useAppStore((s) => s.integrations).slice(0, 5);
  const toggleIntegration = useAppStore((s) => s.toggleIntegration);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base"><Zap className="h-4 w-4 text-violet-600" /> Integrations</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => useAppStore.getState().openAdmin('integrations')} className="text-xs">All <ChevronRight className="h-3 w-3" /></Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {integrations.map((i) => (
          <div key={i.id} className="flex items-center gap-3 rounded-lg border p-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-muted text-base">{i.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{i.name}</p>
              <p className="truncate text-xs text-muted-foreground capitalize">{i.category}</p>
            </div>
            <Button
              size="sm"
              variant={i.connected ? 'default' : 'outline'}
              onClick={() => toggleIntegration(i.id)}
              className={i.connected ? 'bg-emerald-600 text-white hover:bg-emerald-700' : ''}
            >
              {i.connected ? 'Connected' : 'Connect'}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================================
// Corporate User Dashboard (lightweight — full dashboard in corporate portal)
// ============================================================

function CorporateUserDashboard() {
  const user = useCurrentUser();
  const corporates = useAppStore((s) => s.corporates);
  const openCorporate = useAppStore((s) => s.openCorporate);

  if (!user) return null;
  const myCorporate = user.corporateId ? corporates.find((c) => c.id === user.corporateId) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <Building2 className="h-7 w-7" />
            </span>
            <div>
              <h2 className="text-xl font-bold">{myCorporate?.name ?? 'Corporate Portal'}</h2>
              <p className="text-sm text-muted-foreground">
                {user.role === 'corporate_admin'
                  ? 'Manage your corporate training, employees, and subscriptions.'
                  : 'Access your approved courses and track your learning progress.'}
              </p>
            </div>
            <Button onClick={openCorporate} className="ml-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700">
              Open Corporate Portal <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Locale Settings Section
// ============================================================

function LocaleSettingsSection() {
  const language = useAppStore((s) => s.language);
  const currency = useAppStore((s) => s.currency);
  const country = useAppStore((s) => s.country);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const setCurrency = useAppStore((s) => s.setCurrency);
  const setLocale = useAppStore((s) => s.setLocale);
  const detectLocaleFromGps = useAppStore((s) => s.detectLocaleFromGps);

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="h-5 w-5 text-emerald-600" /> Language, Country & Currency
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          These settings are auto-detected from your location. You can override them anytime.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Language</Label>
            <Select value={language} onValueChange={(v) => setLanguage(v as LanguageCode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SUPPORTED_CURRENCIES.map((cur) => (
                  <SelectItem key={cur.code} value={cur.code}>
                    {cur.symbol} {cur.code} — {cur.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Country / Region</Label>
            <Select value={country} onValueChange={(v) => {
              const info = COUNTRY_TIMEZONES[v];
              if (info) setLocale({ country: v, timezone: info.timezone, currency: info.currency });
            }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(COUNTRY_TIMEZONES).map(([code, info]) => (
                  <SelectItem key={code} value={code}>
                    {info.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={detectLocaleFromGps}>
            <Globe className="mr-1.5 h-3.5 w-3.5" /> Auto-detect from GPS
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
