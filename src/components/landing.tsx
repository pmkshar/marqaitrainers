'use client';

import { ArrowRight, PlayCircle, Sparkles, BookOpen, Video, FileQuestion, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { COURSES } from '@/lib/courses';
import { CourseIcon } from './navbar';

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Step-Wise Training',
    description: 'Every lesson is broken into bite-sized, ordered steps with code examples, tips, and explanations so you never feel lost.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Video,
    title: 'Video Walkthroughs',
    description: 'Each lesson ships with a guided video so you can watch, pause, and code along at your own pace.',
    color: 'from-rose-500 to-pink-600',
  },
  {
    icon: FileQuestion,
    title: 'Sample Tests & Quizzes',
    description: 'Reinforce learning with auto-graded MCQ quizzes after every lesson, complete with detailed explanations.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: MessageSquare,
    title: 'AI Tutor Chat',
    description: 'Ask questions anytime — our AI tutor answers in seconds with code snippets, examples, and follow-ups.',
    color: 'from-violet-500 to-purple-600',
  },
];

export function Hero() {
  const { openCourse, setTutorOpen } = useAppStore();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-background to-background dark:from-emerald-950/20">
      <div className="absolute inset-0 -z-10 [background:radial-gradient(60%_50%_at_50%_0%,rgba(16,185,129,0.18),transparent)]" />
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <Badge variant="outline" className="w-fit border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <Sparkles className="mr-1 h-3 w-3" /> AI-Powered Learning Platform
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Master software engineering with your <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">personal AI tutor</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground text-pretty">
              Learn AI/ML, Full Stack Java, .NET, Mobile App Development, and Flutter through step-wise lessons, video walkthroughs, hands-on tests, and a 24/7 AI tutor that answers your questions instantly.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => openCourse(COURSES[0].id)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:from-emerald-600 hover:to-teal-700"
                size="lg"
              >
                Start Learning Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={() => setTutorOpen(true)}
                variant="outline"
                size="lg"
                className="border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
              >
                <PlayCircle className="mr-2 h-4 w-4" /> Try AI Tutor
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <Stat value="5" label="Career Tracks" />
              <Stat value="100+" label="Lessons & Tests" />
              <Stat value="24/7" label="AI Tutor" />
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-transparent blur-2xl" />
            <Card className="overflow-hidden border-border/60 shadow-2xl">
              <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs text-muted-foreground">codetutor-ai · Lesson 3 / Step 2</span>
              </div>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Implement gradient descent</p>
                    <p className="text-xs text-muted-foreground">AI &amp; Machine Learning · 75 min</p>
                  </div>
                </div>
                <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs text-emerald-300">
{`w, b = 0.0, 0.0
lr = 0.01
for epoch in range(1000):
    y_pred = w * x + b
    grad_w = (2/n) * ((y_pred - y) * x).sum()
    grad_b = (2/n) * (y_pred - y).sum()
    w -= lr * grad_w
    b -= lr * grad_b`}
                </pre>
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-emerald-800 dark:text-emerald-200">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  <span>Tip: Always shuffle your data and use mini-batches when datasets grow large.</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Step 2 of 3 · ~25 min remaining</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">Continue →</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border bg-card/50 p-3 text-center">
      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export function Features() {
  return (
    <section className="border-t bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to learn by doing</h2>
          <p className="mt-4 text-muted-foreground">
            Four pillars that turn passive watching into active mastery. Every course on the platform follows the same proven structure.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Card key={f.title} className="group relative overflow-hidden border-border/60 transition-shadow hover:shadow-lg">
              <CardContent className="p-6">
                <span className={`mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-sm`}>
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CourseGrid() {
  const { openCourse } = useAppStore();

  return (
    <section className="bg-muted/30 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Explore our courses</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Five career tracks, each with step-wise lessons, video walkthroughs, and graded tests. Pick one and start today.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((course) => (
            <Card
              key={course.id}
              onClick={() => openCourse(course.id)}
              className="group flex cursor-pointer flex-col overflow-hidden border-border/60 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className={`relative h-28 bg-gradient-to-br ${course.gradient}`}>
                <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                <span className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-xl bg-white/15 text-white backdrop-blur">
                  <CourseIcon name={course.icon} className="h-6 w-6" />
                </span>
                <Badge className="absolute left-4 top-4 bg-white/20 text-white hover:bg-white/30" variant="secondary">
                  {course.level}
                </Badge>
              </div>
              <CardContent className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-semibold leading-tight">{course.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{course.subtitle}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {course.tags.slice(0, 3).map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px] font-medium">{t}</Badge>
                  ))}
                  {course.tags.length > 3 && (
                    <Badge variant="outline" className="text-[10px] font-medium">+{course.tags.length - 3}</Badge>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <PlayCircle className="h-3.5 w-3.5" /> {course.lessonsCount} lessons
                  </span>
                  <span>·</span>
                  <span>{course.duration}</span>
                  <span>·</span>
                  <span>★ {course.rating}</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <span className="text-xs text-muted-foreground">By {course.instructor}</span>
                  <span className="text-sm font-semibold text-emerald-600 transition-transform group-hover:translate-x-1 dark:text-emerald-400">
                    View course →
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* CTA card */}
          <Card className="flex flex-col items-center justify-center border-dashed border-emerald-500/40 bg-emerald-500/5 p-8 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Sparkles className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-lg font-semibold">Not sure where to start?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Ask our AI tutor for a personalized recommendation based on your goals and experience.
            </p>
            <Button
              onClick={() => useAppStore.getState().setTutorOpen(true)}
              className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
            >
              <Sparkles className="mr-1.5 h-4 w-4" /> Ask AI Tutor
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
}

export function CtaSection() {
  const { setTutorOpen } = useAppStore();
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 px-6 py-16 text-center text-white shadow-xl sm:px-12">
          <div className="absolute inset-0 bg-grid-pattern opacity-20" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to start your journey?</h2>
            <p className="mt-4 text-emerald-50">
              Join thousands of learners leveling up their software careers with CodeTutor AI. Pick a course, follow the steps, and ask the AI tutor whenever you get stuck.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => useAppStore.getState().openCourse(COURSES[0].id)}
                className="bg-white text-emerald-700 hover:bg-emerald-50"
                size="lg"
              >
                Browse courses <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={() => setTutorOpen(true)}
                variant="outline"
                size="lg"
                className="border-white/40 bg-white/10 text-white hover:bg-white/20"
              >
                <Sparkles className="mr-2 h-4 w-4" /> Talk to AI Tutor
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
