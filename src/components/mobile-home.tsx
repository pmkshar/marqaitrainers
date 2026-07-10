'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import {
  ArrowRight, PlayCircle, Sparkles, BookOpen, Video,
  FileQuestion, MessageSquare, Users, CreditCard, Mic,
  ChevronRight, Clock, Star, Search, Brain, GraduationCap,
  Building2, Target, ShoppingBag, Zap, TrendingUp, Award,
  Headphones, Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store';
import { COURSES } from '@/lib/courses';
import { CourseIcon } from './navbar';
import { cn } from '@/lib/utils';

// ============================================================
// Mobile Home — App-like Home Feed
// ============================================================

// Story items at the top
const STORIES = [
  { id: 'marqai', label: 'MarqAI', emoji: '🎙️', color: 'from-purple-500 to-pink-500', action: 'tutor' },
  { id: 'new', label: "What's New", emoji: '🆕', color: 'from-amber-500 to-orange-500', action: 'courses' },
  { id: 'interview', label: 'AI Interview', emoji: '🎯', color: 'from-rose-500 to-pink-500', action: 'interview' },
  { id: 'certificate', label: 'Certificates', emoji: '🏆', color: 'from-emerald-500 to-teal-500', action: 'certs' },
  { id: 'corporate', label: 'Corporate', emoji: '🏢', color: 'from-sky-500 to-cyan-500', action: 'corporate' },
];

// Quick action buttons
const QUICK_ACTIONS = [
  { icon: Mic, label: 'Ask MarqAI', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400', action: 'tutor' },
  { icon: Video, label: 'AI Interview', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400', action: 'interview' },
  { icon: ShoppingBag, label: 'Buy Course', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400', action: 'pricing' },
  { icon: Building2, label: 'Corporate', color: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400', action: 'corporate' },
];

export function MobileHome() {
  const {
    openCourse, setTutorOpen, openPricing, openCorporate, setAuthOpen,
    currentUser, completedLessons, openMyLearning, openCourses
  } = useAppStore();

  const user = currentUser();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleStoryPress = (action: string) => {
    switch (action) {
      case 'tutor': setTutorOpen(true); break;
      case 'courses': openCourses(); break;
      case 'interview': useAppStore.getState().openAiInterview?.(); break;
      case 'certs': useAppStore.getState().openCertificates?.(); break;
      case 'corporate': openCorporate(); break;
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'tutor': setTutorOpen(true); break;
      case 'interview': useAppStore.getState().openAiInterview(); break;
      case 'pricing': openPricing(); break;
      case 'corporate': openCorporate(); break;
    }
  };

  return (
    <div className="animate-page-enter">
      {/* ── Welcome Banner ─────────── */}
      <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 px-4 pt-5 pb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm font-medium">
              {user ? `Hey, ${user.name.split(' ')[0]}! 👋` : 'Welcome to MarqAI! 🎓'}
            </p>
            <h1 className="text-2xl font-bold mt-1 leading-tight">
              {user ? 'Continue Learning' : 'Start Your Journey'}
            </h1>
          </div>
          <img src="/marqai-logo.svg" alt="" className="h-12 w-12 rounded-xl bg-white/20 p-2" />
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="rounded-xl bg-white/15 backdrop-blur px-3 py-2 text-center">
            <p className="text-lg font-bold">{COURSES.length}</p>
            <p className="text-[10px] text-emerald-100">Courses</p>
          </div>
          <div className="rounded-xl bg-white/15 backdrop-blur px-3 py-2 text-center">
            <p className="text-lg font-bold">24/7</p>
            <p className="text-[10px] text-emerald-100">AI Tutor</p>
          </div>
          <div className="rounded-xl bg-white/15 backdrop-blur px-3 py-2 text-center">
            <p className="text-lg font-bold">{completedLessons?.length ?? 0}</p>
            <p className="text-[10px] text-emerald-100">Completed</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
          <button
            onClick={openCourses}
            className="w-full h-10 rounded-xl bg-white/15 backdrop-blur pl-10 pr-4 text-left text-sm text-white/70 placeholder:text-white/50"
          >
            Search courses — AI, Java, Flutter, Python...
          </button>
        </div>
      </div>

      {/* ── Stories Row ───────────── */}
      <div className="px-4 -mt-4">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2" ref={scrollRef}>
          {STORIES.map((story) => (
            <button
              key={story.id}
              onClick={() => handleStoryPress(story.action)}
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <div className={cn(
                'grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br p-[3px]',
                story.color
              )}>
                <div className="grid h-full w-full place-items-center rounded-full bg-background text-2xl">
                  {story.emoji}
                </div>
              </div>
              <span className="text-[10px] font-medium text-muted-foreground max-w-[64px] truncate">{story.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Quick Actions ─────────── */}
      <div className="px-4 mt-5">
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action.action)}
              className="flex flex-col items-center gap-2 rounded-2xl p-3 active:scale-95 transition-transform"
            >
              <div className={cn('grid h-12 w-12 place-items-center rounded-2xl', action.color)}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Continue Learning ─────── */}
      {user && user.enrolledCourseIds.length > 0 && (
        <div className="px-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Continue Learning</h2>
            <button onClick={openMyLearning} className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              See all <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {COURSES.filter(c => user.enrolledCourseIds.includes(c.id)).slice(0, 4).map((course) => {
              const allLessons = COURSES.find(c => c.id === course.id)?.modules.flatMap(m => m.lessons) ?? [];
              const done = allLessons.filter(l => completedLessons?.includes(l.id)).length;
              const pct = allLessons.length ? Math.round((done / allLessons.length) * 100) : 0;
              return (
                <button
                  key={course.id}
                  onClick={() => openCourse(course.id)}
                  className="shrink-0 w-[260px] rounded-2xl border bg-card overflow-hidden active:scale-[0.98] transition-transform text-left"
                >
                  <div className={cn('h-24 bg-gradient-to-br flex items-center justify-center', course.gradient)}>
                    <CourseIcon name={course.icon} className="h-10 w-10 text-white/80" />
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm truncate">{course.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{done}/{allLessons.length} lessons</p>
                    <Progress value={pct} className="h-1.5 mt-2" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CTA for non-logged-in users ──── */}
      {!user && (
        <div className="px-4 mt-6">
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20">
            <CardContent className="p-5 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-emerald-600" />
              <h3 className="font-bold text-lg mt-2">Start Learning Free</h3>
              <p className="text-sm text-muted-foreground mt-1">
                AI voice tutor, step-wise lessons, certificates & more
              </p>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => setAuthOpen(true, 'register', 'candidate')}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                  size="sm"
                >
                  Sign Up Free
                </Button>
                <Button
                  onClick={() => setTutorOpen(true)}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-purple-300 text-purple-600 dark:text-purple-400"
                >
                  <Mic className="mr-1 h-3 w-3" /> Try MarqAI
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Popular Courses ───────── */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Popular Courses</h2>
          <button onClick={openCourses} className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
            All <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3">
          {COURSES.slice(0, 4).map((course, idx) => (
            <button
              key={course.id}
              onClick={() => openCourse(course.id)}
              className="w-full flex items-center gap-3 rounded-2xl border bg-card p-3 active:bg-muted/50 transition-colors text-left"
            >
              <div className={cn(
                'grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm',
                course.gradient
              )}>
                <CourseIcon name={course.icon} className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{course.title}</p>
                <p className="text-xs text-muted-foreground truncate">{course.subtitle}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-[9px]">{course.level}</Badge>
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" /> {course.duration}
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] text-amber-600">
                    <Star className="h-2.5 w-2.5 fill-amber-400" /> {course.rating}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Why MarqAI ────────────── */}
      <div className="px-4 mt-6 mb-4">
        <h2 className="text-lg font-bold mb-3">Why MarqAI Courses?</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Headphones, title: 'Voice Tutor', desc: 'Learn by listening in 5+ languages', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
            { icon: Award, title: 'Certificates', desc: 'Verified certs from MarqAI Tech', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
            { icon: Target, title: 'AI Interview', desc: 'Practice mock interviews with AI', color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30' },
            { icon: Smartphone, title: 'Mobile First', desc: 'Learn anywhere, anytime on phone', color: 'text-sky-600 bg-sky-100 dark:bg-sky-900/30' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border bg-card p-4">
              <div className={cn('grid h-10 w-10 place-items-center rounded-xl', item.color)}>
                <item.icon className="h-5 w-5" />
              </div>
              <p className="font-semibold text-sm mt-2">{item.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Corporate Training Banner ── */}
      <div className="px-4 mb-6">
        <button
          onClick={openCorporate}
          className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-600 p-5 text-white text-left active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8" />
            <div>
              <p className="font-bold">Corporate Training</p>
              <p className="text-sm text-sky-100">Custom courses for your team · AI-powered</p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm font-medium">
            Explore Plans <ArrowRight className="h-4 w-4" />
          </div>
        </button>
      </div>

      {/* Bottom spacer for tab bar */}
      <div className="h-4" />
    </div>
  );
}
