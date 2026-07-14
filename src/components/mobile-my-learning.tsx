'use client';

import { useMemo } from 'react';
import {
  BookOpen, CheckCircle2, Clock, PlayCircle, Sparkles,
  ChevronRight, Calendar, Video, Mic, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store';
import { COURSES, findCourse, getAllLessons } from '@/lib/courses';
import { CourseIcon } from './navbar';
import { cn } from '@/lib/utils';

// ============================================================
// Mobile My Learning — Enrolled courses, progress, bookings
// ============================================================

export function MobileMyLearning() {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users) ?? [];
  const openLesson = useAppStore((s) => s.openLesson);
  const openCourse = useAppStore((s) => s.openCourse);
  const completedLessons = useAppStore((s) => s.completedLessons) ?? [];
  const bookings = useAppStore((s) => s.bookings) ?? [];
  const setTutorOpen = useAppStore((s) => s.setTutorOpen);
  const setAuthOpen = useAppStore((s) => s.setAuthOpen);
  const certificates = useAppStore((s) => s.certificates) ?? [];
  const openCourses = useAppStore((s) => s.openCourses);

  const user = currentUserId ? users.find(u => u.id === currentUserId) ?? null : null;

  if (!user || user.role !== 'candidate') {
    return (
      <div className="animate-page-enter flex flex-col items-center justify-center px-4 py-16 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-bold">Sign in to track learning</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a free account to enroll in courses and track your progress.
        </p>
        <Button
          onClick={() => setAuthOpen(true, 'register', 'candidate')}
          className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
        >
          Sign Up Free
        </Button>
      </div>
    );
  }

  const enrolled = COURSES.filter(c => user.enrolledCourseIds?.includes(c.id));
  const upcomingBookings = bookings.filter(b => b.candidateId === user.id && b.status === 'upcoming');

  return (
    <div className="animate-page-enter">
      {/* Profile header */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-4 pt-4 pb-6 text-white">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-white/30">
            <AvatarFallback className={cn('bg-gradient-to-br text-2xl font-bold text-white', user.avatarColor || 'from-emerald-500 to-teal-600')}>
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold truncate">{user.name}</h1>
            <p className="text-sm text-emerald-100">{completedLessons.length} lessons · {enrolled.length} courses</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="rounded-xl bg-white/15 backdrop-blur px-3 py-2 text-center">
            <p className="text-lg font-bold">{enrolled.length}</p>
            <p className="text-[10px] text-emerald-100">Enrolled</p>
          </div>
          <div className="rounded-xl bg-white/15 backdrop-blur px-3 py-2 text-center">
            <p className="text-lg font-bold">{completedLessons.length}</p>
            <p className="text-[10px] text-emerald-100">Completed</p>
          </div>
          <div className="rounded-xl bg-white/15 backdrop-blur px-3 py-2 text-center">
            <p className="text-lg font-bold">{certificates.filter(c => c.userId === user.id).length}</p>
            <p className="text-[10px] text-emerald-100">Certificates</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-4 -mt-4">
        <div className="flex gap-2">
          <Button
            onClick={() => setTutorOpen(true)}
            size="sm"
            className="flex-1 bg-purple-600 text-white hover:bg-purple-700"
          >
            <Mic className="mr-1 h-3 w-3" /> Ask MarqAI
          </Button>
          <Button
            onClick={() => openCourses()}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <BookOpen className="mr-1 h-3 w-3" /> Browse Courses
          </Button>
        </div>
      </div>

      {/* Enrolled courses */}
      <div className="px-4 mt-6">
        <h2 className="font-bold text-base mb-3">My Courses</h2>
        {enrolled.length === 0 ? (
          <Card className="text-center">
            <CardContent className="p-6">
              <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 font-semibold text-sm">No courses yet</p>
              <p className="text-xs text-muted-foreground">Browse our catalog and enroll in a course</p>
              <Button onClick={() => openCourses()} size="sm" className="mt-3 bg-emerald-600 text-white">
                Browse Courses
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {enrolled.map(course => {
              const allLessons = getAllLessons(course.id);
              const done = allLessons.filter(l => completedLessons.includes(l.lessonId)).length;
              const pct = allLessons.length ? Math.round((done / allLessons.length) * 100) : 0;
              const nextLesson = allLessons.find(l => !completedLessons.includes(l.lessonId));

              return (
                <button
                  key={course.id}
                  onClick={() => nextLesson ? openLesson(course.id, nextLesson.moduleId, nextLesson.lessonId) : openCourse(course.id)}
                  className="w-full flex items-center gap-3 rounded-2xl border bg-card p-3 active:bg-muted/50 transition-colors text-left"
                >
                  <div className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white', course.gradient)}>
                    <CourseIcon name={course.icon} className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{course.title}</p>
                    <p className="text-xs text-muted-foreground">{done}/{allLessons.length} lessons</p>
                    <Progress value={pct} className="h-1.5 mt-1.5" />
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-emerald-600">{pct}%</span>
                    {nextLesson && (
                      <span className="text-[9px] text-muted-foreground">Continue</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming bookings */}
      {upcomingBookings.length > 0 && (
        <div className="px-4 mt-6">
          <h2 className="font-bold text-base mb-3">Upcoming Sessions</h2>
          <div className="space-y-2">
            {upcomingBookings.slice(0, 3).map(booking => {
              const tutor = users.find(u => u.id === booking.tutorId);
              return (
                <div key={booking.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={cn('bg-gradient-to-br text-sm font-bold text-white', tutor?.avatarColor || 'from-sky-500 to-cyan-600')}>
                      {tutor?.name.charAt(0) || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm">{booking.topic}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {new Date(booking.scheduledAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[9px]">{booking.durationMinutes} min</Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="h-20" />
    </div>
  );
}
