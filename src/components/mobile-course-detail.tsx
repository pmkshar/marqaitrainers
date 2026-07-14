'use client';

import {
  ArrowRight, BookOpen, CheckCircle2, Clock, FileQuestion, PlayCircle, Star,
  Users, Video, Sparkles, Download, ListChecks, ChevronDown, ChevronRight,
  Mic, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { findCourse, getAllLessons } from '@/lib/courses';
import { useAppStore } from '@/lib/store';
import { CourseIcon } from './navbar';
import { cn } from '@/lib/utils';

// ============================================================
// Mobile Course Detail — Full course info with modules/lessons
// ============================================================

export function MobileCourseDetail({ courseId }: { courseId: string }) {
  const course = findCourse(courseId);
  const openCourse = useAppStore((s) => s.openCourse);
  const openLesson = useAppStore((s) => s.openLesson);
  const openQuiz = useAppStore((s) => s.openQuiz);
  const setTutorOpen = useAppStore((s) => s.setTutorOpen);
  const completedLessons = useAppStore((s) => s.completedLessons) ?? [];
  const setAuthOpen = useAppStore((s) => s.setAuthOpen);
  const currentUser = useAppStore((s) => s.currentUser);

  if (!course) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4">
        <div className="text-center">
          <p className="text-lg font-semibold">Course not found.</p>
        </div>
      </div>
    );
  }

  const user = currentUser();
  const allLessons = getAllLessons(courseId);
  const completedCount = allLessons.filter(l => completedLessons.includes(l.lessonId)).length;
  const progressPct = allLessons.length ? Math.round((completedCount / allLessons.length) * 100) : 0;
  const isEnrolled = user?.enrolledCourseIds?.includes(courseId);

  const handleEnroll = () => {
    if (!user) {
      setAuthOpen(true, 'register', 'candidate');
    } else {
      // Open the course detail which has its own enrollment logic
      openCourse(courseId);
    }
  };

  return (
    <div className="animate-page-enter pb-4">
      {/* Hero */}
      <div className={cn('px-4 pt-3 pb-6 bg-gradient-to-br text-white', course.gradient)}>
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur">
            <CourseIcon name={course.icon} className="h-7 w-7 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold leading-tight">{course.title}</h1>
            <p className="text-white/80 text-sm mt-1">{course.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <Badge className="bg-white/20 text-white border-0">{course.level}</Badge>
          <span className="flex items-center gap-1 text-xs text-white/80"><Clock className="h-3 w-3" /> {course.duration}</span>
          <span className="flex items-center gap-1 text-xs text-white/80"><Star className="h-3 w-3 fill-amber-300" /> {course.rating}</span>
          <span className="flex items-center gap-1 text-xs text-white/80"><Users className="h-3 w-3" /> {course.studentsCount}</span>
        </div>
        <p className="text-sm text-white/90 mt-3 line-clamp-3">{course.longDescription.slice(0, 200)}...</p>

        {/* Progress or enroll */}
        {isEnrolled ? (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span>{completedCount}/{allLessons.length} lessons done</span>
              <span className="font-bold">{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-2 mt-1 bg-white/20" />
          </div>
        ) : (
          <div className="flex gap-2 mt-4">
            <Button onClick={handleEnroll} size="sm" className="flex-1 bg-white text-emerald-700 hover:bg-white/90 font-bold">
              Enroll Now
            </Button>
            <Button onClick={() => setTutorOpen(true)} size="sm" variant="outline" className="border-white/40 text-white hover:bg-white/10">
              <Mic className="mr-1 h-3 w-3" /> Ask AI
            </Button>
          </div>
        )}
      </div>

      {/* What you'll learn */}
      <div className="px-4 mt-5">
        <h2 className="font-bold text-base mb-2">What You'll Learn</h2>
        <div className="space-y-2">
          {course.whatYouLearn.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <p className="text-sm text-muted-foreground">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modules & Lessons */}
      <div className="px-4 mt-6">
        <h2 className="font-bold text-base mb-3">Course Content</h2>
        <Accordion type="multiple" className="space-y-2">
          {course.modules.map((mod, modIdx) => (
            <AccordionItem key={mod.id} value={mod.id} className="border rounded-xl px-3">
              <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
                <div className="flex items-center gap-2 text-left">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    {modIdx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate">{mod.title}</p>
                    <p className="text-xs text-muted-foreground font-normal">{mod.lessons.length} lessons</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-2 space-y-1">
                {mod.lessons.map(lesson => {
                  const isCompleted = completedLessons.includes(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => openLesson(courseId, mod.id, lesson.id)}
                      className="w-full flex items-center gap-3 rounded-xl p-2.5 active:bg-muted/50 text-left transition-colors"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                      ) : (
                        <PlayCircle className="h-5 w-5 shrink-0 text-muted-foreground" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-sm truncate', isCompleted && 'text-muted-foreground line-through')}>{lesson.title}</p>
                        <p className="text-[10px] text-muted-foreground">{lesson.duration}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Instructor */}
      <div className="px-4 mt-6">
        <h2 className="font-bold text-base mb-3">Instructor</h2>
        <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
          <div className={cn('grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br text-lg font-bold text-white', course.gradient)}>
            {course.instructor.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-sm">{course.instructor}</p>
            <p className="text-xs text-muted-foreground">{course.instructorTitle}</p>
          </div>
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}
