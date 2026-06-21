'use client';

import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Clock, FileQuestion, PlayCircle, Star, Users, Video, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { findCourse, getAllLessons } from '@/lib/courses';
import { useAppStore } from '@/lib/store';
import { CourseIcon } from './navbar';

export function CourseDetail({ courseId }: { courseId: string }) {
  const course = findCourse(courseId);
  const { openLesson, openQuiz, goHome, setTutorOpen, completedLessons } = useAppStore();

  if (!course) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4">
        <div className="text-center">
          <p className="text-lg font-semibold">Course not found.</p>
          <Button onClick={goHome} className="mt-4">Back to home</Button>
        </div>
      </div>
    );
  }

  const allLessons = getAllLessons(courseId);
  const completedCount = allLessons.filter((l) => completedLessons.includes(l.lessonId)).length;
  const progressPct = allLessons.length ? Math.round((completedCount / allLessons.length) * 100) : 0;

  return (
    <div className="bg-background">
      {/* Hero header */}
      <section className={`bg-gradient-to-br ${course.gradient} text-white`}>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <button
            onClick={goHome}
            className="inline-flex items-center gap-1.5 text-sm text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> All courses
          </button>
          <div className="mt-6 grid items-start gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                  <CourseIcon name={course.icon} className="h-7 w-7" />
                </span>
                <div>
                  <Badge className="bg-white/20 text-white hover:bg-white/30">{course.level}</Badge>
                  <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{course.title}</h1>
                </div>
              </div>
              <p className="mt-4 max-w-2xl text-base text-white/90">{course.longDescription}</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/90">
                <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> {course.studentsCount} students</span>
                <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-current" /> {course.rating} rating</span>
                <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {course.duration}</span>
                <span className="inline-flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {course.lessonsCount} lessons</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {course.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="bg-white/15 text-white hover:bg-white/25">{t}</Badge>
                ))}
              </div>
            </div>

            {/* Progress card */}
            <Card className="bg-white/10 text-white backdrop-blur border-white/20">
              <CardContent className="space-y-4 p-5">
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/80">Your progress</p>
                  <p className="text-2xl font-bold">{progressPct}%</p>
                  <Progress value={progressPct} className="mt-2 bg-white/20 [&>div]:bg-white" />
                  <p className="mt-2 text-xs text-white/80">{completedCount} of {allLessons.length} lessons complete</p>
                </div>
                <div className="rounded-lg bg-white/10 p-3 text-sm">
                  <p className="font-semibold">Instructor</p>
                  <p className="mt-0.5">{course.instructor}</p>
                  <p className="text-xs text-white/80">{course.instructorTitle}</p>
                </div>
                <Button
                  onClick={() => {
                    const firstLesson = course.modules[0].lessons[0];
                    openLesson(course.id, course.modules[0].id, firstLesson.id);
                  }}
                  className="w-full bg-white text-emerald-700 hover:bg-white/90"
                >
                  {completedCount > 0 ? 'Continue learning' : 'Start first lesson'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setTutorOpen(true)}
                  variant="outline"
                  className="w-full border-white/40 bg-transparent text-white hover:bg-white/10"
                >
                  <Sparkles className="mr-2 h-4 w-4" /> Ask AI Tutor
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Body: what you learn + curriculum */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* What you learn + prerequisites */}
          <aside className="space-y-6">
            <Card>
              <CardContent className="p-5">
                <h3 className="text-base font-semibold">What you&apos;ll learn</h3>
                <ul className="mt-3 space-y-2">
                  {course.whatYouLearn.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <h3 className="text-base font-semibold">Prerequisites</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {course.prerequisites.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-emerald-500/5 border-emerald-500/30">
              <CardContent className="p-5">
                <h3 className="flex items-center gap-2 text-base font-semibold">
                  <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Learning format
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Step-wise written lessons with code</li>
                  <li className="flex items-center gap-2"><Video className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Video walkthrough for every lesson</li>
                  <li className="flex items-center gap-2"><FileQuestion className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Auto-graded quiz per lesson</li>
                  <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> 24/7 AI tutor for your questions</li>
                </ul>
              </CardContent>
            </Card>
          </aside>

          {/* Curriculum */}
          <div className="lg:col-span-2">
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Course curriculum</h2>
              <span className="text-sm text-muted-foreground">{course.modules.length} modules</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Click any lesson to start. Quizzes open after the lesson.</p>

            <Accordion type="multiple" defaultValue={[course.modules[0].id]} className="mt-6 space-y-3">
              {course.modules.map((module, mi) => (
                <AccordionItem key={module.id} value={module.id} className="overflow-hidden rounded-xl border bg-card">
                  <AccordionTrigger className="px-5 py-4 hover:no-underline">
                    <div className="flex w-full items-center gap-3 pr-4 text-left">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">
                        {String(mi + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{module.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{module.description}</p>
                      </div>
                      <Badge variant="secondary" className="shrink-0 text-xs">{module.lessons.length} lessons</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-2 pb-2">
                    <ul className="divide-y">
                      {module.lessons.map((lesson, li) => {
                        const isComplete = completedLessons.includes(lesson.id);
                        const isLast = mi === course.modules.length - 1 && li === module.lessons.length - 1;
                        return (
                          <li key={lesson.id} className="flex items-center gap-3 px-3 py-3">
                            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                              isComplete
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {isComplete ? <CheckCircle2 className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
                            </span>
                            <div className="min-w-0 flex-1">
                              <button
                                onClick={() => openLesson(course.id, module.id, lesson.id)}
                                className="block w-full text-left"
                              >
                                <p className="text-sm font-medium hover:text-emerald-600 dark:hover:text-emerald-400">{lesson.title}</p>
                                <p className="truncate text-xs text-muted-foreground">{lesson.description}</p>
                              </button>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <span className="hidden text-xs text-muted-foreground sm:inline">{lesson.duration}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openQuiz(course.id, module.id, lesson.id)}
                                className="text-xs"
                              >
                                <FileQuestion className="mr-1 h-3.5 w-3.5" /> Test
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => openLesson(course.id, module.id, lesson.id)}
                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                              >
                                {isComplete ? 'Review' : 'Start'}
                              </Button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  );
}
