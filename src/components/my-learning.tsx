'use client';

import { ArrowLeft, BookOpen, CheckCircle2, Clock, Calendar, Video, Sparkles, PlayCircle, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAppStore } from '@/lib/store';
import { COURSES, findCourse, getAllLessons } from '@/lib/courses';
import { CourseIcon } from './navbar';

export function MyLearning() {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users) ?? [];
  const goHome = useAppStore((s) => s.goHome);
  const openLesson = useAppStore((s) => s.openLesson);
  const openCourse = useAppStore((s) => s.openCourse);
  const completedLessons = useAppStore((s) => s.completedLessons) ?? [];
  const bookings = useAppStore((s) => s.bookings) ?? [];
  const setTutorOpen = useAppStore((s) => s.setTutorOpen);
  const user = currentUserId ? users.find((u) => u.id === currentUserId) ?? null : null;

  if (!user || user.role !== 'candidate') {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4">
        <Card className="max-w-md text-center">
          <CardContent className="p-8">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Sign in to track your learning</h2>
            <p className="mt-2 text-sm text-muted-foreground">Create a free candidate account to enroll in courses and track progress.</p>
            <Button onClick={() => useAppStore.getState().setAuthOpen(true, 'register', 'candidate')} className="mt-4 bg-emerald-600 text-white hover:bg-emerald-700">Register free</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const enrolled = COURSES.filter((c) => user.enrolledCourseIds.includes(c.id));
  const myBookings = bookings.filter((b) => b.candidateId === user.id);
  const upcomingBookings = myBookings.filter((b) => b.status === 'upcoming');

  return (
    <div className="bg-background">
      <section className="border-b bg-gradient-to-br from-emerald-50/60 to-background dark:from-emerald-950/20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <button onClick={goHome} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </button>
          <div className="mt-3 flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className={`bg-gradient-to-br ${user.avatarColor} text-white text-2xl font-bold`}>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Welcome, {user.name.split(' ')[0]}</h1>
              <p className="text-sm text-muted-foreground">{completedLessons.length} lessons completed · {enrolled.length} course{enrolled.length !== 1 ? 's' : ''} enrolled</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Enrolled courses */}
        <div>
          <h2 className="text-xl font-semibold">My courses</h2>
          {enrolled.length === 0 ? (
            <Card className="mt-3 border-dashed">
              <CardContent className="p-8 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 font-medium">You haven&apos;t enrolled in any courses yet.</p>
                <p className="text-sm text-muted-foreground">Browse the catalog and pick a course to start learning.</p>
                <Button onClick={() => openCourse(COURSES[0].id)} className="mt-4 bg-emerald-600 text-white hover:bg-emerald-700">Browse courses</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {enrolled.map((c) => {
                const lessons = getAllLessons(c.id);
                const done = lessons.filter((l) => completedLessons.includes(l.lessonId)).length;
                const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
                const firstUndone = lessons.find((l) => !completedLessons.includes(l.lessonId));
                return (
                  <Card key={c.id} className="border-border/60">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <span className={`grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${c.gradient} text-white`}>
                          <CourseIcon name={c.icon} className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{c.title}</p>
                          <p className="text-xs text-muted-foreground">{done}/{lessons.length} lessons · {pct}%</p>
                        </div>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-600" style={{ width: `${pct}%` }} />
                      </div>
                      <Button
                        size="sm"
                        className="mt-3 w-full bg-emerald-600 text-white hover:bg-emerald-700"
                        onClick={() => firstUndone
                          ? openLesson(firstUndone.courseId, firstUndone.moduleId, firstUndone.lessonId)
                          : openCourse(c.id)}
                      >
                        {firstUndone ? 'Continue' : 'Review course'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming bookings */}
        <div>
          <h2 className="text-xl font-semibold">Upcoming tutor sessions</h2>
          {upcomingBookings.length === 0 ? (
            <Card className="mt-3 border-dashed">
              <CardContent className="p-6 text-center">
                <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No upcoming sessions. Book a human tutor for 1:1 help.</p>
                <Button onClick={() => useAppStore.getState().openTutors()} variant="outline" className="mt-3">Browse tutors</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-3 space-y-3">
              {upcomingBookings.map((b) => {
                const tutor = users.find((u) => u.id === b.tutorId);
                return (
                  <Card key={b.id}>
                    <CardContent className="flex flex-wrap items-center gap-4 p-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={`bg-gradient-to-br ${tutor?.avatarColor ?? 'from-slate-500 to-slate-700'} text-white font-bold`}>
                          {tutor?.name.charAt(0) ?? '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{b.topic}</p>
                        <p className="text-xs text-muted-foreground">
                          With {tutor?.name} · {new Date(b.scheduledAt).toLocaleString()} · {b.durationMinutes} min
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-sky-500/15 text-sky-700 dark:text-sky-300">{b.status}</Badge>
                      <span className="font-semibold">${b.price}</span>
                      <Button size="sm" className="bg-sky-600 text-white hover:bg-sky-700"><Video className="mr-1 h-3.5 w-3.5" /> Join</Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Recommended */}
        <div>
          <h2 className="text-xl font-semibold">Recommended for you</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COURSES.filter((c) => !user.enrolledCourseIds.includes(c.id)).slice(0, 3).map((c) => (
              <Card key={c.id} className="cursor-pointer border-border/60 transition-shadow hover:shadow-lg" onClick={() => openCourse(c.id)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${c.gradient} text-white`}>
                      <CourseIcon name={c.icon} className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{c.title}</p>
                      <p className="text-xs text-muted-foreground">${c.oneTimePrice} · ★ {c.rating}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-medium">Have a question right now?</p>
                <p className="text-sm text-muted-foreground">Ask the AI tutor — instant answers, 24/7.</p>
              </div>
            </div>
            <Button onClick={() => setTutorOpen(true)} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
              <Sparkles className="mr-1.5 h-4 w-4" /> Ask AI Tutor
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
