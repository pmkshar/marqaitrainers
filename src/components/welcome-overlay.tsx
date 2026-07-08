'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sparkles,
  Play,
  Pause,
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
  Volume2,
  RotateCcw,
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

// ============================================================
// WelcomeIntroVideo — AI tutor introduction with voice narration
// ============================================================

const INTRO_SCRIPT = [
  "Hello! I am Marq AI, your personal AI Software Tutor on MarqAI Courses.",
  "I will guide you through every lesson — explaining concepts, writing code, and answering your questions 24/7.",
  "Our platform offers 6 career-track courses in AI, Java, .NET, Python, React Native, and Flutter — each with video walkthroughs, graded quizzes, and verified certificates.",
  "You can learn in English, Hindi, Tamil, Telugu, and more languages with my AI voice tutoring.",
  "I also conduct mock interviews to help you prepare for real job opportunities.",
  "Ready to start? Sign up, explore our courses, and let me be your learning companion. Let's begin!",
];

function WelcomeIntroVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeLine, setActiveLine] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [voicesReady, setVoicesReady] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const cancelRef = useRef(false);
  const utterancesRef = useRef<SpeechSynthesisUtterance[]>([]);
  const voicesRetryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load voices: wait for voiceschanged event, with a fallback timeout
  useEffect(() => {
    if (!supported) {
      setSpeechError('Speech is not supported in this browser.');
      return;
    }

    const checkVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoicesReady(true);
      }
    };

    // Check immediately (voices may already be cached)
    checkVoices();

    // Listen for voiceschanged (fires when voices finish loading)
    const handleVoicesChanged = () => {
      checkVoices();
    };
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

    // Fallback: some browsers don't fire voiceschanged, so retry after a delay
    voicesRetryRef.current = setTimeout(() => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoicesReady(true);
      } else {
        // Even if still empty, mark as ready after timeout so user can try
        setVoicesReady(true);
      }
    }, 1500);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      if (voicesRetryRef.current) clearTimeout(voicesRetryRef.current);
    };
  }, [supported]);

  const stopSpeech = useCallback(() => {
    cancelRef.current = true;
    try { window.speechSynthesis.cancel(); } catch {}
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const speak = useCallback(() => {
    if (!supported) {
      setSpeechError('Speech is not supported in this browser.');
      return;
    }

    // Ensure voices are loaded before speaking
    const voices = window.speechSynthesis.getVoices();
    // If still no voices, try waiting briefly
    if (voices.length === 0) {
      setSpeechError('Loading voices... please try again in a moment.');
      // Trigger a voiceschanged listener attempt
      const handleVoices = () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoices);
        setSpeechError(null);
        setVoicesReady(true);
      };
      window.speechSynthesis.addEventListener('voiceschanged', handleVoices);
      return;
    }

    setSpeechError(null);
    stopSpeech();
    cancelRef.current = false;
    setIsPlaying(true);
    setIsPaused(false);
    setActiveLine(0);
    setProgress(0);

    const enIN = voices.find(v => v.lang === 'en-IN') ?? voices.find(v => v.lang.startsWith('en')) ?? null;

    utterancesRef.current = [];
    INTRO_SCRIPT.forEach((text, idx) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-IN';
      u.rate = 0.95;
      u.pitch = 1.0;
      if (enIN) u.voice = enIN;
      u.onstart = () => {
        if (!cancelRef.current) {
          setActiveLine(idx);
          setProgress(((idx) / INTRO_SCRIPT.length) * 100);
        }
      };
      u.onend = () => {
        if (!cancelRef.current) {
          setProgress(((idx + 1) / INTRO_SCRIPT.length) * 100);
          if (idx === INTRO_SCRIPT.length - 1) {
            setIsPlaying(false);
            setActiveLine(-1);
          }
        }
      };
      u.onerror = (e) => {
        if (!cancelRef.current) {
          setSpeechError('Speech playback encountered an error. Please try again.');
        }
        setIsPlaying(false);
        setIsPaused(false);
      };
      utterancesRef.current.push(u);
      window.speechSynthesis.speak(u);
    });

    // Chrome bug workaround: speechSynthesis can pause if tab is in background.
    // Periodically call resume() to keep it going.
    const keepAlive = setInterval(() => {
      if (cancelRef.current || !window.speechSynthesis.speaking) {
        clearInterval(keepAlive);
        return;
      }
      window.speechSynthesis.resume();
    }, 5000);
  }, [supported, stopSpeech]);

  const pauseResume = useCallback(() => {
    if (!isPlaying) return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPlaying, isPaused]);

  useEffect(() => {
    return () => {
      cancelRef.current = true;
      try { window.speechSynthesis.cancel(); } catch {}
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10">
      {/* Video-like player area */}
      <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-emerald-900/20 via-teal-900/10 to-cyan-900/20 relative">
        {/* Avatar circle */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
              <Brain className="h-10 w-10" />
            </div>
            {isPlaying && !isPaused && (
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/30" />
            )}
            {isPlaying && !isPaused && (
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px]">
                <Mic className="h-3 w-3" />
              </span>
            )}
          </div>
          <div>
            <p className="font-bold text-foreground text-lg">Marq AI Tutor</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isPlaying && !isPaused ? 'Speaking...' : isPaused ? 'Paused' : 'Click play to hear the introduction'}
            </p>
          </div>
        </div>

        {/* Subtitle overlay */}
        {isPlaying && activeLine >= 0 && (
          <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-black/70 px-3 py-2 backdrop-blur-sm">
            <p className="text-sm text-white leading-relaxed">{INTRO_SCRIPT[activeLine]}</p>
          </div>
        )}

        {/* Progress bar */}
        {isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div
              className="h-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Speech error message */}
      {speechError && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800">
          <span className="text-xs text-amber-700 dark:text-amber-400">{speechError}</span>
          <button
            onClick={() => setSpeechError(null)}
            className="ml-auto text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Player controls */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-card/80 border-t">
        {!isPlaying ? (
          <Button onClick={speak} disabled={!supported || !voicesReady} size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50">
            <Play className="mr-1.5 h-4 w-4" />
            {voicesReady ? 'Play Introduction' : 'Loading Voices...'}
          </Button>
        ) : (
          <Button onClick={pauseResume} size="sm" variant="outline" className="border-emerald-500/30">
            {isPaused ? <Play className="mr-1.5 h-4 w-4" /> : <Pause className="mr-1.5 h-4 w-4" />}
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
        )}
        {isPlaying && (
          <Button onClick={stopSpeech} size="sm" variant="outline">
            <X className="mr-1 h-4 w-4" /> Stop
          </Button>
        )}
        {isPlaying && (
          <Button onClick={speak} size="sm" variant="ghost">
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
        <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <Volume2 className="h-3.5 w-3.5" />
          <span>{activeLine + 1}/{INTRO_SCRIPT.length}</span>
        </div>
      </div>

      {/* Decorative gradient border effect */}
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-emerald-500/10 pointer-events-none" />
    </div>
  );
}

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
          {/* AI Tutor Introduction Video */}
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Video className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-bold">Meet Marq AI Tutor</h2>
            </div>
            <WelcomeIntroVideo />
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
                  MP
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed text-foreground/90 italic">
                    &ldquo;Welcome to MarqAI Courses! I founded this platform with a simple vision — to make world-class software education accessible to every learner in India and beyond. Our AI-powered tutoring system ensures that you never learn alone. Whether you are a fresh graduate or a working professional looking to upskill, MarqAI is built to guide you every step of the way. Your success is our mission.&rdquo;
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      Mahesh Kumar Parvathareddy
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
