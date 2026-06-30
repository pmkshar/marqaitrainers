'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, ArrowRight, Bot, CheckCircle2, ChevronLeft, ChevronRight,
  Clock, GraduationCap, HelpCircle, Lightbulb, Loader2, MessageSquare,
  Pause, Play, RefreshCw, Send, Sparkles, Volume2, XCircle,
  Captions, Lock, Trophy, ListChecks, MessagesSquare, Mic, Square,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Course, Lesson, Module } from '@/lib/types';
import { getTutorForCourse, type TutorPersona } from '@/lib/tutor-personas';
import { getAllLessons } from '@/lib/courses';
import { useAppStore } from '@/lib/store';

// ============================================================
// VoiceEnabledChapterTutor  (v3 — June 2026 redesign)
// ------------------------------------------------------------
// Two-panel layout:
//   LEFT  = Animated tutor avatar (big) + voice controls
//   RIGHT = Course content (slides, teaching, Q&A)
//
// Key fixes in v3:
//   - AbortController for reliable stop/cancel
//   - Google Translate TTS fallback for Indian languages
//   - Course-switch cleanup (clears stale cache)
//   - Gender-aware voice selection
//   - Animated speaking tutor avatar
// ============================================================

interface VoiceChapterTutorProps {
  course: Course;
  module: Module;
  lesson: Lesson;
  onComplete?: (scorePct: number) => void;
  onAskTutor?: () => void;
  onNextLesson?: () => void;
  hasNextLesson?: boolean;
}

type Stage = 'slides' | 'chapter_test' | 'result';

interface SlideTeaching {
  explanation: string;
  example: string;
  pitfall: string;
  checkQuestion: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
}

interface QAHistoryItem {
  slideIdx: number;
  slideTitle: string;
  question: string;
  answer: string;
  askedAt: number;
}

function parseDurationMinutes(duration: string): number {
  const hMatch = duration.match(/(\d+)\s*h/i);
  const mMatch = duration.match(/(\d+)\s*min/i);
  const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
  const mins = mMatch ? parseInt(mMatch[1], 10) : 0;
  if (hours === 0 && mins === 0) {
    const n = parseInt(duration, 10);
    return isNaN(n) ? 30 : n;
  }
  return hours * 60 + mins;
}

// Strip markdown to plain spoken text
function toSpokenText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' (code block) ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ============================================================
// Google Translate TTS fallback for Indian languages
// ============================================================
function playGoogleTTS(text: string, lang: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const bcp47Map: Record<string, string> = {
      en: 'en', hi: 'hi', ta: 'ta', te: 'te', kn: 'kn',
      es: 'es', fr: 'fr', de: 'de', pt: 'pt', ar: 'ar', zh: 'zh-CN',
    };
    const ttsLang = bcp47Map[lang] ?? lang;

    const MAX_LEN = 180;
    const chunks: string[] = [];
    let remaining = text;
    while (remaining.length > 0) {
      if (remaining.length <= MAX_LEN) {
        chunks.push(remaining);
        break;
      }
      let cutIdx = remaining.lastIndexOf('.', MAX_LEN);
      if (cutIdx < MAX_LEN * 0.4) cutIdx = remaining.lastIndexOf(' ', MAX_LEN);
      if (cutIdx < MAX_LEN * 0.4) cutIdx = MAX_LEN;
      chunks.push(remaining.slice(0, cutIdx + 1));
      remaining = remaining.slice(cutIdx + 1).trim();
    }

    let chunkIdx = 0;

    function playNext() {
      if (chunkIdx >= chunks.length) {
        resolve();
        return;
      }
      const chunk = chunks[chunkIdx];
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${ttsLang}&client=tw-ob`;
      const audio = new Audio(url);
      audio.onended = () => {
        chunkIdx++;
        playNext();
      };
      audio.onerror = () => {
        resolve();
      };
      audio.play().catch(() => resolve());
    }

    playNext();
  });
}

function browserHasVoiceForLang(lang: string): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  const voices = window.speechSynthesis.getVoices();
  const prefix = lang.toLowerCase();
  return voices.some(v => v.lang.toLowerCase().startsWith(prefix));
}

// ============================================================
// ANIMATED TUTOR AVATAR — SVG with speaking animation
// ============================================================
function AnimatedTutorAvatar({
  tutor,
  isSpeaking,
  size = 'large',
}: {
  tutor: TutorPersona;
  isSpeaking: boolean;
  size?: 'large' | 'small';
}) {
  const isFemale = tutor.gender === 'female';
  const isLarge = size === 'large';
  const w = isLarge ? 200 : 48;
  const h = isLarge ? 200 : 48;

  return (
    <div className={`relative ${isLarge ? 'w-[200px] h-[200px]' : 'w-12 h-12'}`}>
      <svg viewBox="0 0 200 200" width={w} height={h} className="drop-shadow-lg">
        <defs>
          <linearGradient id={`grad-${tutor.initial}`} x1="0%" y1="0%" x2="100%" y2="100%">
            {isFemale ? (
              <>
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#0d9488" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#6366f1" />
              </>
            )}
          </linearGradient>
        </defs>

        <circle cx="100" cy="100" r="95" fill={`url(#grad-${tutor.initial})`} />
        <circle cx="100" cy="85" r="50" fill="#f5d0a9" />

        {isFemale ? (
          <>
            <ellipse cx="100" cy="65" rx="55" ry="40" fill="#1a1a2e" />
            <ellipse cx="55" cy="95" rx="15" ry="35" fill="#1a1a2e" />
            <ellipse cx="145" cy="95" rx="15" ry="35" fill="#1a1a2e" />
            <circle cx="130" cy="55" r="6" fill="#f59e0b" />
          </>
        ) : (
          <>
            <ellipse cx="100" cy="60" rx="52" ry="30" fill="#2d1810" />
          </>
        )}

        <ellipse cx="82" cy="82" rx="6" ry="7" fill="#1a1a2e">
          {isSpeaking && (
            <animate attributeName="ry" values="7;5;7" dur="2s" repeatCount="indefinite" />
          )}
        </ellipse>
        <ellipse cx="118" cy="82" rx="6" ry="7" fill="#1a1a2e">
          {isSpeaking && (
            <animate attributeName="ry" values="7;5;7" dur="2s" repeatCount="indefinite" />
          )}
        </ellipse>

        <circle cx="84" cy="80" r="2" fill="white" />
        <circle cx="120" cy="80" r="2" fill="white" />

        <line x1="74" y1="72" x2="90" y2="72" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="110" y1="72" x2="126" y2="72" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />

        <path d="M98 88 Q100 95 102 88" stroke="#d4a574" strokeWidth="1.5" fill="none" />

        {isSpeaking ? (
          <>
            <ellipse cx="100" cy="102" rx="12" ry="8" fill="#e74c3c">
              <animate attributeName="ry" values="8;4;8;6;8" dur="0.3s" repeatCount="indefinite" />
            </ellipse>
            <rect x="92" y="98" width="16" height="4" rx="1" fill="white" opacity="0.8">
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.3s" repeatCount="indefinite" />
            </rect>
          </>
        ) : (
          <path d="M90 100 Q100 110 110 100" stroke="#c0392b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}

        {isSpeaking && (
          <>
            <circle cx="72" cy="95" r="8" fill="#f8a4a4" opacity="0.4">
              <animate attributeName="opacity" values="0.4;0.2;0.4" dur="1s" repeatCount="indefinite" />
            </circle>
            <circle cx="128" cy="95" r="8" fill="#f8a4a4" opacity="0.4">
              <animate attributeName="opacity" values="0.4;0.2;0.4" dur="1s" repeatCount="indefinite" />
            </circle>
          </>
        )}

        <path d="M55 140 Q100 120 145 140 L155 200 L45 200 Z" fill={isFemale ? '#059669' : '#2563eb'} />
        <path d="M85 135 L100 150 L115 135" stroke="white" strokeWidth="2" fill="none" />

        {isSpeaking && (
          <>
            <circle cx="160" cy="85" r="5" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.7">
              <animate attributeName="r" values="5;15;5" dur="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0;0.7" dur="1s" repeatCount="indefinite" />
            </circle>
            <circle cx="160" cy="85" r="5" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.5">
              <animate attributeName="r" values="5;20;5" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur="1.2s" repeatCount="indefinite" />
            </circle>
          </>
        )}

        <text
          x="100" y="195"
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontWeight="bold"
          fontFamily="system-ui"
        >
          {tutor.name}
        </text>
      </svg>

      {isSpeaking && (
        <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" style={{ animationDuration: '2s' }} />
      )}
    </div>
  );
}

export function VoiceEnabledChapterTutor({
  course, module: mod, lesson, onComplete, onAskTutor, onNextLesson, hasNextLesson,
}: VoiceChapterTutorProps) {
  const tutor = getTutorForCourse(course.id);
  const totalSlides = lesson.steps.length;
  const totalQuestions = lesson.quiz.length;

  const passedLessonTests = useAppStore((s) => s.passedLessonTests);
  const markLessonTestPassed = useAppStore((s) => s.markLessonTestPassed);
  const testAlreadyPassed = passedLessonTests.includes(lesson.id);

  const [stage, setStage] = useState<Stage>('slides');
  const [slideIdx, setSlideIdx] = useState(0);

  const [teachings, setTeachings] = useState<Record<number, SlideTeaching>>({});
  const [loadingTeach, setLoadingTeach] = useState(false);
  const [teachError, setTeachError] = useState<string | null>(null);

  const [questionPopupOpen, setQuestionPopupOpen] = useState(false);
  const [popupAnswer, setPopupAnswer] = useState<number | null>(null);
  const [popupRevealed, setPopupRevealed] = useState(false);
  const [popupWasCorrect, setPopupWasCorrect] = useState(false);
  const [showWrongAnswerWarning, setShowWrongAnswerWarning] = useState(false);

  const [voiceMode, setVoiceMode] = useState(false);
  const [voicePhase, setVoicePhase] = useState<
    'intro' | 'explanation' | 'awaiting_answer' | 'example' | 'pitfall' | 'done'
  >('intro');
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [voicePaused, setVoicePaused] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceProgress, setVoiceProgress] = useState(0);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [voicePosition, setVoicePosition] = useState(0);
  const audioRef = useRef<{ _timer?: ReturnType<typeof setInterval> } | null>(null);
  const slideRef = useRef<HTMLDivElement>(null);

  // Abort controller — when user clicks Stop, we abort all pending speech
  const abortRef = useRef<AbortController | null>(null);

  const startedVoiceForSlide = useRef<Set<number>>(new Set());
  const introSpokenForCourse = useRef<Set<string>>(new Set());

  const [qaInput, setQaInput] = useState('');
  const [slideQA, setSlideQA] = useState<Record<number, { q: string; a: string; loading: boolean }>>({});
  const [qaHistory, setQaHistory] = useState<QAHistoryItem[]>([]);

  const [testAnswers, setTestAnswers] = useState<Record<string, number>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testPopupOpen, setTestPopupOpen] = useState(false);

  const totalMinutes = parseDurationMinutes(lesson.duration);
  const slide = lesson.steps[slideIdx];
  const slideProgress = Math.round(((slideIdx + 1) / totalSlides) * 100);

  const courseLessons = useMemo(() => getAllLessons(course.id), [course.id]);
  const totalCourseLessons = courseLessons.length;
  const passedCourseLessons = useMemo(
    () => courseLessons.filter((l) => passedLessonTests.includes(l.lessonId)).length,
    [courseLessons, passedLessonTests],
  );
  const courseProgressPct = totalCourseLessons
    ? Math.round((passedCourseLessons / totalCourseLessons) * 100)
    : 0;

  // ============================================================
  // COURSE SWITCH CLEANUP
  // ============================================================
  const prevCourseIdRef = useRef(course.id);
  const prevLessonIdRef = useRef(lesson.id);

  useEffect(() => {
    if (prevCourseIdRef.current !== course.id) {
      prevCourseIdRef.current = course.id;
      introSpokenForCourse.current.clear();
      setTeachings({});
      startedVoiceForSlide.current.clear();
    }
    if (prevLessonIdRef.current !== lesson.id) {
      prevLessonIdRef.current = lesson.id;
      startedVoiceForSlide.current.clear();
    }
  }, [course.id, lesson.id]);

  // ============================================================
  // SLIDE CHANGE CLEANUP
  // ============================================================
  useEffect(() => {
    setQaInput('');
    setTeachError(null);
    setVoiceMode(false);
    setVoicePlaying(false);
    setVoiceProgress(0);
    setVoiceDuration(0);
    setVoicePosition(0);
    setVoiceError(null);
    setVoicePhase('intro');
    setVoicePaused(false);
    setQuestionPopupOpen(false);
    setPopupAnswer(null);
    setPopupRevealed(false);
    setPopupWasCorrect(false);
    setShowWrongAnswerWarning(false);
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current?._timer) {
      clearInterval(audioRef.current._timer);
      audioRef.current._timer = undefined;
    }
    if (slideRef.current) slideRef.current.scrollTop = 0;
  }, [slideIdx]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current?._timer) clearInterval(audioRef.current._timer);
    };
  }, []);

  // Warm up browser voice list
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.getVoices();
    const handler = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener('voiceschanged', handler);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', handler);
  }, []);

  // ============================================================
  // Voice-over: pick the right system voice
  // ============================================================
  const getPreferredLang = useCallback((): string => {
    try {
      if (typeof window === 'undefined') return 'en';
      const raw = window.localStorage.getItem('marq-ai-tutor-intro-prefs');
      if (raw) {
        const p = JSON.parse(raw);
        if (p && typeof p.lang === 'string') return p.lang;
      }
    } catch { /* noop */ }
    return 'en';
  }, []);

  const pickSystemVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const preferredLang = getPreferredLang();
    const isFemaleTutor = tutor.gender === 'female';

    const bcp47Map: Record<string, string> = {
      en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', kn: 'kn-IN',
      es: 'es-ES', fr: 'fr-FR', de: 'de-DE', pt: 'pt-BR', ar: 'ar-SA', zh: 'zh-CN',
    };
    const preferredBcp47 = bcp47Map[preferredLang] ?? 'en-IN';
    const langPrefix = preferredBcp47.split('-')[0].toLowerCase();

    const femaleVoicePatterns: Record<string, string[]> = {
      en: ['female', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona', 'zira',
           'google uk english female', 'google us english', 'linda', 'susan', 'heera',
           'shruti', 'swara', 'meera', 'priya', 'ananya'],
      hi: ['hindi', 'heera', 'kalpana', 'shruti', 'swara', 'lata', 'female'],
      ta: ['tamil', 'pallavi', 'female'],
      te: ['telugu', 'female'],
      kn: ['kannada', 'female'],
      es: ['female', 'monica', 'paulina', 'google español'],
      fr: ['female', 'google français', 'amélie'],
      de: ['female', 'google deutsch', 'anna'],
    };
    const maleVoicePatterns: Record<string, string[]> = {
      en: ['male', 'daniel', 'james', 'alex', 'fred', 'rishi', 'google uk english male', 'hemant'],
      hi: ['male', 'hemant', 'lala'],
      ta: ['male'],
      te: ['male'],
      kn: ['male'],
      es: ['male', 'jorge'],
      fr: ['male', 'google français'],
      de: ['male', 'google deutsch'],
    };

    const nameHints = isFemaleTutor
      ? (femaleVoicePatterns[langPrefix] ?? ['female'])
      : (maleVoicePatterns[langPrefix] ?? ['male']);

    // 1. Exact BCP-47 match with gender
    for (const hint of nameHints) {
      const byName = voices.find((v) =>
        v.lang === preferredBcp47 && v.name.toLowerCase().includes(hint)
      );
      if (byName) return byName;
    }

    // 2. Case-insensitive BCP-47 with gender
    for (const hint of nameHints) {
      const byName = voices.find((v) =>
        v.lang.toLowerCase() === preferredBcp47.toLowerCase() &&
        v.name.toLowerCase().includes(hint)
      );
      if (byName) return byName;
    }

    // 3. Any voice for exact BCP-47
    const exactMatch = voices.find((v) => v.lang === preferredBcp47);
    if (exactMatch) return exactMatch;

    // 4. Language prefix with gender
    for (const hint of nameHints) {
      const byName = voices.find((v) =>
        v.lang.toLowerCase().startsWith(langPrefix) &&
        v.name.toLowerCase().includes(hint)
      );
      if (byName) return byName;
    }

    // 5. Any voice for language prefix
    const prefixMatch = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
    if (prefixMatch) return prefixMatch;

    // 6. For English: try en-IN, then gender-aware fallback
    if (langPrefix === 'en') {
      const indianEnglish = voices.find((v) => v.lang === 'en-IN');
      if (indianEnglish) return indianEnglish;
      if (isFemaleTutor) {
        const englishFemale = voices.find((v) =>
          v.lang.toLowerCase().startsWith('en') &&
          /female|samantha|victoria|karen|zira|google us english|shruti/i.test(v.name)
        );
        if (englishFemale) return englishFemale;
      } else {
        const englishMale = voices.find((v) =>
          v.lang.toLowerCase().startsWith('en') &&
          /male|daniel|james|alex|fred|rishi/i.test(v.name)
        );
        if (englishMale) return englishMale;
      }
      const anyEnglish = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
      if (anyEnglish) return anyEnglish;
    }

    return voices[0];
  }, [tutor.gender, getPreferredLang]);

  const getPreferredBcp47 = useCallback((): string => {
    const preferredLang = getPreferredLang();
    const bcp47Map: Record<string, string> = {
      en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', kn: 'kn-IN',
      es: 'es-ES', fr: 'fr-FR', de: 'de-DE', pt: 'pt-BR', ar: 'ar-SA', zh: 'zh-CN',
    };
    return bcp47Map[preferredLang] ?? 'en-IN';
  }, [getPreferredLang]);

  // ============================================================
  // speakChunk — with abort signal and Google TTS fallback
  // ============================================================
  const speakChunk = useCallback((text: string, signal?: AbortSignal): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) { resolve(); return; }

      const preferredLang = getPreferredLang();
      const spoken = toSpokenText(text);
      if (!spoken) { resolve(); return; }

      // For Indian languages without native browser voices, use Google TTS
      const indianLangsNeedingFallback = ['te', 'ta', 'kn'];
      if (indianLangsNeedingFallback.includes(preferredLang) && !browserHasVoiceForLang(preferredLang)) {
        playGoogleTTS(spoken, preferredLang).then(resolve).catch(() => resolve());
        return;
      }

      if (typeof window === 'undefined' || !window.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(spoken);
      const voice = pickSystemVoice();
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = getPreferredBcp47();
      }
      let userRate = 0.9;
      try {
        const raw = window.localStorage.getItem('marq-ai-tutor-intro-prefs');
        if (raw) {
          const p = JSON.parse(raw);
          if (p && typeof p.rate === 'number') userRate = p.rate;
        }
      } catch { /* noop */ }
      utterance.rate = Math.min(1.0, Math.max(0.5, tutor.speed * userRate * 0.85));
      utterance.pitch = tutor.gender === 'female' ? 1.15 : 1.0;
      utterance.volume = 1.0;

      if (signal?.aborted) { resolve(); return; }

      utterance.onend = () => resolve();
      utterance.onerror = (ev) => {
        if (ev.error === 'canceled' || ev.error === 'interrupted' || signal?.aborted) {
          resolve();
        } else {
          reject(new Error(`Voice-over error: ${ev.error || 'unknown'}`));
        }
      };

      if (signal) {
        const onAbort = () => {
          window.speechSynthesis.cancel();
          resolve();
        };
        signal.addEventListener('abort', onAbort, { once: true });
      }

      window.speechSynthesis.speak(utterance);
    });
  }, [pickSystemVoice, getPreferredBcp47, tutor.speed, tutor.gender, getPreferredLang]);

  const startProgressTimer = (
    estimatedSeconds: number,
    rangeStart: number, rangeEnd: number,
  ) => {
    const startTime = Date.now();
    const span = rangeEnd - rangeStart;
    const timer = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const pct = Math.min(95, (elapsed / Math.max(1, estimatedSeconds)) * 100);
      setVoiceProgress(rangeStart + Math.min(span, (pct / 100) * span));
      setVoicePosition(elapsed);
      if (elapsed >= estimatedSeconds * 1.5) clearInterval(timer);
    }, 250);
    if (!audioRef.current) audioRef.current = {};
    audioRef.current._timer = timer;
    return () => clearInterval(timer);
  };

  // ============================================================
  // Auto-fetch teaching when a new slide loads
  // ============================================================
  const fetchTeachingForSlide = useCallback(async (idx: number): Promise<SlideTeaching | null> => {
    if (teachings[idx]) return teachings[idx];
    setLoadingTeach(true);
    setTeachError(null);
    try {
      const s = lesson.steps[idx];
      const res = await fetch('/api/chapter-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'teach',
          courseId: course.id,
          courseContext: `${course.title} — ${course.subtitle}`,
          lessonTitle: lesson.title,
          slideTitle: s.title,
          slideContent: s.content,
          slideCode: s.code,
          codeLanguage: s.codeLanguage,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTeachings((prev) => ({ ...prev, [idx]: data }));
      return data;
    } catch (err) {
      setTeachError(err instanceof Error ? err.message : 'Failed to load teaching');
      return null;
    } finally {
      setLoadingTeach(false);
    }
  }, [teachings, course.id, course.title, course.subtitle, lesson.title, lesson.steps]);

  useEffect(() => {
    if (stage !== 'slides') return;
    let cancelled = false;
    (async () => {
      const teaching = await fetchTeachingForSlide(slideIdx);
      if (cancelled || !teaching) return;
      if (!startedVoiceForSlide.current.has(slideIdx)) {
        startedVoiceForSlide.current.add(slideIdx);
        setTimeout(() => {
          if (!cancelled) startVoiceOver(teaching);
        }, 300);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideIdx, stage]);

  // ============================================================
  // Voice-over main flow — with AbortController
  // ============================================================
  const startVoiceOver = async (preloadedTeaching?: SlideTeaching) => {
    if (voiceLoading) return;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const signal = controller.signal;

    setVoiceMode(true);
    setVoiceError(null);
    setVoicePhase('intro');
    setPopupAnswer(null);
    setPopupRevealed(false);
    setPopupWasCorrect(false);
    setVoicePaused(false);

    const shouldSpeakIntro = !introSpokenForCourse.current.has(course.id);
    if (shouldSpeakIntro) {
      introSpokenForCourse.current.add(course.id);
      try {
        setVoicePhase('intro');
        const introWordCount = tutor.introText.split(/\s+/).length;
        const introSeconds = Math.max(10, Math.round((introWordCount / 120) * 60));
        const stopTimerIntro = startProgressTimer(introSeconds, 0, 5);
        setVoicePlaying(true);
        await speakChunk(tutor.introText, signal);
        if (signal.aborted) return;
        stopTimerIntro();
        setVoicePlaying(false);
      } catch { /* continue */ }
    }

    if (signal.aborted) return;

    let teaching = preloadedTeaching ?? teachings[slideIdx];
    if (!teaching) {
      setLoadingTeach(true);
      try {
        const res = await fetch('/api/chapter-tutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'teach',
            courseId: course.id,
            courseContext: `${course.title} — ${course.subtitle}`,
            lessonTitle: lesson.title,
            slideTitle: slide.title,
            slideContent: slide.content,
            slideCode: slide.code,
            codeLanguage: slide.codeLanguage,
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTeachings((prev) => ({ ...prev, [slideIdx]: data }));
        teaching = data;
      } catch (err) {
        setVoiceError(err instanceof Error ? err.message : 'Failed to load teaching');
        setLoadingTeach(false);
        return;
      } finally {
        setLoadingTeach(false);
      }
    }

    if (!teaching || signal.aborted) return;

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setVoiceError('Your browser does not support voice-over.');
      return;
    }

    setVoiceLoading(true);
    try {
      window.speechSynthesis.cancel();

      // PHASE 1: explanation
      const phase1Script = [
        `Slide ${slideIdx + 1}: ${slide.title}.`,
        slide.content,
        `Let me explain. ${teaching.explanation}`,
      ].join(' ');
      const phase1WordCount = phase1Script.split(/\s+/).length;
      const phase1Seconds = Math.max(8, Math.round((phase1WordCount / 120) * 60));
      setVoiceDuration(phase1Seconds);
      setVoiceProgress(0);
      setVoicePosition(0);
      setVoicePhase('explanation');
      const stopTimer1 = startProgressTimer(phase1Seconds, 0, 35);
      setVoicePlaying(true);
      await speakChunk(phase1Script, signal);
      if (signal.aborted) return;
      stopTimer1();
      setVoicePlaying(false);

      // Ask mid-lesson question
      await speakChunk(
        `Now, before we continue, please answer this question so that I know you are following me. ` +
        `The question is: ${teaching.checkQuestion.question}. ` +
        `Take your time and pick the option you think is correct.`,
        signal,
      );
      if (signal.aborted) return;

      setVoicePhase('awaiting_answer');
      setVoiceProgress(35);
      setQuestionPopupOpen(true);
    } catch (err) {
      if (signal.aborted) return;
      const msg = err instanceof Error ? err.message : 'Voice generation failed';
      setVoiceError(msg);
    } finally {
      setVoiceLoading(false);
    }
  };

  const submitPopupAnswer = () => {
    if (popupAnswer === null) return;
    const teaching = teachings[slideIdx];
    if (!teaching) return;
    const isCorrect = popupAnswer === teaching.checkQuestion.correctAnswer;
    setPopupWasCorrect(isCorrect);
    setPopupRevealed(true);
    if (isCorrect) {
      speakChunk(`That's correct. ${teaching.checkQuestion.explanation} Let's continue with a real-world example.`).catch(() => {});
    } else {
      speakChunk(
        `That answer is not correct. Please listen to the class carefully. ` +
        `The correct answer is: ${teaching.checkQuestion.options[teaching.checkQuestion.correctAnswer]}. ` +
        `${teaching.checkQuestion.explanation} Let me show you a real-world example to make this clearer.`
      ).catch(() => {});
      setShowWrongAnswerWarning(true);
    }
  };

  const continueAfterPopupAnswer = async () => {
    const teaching = teachings[slideIdx];
    if (!teaching) return;
    setQuestionPopupOpen(false);
    setShowWrongAnswerWarning(false);

    const controller = new AbortController();
    abortRef.current = controller;
    const signal = controller.signal;

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setVoicePhase('done');
      setVoiceProgress(100);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      setVoicePhase('example');
      setVoicePlaying(true);

      const phase2Script = `Here is a real-world example. ${teaching.example}`;
      const phase2WordCount = phase2Script.split(/\s+/).length;
      const phase2Seconds = Math.max(6, Math.round((phase2WordCount / 120) * 60));
      const stopTimer2 = startProgressTimer(phase2Seconds, 35, 75);
      await speakChunk(phase2Script, signal);
      if (signal.aborted) return;
      stopTimer2();

      setVoicePhase('pitfall');
      const phase3Script = `Watch out for this common pitfall. ${teaching.pitfall} That wraps up this slide. Take a moment to review, then move on when you're ready.`;
      const phase3WordCount = phase3Script.split(/\s+/).length;
      const phase3Seconds = Math.max(5, Math.round((phase3WordCount / 120) * 60));
      const stopTimer3 = startProgressTimer(phase3Seconds, 75, 100);
      await speakChunk(phase3Script, signal);
      if (signal.aborted) return;
      stopTimer3();

      setVoicePlaying(false);
      setVoicePhase('done');
      setVoiceProgress(100);
    } catch (err) {
      if (signal.aborted) return;
      const msg = err instanceof Error ? err.message : 'Voice generation failed';
      setVoiceError(msg);
      setVoicePlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setVoicePlaying(true);
      setVoicePaused(false);
    } else if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setVoicePlaying(false);
      setVoicePaused(true);
    }
  };

  const stopVoice = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current?._timer) {
      clearInterval(audioRef.current._timer);
      audioRef.current._timer = undefined;
    }
    setVoiceMode(false);
    setVoicePlaying(false);
    setVoicePaused(false);
    setVoiceProgress(0);
    setVoicePosition(0);
    setVoiceDuration(0);
    setVoicePhase('intro');
    setVoiceError(null);
    setQuestionPopupOpen(false);
    setPopupAnswer(null);
    setPopupRevealed(false);
    setPopupWasCorrect(false);
    setShowWrongAnswerWarning(false);
  };

  const askQuestion = async () => {
    const q = qaInput.trim();
    if (!q || slideQA[slideIdx]?.loading) return;
    setSlideQA((prev) => ({ ...prev, [slideIdx]: { q, a: '', loading: true } }));
    try {
      const res = await fetch('/api/chapter-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'answer_question',
          courseId: course.id,
          courseContext: `${course.title} — ${course.subtitle}`,
          lessonTitle: lesson.title,
          slideTitle: slide.title,
          slideContent: slide.content,
          slideCode: slide.code,
          codeLanguage: slide.codeLanguage,
          studentQuestion: q,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const answer = data.content;
      setSlideQA((prev) => ({ ...prev, [slideIdx]: { q, a: answer, loading: false } }));
      setQaHistory((prev) => [
        ...prev,
        { slideIdx, slideTitle: slide.title, question: q, answer, askedAt: Date.now() },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed';
      const fallback = `Sorry, I could not answer right now. ${msg}`;
      setSlideQA((prev) => ({ ...prev, [slideIdx]: { q, a: fallback, loading: false } }));
      setQaHistory((prev) => [
        ...prev,
        { slideIdx, slideTitle: slide.title, question: q, answer: fallback, askedAt: Date.now() },
      ]);
    }
  };

  const goNextSlideOrPopTest = () => {
    stopVoice();
    if (slideIdx < totalSlides - 1) {
      setSlideIdx((i) => i + 1);
    } else {
      setStage('chapter_test');
      setTestPopupOpen(true);
    }
  };

  const submitTest = () => {
    setTestSubmitted(true);
    const score = lesson.quiz.reduce(
      (acc, q) => (testAnswers[q.id] === q.correctAnswer ? acc + 1 : acc),
      0,
    );
    const pct = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
    if (pct >= 60) markLessonTestPassed(lesson.id);
    onComplete?.(pct);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const restartChapter = () => {
    stopVoice();
    setStage('slides');
    setSlideIdx(0);
    setTestAnswers({});
    setTestSubmitted(false);
    setTestPopupOpen(false);
  };

  const score = lesson.quiz.reduce(
    (acc, q) => (testAnswers[q.id] === q.correctAnswer ? acc + 1 : acc),
    0,
  );
  const scorePct = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
  const passed = scorePct >= 60;

  // ============================================================
  // RENDER — Two-panel: LEFT = Tutor + Controls, RIGHT = Content
  // ============================================================
  if (stage === 'slides') {
    const teaching = teachings[slideIdx];
    const isSpeaking = voiceMode && voicePlaying && !voicePaused;

    return (
      <div ref={slideRef} className="space-y-5">
        {/* Course progress */}
        <Card className="overflow-hidden border-emerald-500/30">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                <p className="text-sm font-semibold">Course Progress</p>
              </div>
              <Badge className="border-white/30 bg-white/20 text-white">
                {passedCourseLessons} / {totalCourseLessons} chapters passed
              </Badge>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${courseProgressPct}%` }} />
              </div>
              <span className="text-xs font-medium tabular-nums">{courseProgressPct}%</span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1">
              {courseLessons.map((l, i) => {
                const passedThis = passedLessonTests.includes(l.lessonId);
                const isCurrent = l.lessonId === lesson.id;
                return (
                  <span key={l.lessonId} title={`Chapter ${i + 1}: ${l.title}${passedThis ? ' (passed)' : isCurrent ? ' (current)' : ''}`}
                    className={`h-2 w-2 rounded-full transition-all ${passedThis ? 'bg-white' : isCurrent ? 'bg-yellow-300 ring-2 ring-white/60' : 'bg-white/30'}`}
                  />
                );
              })}
            </div>
          </div>
        </Card>

        {/* TWO-PANEL LAYOUT */}
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* LEFT: Animated Tutor Avatar + Voice Controls */}
          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <Card className="overflow-hidden border-2 border-emerald-500/30">
              <CardContent className="flex flex-col items-center p-6">
                <AnimatedTutorAvatar tutor={tutor} isSpeaking={isSpeaking} size="large" />
                <div className="mt-4 text-center">
                  <h3 className="text-xl font-bold">{tutor.name}</h3>
                  <p className="text-xs text-muted-foreground">{tutor.title}</p>
                  <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 italic">{tutor.tagline}</p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {voiceMode && voicePlaying && !voicePaused && (
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 animate-pulse">
                      <Volume2 className="mr-1 h-3 w-3" /> Speaking...
                    </Badge>
                  )}
                  {voiceMode && voicePaused && (
                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300">
                      <Pause className="mr-1 h-3 w-3" /> Paused
                    </Badge>
                  )}
                  {voiceMode && voicePhase === 'done' && (
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Done
                    </Badge>
                  )}
                  {!voiceMode && !voiceLoading && (
                    <Badge variant="outline" className="text-muted-foreground">Ready</Badge>
                  )}
                  {voiceLoading && (
                    <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300">
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Loading...
                    </Badge>
                  )}
                </div>
                {voiceMode && (
                  <div className="mt-3 w-full">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                      <span>{voicePhase === 'intro' ? 'Intro' : voicePhase === 'explanation' ? 'Explaining' : voicePhase === 'example' ? 'Example' : voicePhase === 'pitfall' ? 'Pitfall' : voicePhase === 'awaiting_answer' ? 'Waiting' : 'Done'}</span>
                      <span>{Math.round(voiceProgress)}%</span>
                    </div>
                    <Progress value={voiceProgress} className="h-1.5" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Voice controls */}
            <Card className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Voice Controls</p>

                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground">Language</label>
                  <select
                    value={getPreferredLang()}
                    onChange={(e) => {
                      try {
                        const raw = window.localStorage.getItem('marq-ai-tutor-intro-prefs') ?? '{}';
                        const p = JSON.parse(raw);
                        p.lang = e.target.value;
                        window.localStorage.setItem('marq-ai-tutor-intro-prefs', JSON.stringify(p));
                      } catch { /* noop */ }
                      if (voiceMode) {
                        stopVoice();
                        setTimeout(() => startVoiceOver(), 200);
                      }
                    }}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm cursor-pointer"
                  >
                    <option value="en">🇮🇳 English (Indian)</option>
                    <option value="hi">🇮🇳 हिन्दी (Hindi)</option>
                    <option value="te">🇮🇳 తెలుగు (Telugu)</option>
                    <option value="ta">🇮🇳 தமிழ் (Tamil)</option>
                    <option value="kn">🇮🇳 ಕನ್ನಡ (Kannada)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground">Speed</label>
                  <input
                    type="range" min="0.5" max="1.5" step="0.1" defaultValue="0.9"
                    onChange={(e) => {
                      try {
                        const raw = window.localStorage.getItem('marq-ai-tutor-intro-prefs') ?? '{}';
                        const p = JSON.parse(raw);
                        p.rate = parseFloat(e.target.value);
                        window.localStorage.setItem('marq-ai-tutor-intro-prefs', JSON.stringify(p));
                      } catch { /* noop */ }
                    }}
                    className="w-full h-1.5 cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {!voiceMode ? (
                    <Button className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700" size="sm"
                      onClick={() => startVoiceOver()} disabled={voiceLoading}>
                      <Play className="mr-1.5 h-4 w-4" /> Play Voice-over
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={togglePlayPause} className="flex-1">
                        {voicePaused ? <><Play className="mr-1 h-4 w-4" /> Resume</> : <><Pause className="mr-1 h-4 w-4" /> Pause</>}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={stopVoice} className="flex-1">
                        <Square className="mr-1 h-4 w-4" /> Stop
                      </Button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm"
                    onClick={() => { stopVoice(); setSlideIdx(Math.max(0, slideIdx - 1)); }}
                    disabled={slideIdx === 0} className="flex-1">
                    <ChevronLeft className="mr-1 h-4 w-4" /> Prev
                  </Button>
                  <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                    {slideIdx + 1}/{totalSlides}
                  </span>
                  <Button variant="outline" size="sm" onClick={goNextSlideOrPopTest} className="flex-1">
                    Next <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <Progress value={slideProgress} className="flex-1 h-1.5" />
                  <span className="text-[10px] text-muted-foreground tabular-nums">{slideProgress}%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Course Content */}
          <div className="min-w-0 space-y-5">
            <Card className="overflow-hidden border-2 border-emerald-500/30">
              <CardContent className="p-5 sm:p-7 space-y-5">
                <div>
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-600 text-base font-bold text-white">
                      {slideIdx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="pt-1 text-2xl font-bold leading-tight sm:text-3xl">{slide.title}</h3>
                    </div>
                  </div>
                  <p className="mt-4 text-[15px] leading-relaxed text-foreground/90 sm:text-base">{slide.content}</p>
                </div>

                {slide.code && (
                  <div className="overflow-hidden rounded-xl border bg-zinc-950">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                      <span className="text-xs font-medium text-zinc-400">{slide.codeLanguage ?? 'code'}</span>
                      <span className="text-[10px] text-zinc-500">reference</span>
                    </div>
                    <SyntaxHighlighter
                      language={slide.codeLanguage ?? 'text'} style={oneDark}
                      customStyle={{ margin: 0, background: 'transparent', padding: '1rem', fontSize: '13px' }}
                      codeTagProps={{ style: { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' } }}
                    >
                      {slide.code}
                    </SyntaxHighlighter>
                  </div>
                )}

                {slide.tip && (
                  <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-900 dark:text-amber-200">
                    <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    <div>
                      <p className="font-semibold">Pro tip</p>
                      <p className="mt-0.5">{slide.tip}</p>
                    </div>
                  </div>
                )}

                {loadingTeach && !teaching && (
                  <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> {tutor.name} is preparing the explanation...
                  </div>
                )}
                {teachError && (
                  <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 text-sm text-rose-900 dark:text-rose-200">
                    <AlertTriangle className="mr-1.5 inline h-4 w-4" /> {teachError}
                  </div>
                )}
                {teaching && (
                  <div className="space-y-3">
                    <FlowingAnswer label="Explanation" icon={<Bot className="h-3.5 w-3.5" />}
                      active={voicePhase === 'explanation'} done={voicePhase === 'example' || voicePhase === 'pitfall' || voicePhase === 'done'}>
                      <MarkdownLite content={teaching.explanation} />
                    </FlowingAnswer>
                    <FlowingAnswer label="Real-world example" icon={<Lightbulb className="h-3.5 w-3.5" />}
                      active={voicePhase === 'example'} done={voicePhase === 'pitfall' || voicePhase === 'done'}>
                      <MarkdownLite content={teaching.example} />
                    </FlowingAnswer>
                    <FlowingAnswer label="Common pitfall" icon={<HelpCircle className="h-3.5 w-3.5" />}
                      active={voicePhase === 'pitfall'} done={voicePhase === 'done'}>
                      <MarkdownLite content={teaching.pitfall} />
                    </FlowingAnswer>
                  </div>
                )}

                {teaching && !voiceMode && !voiceLoading && (
                  <Button size="sm" variant="outline" className="mt-4" onClick={() => startVoiceOver(teaching)}>
                    <Volume2 className="mr-1.5 h-4 w-4" /> Replay voice-over
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Q&A */}
            <div className="rounded-xl border bg-background/60 p-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" /> Ask {tutor.name} a follow-up
              </p>
              {slideQA[slideIdx] && (
                <div className="mt-3 space-y-2">
                  <div className="rounded-md bg-emerald-500/10 px-2.5 py-1.5 text-xs">
                    <span className="font-semibold">You: </span>{slideQA[slideIdx].q}
                  </div>
                  {slideQA[slideIdx].loading ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" /> {tutor.name} is thinking...
                    </div>
                  ) : (
                    <div className="rounded-md bg-muted/50 px-2.5 py-1.5 text-xs">
                      <span className="font-semibold">{tutor.name}: </span>{slideQA[slideIdx].a}
                    </div>
                  )}
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <input value={qaInput} onChange={(e) => setQaInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') askQuestion(); }}
                  placeholder="Type your question..."
                  className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50" />
                <Button size="sm" onClick={askQuestion} disabled={!qaInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {qaHistory.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <MessagesSquare className="h-3.5 w-3.5" /> Q&A History ({qaHistory.length})
                  </p>
                  <div className="mt-3 max-h-60 space-y-3 overflow-y-auto">
                    {qaHistory.map((item, i) => (
                      <div key={i} className="rounded-lg border p-3 text-xs">
                        <p className="font-semibold text-emerald-700 dark:text-emerald-300">Q: {item.question}</p>
                        <p className="mt-1 text-muted-foreground">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-between border-t pt-4">
              <Button variant="outline" size="sm" onClick={() => { stopVoice(); setSlideIdx(Math.max(0, slideIdx - 1)); }} disabled={slideIdx === 0}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Previous slide
              </Button>
              <Button size="sm" onClick={goNextSlideOrPopTest} className="bg-emerald-600 text-white hover:bg-emerald-700">
                {slideIdx < totalSlides - 1 ? 'Next slide' : 'Finish chapter test'} <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mid-lesson question popup */}
        <Dialog open={questionPopupOpen} onOpenChange={() => {}}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AnimatedTutorAvatar tutor={tutor} isSpeaking={false} size="small" />
                Quick Check — Are you following?
              </DialogTitle>
              <DialogDescription>
                {teachings[slideIdx]?.checkQuestion.question ?? 'Loading question...'}
              </DialogDescription>
            </DialogHeader>
            {teachings[slideIdx] && (
              <div className="space-y-3">
                {teachings[slideIdx].checkQuestion.options.map((opt, oi) => {
                  const picked = popupAnswer === oi;
                  const isCorrect = oi === teachings[slideIdx].checkQuestion.correctAnswer;
                  const isWrongPick = popupRevealed && picked && !isCorrect;
                  return (
                    <button key={oi} disabled={popupRevealed} onClick={() => setPopupAnswer(oi)}
                      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${
                        popupRevealed ? isCorrect ? 'border-emerald-500/60 bg-emerald-500/10' : isWrongPick ? 'border-rose-500/60 bg-rose-500/10' : 'border-border'
                          : picked ? 'border-emerald-500 bg-emerald-500/5' : 'border-border hover:bg-muted/50 cursor-pointer'
                      } ${popupRevealed ? 'cursor-default' : 'cursor-pointer'}`}>
                      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${picked ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-muted-foreground/40'}`}>
                        {picked && <CheckCircle2 className="h-3 w-3" />}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {popupRevealed && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                      {popupRevealed && isWrongPick && <XCircle className="h-4 w-4 text-rose-600" />}
                    </button>
                  );
                })}
                {showWrongAnswerWarning && !popupWasCorrect && popupRevealed && (
                  <div className="rounded-lg border-2 border-rose-500/50 bg-rose-500/10 p-3 text-sm text-rose-900 dark:text-rose-200">
                    <p className="flex items-center gap-1.5 font-semibold"><AlertTriangle className="h-4 w-4" /> Please listen to the class carefully</p>
                    <p className="mt-1 text-xs">That answer is not correct. {tutor.name} will walk you through a real-world example.</p>
                  </div>
                )}
                {popupWasCorrect && popupRevealed && (
                  <div className="rounded-lg border-2 border-emerald-500/50 bg-emerald-500/10 p-3 text-sm text-emerald-900 dark:text-emerald-200">
                    <p className="flex items-center gap-1.5 font-semibold"><CheckCircle2 className="h-4 w-4" /> Correct!</p>
                    <p className="mt-1 text-xs">{teachings[slideIdx].checkQuestion.explanation}</p>
                  </div>
                )}
                {!popupRevealed ? (
                  <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700" disabled={popupAnswer === null} onClick={submitPopupAnswer}>
                    Submit answer
                  </Button>
                ) : (
                  <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700" onClick={continueAfterPopupAnswer}>
                    Continue listening <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
            {!teachings[slideIdx] && (
              <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading question...
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Chapter test popup */}
        <Dialog open={testPopupOpen} onOpenChange={(open) => {
          if (!open && !testSubmitted) { setTestPopupOpen(true); return; }
          if (!open && testSubmitted) setTestPopupOpen(false);
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className={`grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br ${course.gradient} text-white`}>
                  <ListChecks className="h-4 w-4" />
                </span>
                Chapter Test · {lesson.title}
              </DialogTitle>
              <DialogDescription>
                {testAlreadyPassed
                  ? 'You have already passed this test. You can retake it any time.'
                  : 'Until you finish this test, the next chapter will not be started. Pass with 60% or higher.'}
              </DialogDescription>
            </DialogHeader>
            {!testAlreadyPassed && (
              <div className="rounded-lg border-2 border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200">
                <p className="flex items-center gap-1.5 font-semibold"><Lock className="h-4 w-4" /> Next chapter is locked</p>
                <p className="mt-1 text-xs">You must pass this test ({totalQuestions} questions, pass mark 60%) before moving on.</p>
              </div>
            )}
            <div className="space-y-4 py-2">
              {!testSubmitted ? (
                <>
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <p className="font-medium">Progress</p>
                      <p className="text-muted-foreground">{Object.keys(testAnswers).length} of {totalQuestions} answered</p>
                    </div>
                    <Progress value={totalQuestions ? (Object.keys(testAnswers).length / totalQuestions) * 100 : 0} className="mt-2 h-1.5" />
                  </div>
                  {lesson.quiz.map((q, qi) => (
                    <div key={q.id} className="rounded-xl border p-4">
                      <div className="flex items-start gap-3">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold">{qi + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium leading-relaxed">{q.question}</p>
                          <div className="mt-3 space-y-1.5">
                            {q.options.map((opt, oi) => {
                              const picked = testAnswers[q.id] === oi;
                              return (
                                <button key={oi} onClick={() => setTestAnswers((a) => ({ ...a, [q.id]: oi }))}
                                  className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${picked ? 'border-emerald-500 bg-emerald-500/5' : 'border-border hover:bg-muted/50'}`}>
                                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${picked ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-muted-foreground/40'}`}>
                                    {picked && <CheckCircle2 className="h-3 w-3" />}
                                  </span>
                                  <span className="flex-1">{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                    disabled={Object.keys(testAnswers).length < totalQuestions} onClick={submitTest}>
                    Submit test {Object.keys(testAnswers).length < totalQuestions && ` (${totalQuestions - Object.keys(testAnswers).length} left)`}
                  </Button>
                </>
              ) : (
                <>
                  <div className={`flex items-center gap-4 rounded-xl border p-5 ${passed ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-amber-500/50 bg-amber-500/5'}`}>
                    <span className={`grid h-14 w-14 place-items-center rounded-full ${passed ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'}`}>
                      {passed ? <GraduationCap className="h-7 w-7" /> : <HelpCircle className="h-7 w-7" />}
                    </span>
                    <div className="flex-1">
                      <p className="text-2xl font-bold">{score} / {totalQuestions} correct · {scorePct}%</p>
                      <p className={`text-sm ${passed ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
                        {passed ? `Chapter complete — ${tutor.name} says well done!` : 'Almost there — review and try again.'}
                      </p>
                    </div>
                  </div>
                  {lesson.quiz.map((q, qi) => {
                    const userAnswer = testAnswers[q.id];
                    const isCorrect = userAnswer === q.correctAnswer;
                    const isWrong = userAnswer !== undefined && userAnswer !== q.correctAnswer;
                    return (
                      <div key={q.id} className={`rounded-xl border p-4 ${isCorrect ? 'border-emerald-500/40' : isWrong ? 'border-rose-500/40' : ''}`}>
                        <div className="flex items-start gap-3">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold">{qi + 1}</span>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium leading-relaxed">{q.question}</p>
                            <div className="mt-3 space-y-1.5">
                              {q.options.map((opt, oi) => {
                                const isRight = oi === q.correctAnswer;
                                const isWrongPick = userAnswer === oi && !isRight;
                                return (
                                  <div key={oi} className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${isRight ? 'border-emerald-500/50 bg-emerald-500/5' : isWrongPick ? 'border-rose-500/50 bg-rose-500/5' : 'border-border'}`}>
                                    <span className="flex-1">{opt}</span>
                                    {isRight && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                                    {isWrongPick && <XCircle className="h-4 w-4 text-rose-600" />}
                                  </div>
                                );
                              })}
                            </div>
                            <div className={`mt-3 rounded-lg border p-3 text-sm ${isCorrect ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-900 dark:text-emerald-200' : 'border-border bg-muted/40 text-muted-foreground'}`}>
                              <span className="font-semibold">{isCorrect ? 'Correct. ' : 'Explanation: '}</span>{q.explanation}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                    <Button variant="outline" size="sm" onClick={restartChapter}><RefreshCw className="mr-1.5 h-4 w-4" /> Restart chapter</Button>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={onAskTutor}><Sparkles className="mr-1.5 h-4 w-4" /> Ask {tutor.name}</Button>
                      {passed && hasNextLesson && onNextLesson ? (
                        <Button size="sm" onClick={() => { setTestPopupOpen(false); onNextLesson(); }}
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
                          Next chapter <ArrowRight className="ml-1.5 h-4 w-4" />
                        </Button>
                      ) : passed ? (
                        <Button size="sm" onClick={() => setTestPopupOpen(false)} className="bg-emerald-600 text-white hover:bg-emerald-700">
                          <CheckCircle2 className="mr-1.5 h-4 w-4" /> Done
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => { setTestSubmitted(false); setTestAnswers({}); }}
                          className="bg-amber-600 text-white hover:bg-amber-700">
                          <RefreshCw className="mr-1.5 h-4 w-4" /> Retry test
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (stage === 'chapter_test' || stage === 'result') return null;
  return null;
}

// ============================================================
// FlowingAnswer
// ============================================================
function FlowingAnswer({ label, icon, active, done, children }: {
  label: string; icon: React.ReactNode; active: boolean; done: boolean; children: React.ReactNode;
}) {
  return (
    <div className={`rounded-lg border p-3 transition-all duration-500 ${active ? 'border-emerald-500/60 bg-emerald-500/10 shadow-sm' : done ? 'border-border bg-background opacity-70' : 'border-border bg-background/40 opacity-50'}`}>
      <p className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider ${active ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground'}`}>
        {icon} {label}
        {active && <span className="ml-1 text-emerald-600">· speaking now</span>}
        {done && !active && <CheckCircle2 className="ml-1 h-3 w-3 text-emerald-500" />}
      </p>
      <div className="mt-1.5 text-foreground/90">{children}</div>
    </div>
  );
}

// ============================================================
// MarkdownLite + renderInline
// ============================================================
function MarkdownLite({ content }: { content: string }) {
  const parts = content.split(/```([\s\S]*?)```/g);
  return (
    <div className="space-y-2">
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          const lines = part.split('\n');
          const lang = lines[0]?.trim() || '';
          const code = lines.slice(lang ? 1 : 0).join('\n').replace(/\n$/, '');
          return (
            <pre key={i} className="overflow-x-auto rounded-lg bg-zinc-950 p-2.5 text-[12px] leading-relaxed text-emerald-200">
              {lang && <div className="mb-1 text-[10px] uppercase tracking-wider text-zinc-500">{lang}</div>}
              <code>{code}</code>
            </pre>
          );
        }
        return (
          <div key={i} className="whitespace-pre-wrap leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderInline(part) }} />
        );
      })}
    </div>
  );
}

function renderInline(text: string): string {
  let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  html = html.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[12px]">$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/^###\s+(.+)$/gm, '<div class="font-semibold mt-1">$1</div>');
  html = html.replace(/^##\s+(.+)$/gm, '<div class="font-semibold text-base mt-1">$1</div>');
  html = html.replace(/^[-*]\s+(.+)$/gm, '<div class="pl-3 before:content-[\'•\'] before:mr-1.5 before:text-muted-foreground">$1</div>');
  return html;
}
