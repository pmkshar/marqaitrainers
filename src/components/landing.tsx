'use client';

import { ArrowRight, PlayCircle, Sparkles, BookOpen, Video, FileQuestion, MessageSquare, Users, CreditCard, Check, Search, Building2, Award, UserPlus, ClipboardCheck, Briefcase, Mic, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/lib/store';
import { COURSES } from '@/lib/courses';
import { PRICING_PLANS } from '@/lib/seed-data';
import { CourseIcon } from './navbar';

const FEATURES = [
  { icon: BookOpen, title: 'Structured Courses', description: '6 career-track courses with step-wise lessons, code examples, tips, and detailed explanations. From beginner to expert level.', color: 'from-emerald-500 to-teal-600' },
  { icon: Video, title: 'Video Walkthroughs', description: 'Every lesson includes a guided video walkthrough so you can watch, pause, and code along at your own pace.', color: 'from-rose-500 to-pink-600' },
  { icon: FileQuestion, title: 'Graded Quizzes & Tests', description: 'Auto-graded MCQ quizzes after every lesson with detailed explanations. Track your progress and earn certificates.', color: 'from-amber-500 to-orange-600' },
  { icon: MessageSquare, title: 'AI Tutor Chat', description: 'Ask questions anytime — our AI tutor answers in seconds with code snippets, examples, and personalized follow-ups.', color: 'from-violet-500 to-purple-600' },
  { icon: Users, title: 'Human Tutors', description: 'Book 1:1 video sessions with vetted human experts for live mentoring, code reviews, and career guidance.', color: 'from-sky-500 to-cyan-600' },
  { icon: CreditCard, title: 'Flexible Pricing', description: 'Subscribe monthly or annually for all-access, or buy individual courses for lifetime access. Corporate plans available.', color: 'from-fuchsia-500 to-pink-600' },
];

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
              <Sparkles className="mr-1 h-3 w-3" /> AI + Human Tutors · Voice Tutoring
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Learn Software with <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">AI Voice Tutoring</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground text-pretty">
              AI Tutor, Full Stack, .NET, Mobile Dev, Flutter, Python — learn with AI-powered voice tutoring in English, Hindi, Spanish, and more!
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
                <Mic className="mr-2 h-4 w-4" /> Talk to AI
              </Button>
            </div>
            <div className="mt-2 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search courses — e.g., AI, Java, Flutter, Python..." className="pl-10" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 pt-4">
              <Stat value="6" label="Career Tracks" />
              <Stat value="5+" label="Human Tutors" />
              <Stat value="🎙️" label="AI Voice Tutor" />
              <Stat value="24/7" label="AI Tutor" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-transparent blur-2xl" />
            <Card className="overflow-hidden border-border/60 shadow-2xl">
              <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs text-muted-foreground">marqai · Lesson 3 / Step 2</span>
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
                  <button onClick={() => setTutorOpen(true)} className="font-medium text-emerald-600 dark:text-emerald-400">Ask AI Tutor →</button>
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
              Join thousands of learners leveling up their careers with marqaicourses. Pick a course, follow the steps, ask the AI tutor, or book a human mentor.
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
                <Sparkles className="mr-2 h-4 w-4" /> Talk to AI Tutor
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- Registration to Certification flow ----
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

// ---- Corporate Training section ----
export function CorporateTraining() {
  const { openCorporate } = useAppStore();
  const corpFeatures = [
    { icon: BookOpen, title: 'Customized Courses', description: 'Tailor courses to your team\'s specific skills and goals.', color: 'from-blue-500 to-blue-600' },
    { icon: Users, title: 'AI Tutor for Employees', description: 'Provide 24/7 personalized support and feedback.', color: 'from-emerald-500 to-teal-600' },
    { icon: ClipboardCheck, title: 'AI Assessments & Feedback', description: 'Engage learners with interactive quizzes and real-time feedback.', color: 'from-purple-500 to-purple-600' },
    { icon: Award, title: 'Verified Certificates', description: 'Issue industry-recognized certificates upon completion.', color: 'from-amber-500 to-orange-600' },
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

// ---- Mobile App Promo ----
export function MobileAppPromo() {
  return (
    <section className="py-12 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
            <Smartphone className="h-8 w-8" />
          </span>
          <div>
            <h2 className="text-2xl font-bold">Learn anywhere with the MarqAI Courses app</h2>
            <p className="mt-2 text-muted-foreground">Download the app for iOS and Android. Access your courses, AI tutor, and certificates on the go.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
