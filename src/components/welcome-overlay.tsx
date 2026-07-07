'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Play,
  X,
  BookOpen,
  GraduationCap,
  Mic,
  Users,
  CreditCard,
  Clock,
  Code2,
  MessageSquare,
  Brain,
  Zap,
  ChevronRight,
  Quote,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';

// ============================================================
// WelcomeOverlay
// ------------------------------------------------------------
// Full-screen overlay shown to first-time visitors.
// Persists dismissal in localStorage under 'marqai_welcomed'.
// ============================================================

const WELCOME_KEY = 'marqai_welcomed';

function hasBeenWelcomed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(WELCOME_KEY) === 'true';
  } catch {
    return false;
  }
}

function markWelcomed(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(WELCOME_KEY, 'true');
  } catch {
    /* noop */
  }
}

// Advantages data
const ADVANTAGES = [
  { icon: Mic, label: 'AI Voice Tutoring in 5+ Languages', color: 'from-emerald-500 to-teal-600' },
  { icon: GraduationCap, label: '6 Career-Track Courses with Verified Certificates', color: 'from-amber-500 to-orange-600' },
  { icon: Code2, label: 'Step-by-Step Code Walkthroughs', color: 'from-violet-500 to-purple-600' },
  { icon: Brain, label: '24/7 AI Interview Practice', color: 'from-rose-500 to-pink-600' },
  { icon: Users, label: 'Human Tutor Sessions Available', color: 'from-sky-500 to-cyan-600' },
  { icon: BookOpen, label: 'Corporate Training Programs', color: 'from-fuchsia-500 to-pink-600' },
  { icon: Clock, label: 'Learn at Your Own Pace', color: 'from-teal-500 to-emerald-600' },
  { icon: CreditCard, label: 'Affordable Pricing with Flexible Plans', color: 'from-cyan-500 to-sky-600' },
];

interface WelcomeOverlayProps {
}

export function WelcomeOverlay(_props?: WelcomeOverlayProps) {
  const openCourses = useAppStore((s) => s.openCourses);
  const setAuthOpen = useAppStore((s) => s.setAuthOpen);
  const [visible, setVisible] = useState(false);
  const [animated, setAnimated] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    if (!hasBeenWelcomed()) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        setVisible(true);
        // Trigger entrance animation after mount
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setAnimated(true);
          });
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = useCallback(() => {
    setAnimated(false);
    setTimeout(() => {
      setVisible(false);
      markWelcomed();
    }, 300);
  }, []);

  const handleStartLearning = useCallback(() => {
    setAnimated(false);
    setTimeout(() => {
      setVisible(false);
      markWelcomed();
      openCourses();
    }, 300);
  }, [openCourses]);

  const handleSignIn = useCallback(() => {
    setAnimated(false);
    setTimeout(() => {
      setVisible(false);
      markWelcomed();
      setAuthOpen(true, 'login');
    }, 300);
  }, [setAuthOpen]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to MarqAI Courses"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${
          animated ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Card */}
      <div
        className={`relative z-10 w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-2xl bg-card shadow-2xl transition-all duration-500 ease-out ${
          animated
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-6'
        }`}
      >
        {/* ===== Header gradient bar ===== */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 px-6 py-8 text-white sm:px-8 sm:py-10">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -left-6 -bottom-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute right-1/3 top-1/4 h-20 w-20 rounded-full bg-white/5" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/15 p-2 backdrop-blur-sm transition-colors hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label="Close welcome overlay"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Logo & greeting */}
          <div className="relative flex flex-col items-center text-center">
            {/* MarqAI Logo */}
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg ring-1 ring-white/20 sm:h-20 sm:w-20">
              <Sparkles className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <div className="flex items-center gap-2 text-emerald-100">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold uppercase tracking-widest">
                Welcome to MarqAI Courses
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
              Your AI-Powered Learning Journey Starts Here
            </h1>
            <p className="mt-2 max-w-lg text-sm text-white/85 sm:text-base">
              World-class software education, guided by AI — accessible to every learner in India and beyond.
            </p>
          </div>
        </div>

        {/* ===== Scrollable body ===== */}
        <div className="max-h-[calc(92vh-320px)] overflow-y-auto p-6 sm:p-8">
          {/* Introduction video placeholder */}
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Video className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-bold">Meet Your AI Tutor</h2>
            </div>
            <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-muted/50 to-muted/30">
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                    <Play className="h-7 w-7 ml-1" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Marq AI Tutor Introduction</p>
                    <p className="text-xs text-muted-foreground mt-1">Watch a 2-min overview of your AI-powered learning companion</p>
                  </div>
                </div>
              </div>
              {/* Decorative gradient border effect */}
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-emerald-500/10" />
            </div>
          </section>

          {/* Founder's Note */}
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Quote className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-bold">A Note from Our Founder</h2>
            </div>
            <div className="rounded-xl border bg-muted/30 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white shadow-sm">
                  MR
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed text-foreground/90 italic">
                    &ldquo;Welcome to MarqAI Courses! I founded this platform with a simple vision — to make world-class software education accessible to every learner in India and beyond. Our AI-powered tutoring system ensures that you never learn alone. Whether you are a fresh graduate or a working professional looking to upskill, MarqAI is built to guide you every step of the way. Your success is our mission.&rdquo;
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      Marq Rajkumar
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <p className="mt-1 text-center text-xs text-muted-foreground">
                    Founder &amp; CEO, MarqAI Tech Pvt Ltd
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Marq AI Tutor's Note */}
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-bold">Meet Marq AI Tutor</h2>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-lg text-white shadow-sm">
                  <Brain className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed text-foreground/90">
                    &ldquo;Hi! I&apos;m your Marq AI Tutor, available 24/7 to help you learn. I can explain concepts, write code with you, quiz your knowledge, and even conduct mock interviews — all in your preferred language. Think of me as your personal mentor who never sleeps!&rdquo;
                  </p>
                  <div className="mt-3">
                    <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                      <Zap className="mr-1 h-3 w-3" />
                      Marq AI Tutor
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Advantages */}
          <section className="mb-2">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-bold">Why Learn with MarqAI?</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {ADVANTAGES.map((adv) => {
                const Icon = adv.icon;
                return (
                  <div
                    key={adv.label}
                    className="group flex items-start gap-3 rounded-xl border bg-card p-3.5 transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/5"
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${adv.color} text-white shadow-sm transition-transform group-hover:scale-110`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium leading-snug pt-1.5">
                      {adv.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* ===== Footer with CTAs ===== */}
        <div className="border-t bg-card p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground hidden sm:block">
              <Sparkles className="mr-1 inline-block h-3.5 w-3.5 text-emerald-500" />
              Start your journey — it&apos;s free to explore
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <Button
                variant="ghost"
                onClick={handleClose}
                className="text-muted-foreground order-2 sm:order-1"
              >
                Skip for Now
              </Button>
              <Button
                variant="outline"
                onClick={handleSignIn}
                className="order-1 sm:order-2 border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
              >
                Sign In
              </Button>
              <Button
                onClick={handleStartLearning}
                className="order-0 sm:order-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg hover:shadow-emerald-500/30"
                size="lg"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Learning
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
