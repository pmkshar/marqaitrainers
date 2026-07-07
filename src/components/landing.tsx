'use client';

import { ArrowRight, PlayCircle, Sparkles, BookOpen, Video, FileQuestion, MessageSquare, Users, CreditCard, Check, Search, Building2, Award, UserPlus, ClipboardCheck, Briefcase, Mic, Smartphone, ShoppingCart, GraduationCap, MessageCircle, Target, Download, QrCode, Wifi, Bell, ChevronLeft, ChevronRight, Clock, Star, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/lib/store';
import { COURSES } from '@/lib/courses';
import { PRICING_PLANS } from '@/lib/seed-data';
import { CourseIcon } from './navbar';
import { useEffect, useRef, useState } from 'react';

const FEATURES = [
  { icon: BookOpen, title: 'Structured Courses', description: '6 career-track courses with step-wise lessons, code examples, tips, and detailed explanations. From beginner to expert level.', color: 'from-emerald-500 to-teal-600' },
  { icon: Video, title: 'Video Walkthroughs', description: 'Every lesson includes a guided video walkthrough so you can watch, pause, and code along at your own pace.', color: 'from-rose-500 to-pink-600' },
  { icon: FileQuestion, title: 'Graded Quizzes & Tests', description: 'Auto-graded MCQ quizzes after every lesson with detailed explanations. Track your progress and earn verified certificates.', color: 'from-amber-500 to-orange-600' },
  { icon: MessageSquare, title: 'MarqAI Tutor Chat', description: 'Ask questions anytime — MarqAI answers in seconds with code snippets, examples, and personalized follow-ups.', color: 'from-violet-500 to-purple-600' },
  { icon: Users, title: 'Human Tutors', description: 'Book 1:1 video sessions with vetted human experts for live mentoring, code reviews, and career guidance.', color: 'from-sky-500 to-cyan-600' },
  { icon: CreditCard, title: 'Flexible Pricing', description: 'Subscribe monthly or annually for all-access, or buy individual courses for lifetime access. Corporate plans available.', color: 'from-fuchsia-500 to-pink-600' },
];

// Training Flow Steps (6 steps as requested)
const TRAINING_STEPS = [
  { 
    step: 1, 
    icon: UserPlus, 
    title: 'Register', 
    description: 'Create your free account in seconds. No credit card required to start.',
    color: 'from-emerald-500 to-emerald-600'
  },
  { 
    step: 2, 
    icon: ShoppingCart, 
    title: 'Buy Course', 
    description: 'Choose individual courses or subscribe for unlimited access.',
    color: 'from-sky-500 to-cyan-600'
  },
  { 
    step: 3, 
    icon: MessageCircle, 
    title: 'MarqAI Teaches', 
    description: 'Learn with AI-powered voice tutoring and personalized explanations.',
    color: 'from-amber-500 to-orange-600'
  },
  { 
    step: 4, 
    icon: Target, 
    title: 'Practice & Quiz', 
    description: 'Test your knowledge with graded quizzes and hands-on practice.',
    color: 'from-violet-500 to-purple-600'
  },
  { 
    step: 5, 
    icon: MessageSquare, 
    title: 'AI Interview', 
    description: 'Practice mock interviews with MarqAI to prepare for real job interviews.',
    color: 'from-rose-500 to-pink-600'
  },
  { 
    step: 6, 
    icon: GraduationCap, 
    title: 'Get Certified', 
    description: 'Earn verified certificates from MarqAI Tech Pvt Ltd upon completion.',
    color: 'from-teal-500 to-cyan-600'
  },
];

// Corporate Clients for ticker
const CORPORATE_CLIENTS = [
  { name: 'TCS', shortName: 'TCS' },
  { name: 'Infosys', shortName: 'INFY' },
  { name: 'Wipro', shortName: 'WIPRO' },
  { name: 'HCL', shortName: 'HCL' },
  { name: 'Accenture', shortName: 'ACC' },
  { name: 'IBM', shortName: 'IBM' },
  { name: 'Microsoft', shortName: 'MSFT' },
  { name: 'Google', shortName: 'GOOG' },
  { name: 'Amazon', shortName: 'AMZN' },
  { name: 'Cognizant', shortName: 'CTSH' },
  { name: 'Capgemini', shortName: 'CAP' },
  { name: 'Tech Mahindra', shortName: 'TECHM' },
];

// ── Big Course Search Bar (shown right after navbar) ──────────────────
export function CourseSearchBar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const { openCourse } = useAppStore();

  const filtered = query.trim()
    ? COURSES.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          c.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <section className="relative border-b bg-gradient-to-b from-emerald-50/40 to-background dark:from-emerald-950/10">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Big search input */}
        <div className="relative">
          <Search className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder="Search courses — e.g., AI, Java, Flutter, Python, .NET, React Native..."
            className="h-16 w-full rounded-2xl border-2 border-emerald-200 bg-white pl-14 pr-6 text-lg shadow-lg transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 dark:border-emerald-800 dark:bg-slate-900 dark:focus:border-emerald-400"
          />
          {query.trim() && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown results */}
        {focused && query.trim() && (
          <div className="absolute left-0 right-0 z-50 mx-auto mt-2 max-w-4xl rounded-xl border bg-popover shadow-2xl">
            {filtered.length > 0 ? (
              <ul className="py-2">
                {filtered.map((course) => (
                  <li key={course.id}>
                    <button
                      onClick={() => {
                        openCourse(course.id);
                        setQuery('');
                        setFocused(false);
                      }}
                      className="flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-accent"
                    >
                      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${course.gradient} text-white shadow-sm`}>
                        <CourseIcon name={course.icon} className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{course.title}</p>
                        <p className="truncate text-sm text-muted-foreground">{course.subtitle}</p>
                      </div>
                      <div className="hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
                        <Badge variant="secondary">{course.level}</Badge>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}</span>
                        <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" />{course.rating}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center">
                <p className="text-muted-foreground">No courses found for &quot;{query}&quot;</p>
                <p className="mt-1 text-sm text-muted-foreground">Try searching for AI, Java, Flutter, .NET, Python, React Native...</p>
              </div>
            )}
          </div>
        )}

        {/* Quick tags below search bar */}
        <div className="mt-3 flex flex-wrap gap-2">
          {['AI & ML', 'Full Stack Java', '.NET', 'React Native', 'Flutter', 'Python'].map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setQuery(tag);
                setFocused(true);
              }}
              className="rounded-full border border-border/60 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-300"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Scrolling Course Icons (CSS animation marquee — continuous scroll, hover to pause) ──
export function ScrollingCourseIcons() {
  const { openCourse } = useAppStore();

  // Triple the courses for seamless infinite CSS scroll
  const allCourses = [...COURSES, ...COURSES, ...COURSES];

  return (
    <section className="overflow-hidden border-b bg-gradient-to-r from-emerald-50/30 via-teal-50/20 to-emerald-50/30 py-10 dark:from-emerald-950/10 dark:via-teal-950/5 dark:to-emerald-950/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Inspirational Quote */}
        <div className="mb-6 text-center">
          <blockquote className="relative mx-auto max-w-2xl">
            <span className="absolute -left-4 -top-2 text-4xl text-emerald-300 dark:text-emerald-700">&ldquo;</span>
            <p className="text-lg font-medium italic leading-relaxed text-foreground/90 sm:text-xl">
              The beautiful thing about learning is that no one can take it away from you.
            </p>
            <footer className="mt-2 text-sm text-muted-foreground">
              — B.B. King
            </footer>
          </blockquote>
        </div>

        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-600" />
            <h3 className="text-lg font-semibold">Our Career Tracks</h3>
          </div>
          <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Hover to pause
          </div>
        </div>
      </div>

      {/* CSS-animated marquee track — pauses on hover */}
      <div className="group/marquee relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-emerald-50/80 to-transparent dark:from-emerald-950/80" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-emerald-50/80 to-transparent dark:from-emerald-950/80" />

        <div
          className="flex gap-5 px-4"
          style={{
            animation: 'marqai-scroll 60s linear infinite',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.animationPlayState = 'paused'; }}
          onMouseLeave={(e) => { e.currentTarget.style.animationPlayState = 'running'; }}
        >
          {allCourses.map((course, idx) => (
            <button
              key={`${course.id}-${idx}`}
              onClick={() => openCourse(course.id)}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-border/40 bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-emerald-400/40"
              style={{ minWidth: '180px', flexShrink: 0 }}
            >
              <span className={`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${course.gradient} text-white shadow-md transition-transform group-hover:scale-110`}>
                <CourseIcon name={course.icon} className="h-8 w-8" />
              </span>
              <span className="text-center">
                <span className="block text-sm font-semibold leading-tight">{course.title}</span>
                <span className="mt-1 block text-[11px] text-muted-foreground">{course.lessonsCount} lessons · {course.duration}</span>
              </span>
              <Badge variant="secondary" className="text-[10px]">{course.level}</Badge>
              <div className="flex items-center gap-1 text-xs text-amber-500">
                <Star className="h-3 w-3 fill-amber-400" />
                <span className="font-medium">{course.rating}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

    </section>
  );
}

// ── Infographic Stats Section ──────────────────
export function InfographicStats() {
  const { openCorporate } = useAppStore();
  const stats = [
    { value: '6', label: 'Career Tracks', sub: 'AI/ML · Full Stack · .NET · Mobile · Flutter · Python', color: 'from-emerald-500 to-teal-600', icon: Layers },
    { value: '24/7', label: 'MarqAI Tutor', sub: 'AI Voice Tutor Available Round the Clock', color: 'from-violet-500 to-purple-600', icon: Mic },
    { value: '100+', label: 'Lessons', sub: 'Step-wise with Code, Videos & Quizzes', color: 'from-amber-500 to-orange-600', icon: BookOpen },
    { value: '5+', label: 'Languages', sub: 'English · Hindi · Tamil · Telugu · Kannada', color: 'from-rose-500 to-pink-600', icon: MessageSquare },
  ];

  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-3 border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <Sparkles className="mr-1 h-3 w-3" /> MarqAI Courses at a Glance
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Powering the Next Generation of Tech Talent</h2>
          <p className="mt-3 text-muted-foreground">Everything you need to upskill — AI voice tutoring, verified certificates, and corporate-ready training.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${stat.color}`} />
              <CardContent className="pt-8 pb-6 text-center">
                <div className={`mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-md transition-transform group-hover:scale-110`}>
                  <stat.icon className="h-7 w-7" />
                </div>
                <div className="text-4xl font-extrabold text-foreground">{stat.value}</div>
                <div className="mt-1 text-lg font-semibold">{stat.label}</div>
                <p className="mt-2 text-sm text-muted-foreground">{stat.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Infographic image */}
        <div className="mt-12">
          <img
            src="/infographic-stats.svg"
            alt="MarqAI Courses Key Statistics"
            className="w-full rounded-2xl shadow-md"
          />
        </div>
      </div>
    </section>
  );
}

// ── Infographic How It Works Section ──────────────────
export function InfographicHowItWorks() {
  const steps = [
    { step: 1, icon: UserPlus, title: 'Register', desc: 'Create your free account in seconds. No credit card required.', color: 'from-emerald-500 to-emerald-600' },
    { step: 2, icon: ShoppingCart, title: 'Enroll', desc: 'Pick a course or subscribe for unlimited access to all tracks.', color: 'from-sky-500 to-cyan-600' },
    { step: 3, icon: Mic, title: 'MarqAI Teaches', desc: 'AI voice tutor guides you with personalized explanations in your language.', color: 'from-violet-500 to-purple-600' },
    { step: 4, icon: Target, title: 'Practice', desc: 'Test knowledge with graded quizzes and hands-on coding exercises.', color: 'from-amber-500 to-orange-600' },
    { step: 5, icon: Video, title: 'AI Interview', desc: 'Practice with AI-proctored video interviews for real-world readiness.', color: 'from-rose-500 to-pink-600' },
    { step: 6, icon: GraduationCap, title: 'Get Certified', desc: 'Earn verified certificates from MarqAI Tech Pvt Ltd.', color: 'from-teal-500 to-cyan-600' },
  ];

  return (
    <section className="bg-gradient-to-b from-muted/30 to-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Infographic image */}
        <img
          src="/infographic-howitworks.svg"
          alt="How MarqAI Courses Works - 6 Step Process"
          className="w-full rounded-2xl shadow-md mb-12"
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s) => (
            <div key={s.step} className="group relative flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
              <div className={`relative grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${s.color} text-white shadow-md`}>
                <s.icon className="h-6 w-6" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold shadow dark:bg-zinc-900">
                  {s.step}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Corporate CTA Banner ──────────────────
export function CorporateCTABanner() {
  const { openCorporate, setTutorOpen } = useAppStore();
  return (
    <section className="bg-background py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <img
          src="/infographic-corporate.svg"
          alt="MarqAI Corporate Training Solutions"
          className="w-full rounded-2xl shadow-lg mb-8"
        />
        <div className="text-center">
          <Button onClick={openCorporate} size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:from-emerald-600 hover:to-teal-700">
            <Building2 className="mr-2 h-5 w-5" /> Explore Corporate Plans
          </Button>
          <Button onClick={() => setTutorOpen(true)} variant="outline" size="lg" className="ml-3">
            <Sparkles className="mr-2 h-4 w-4" /> Talk to MarqAI
          </Button>
        </div>
      </div>
    </section>
  );
}

export function Hero() {
  const { openCourse, setTutorOpen, openPricing, openTutors, setAuthOpen, currentUser } = useAppStore();
  const user = currentUser();
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-background to-background dark:from-emerald-950/20">
      <div className="absolute inset-0 -z-10 [background:radial-gradient(60%_50%_at_50%_0%,rgba(16,185,129,0.18),transparent)]" />
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <Badge variant="outline" className="w-fit border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <Sparkles className="mr-1 h-3 w-3" /> Powered by MarqAI · Voice Tutoring
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Learn Software with <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">MarqAI Voice Tutor</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground text-pretty">
              MarqAI Courses — AI voice tutor guides you through Full Stack, .NET, Mobile, Flutter, Python, and AI/ML — with personalized learning in English, Hindi, and Indian languages!
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {!user && (
                <Button
                  onClick={() => setAuthOpen(true, 'register', 'candidate')}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:from-emerald-600 hover:to-teal-700"
                  size="lg"
                >
                  Start Learning Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              <Button onClick={() => openCourse(COURSES[0].id)} variant="outline" size="lg">
                <PlayCircle className="mr-2 h-4 w-4" /> View Courses
              </Button>
              <Button onClick={() => setTutorOpen(true)} variant="outline" size="lg" className="bg-purple-600 text-white hover:bg-purple-700 border-purple-600">
                <Mic className="mr-2 h-4 w-4" /> Ask MarqAI
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-3 pt-4">
              <Stat value="6" label="Career Tracks" />
              <Stat value="5+" label="Human Tutors" />
              <Stat value="🎙️" label="MarqAI Voice" />
              <Stat value="24/7" label="AI Support" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-transparent blur-2xl" />
            <Card className="overflow-hidden border-border/60 shadow-2xl">
              <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs text-muted-foreground">MarqAI Courses · Lesson 3 / Step 2</span>
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
                  <span>MarqAI Tip: Always shuffle your data and use mini-batches when datasets grow large.</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Step 2 of 3 · ~25 min remaining</span>
                  <button onClick={() => setTutorOpen(true)} className="font-medium text-emerald-600 dark:text-emerald-400">Ask MarqAI →</button>
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

// Training Flow Section - 6 Steps
export function TrainingFlow() {
  return (
    <section className="bg-gradient-to-b from-background to-muted/30 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-3 border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <GraduationCap className="mr-1 h-3 w-3" /> How It Works
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Your Path to Certification</h2>
          <p className="mt-4 text-muted-foreground">
            Follow our proven 6-step training flow from registration to certification with AI-powered learning.
          </p>
        </div>

        {/* Desktop: Horizontal layout */}
        <div className="mt-12 hidden lg:block">
          <div className="flex items-center justify-center gap-2">
            {TRAINING_STEPS.map((step, index) => (
              <div key={step.step} className="flex items-center">
                <div className="flex flex-col items-center text-center" style={{ minWidth: '160px' }}>
                  <div className={`relative grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${step.color} text-white shadow-lg`}>
                    <step.icon className="h-7 w-7" />
                    <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold shadow-md dark:bg-zinc-900">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold">{step.title}</h3>
                  <p className="mt-1 max-w-[140px] text-xs text-muted-foreground">{step.description}</p>
                </div>
                {index < TRAINING_STEPS.length - 1 && (
                  <div className="mx-2 flex items-center">
                    <div className="h-0.5 w-8 bg-gradient-to-r from-muted to-muted-foreground/20" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
                    <div className="h-0.5 w-8 bg-gradient-to-l from-muted to-muted-foreground/20" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile/Tablet: Vertical layout */}
        <div className="mt-8 lg:hidden">
          <div className="grid gap-4 sm:grid-cols-2">
            {TRAINING_STEPS.map((step, index) => (
              <div key={step.step} className="relative flex items-start gap-4 rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex flex-col items-center">
                  <div className={`relative grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${step.color} text-white shadow-md`}>
                    <step.icon className="h-6 w-6" />
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold shadow-md dark:bg-zinc-900">
                      {step.step}
                    </span>
                  </div>
                  {index < TRAINING_STEPS.length - 1 && (
                    <div className="mt-2 h-8 w-0.5 bg-gradient-to-b from-muted-foreground/30 to-transparent sm:hidden" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold">{step.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Course Carousel Section
export function CourseCarousel() {
  const { openCourse, setTutorOpen, setAuthOpen, currentUser } = useAppStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const container = scrollContainerRef.current;
    if (!container) return;

    const scroll = () => {
      if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
        container.scrollLeft = 0;
      } else {
        container.scrollLeft += 1;
      }
    };

    const interval = setInterval(scroll, 30);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft -= 350;
    }
  };

  const handleNext = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += 350;
    }
  };

  return (
    <section className="bg-muted/30 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Explore our courses</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Six on-demand career tracks with certificates. Buy individually, subscribe for all-access, or get corporate training plans for your team.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handlePrev} className="h-10 w-10">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext} className="h-10 w-10">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Carousel with fade edges */}
        <div className="relative mt-10">
          {/* Left fade */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-muted/30 to-transparent" />
          {/* Right fade */}
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-muted/30 to-transparent" />
          
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollBehavior: 'smooth' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {COURSES.map((course) => (
              <Card 
                key={course.id} 
                onClick={() => openCourse(course.id)} 
                className="group relative w-72 flex-shrink-0 cursor-pointer overflow-hidden border-border/60 transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`relative h-32 bg-gradient-to-br ${course.gradient}`}>
                  <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                  <span className="absolute right-4 top-4 grid h-14 w-14 place-items-center rounded-xl bg-white/15 text-white backdrop-blur">
                    <CourseIcon name={course.icon} className="h-7 w-7" />
                  </span>
                  <Badge className="absolute left-4 top-4 bg-white/20 text-white hover:bg-white/30" variant="secondary">
                    {course.level}
                  </Badge>
                  {course.onDemand && (
                    <Badge className="absolute left-4 bottom-3 bg-emerald-500/80 text-white hover:bg-emerald-500" variant="secondary">
                      On-Demand
                    </Badge>
                  )}
                </div>
                <CardContent className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-semibold leading-tight">{course.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{course.subtitle}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {course.tags.slice(0, 3).map((t) => (
                      <Badge key={t} variant="outline" className="text-[10px] font-medium">{t}</Badge>
                    ))}
                    {course.tags.length > 3 && (<Badge variant="outline" className="text-[10px] font-medium">+{course.tags.length - 3}</Badge>)}
                  </div>
                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><PlayCircle className="h-3.5 w-3.5" /> {course.lessonsCount} lessons</span>
                    <span>·</span><span>{course.duration}</span>
                    <span>·</span><span>★ {course.rating}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t pt-3">
                    <div className="text-sm">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">${course.oneTimePrice}</span>
                      <span className="text-xs text-muted-foreground"> one-time · </span>
                      <span className="font-medium">${course.monthlyPrice}/mo</span>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600 transition-transform group-hover:translate-x-1 dark:text-emerald-400">View →</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Ask AI Card */}
            <Card className="flex w-72 flex-shrink-0 flex-col items-center justify-center border-dashed border-emerald-500/40 bg-emerald-500/5 p-8 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <Sparkles className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">Not sure where to start?</h3>
              <p className="mt-2 text-sm text-muted-foreground">Ask our AI tutor for a personalized recommendation.</p>
              <div className="mt-4 flex flex-col gap-2">
                <Button onClick={() => setTutorOpen(true)} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
                  <Sparkles className="mr-1.5 h-4 w-4" /> AI Tutor
                </Button>
                <Button onClick={() => useAppStore.getState().openTutors()} variant="outline">Human Tutors</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Features() {
  return (
    <section className="border-t bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why learn with marqaicourses?</h2>
          <p className="mt-4 text-muted-foreground">
            Structured courses with video lessons, graded tests, certificates, AI tutor for instant help, human tutors for live mentoring, and flexible pricing — everything you need to advance your career.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

// Keep the original CourseGrid as an alternative
export function CourseGrid() {
  const { openCourse, setTutorOpen, setAuthOpen, currentUser } = useAppStore();
  return (
    <section className="bg-muted/30 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Explore our courses</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Six on-demand career tracks with certificates. Buy individually, subscribe for all-access, or get corporate training plans for your team.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((course) => (
            <Card key={course.id} onClick={() => openCourse(course.id)} className="group flex cursor-pointer flex-col overflow-hidden border-border/60 transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className={`relative h-28 bg-gradient-to-br ${course.gradient}`}>
                <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                <span className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-xl bg-white/15 text-white backdrop-blur">
                  <CourseIcon name={course.icon} className="h-6 w-6" />
                </span>
                <Badge className="absolute left-4 top-4 bg-white/20 text-white hover:bg-white/30" variant="secondary">{course.level}</Badge>
                {course.onDemand && (
                  <Badge className="absolute left-4 bottom-3 bg-emerald-500/80 text-white hover:bg-emerald-500" variant="secondary">On-Demand</Badge>
                )}
              </div>
              <CardContent className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-semibold leading-tight">{course.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{course.subtitle}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {course.tags.slice(0, 3).map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px] font-medium">{t}</Badge>
                  ))}
                  {course.tags.length > 3 && (<Badge variant="outline" className="text-[10px] font-medium">+{course.tags.length - 3}</Badge>)}
                </div>
                <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><PlayCircle className="h-3.5 w-3.5" /> {course.lessonsCount} lessons</span>
                  <span>·</span><span>{course.duration}</span>
                  <span>·</span><span>★ {course.rating}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <div className="text-sm">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">${course.oneTimePrice}</span>
                    <span className="text-xs text-muted-foreground"> one-time · </span>
                    <span className="font-medium">${course.monthlyPrice}/mo</span>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600 transition-transform group-hover:translate-x-1 dark:text-emerald-400">View →</span>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="flex flex-col items-center justify-center border-dashed border-emerald-500/40 bg-emerald-500/5 p-8 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Sparkles className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-lg font-semibold">Not sure where to start?</h3>
            <p className="mt-2 text-sm text-muted-foreground">Ask our AI tutor for a personalized recommendation, or talk to a human tutor.</p>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => setTutorOpen(true)} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
                <Sparkles className="mr-1.5 h-4 w-4" /> AI Tutor
              </Button>
              <Button onClick={() => useAppStore.getState().openTutors()} variant="outline">Human Tutors</Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

export function PricingSection() {
  const { openPricing, setAuthOpen, currentUser } = useAppStore();
  const user = currentUser();
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-3 border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <CreditCard className="mr-1 h-3 w-3" /> Flexible Pricing
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Pay your way — subscribe or buy</h2>
          <p className="mt-4 text-muted-foreground">
            Choose monthly or annual all-access subscriptions, or buy individual courses for lifetime access. Per-course pricing varies — see the catalog.
          </p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${plan.highlighted ? 'border-emerald-500/60 shadow-xl ring-1 ring-emerald-500/30' : ''}`}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                  Most popular
                </Badge>
              )}
              <CardContent className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-sm text-muted-foreground">/{plan.period}</span>
                </div>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => (user ? openPricing() : setAuthOpen(true, 'register', 'candidate'))}
                  className={`mt-6 w-full ${plan.highlighted ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700' : ''}`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  {plan.ctaLabel}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button onClick={openPricing} variant="link" className="text-emerald-600 dark:text-emerald-400">
            See full pricing details &amp; per-course prices →
          </Button>
        </div>
      </div>
    </section>
  );
}

export function TutorsPreview() {
  const { openTutors, users } = useAppStore();
  const tutors = users.filter((u) => u.role === 'tutor' && u.tutorProfile?.approved).slice(0, 3);
  return (
    <section className="bg-muted/30 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge variant="outline" className="mb-3 border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300">
              <Users className="mr-1 h-3 w-3" /> Live Human Mentoring
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Book 1:1 sessions with human tutors</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Sometimes you need a human. Our vetted tutors teach through live video and chat — book by the hour, pay only for what you use.
            </p>
          </div>
          <Button onClick={openTutors} variant="outline">Browse all tutors <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tutors.map((t) => (
            <Card key={t.id} className="border-border/60 transition-shadow hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br ${t.avatarColor} text-xl font-bold text-white`}>
                    {t.name.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-tight">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.tutorProfile?.headline}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <Badge variant="secondary" className={
                        t.tutorProfile?.availability === 'available' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' :
                        t.tutorProfile?.availability === 'busy' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' :
                        'bg-muted text-muted-foreground'
                      }>
                        {t.tutorProfile?.availability}
                      </Badge>
                      <span className="text-muted-foreground">★ {t.tutorProfile?.rating} · {t.tutorProfile?.sessionsCompleted} sessions</span>
                    </div>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{t.tutorProfile?.bio}</p>
                <div className="mt-4 flex items-center justify-between border-t pt-3">
                  <span className="text-lg font-bold">${t.tutorProfile?.hourlyRate}<span className="text-xs font-normal text-muted-foreground">/hr</span></span>
                  <Button onClick={openTutors} size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700">Book session</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="mt-6 border-dashed border-sky-500/40 bg-sky-500/5">
          <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
            <div>
              <h3 className="text-lg font-semibold">Are you an expert? Teach on marqaicourses.</h3>
              <p className="text-sm text-muted-foreground">Apply to become a human tutor. Set your rates, teach online via video + chat, get paid on your schedule.</p>
            </div>
            <Button onClick={() => useAppStore.getState().setAuthOpen(true, 'register', 'tutor')} className="bg-gradient-to-r from-sky-500 to-cyan-600 text-white hover:from-sky-600 hover:to-cyan-700">
              Apply to Teach <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export function CtaSection() {
  const { setTutorOpen, setAuthOpen, currentUser } = useAppStore();
  const user = currentUser();
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 px-6 py-16 text-center text-white shadow-xl sm:px-12">
          <div className="absolute inset-0 bg-grid-pattern opacity-20" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to start your journey?</h2>
            <p className="mt-4 text-emerald-50">
              Join thousands of learners leveling up their careers with MarqAI Courses. Pick a course, follow the steps, ask MarqAI voice tutor, or book a human mentor.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {!user ? (
                <Button onClick={() => setAuthOpen(true, 'register', 'candidate')} className="bg-white text-emerald-700 hover:bg-emerald-50" size="lg">
                  Register Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => useAppStore.getState().openCourse(COURSES[0].id)} className="bg-white text-emerald-700 hover:bg-emerald-50" size="lg">
                  Browse courses <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              <Button onClick={() => setTutorOpen(true)} variant="outline" size="lg" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                <Sparkles className="mr-2 h-4 w-4" /> Ask MarqAI
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- Corporate Training section ----
export function CorporateTraining() {
  const { openCorporate } = useAppStore();
  const corpFeatures = [
    { icon: BookOpen, title: 'Customized Courses', description: 'Tailor courses to your team\'s specific skills and goals.', color: 'from-blue-500 to-blue-600' },
    { icon: Mic, title: 'MarqAI Voice Tutor', description: 'Provide 24/7 personalized support and feedback in multiple languages.', color: 'from-emerald-500 to-teal-600' },
    { icon: ClipboardCheck, title: 'AI Assessments & Feedback', description: 'Engage learners with interactive quizzes and real-time feedback.', color: 'from-purple-500 to-purple-600' },
    { icon: Award, title: 'Verified Certificates', description: 'Issue certificates verified by MarqAI Tech Pvt Ltd upon completion.', color: 'from-amber-500 to-orange-600' },
  ];
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold">Customized AI-Powered Training for Your Team</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          We create custom training programs tailored to your team&apos;s unique needs. Our AI tutor provides personalized learning paths for every employee.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {corpFeatures.map((f) => (
            <Card key={f.title} className="text-center">
              <CardContent className="flex flex-col items-center p-6">
                <span className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${f.color} text-white`}>
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button onClick={openCorporate} className="bg-purple-600 text-white hover:bg-purple-700">
            <Building2 className="mr-2 h-4 w-4" /> Explore Corporate Training
          </Button>
        </div>
      </div>
    </section>
  );
}

// ---- Corporate Clients Ticker ----
export function CorporateClientsTicker() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const container = scrollContainerRef.current;
    if (!container) return;

    const scroll = () => {
      if (container.scrollLeft >= container.scrollWidth / 2) {
        container.scrollLeft = 0;
      } else {
        container.scrollLeft += 0.5;
      }
    };

    const interval = setInterval(scroll, 20);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Duplicate clients for seamless loop
  const duplicatedClients = [...CORPORATE_CLIENTS, ...CORPORATE_CLIENTS];

  return (
    <section className="py-12 bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-muted-foreground mb-6">
          Trusted by leading companies
        </p>
        <div className="relative">
          {/* Left gradient fade */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-16 w-32 bg-gradient-to-r from-muted/50 to-transparent" />
          {/* Right gradient fade */}
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-16 w-32 bg-gradient-to-l from-muted/50 to-transparent" />
          
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-12 overflow-x-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {duplicatedClients.map((client, index) => (
              <div 
                key={`${client.name}-${index}`} 
                className="flex flex-shrink-0 items-center gap-3 px-6 py-3 rounded-lg bg-background/50 border border-border/50 shadow-sm hover:border-emerald-500/30 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-sm font-bold text-slate-600 dark:text-slate-300">
                  {client.shortName.slice(0, 2)}
                </div>
                <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">{client.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- Corporate Plans ----
export function CorporatePlans() {
  const { openCorporate } = useAppStore();
  return (
    <section className="bg-muted/30 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold">Flexible Corporate Plans</h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.highlighted ? 'border-2 border-purple-500 shadow-lg' : ''}`}>
              {plan.highlighted && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600">Most Popular</Badge>}
              <CardContent className="p-6">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="mt-2"><span className="text-3xl font-extrabold">${plan.price}</span><span className="text-muted-foreground">/{plan.period}</span></p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 text-emerald-500 shrink-0" />{f}</li>
                  ))}
                </ul>
                <Button onClick={openCorporate} className={`mt-6 w-full ${plan.highlighted ? 'bg-purple-600 text-white hover:bg-purple-700' : ''}`} variant={plan.highlighted ? 'default' : 'outline'}>
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Button onClick={openCorporate} className="bg-purple-600 text-white hover:bg-purple-700">
            <Building2 className="mr-2 h-4 w-4" /> Register Your Company
          </Button>
        </div>
      </div>
    </section>
  );
}

// ---- Mobile App Promo (Enhanced) ----
export function MobileAppPromo() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left side - Content */}
          <div className="flex flex-col gap-6">
            <Badge variant="outline" className="w-fit border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
              <Smartphone className="mr-1 h-3 w-3" /> Mobile App
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Get the App</h2>
            <p className="max-w-xl text-lg text-slate-300">
              Learn anywhere, anytime. Download the MarqAI Courses app for iOS and Android. Access your courses, AI tutor, and certificates on the go.
            </p>
            
            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 mt-2">
              <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm">
                <Wifi className="h-4 w-4 text-emerald-400" />
                <span>Offline Learning</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm">
                <Mic className="h-4 w-4 text-emerald-400" />
                <span>AI Voice Tutor</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm">
                <Bell className="h-4 w-4 text-emerald-400" />
                <span>Push Notifications</span>
              </div>
            </div>

            {/* Store buttons */}
            <div className="flex flex-wrap gap-4 mt-4">
              {/* Google Play Button */}
              <button className="flex items-center gap-3 rounded-lg bg-black px-5 py-3 transition-transform hover:scale-105">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] text-slate-400">GET IT ON</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </button>
              
              {/* App Store Button */}
              <button className="flex items-center gap-3 rounded-lg bg-black px-5 py-3 transition-transform hover:scale-105">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] text-slate-400">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </button>

              {/* PWA Install Button */}
              <button className="flex items-center gap-3 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-5 py-3 transition-all hover:bg-emerald-500/20 hover:scale-105">
                <Download className="h-6 w-6 text-emerald-400" />
                <div className="text-left">
                  <div className="text-[10px] text-emerald-300">INSTALL NOW</div>
                  <div className="text-sm font-semibold">PWA App</div>
                </div>
              </button>
            </div>

            {/* QR Code hint */}
            <div className="flex items-center gap-3 mt-4 text-sm text-slate-400">
              <QrCode className="h-5 w-5" />
              <span>Scan the QR code on the right to download the app</span>
            </div>
          </div>

          {/* Right side - Phone mockup and QR */}
          <div className="relative flex items-center justify-center">
            {/* Phone mockup */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-transparent blur-2xl" />
              <div className="relative rounded-[2.5rem] border-8 border-slate-700 bg-slate-900 p-1 shadow-2xl">
                {/* Phone notch */}
                <div className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-slate-900" />
                {/* Phone screen */}
                <div className="h-[420px] w-[220px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-500 to-teal-600">
                  <div className="flex h-full flex-col items-center justify-center p-6 text-center text-white">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/20 backdrop-blur">
                      <BookOpen className="h-8 w-8" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold">MarqAI Courses</h3>
                    <p className="mt-2 text-sm text-white/80">Learn on the go with AI-powered tutoring</p>
                    <div className="mt-6 space-y-2 text-sm">
                      <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
                        <PlayCircle className="h-4 w-4" />
                        <span>Video Lessons</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
                        <Mic className="h-4 w-4" />
                        <span>Voice Tutor</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
                        <Award className="h-4 w-4" />
                        <span>Certificates</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="absolute -right-4 bottom-8 hidden lg:block">
              <div className="rounded-xl border border-white/20 bg-white p-3 shadow-xl">
                <div className="grid h-24 w-24 place-items-center rounded bg-slate-100 text-slate-400">
                  <QrCode className="h-16 w-16" />
                </div>
                <p className="mt-2 text-center text-[10px] font-medium text-slate-500">Scan to download</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- Registration to Certification flow (original, smaller version) ----
const STEPS = [
  { icon: UserPlus, label: 'Sign Up', color: 'from-blue-500 to-blue-600' },
  { icon: BookOpen, label: 'Enroll', color: 'from-emerald-500 to-teal-600' },
  { icon: PlayCircle, label: 'Learn', color: 'from-purple-500 to-purple-600' },
  { icon: ClipboardCheck, label: 'Practice', color: 'from-amber-500 to-orange-600' },
  { icon: Check, label: 'Assess', color: 'from-rose-500 to-pink-600' },
  { icon: Award, label: 'Certify', color: 'from-yellow-500 to-amber-600' },
  { icon: Briefcase, label: 'Get Hired', color: 'from-teal-500 to-cyan-600' },
];

export function RegistrationToCertification() {
  return (
    <section className="bg-muted/30 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold">From Registration to Certification</h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-2">
                <span className={`grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br ${step.color} text-white shadow-md`}>
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-medium text-muted-foreground">{step.label}</span>
              </div>
              {i < STEPS.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground/40" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Trusted Companies ----
const TRUSTED = ['Google', 'Microsoft', 'IBM', 'Salesforce', 'GitHub', 'Amazon', 'LinkedIn', 'Tech'];
export function TrustedCompanies() {
  const { openCorporate } = useAppStore();
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-muted-foreground">Trusted by Leading Companies</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-8">
          {TRUSTED.map((name) => (
            <span key={name} className="text-lg font-bold text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors">{name}</span>
          ))}
        </div>
        <div className="mt-6 text-center">
          <button onClick={openCorporate} className="text-sm font-medium text-purple-600 hover:underline">Explore Corporate Portal →</button>
        </div>
      </div>
    </section>
  );
}

// ── Courses Page (separate page for all courses) ──────────────────
export function CoursesPage() {
  const { openCourse, setTutorOpen } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');

  const filteredCourses = COURSES.filter((c) => {
    const matchesSearch = !searchQuery.trim() ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLevel = selectedLevel === 'All' || c.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const levels = ['All', ...Array.from(new Set(COURSES.map((c) => c.level)))];

  return (
    <section className="min-h-screen bg-background py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <Badge variant="outline" className="mb-3 border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <GraduationCap className="mr-1 h-3 w-3" /> All Courses
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Explore Our <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Career Tracks</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Industry-aligned courses with AI voice tutoring, video walkthroughs, graded quizzes, and verified certificates from MarqAI Tech Pvt Ltd.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              className="h-11 w-full rounded-xl border bg-card pl-10 pr-4 text-sm shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  selectedLevel === level
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              onClick={() => openCourse(course.id)}
              className="group flex cursor-pointer flex-col overflow-hidden border-border/60 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className={`relative h-36 bg-gradient-to-br ${course.gradient}`}>
                <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                <span className="absolute right-4 top-4 grid h-14 w-14 place-items-center rounded-xl bg-white/15 text-white backdrop-blur">
                  <CourseIcon name={course.icon} className="h-7 w-7" />
                </span>
                <Badge className="absolute left-4 top-4 bg-white/20 text-white hover:bg-white/30" variant="secondary">
                  {course.level}
                </Badge>
                {course.onDemand && (
                  <Badge className="absolute left-4 bottom-3 bg-emerald-500/80 text-white hover:bg-emerald-500" variant="secondary">
                    On-Demand
                  </Badge>
                )}
              </div>
              <CardContent className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-semibold leading-tight">{course.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{course.subtitle}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {course.tags.slice(0, 3).map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px] font-medium">{t}</Badge>
                  ))}
                  {course.tags.length > 3 && (<Badge variant="outline" className="text-[10px] font-medium">+{course.tags.length - 3}</Badge>)}
                </div>
                <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><PlayCircle className="h-3.5 w-3.5" /> {course.lessonsCount} lessons</span>
                  <span>·</span><span>{course.duration}</span>
                  <span>·</span><span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-amber-400 text-amber-500" /> {course.rating}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <div className="text-sm">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">${course.oneTimePrice}</span>
                    <span className="text-xs text-muted-foreground"> one-time · </span>
                    <span className="font-medium">${course.monthlyPrice}/mo</span>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600 transition-transform group-hover:translate-x-1 dark:text-emerald-400">View →</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Ask AI Card */}
          <Card className="flex flex-col items-center justify-center border-dashed border-emerald-500/40 bg-emerald-500/5 p-8 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Sparkles className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-lg font-semibold">Not sure where to start?</h3>
            <p className="mt-2 text-sm text-muted-foreground">Ask our AI tutor for a personalized recommendation.</p>
            <Button onClick={() => setTutorOpen(true)} className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
              <Sparkles className="mr-1.5 h-4 w-4" /> Ask MarqAI
            </Button>
          </Card>
        </div>

        {filteredCourses.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-lg text-muted-foreground">No courses found for &quot;{searchQuery}&quot;</p>
            <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(''); setSelectedLevel('All'); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}