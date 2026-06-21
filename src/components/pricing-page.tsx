'use client';

import { ArrowLeft, Check, CreditCard, Sparkles, Calendar, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { COURSES } from '@/lib/courses';
import { PRICING_PLANS } from '@/lib/seed-data';
import { CourseIcon } from './navbar';

export function PricingPage() {
  const { goHome, openCourse, setTutorOpen, setAuthOpen, currentUser } = useAppStore();
  const user = currentUser();

  return (
    <div className="bg-background">
      {/* Header */}
      <section className="border-b bg-gradient-to-br from-emerald-50/60 to-background dark:from-emerald-950/20">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <button onClick={goHome} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </button>
          <div className="mt-4 max-w-2xl">
            <Badge variant="outline" className="mb-3 border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <CreditCard className="mr-1 h-3 w-3" /> Pricing
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Choose how you want to learn</h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Subscribe for unlimited all-access (monthly or annual) — or buy individual courses for lifetime access. Tutors book sessions à la carte.
            </p>
          </div>
        </div>
      </section>

      {/* Subscription plans */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-2xl font-bold tracking-tight">Subscription Plans</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <Card key={plan.id} className={`relative flex flex-col ${plan.highlighted ? 'border-emerald-500/60 shadow-xl ring-1 ring-emerald-500/30' : ''}`}>
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                  Most popular
                </Badge>
              )}
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-2">
                  {plan.model === 'subscription_monthly' && <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                  {plan.model === 'subscription_annual' && <RefreshCw className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                  {plan.model === 'one_time' && <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                </div>
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
                  onClick={() => (user ? openCourse(COURSES[0].id) : setAuthOpen(true, 'register', 'candidate'))}
                  className={`mt-6 w-full ${plan.highlighted ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700' : ''}`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  {plan.ctaLabel}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Per-course pricing */}
      <section className="bg-muted/30 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-2xl font-bold tracking-tight">Per-Course Pricing</h2>
            <Badge variant="secondary" className="ml-2">Lifetime access · 30-day money-back</Badge>
          </div>

          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="grid grid-cols-12 gap-2 border-b bg-muted/40 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="col-span-5">Course</div>
              <div className="col-span-2 text-center">One-Time</div>
              <div className="col-span-2 text-center">Monthly</div>
              <div className="col-span-2 text-center">Annual</div>
              <div className="col-span-1 text-right">Action</div>
            </div>
            {COURSES.map((c, i) => (
              <div key={c.id} className={`grid grid-cols-12 items-center gap-2 px-5 py-4 ${i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}>
                <div className="col-span-5 flex items-center gap-3">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${c.gradient} text-white`}>
                    <CourseIcon name={c.icon} className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.level} · {c.duration}</p>
                  </div>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-sm font-bold">${c.oneTimePrice}</span>
                  <p className="text-[10px] text-muted-foreground">lifetime</p>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-sm font-medium">${c.monthlyPrice}</span>
                  <p className="text-[10px] text-muted-foreground">/ month</p>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-sm font-medium">${c.annualPrice}</span>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400">save ~20%</p>
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => openCourse(c.id)}>View</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tutor sessions */}
      <section className="bg-background py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="overflow-hidden border-sky-500/30">
            <CardContent className="grid gap-6 p-8 lg:grid-cols-[2fr_1fr]">
              <div>
                <Badge variant="outline" className="mb-2 border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300">
                  À la carte
                </Badge>
                <h2 className="text-2xl font-bold tracking-tight">Human Tutor Sessions</h2>
                <p className="mt-2 text-muted-foreground">
                  Book 1:1 video sessions with vetted human tutors. Pay per session — no subscription required.
                  Sessions range from <span className="font-semibold">$50–$95/hour</span> based on the tutor&apos;s expertise and ratings.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Live video + chat with the tutor</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Cancel free up to 24h before</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Money-back if session is unsatisfactory</li>
                </ul>
              </div>
              <div className="flex flex-col justify-center gap-3 rounded-xl bg-muted/40 p-5 text-center">
                <ShieldCheck className="mx-auto h-10 w-10 text-sky-500" />
                <p className="text-sm font-medium">All tutors vetted by Super Admin</p>
                <Button onClick={() => useAppStore.getState().openTutors()} className="bg-gradient-to-r from-sky-500 to-cyan-600 text-white hover:from-sky-600 hover:to-cyan-700">
                  Browse tutors
                </Button>
                <Button onClick={() => setTutorOpen(true)} variant="outline" size="sm">Or ask the AI tutor</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
