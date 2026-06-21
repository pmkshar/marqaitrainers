'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight,
  Clock, FileQuestion, Lightbulb, ListChecks, Sparkles, Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { findCourse, findLesson, getAllLessons } from '@/lib/courses';
import { useAppStore } from '@/lib/store';
import { CourseIcon } from './navbar';
import { AITutorIntro, useShouldShowIntro } from './ai-tutor-intro';

const INTRO_PER_LESSON_KEY = 'marq-ai-tutor-intro-seen';

function lessonSeen(lessonId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(INTRO_PER_LESSON_KEY);
    const seen: string[] = raw ? JSON.parse(raw) : [];
    return seen.includes(lessonId);
  } catch { return false; }
}

function markLessonSeen(lessonId: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(INTRO_PER_LESSON_KEY);
    const seen: string[] = raw ? JSON.parse(raw) : [];
    if (!seen.includes(lessonId)) {
      seen.push(lessonId);
      window.localStorage.setItem(INTRO_PER_LESSON_KEY, JSON.stringify(seen));
    }
  } catch { /* noop */ }
}

export function LessonView({ courseId, moduleId, lessonId }: { courseId: string; moduleId: string; lessonId: string }) {
  const result = findLesson(courseId, moduleId, lessonId);
  const { openCourse, openQuiz, setTutorOpen, markLessonComplete, completedLessons } = useAppStore();
  const [activeStep, setActiveStep] = useState(0);
  const stepRef = useRef<HTMLDivElement>(null);

  // AI tutor intro overlay state
  const globalIntroEnabled = useShouldShowIntro();
  const [introSeenForThisLesson, setIntroSeenForThisLesson] = useState(true);

  // Reset intro state when lesson changes
  useEffect(() => {
    if (globalIntroEnabled && !lessonSeen(lessonId)) {
      setIntroSeenForThisLesson(false);
    } else {
      setIntroSeenForThisLesson(true);
    }
    // Also reset the active step when lesson changes
    setActiveStep(0);
  }, [lessonId, globalIntroEnabled]);

  const handleIntroStart = () => {
    markLessonSeen(lessonId);
    setIntroSeenForThisLesson(true);
  };

  const course = findCourse(courseId);
  const allLessons = getAllLessons(courseId);
  const currentIndex = allLessons.findIndex((l) => l.lessonId === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const isComplete = completedLessons.includes(lessonId);

  if (!result || !course) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4">
        <div className="text-center">
          <p className="text-lg font-semibold">Lesson not found.</p>
          <Button onClick={() => openCourse(courseId)} className="mt-4">Back to course</Button>
        </div>
      </div>
    );
  }

  const { course: c, module: mod, lesson } = result;
  const step = lesson.steps[activeStep];
  const stepProgress = Math.round(((activeStep + 1) / lesson.steps.length) * 100);

  // Show the AI tutor intro first (once per lesson, if globally enabled)
  if (!introSeenForThisLesson) {
    return (
      <AITutorIntro
        lessonTitle={lesson.title}
        courseTitle={c.title}
        onStart={handleIntroStart}
      />
    );
  }

  return (
    <div className="bg-background">
      {/* Breadcrumb + header */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => openCourse(courseId)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> {c.title}
          </button>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${c.gradient} text-white`}>
              <CourseIcon name={c.icon} className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{mod.title}</p>
              <h1 className="truncate text-xl font-bold sm:text-2xl">{lesson.title}</h1>
            </div>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3.5 w-3.5" /> {lesson.duration}
            </Badge>
            <Button
              size="sm"
              onClick={() => openQuiz(courseId, moduleId, lessonId)}
              variant="outline"
              className="border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
            >
              <FileQuestion className="mr-1.5 h-4 w-4" /> Take Test ({lesson.quiz.length})
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
        {/* Main column */}
        <div className="min-w-0 space-y-6">
          {/* Video */}
          <Card className="overflow-hidden">
            <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
              <Video className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium">Video Training</span>
              <span className="ml-auto text-xs text-muted-foreground">~{lesson.duration}</span>
            </div>
            <div className="relative aspect-video bg-black">
              <video
                key={lesson.videoUrl}
                src={lesson.videoUrl}
                controls
                playsInline
                preload="metadata"
                controlsList="nodownload noremoteplayback"
                className="h-full w-full"
                onError={(e) => {
                  const el = e.currentTarget;
                  const fallback = el.nextElementSibling as HTMLElement | null;
                  if (fallback) fallback.style.display = 'flex';
                  el.style.display = 'none';
                }}
              >
                Your browser does not support the video tag.
              </video>
              <div
                style={{ display: 'none' }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 text-center text-zinc-200"
              >
                <Video className="h-10 w-10 text-emerald-400" />
                <p className="text-sm font-medium">Video preview unavailable</p>
                <p className="max-w-md text-xs text-zinc-400">
                  The walkthrough video could not be loaded right now. Don&apos;t worry — the full
                  step-by-step procedure below is complete and self-contained.
                </p>
                <a
                  href={lesson.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                >
                  Open video in new tab
                </a>
              </div>
            </div>
            <CardContent className="p-4 text-sm text-muted-foreground">
              Watch the video walkthrough first, then follow the step-by-step guide below. Pause and code along — practice beats passive watching every time.
            </CardContent>
          </Card>

          {/* Step-wise training */}
          <Card>
            <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
              <ListChecks className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium">Step-by-Step Procedure</span>
              <span className="ml-auto text-xs text-muted-foreground">
                Step {activeStep + 1} of {lesson.steps.length}
              </span>
            </div>
            <CardContent className="p-0">
              {/* Step tabs */}
              <div className="flex gap-1 overflow-x-auto border-b p-2">
                {lesson.steps.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      i === activeStep
                        ? 'bg-emerald-600 text-white'
                        : i < activeStep
                        ? 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300'
                        : 'bg-muted text-muted-foreground hover:bg-muted/70'
                    }`}
                  >
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-black/10 text-[10px]">
                      {i < activeStep ? '✓' : i + 1}
                    </span>
                    <span className="max-w-[140px] truncate">{s.title}</span>
                  </button>
                ))}
              </div>

              <div ref={stepRef} className="space-y-5 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <Progress value={stepProgress} className="flex-1" />
                  <span className="text-xs text-muted-foreground">{stepProgress}%</span>
                </div>

                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-600 text-sm text-white">{activeStep + 1}</span>
                    {step.title}
                  </h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">{step.content}</p>
                </div>

                {step.code && (
                  <div className="overflow-hidden rounded-xl border bg-zinc-950">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                      <span className="text-xs font-medium text-zinc-400">{step.codeLanguage ?? 'code'}</span>
                      <span className="text-[10px] text-zinc-500">copy &amp; paste</span>
                    </div>
                    <SyntaxHighlighter
                      language={step.codeLanguage ?? 'text'}
                      style={oneDark}
                      customStyle={{ margin: 0, background: 'transparent', padding: '1rem', fontSize: '13px' }}
                      codeTagProps={{ style: { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' } }}
                    >
                      {step.code}
                    </SyntaxHighlighter>
                  </div>
                )}

                {step.tip && (
                  <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-900 dark:text-amber-200">
                    <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    <div>
                      <p className="font-semibold">Pro tip</p>
                      <p className="mt-0.5">{step.tip}</p>
                    </div>
                  </div>
                )}

                {/* Step nav */}
                <div className="flex items-center justify-between border-t pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Previous step
                  </Button>
                  {activeStep < lesson.steps.length - 1 ? (
                    <Button
                      size="sm"
                      onClick={() => setActiveStep((s) => s + 1)}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Next step <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setTutorOpen(true)}
                      >
                        <Sparkles className="mr-1 h-4 w-4" /> Ask AI Tutor
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          markLessonComplete(lessonId);
                          openQuiz(courseId, moduleId, lessonId);
                        }}
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <CheckCircle2 className="mr-1 h-4 w-4" /> Finish &amp; Take Test
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom navigation between lessons */}
          <div className="flex items-center justify-between gap-3">
            {prevLesson ? (
              <Button
                variant="outline"
                onClick={() => useAppStore.getState().openLesson(prevLesson.courseId, prevLesson.moduleId, prevLesson.lessonId)}
                className="max-w-[48%]"
              >
                <ArrowLeft className="mr-1 h-4 w-4 shrink-0" />
                <span className="truncate">Previous: {prevLesson.title}</span>
              </Button>
            ) : <span />}
            {nextLesson ? (
              <Button
                onClick={() => useAppStore.getState().openLesson(nextLesson.courseId, nextLesson.moduleId, nextLesson.lessonId)}
                className="max-w-[48%] bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <span className="truncate">Next: {nextLesson.title}</span>
                <ArrowRight className="ml-1 h-4 w-4 shrink-0" />
              </Button>
            ) : (
              <Button
                onClick={() => {
                  markLessonComplete(lessonId);
                  openCourse(courseId);
                }}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <CheckCircle2 className="mr-1 h-4 w-4" /> Complete course
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar: lesson outline */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold">Lesson outline</h3>
              <ul className="mt-3 space-y-1">
                {lesson.steps.map((s, i) => (
                  <li key={i}>
                    <button
                      onClick={() => setActiveStep(i)}
                      className={`flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                        i === activeStep ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'hover:bg-muted'
                      }`}
                    >
                      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] ${
                        i < activeStep ? 'bg-emerald-500 text-white' :
                        i === activeStep ? 'border border-emerald-500 text-emerald-600' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {i < activeStep ? '✓' : i + 1}
                      </span>
                      <span className="leading-tight">{s.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-emerald-500/5 border-emerald-500/30">
            <CardContent className="p-4">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Stuck on this step?
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Ask the AI tutor — it knows you&apos;re on <span className="font-medium">{lesson.title}</span> and can explain with examples tailored to this course.
              </p>
              <Button
                size="sm"
                onClick={() => setTutorOpen(true)}
                className="mt-3 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
              >
                <Sparkles className="mr-1.5 h-4 w-4" /> Open AI Tutor
              </Button>
            </CardContent>
          </Card>

          {isComplete && (
            <Card className="border-emerald-500/40 bg-emerald-500/5">
              <CardContent className="flex items-center gap-2 p-4 text-sm text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
                <span>Lesson completed — quiz unlocked.</span>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
