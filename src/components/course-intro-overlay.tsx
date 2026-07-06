'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Sparkles, Clock, BookOpen, Target, ChevronDown, ChevronRight,
  Play, Volume2, Pause, CheckCircle2, GraduationCap, Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { findCourse, getAllLessons } from '@/lib/courses';
import { useAppStore } from '@/lib/store';
import { getTutorForCourse } from '@/lib/tutor-personas';
import type { Course, Lesson, Module, User } from '@/lib/types';

function useCurrentUser(): User | null {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);
  return useMemo(
    () => (currentUserId ? users.find((u) => u.id === currentUserId) ?? null : null),
    [currentUserId, users],
  );
}

// ============================================================
// CourseIntroOverlay
// ------------------------------------------------------------
// After admin approval and BEFORE the user starts the first
// lesson of a course, show this overlay:
//   1. AI tutor introduces itself (Indian English for India,
//      US English elsewhere) with voice-over
//   2. Course introduction (title, description, what it covers)
//   3. Benefits of learning this course (career outcomes,
//      skills gained, salary uplift, etc.)
//   4. Complete curriculum (all modules + lessons in a tree)
//   5. "Start Learning" button → enters Lesson 1
//
// Persistence: shown once per (user, course). After the user
// clicks "Start Learning", we record the dismissal in
// localStorage so they don't see it again for this course.
// ============================================================

const OVERLAY_SEEN_KEY = 'marq-ai-course-intro-seen';

function hasSeenIntro(userId: string | undefined, courseId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(OVERLAY_SEEN_KEY);
    const seen: Array<{ userId: string; courseId: string }> = raw ? JSON.parse(raw) : [];
    return seen.some((x) => x.userId === userId && x.courseId === courseId);
  } catch {
    return false;
  }
}

function markSeenIntro(userId: string | undefined, courseId: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(OVERLAY_SEEN_KEY);
    const seen: Array<{ userId: string; courseId: string }> = raw ? JSON.parse(raw) : [];
    if (!seen.some((x) => x.userId === userId && x.courseId === courseId)) {
      seen.push({ userId: userId || 'anon', courseId });
      window.localStorage.setItem(OVERLAY_SEEN_KEY, JSON.stringify(seen));
    }
  } catch {
    /* noop */
  }
}

// Voice selection — Indian English is the platform default.
// For Indian languages (hi, ta, te, kn) we look up the BCP-47 tag
// and fall back to name-based matching for Microsoft / Google voices.
function pickVoice(voices: SpeechSynthesisVoice[], _country: string): SpeechSynthesisVoice | undefined {
  if (!voices.length) return undefined;

  // 1. Exact en-IN match (Indian English is the platform default)
  const enInExact = voices.find((v) => v.lang === 'en-IN');
  if (enInExact) return enInExact;

  // 2. Case-insensitive en-IN match
  const enInCaseInsensitive = voices.find(
    (v) => v.lang.toLowerCase() === 'en-in',
  );
  if (enInCaseInsensitive) return enInCaseInsensitive;

  // 3. Microsoft / Google Indian English voices by name
  const indianEnglishNames = ['heera', 'ravi', 'microsoft ravi', 'google हिन्दी'];
  for (const hint of indianEnglishNames) {
    const byName = voices.find((v) => v.name.toLowerCase().includes(hint));
    // make sure it's an English voice, not Hindi
    if (byName && byName.lang.toLowerCase().startsWith('en')) return byName;
  }

  // 4. Any English voice (en-GB, en-AU, en-US — fallback)
  const anyEnglish = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
  if (anyEnglish) return anyEnglish;

  // 5. Fallback to any voice
  return voices[0];
}

// Script is constructed per-course so it mentions the course title,
// tutor name, and derived benefits.
interface IntroScript {
  greeting: string;
  intro: string;
  benefits: string;
  curriculum: string;
  start: string;
}

function buildScript(course: Course, tutorName: string, userName: string | undefined): IntroScript {
  const greetingName = userName ? userName.split(' ')[0] : 'learner';
  // Indian English is the platform default — always greet with "Namaste"
  const regionalHello = 'Namaste';

  return {
    greeting: `${regionalHello}, ${greetingName}! I'm ${tutorName}, your AI tutor for the ${course.title} course.`,
    intro: `Welcome to this ${course.duration} journey. ${course.description} By the end, you will have hands-on experience with ${course.tags.slice(0, 4).join(', ')} and a portfolio-worthy project to show employers.`,
    benefits: `Here's what you'll gain from this course: ${course.whatYouLearn.slice(0, 4).join('; ')}. ${course.level === 'Beginner' ? 'This course is designed for complete beginners — no prior experience needed.' : 'This course is designed for learners who already know the basics and want to level up.'} You'll earn a shareable certificate, build real projects, and join a community of ${course.studentsCount} fellow learners.`,
    curriculum: `The course is organized into ${course.modules.length} modules covering ${course.lessonsCount} lessons total. Each lesson includes step-by-step guided examples, an interactive code cell where you can practice, and a short quiz to test your understanding. Let me walk you through the complete curriculum on your screen now.`,
    start: `When you're ready, click the Start Learning button and we'll dive into Module 1, Lesson 1. Don't worry if something feels hard — I'll be right here with you the entire time. Let's begin!`,
  };
}

interface CourseIntroOverlayProps {
  courseId: string;
  onStart: () => void;
}

export function CourseIntroOverlay({ courseId, onStart }: CourseIntroOverlayProps) {
  const course = findCourse(courseId);
  const currentUser = useCurrentUser();
  const tutor = getTutorForCourse(courseId);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [spokenIdx, setSpokenIdx] = useState(-1); // which line is being spoken
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(course?.modules[0]?.id ? [course.modules[0].id] : []));

  const script = useMemo<IntroScript | null>(() => {
    if (!course) return null;
    return buildScript(course, tutor.name, currentUser?.name);
  }, [course, tutor.name, currentUser?.name]);

  // Load voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const refresh = () => setVoices(window.speechSynthesis.getVoices());
    refresh();
    window.speechSynthesis.onvoiceschanged = refresh;
    return () => {
      try { window.speechSynthesis.cancel(); } catch { /* noop */ }
    };
  }, []);

  // Look up preferred voice (Indian English by default)
  const preferredVoice = useMemo(
    () => pickVoice(voices, currentUser?.locale?.country || 'IN'),
    [voices, currentUser?.locale?.country],
  );

  // playScript is also called from a "Play" button in the UI, so it must
  // be a stable callback. Defined here (before the early return) to
  // satisfy the rules of hooks. The body guards against null script.
  const playScript = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !script) return;
    try { window.speechSynthesis.cancel(); } catch { /* noop */ }
    setIsPlaying(true);
    setIsPaused(false);

    const allLines = [
      script.greeting,
      script.intro,
      script.benefits,
      script.curriculum,
      script.start,
    ];

    allLines.forEach((line, idx) => {
      const u = new SpeechSynthesisUtterance(line);
      if (preferredVoice) {
        u.voice = preferredVoice;
        u.lang = preferredVoice.lang;
      } else {
        u.lang = 'en-IN'; // Indian English is the platform default
      }
      u.rate = (tutor.speed || 0.95) * 0.9; // slightly slower for clarity
      u.pitch = 1.0;
      u.onstart = () => setSpokenIdx(idx);
      u.onend = () => {
        if (idx === allLines.length - 1) {
          setIsPlaying(false);
          setSpokenIdx(-1);
        }
      };
      window.speechSynthesis.speak(u);
    });
  }, [script, preferredVoice, tutor.speed]);

  // Auto-start speaking when component mounts
  useEffect(() => {
    if (!script || !voices.length) return;
    // Slight delay to let the overlay animate in
    const t = setTimeout(() => playScript(), 600);
    return () => {
      clearTimeout(t);
      try { window.speechSynthesis.cancel(); } catch { /* noop */ }
    };
  }, [script, voices, playScript]);

  if (!course || !script) return null;

  const lines = [
    script.greeting,
    script.intro,
    script.benefits,
    script.curriculum,
    script.start,
  ];

  function pauseSpeech() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }

  function stopSpeech() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try { window.speechSynthesis.cancel(); } catch { /* noop */ }
    setIsPlaying(false);
    setIsPaused(false);
    setSpokenIdx(-1);
  }

  function handleStart() {
    stopSpeech();
    markSeenIntro(currentUser?.id, courseId);
    onStart();
  }

  function toggleModule(id: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Find first lesson to start
  const firstModule = course.modules[0];
  const firstLesson = firstModule?.lessons[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="relative max-h-[92vh] w-full max-w-5xl overflow-hidden">
        {/* Tutor header */}
        <div className={`flex items-center justify-between bg-gradient-to-r ${tutor.avatarGradient} p-5 text-white`}>
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 backdrop-blur text-2xl font-bold">
              {tutor.initial}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-white/80">
                🇮🇳 Indian English · AI Tutor Introduction
              </p>
              <h2 className="text-xl font-bold leading-tight">{tutor.name}</h2>
              <p className="text-sm text-white/85">{tutor.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <Button size="sm" variant="secondary" onClick={playScript}>
                <Volume2 className="mr-1.5 h-4 w-4" /> Play intro
              </Button>
            ) : (
              <>
                <Button size="sm" variant="secondary" onClick={pauseSpeech}>
                  {isPaused ? <Play className="mr-1.5 h-4 w-4" /> : <Pause className="mr-1.5 h-4 w-4" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button size="sm" variant="secondary" onClick={stopSpeech}>
                  Stop
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="max-h-[calc(92vh-180px)] overflow-y-auto p-6">
          {/* SECTION 1: Course Introduction */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-lg font-bold">Course Introduction</h3>
            </div>
            <div
              className={`rounded-xl border p-4 transition-colors ${
                spokenIdx === 0 || spokenIdx === 1
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-border bg-muted/30'
              }`}
            >
              <h4 className="text-xl font-bold">{course.title}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{course.subtitle}</p>
              <p className="mt-3 text-sm leading-relaxed">
                {script.intro}
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs">
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> {course.duration}
                </span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" /> {course.lessonsCount} lessons
                </span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Target className="h-3.5 w-3.5" /> {course.level}
                </span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <GraduationCap className="h-3.5 w-3.5" /> {course.studentsCount} learners
                </span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Globe className="h-3.5 w-3.5" /> {course.language || 'English'}
                </span>
              </div>
            </div>
          </section>

          {/* SECTION 2: Benefits of Learning */}
          <section className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-lg font-bold">What You&apos;ll Gain from This Course</h3>
            </div>
            <div
              className={`rounded-xl border p-4 transition-colors ${
                spokenIdx === 2
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-border bg-muted/30'
              }`}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {course.whatYouLearn.slice(0, 8).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(course.skills || []).slice(0, 8).map((skill) => (
                  <Badge key={skill} variant="secondary" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    {skill}
                  </Badge>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(course.tools || []).slice(0, 8).map((tool) => (
                  <Badge key={tool} variant="outline" className="text-xs">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 3: Complete Curriculum */}
          <section className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-lg font-bold">Complete Curriculum</h3>
              <Badge variant="secondary" className="ml-1">{course.modules.length} modules · {course.lessonsCount} lessons</Badge>
            </div>
            <div
              className={`rounded-xl border p-4 transition-colors ${
                spokenIdx === 3
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-border bg-muted/30'
              }`}
            >
              <div className="space-y-2">
                {course.modules.map((mod: Module, modIdx: number) => {
                  const isExpanded = expandedModules.has(mod.id);
                  return (
                    <div key={mod.id} className="rounded-lg border bg-card">
                      <button
                        type="button"
                        onClick={() => toggleModule(mod.id)}
                        className="flex w-full items-center justify-between p-3 text-left hover:bg-muted/40"
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/15 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            {modIdx + 1}
                          </span>
                          <div>
                            <p className="font-semibold">{mod.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {mod.lessons.length} lesson{mod.lessons.length !== 1 ? 's' : ''}
                              {mod.description ? ` · ${mod.description.slice(0, 80)}${mod.description.length > 80 ? '…' : ''}` : ''}
                            </p>
                          </div>
                        </div>
                      </button>
                      {isExpanded && (
                        <ul className="divide-y border-t">
                          {mod.lessons.map((lesson: Lesson, lIdx: number) => (
                            <li key={lesson.id} className="flex items-start gap-3 p-3 text-sm">
                              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                                {lIdx + 1}
                              </span>
                              <div className="flex-1">
                                <p className="font-medium">{lesson.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {lesson.duration}
                                  {lesson.lessonType ? ` · ${lesson.lessonType}` : ''}
                                  {lesson.skills && lesson.skills.length > 0 ? ` · ${lesson.skills.slice(0, 3).join(', ')}` : ''}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* Footer with Start button */}
        <div className="border-t bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              {spokenIdx >= 0
                ? `AI tutor is speaking… (line ${spokenIdx + 1} of ${lines.length})`
                : 'AI tutor ready · click Start Learning when you\'re ready'}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={handleStart} className="text-muted-foreground">
                Skip intro
              </Button>
              <Button
                onClick={handleStart}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Learning
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Re-export for use in lesson-view
export { hasSeenIntro, markSeenIntro, OVERLAY_SEEN_KEY };
