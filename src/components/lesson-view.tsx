'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight,
  Clock, FileQuestion, Lightbulb, ListChecks, Sparkles, Video,
  Pause, Play, Square, Volume2, Loader2, Bot, HelpCircle,
  AlertTriangle, MessageSquare, Send, MessagesSquare,
  Menu, PanelLeftClose, PanelLeftOpen, Mic, MicOff,
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
import { findCourse, findLesson, getAllLessons } from '@/lib/courses';
import { useAppStore } from '@/lib/store';
import { getTutorForCourse, type TutorPersona } from '@/lib/tutor-personas';
import { CourseIcon } from './navbar';
import { SyllabusSidebar, SyllabusDrawer, SyllabusDrawerToggle } from './syllabus-sidebar';
import { Animated3DTutorAvatar, type Animated3DTutorAvatarProps } from './animated-tutor-avatar';
import { FloatingTutorPopup } from './floating-tutor-popup';

// ============================================================
// TTS Helpers — with Google Translate fallback for Indian langs
// ============================================================

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

function browserHasVoiceForLang(lang: string): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  const voices = window.speechSynthesis.getVoices();
  const prefix = lang.toLowerCase();
  return voices.some(v => v.lang.toLowerCase().startsWith(prefix));
}

function playGoogleTTS(text: string, lang: string, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { resolve(); return; }

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
      if (signal?.aborted) { resolve(); return; }
      if (chunkIdx >= chunks.length) { resolve(); return; }
      const chunk = chunks[chunkIdx];
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${ttsLang}&client=tw-ob`;
      const audio = new Audio(url);
      audio.onended = () => { chunkIdx++; playNext(); };
      audio.onerror = () => { resolve(); };
      audio.play().catch(() => resolve());
    }

    playNext();
  });
}

// ============================================================
// Teaching content types
// ============================================================

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

// ============================================================
// Persistent AI Tutor Sidebar Component
// ============================================================

function AITutorSidebar({
  tutor,
  isSpeaking,
  voiceMode,
  voicePlaying,
  voicePaused,
  voicePhase,
  voiceProgress,
  voiceLoading,
  voiceError,
  getPreferredLang,
  onPlay,
  onPauseResume,
  onStop,
  onLangChange,
  onSpeedChange,
  onPrevSlide,
  onNextSlide,
  currentSlide,
  totalSlides,
  slideProgress,
  // Voice chat props
  isVoiceChatting,
  onStartVoiceChat,
  onStopVoiceChat,
  tutorExpression,
}: {
  tutor: TutorPersona;
  isSpeaking: boolean;
  voiceMode: boolean;
  voicePlaying: boolean;
  voicePaused: boolean;
  voicePhase: string;
  voiceProgress: number;
  voiceLoading: boolean;
  voiceError: string | null;
  getPreferredLang: () => string;
  onPlay: () => void;
  onPauseResume: () => void;
  onStop: () => void;
  onLangChange: (lang: string) => void;
  onSpeedChange: (speed: number) => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  currentSlide: number;
  totalSlides: number;
  slideProgress: number;
  // Voice chat props
  isVoiceChatting?: boolean;
  onStartVoiceChat?: () => void;
  onStopVoiceChat?: () => void;
  tutorExpression?: 'neutral' | 'explaining' | 'thinking' | 'happy' | 'curious';
}) {
  // Derive expression from voice state if not explicitly set
  const expression = tutorExpression ?? (
    isVoiceChatting ? 'curious' :
    isSpeaking ? 'explaining' :
    voicePhase === 'awaiting_answer' ? 'curious' :
    voicePhase === 'done' ? 'happy' :
    'neutral'
  );

  return (
    <div className="space-y-3 lg:sticky lg:top-6 lg:self-start">
      {/* Profile Card with Animated Avatar */}
      <Card className="overflow-hidden border-2 border-emerald-500/30">
        <CardContent className="flex flex-col items-center p-4">
          {/* Animated 3D Avatar */}
          <div className="relative">
            <Animated3DTutorAvatar
              speaking={isSpeaking}
              expression={expression}
              size={100}
            />
            {/* Voice Chat Button — overlaid on avatar */}
            <button
              onClick={isVoiceChatting ? onStopVoiceChat : onStartVoiceChat}
              className={`absolute -bottom-1 -right-1 z-20 flex h-8 w-8 items-center justify-center rounded-full shadow-lg transition-all ${
                isVoiceChatting
                  ? 'bg-rose-500 text-white hover:bg-rose-600'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
              title={isVoiceChatting ? 'Stop voice chat' : 'Start voice chat'}
            >
              {isVoiceChatting ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
            </button>
            {/* Voice chat pulse ring */}
            {isVoiceChatting && (
              <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full border-2 border-emerald-400 animate-voice-pulse" />
            )}
          </div>
          <div className="mt-3 text-center">
            <h3 className="text-lg font-bold">{tutor.name}</h3>
            <p className="text-[11px] text-muted-foreground">{tutor.title}</p>
            <p className="mt-0.5 text-[11px] text-emerald-600 dark:text-emerald-400 italic">{tutor.tagline}</p>
          </div>
          {/* Voice chat active badge */}
          {isVoiceChatting && (
            <Badge className="mt-2 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 animate-pulse text-[10px]">
              <Mic className="mr-1 h-3 w-3" /> Listening...
            </Badge>
          )}
          {/* Status badge */}
          <div className="mt-2 flex items-center gap-1.5">
            {voiceMode && voicePlaying && !voicePaused && !isVoiceChatting && (
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 animate-pulse text-[10px]">
                <Volume2 className="mr-1 h-3 w-3" /> Speaking...
              </Badge>
            )}
            {voiceMode && voicePaused && (
              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px]">
                <Pause className="mr-1 h-3 w-3" /> Paused
              </Badge>
            )}
            {voiceMode && voicePhase === 'done' && !voicePlaying && (
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px]">
                <CheckCircle2 className="mr-1 h-3 w-3" /> Done
              </Badge>
            )}
            {!voiceMode && !voiceLoading && !isVoiceChatting && (
              <Badge variant="outline" className="text-muted-foreground text-[10px]">Ready</Badge>
            )}
            {voiceLoading && (
              <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 text-[10px]">
                <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Loading...
              </Badge>
            )}
          </div>
          {/* Progress bar when in voice mode */}
          {voiceMode && (
            <div className="mt-2 w-full">
              <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-0.5">
                <span className="capitalize">{voicePhase === 'awaiting_answer' ? 'Waiting' : voicePhase}</span>
                <span>{Math.round(voiceProgress)}%</span>
              </div>
              <Progress value={voiceProgress} className="h-1" />
            </div>
          )}
          {voiceError && (
            <p className="mt-1 text-[10px] text-rose-600 dark:text-rose-400">{voiceError}</p>
          )}
        </CardContent>
      </Card>

      {/* Voice Controls Card — always visible */}
      <Card className="overflow-hidden">
        <CardContent className="p-3 space-y-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Voice Controls</p>

          {/* Language selector */}
          <div className="space-y-0.5">
            <label className="text-[10px] font-medium text-muted-foreground">Language</label>
            <select
              value={getPreferredLang()}
              onChange={(e) => onLangChange(e.target.value)}
              className="w-full rounded-md border bg-background px-2 py-1.5 text-xs cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
            </select>
          </div>

          {/* Speed slider */}
          <div className="space-y-0.5">
            <label className="text-[10px] font-medium text-muted-foreground">Speed</label>
            <input
              type="range" min="0.5" max="1.5" step="0.1" defaultValue="0.9"
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="w-full h-1 cursor-pointer"
            />
          </div>

          {/* Play / Pause / Stop buttons — always present */}
          <div className="flex items-center gap-1.5">
            {!voiceMode ? (
              <Button className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 h-8 text-xs" onClick={onPlay} disabled={voiceLoading}>
                <Play className="mr-1 h-3.5 w-3.5" /> Play
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={onPauseResume} className="flex-1 h-8 text-xs">
                  {voicePaused ? <><Play className="mr-1 h-3.5 w-3.5" /> Resume</> : <><Pause className="mr-1 h-3.5 w-3.5" /> Pause</>}
                </Button>
                <Button variant="destructive" size="sm" onClick={onStop} className="flex-1 h-8 text-xs">
                  <Square className="mr-1 h-3.5 w-3.5" /> Stop
                </Button>
              </>
            )}
          </div>

          {/* Slide navigation */}
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={onPrevSlide} disabled={currentSlide === 0} className="flex-1 h-8 text-xs">
              <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Prev
            </Button>
            <span className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">
              {currentSlide + 1}/{totalSlides}
            </span>
            <Button variant="outline" size="sm" onClick={onNextSlide} className="flex-1 h-8 text-xs">
              Next <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <Progress value={slideProgress} className="flex-1 h-1" />
            <span className="text-[9px] text-muted-foreground tabular-nums">{slideProgress}%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// FlowingAnswer + MarkdownLite (reused from voice-chapter-tutor)
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
      <div className="mt-1.5 text-foreground/90 text-sm">{children}</div>
    </div>
  );
}

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
          <div key={i} className="whitespace-pre-wrap leading-relaxed text-sm"
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

// ============================================================
// LessonView — with persistent AI tutor sidebar
// ============================================================

export function LessonView({ courseId, moduleId, lessonId }: { courseId: string; moduleId: string; lessonId: string }) {
  const result = findLesson(courseId, moduleId, lessonId);
  const openCourse = useAppStore((s) => s.openCourse);
  const openQuiz = useAppStore((s) => s.openQuiz);
  const setTutorOpen = useAppStore((s) => s.setTutorOpen);
  const markLessonComplete = useAppStore((s) => s.markLessonComplete);
  const completedLessons = useAppStore((s) => s.completedLessons) ?? [];
  const passedLessonTests = useAppStore((s) => s.passedLessonTests) ?? [];
  const markLessonTestPassed = useAppStore((s) => s.markLessonTestPassed);
  const [activeStep, setActiveStep] = useState(0);
  const stepRef = useRef<HTMLDivElement>(null);

  // AI tutor state
  const tutor = getTutorForCourse(courseId);

  // Voice state
  const [voiceMode, setVoiceMode] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [voicePaused, setVoicePaused] = useState(false);
  const [voicePhase, setVoicePhase] = useState<string>('intro');
  const [voiceProgress, setVoiceProgress] = useState(0);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Voice chat state (Web Speech API)
  const [isVoiceChatting, setIsVoiceChatting] = useState(false);
  const [chapterPausedAt, setChapterPausedAt] = useState<number | null>(null);
  const [showContinuePrompt, setShowContinuePrompt] = useState(false);
  const [voiceChatTranscript, setVoiceChatTranscript] = useState('');
  const [voiceChatResponse, setVoiceChatResponse] = useState('');
  const [voiceChatLoading, setVoiceChatLoading] = useState(false);
  const [tutorExpression, setTutorExpression] = useState<'neutral' | 'explaining' | 'thinking' | 'happy' | 'curious'>('neutral');
  const speechRecognitionRef = useRef<any>(null);

  // Teaching content state
  const [teachings, setTeachings] = useState<Record<number, SlideTeaching>>({});
  const [teachError, setTeachError] = useState<string | null>(null);
  const [loadingTeach, setLoadingTeach] = useState(false);

  // Check question popup
  const [questionPopupOpen, setQuestionPopupOpen] = useState(false);
  const [popupAnswer, setPopupAnswer] = useState<number | null>(null);
  const [popupRevealed, setPopupRevealed] = useState(false);
  const [popupWasCorrect, setPopupWasCorrect] = useState(false);
  const [showWrongAnswerWarning, setShowWrongAnswerWarning] = useState(false);

  // Q&A state
  const [qaInput, setQaInput] = useState('');
  const [slideQA, setSlideQA] = useState<Record<number, { q: string; a: string; loading: boolean }>>({});
  const [qaHistory, setQaHistory] = useState<QAHistoryItem[]>([]);

  // Test state
  const [testAnswers, setTestAnswers] = useState<Record<string, number>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testPopupOpen, setTestPopupOpen] = useState(false);

  // Syllabus sidebar state
  const [syllabusVisible, setSyllabusVisible] = useState(true);
  const [syllabusDrawerOpen, setSyllabusDrawerOpen] = useState(false);

  // Refs
  const abortRef = useRef<AbortController | null>(null);
  const audioRef = useRef<{ _timer?: ReturnType<typeof setInterval> } | null>(null);
  const startedVoiceForSlide = useRef<Set<number>>(new Set());

  const course = findCourse(courseId);
  const allLessons = getAllLessons(courseId);
  const currentIndex = allLessons.findIndex((l) => l.lessonId === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const isComplete = completedLessons.includes(lessonId);
  const testAlreadyPassed = passedLessonTests.includes(lessonId);

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
  const totalSlides = lesson.steps.length;
  const totalQuestions = lesson.quiz.length;

  // ============================================================
  // GET PREFERRED LANG
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

  // ============================================================
  // PICK SYSTEM VOICE — gender-aware
  // ============================================================
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
      en: ['female', 'samantha', 'victoria', 'karen', 'zira', 'google us english', 'shruti', 'swara', 'heera'],
      hi: ['hindi', 'heera', 'shruti', 'swara', 'lata', 'female'],
      ta: ['tamil', 'pallavi', 'female'],
      te: ['telugu', 'female'],
      kn: ['kannada', 'female'],
    };
    const maleVoicePatterns: Record<string, string[]> = {
      en: ['male', 'daniel', 'james', 'alex', 'fred', 'rishi', 'hemant'],
      hi: ['male', 'hemant', 'lala'],
      ta: ['male'],
      te: ['male'],
      kn: ['male'],
    };

    const nameHints = isFemaleTutor
      ? (femaleVoicePatterns[langPrefix] ?? ['female'])
      : (maleVoicePatterns[langPrefix] ?? ['male']);

    // Try exact BCP-47 with gender
    for (const hint of nameHints) {
      const match = voices.find(v => v.lang === preferredBcp47 && v.name.toLowerCase().includes(hint));
      if (match) return match;
    }
    // Try case-insensitive BCP-47 with gender
    for (const hint of nameHints) {
      const match = voices.find(v => v.lang.toLowerCase() === preferredBcp47.toLowerCase() && v.name.toLowerCase().includes(hint));
      if (match) return match;
    }
    // Any voice for exact BCP-47
    const exactMatch = voices.find(v => v.lang === preferredBcp47);
    if (exactMatch) return exactMatch;
    // Language prefix with gender
    for (const hint of nameHints) {
      const match = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix) && v.name.toLowerCase().includes(hint));
      if (match) return match;
    }
    // Any voice for language prefix
    const prefixMatch = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
    if (prefixMatch) return prefixMatch;
    // English fallback
    const anyEnglish = voices.find(v => v.lang.toLowerCase().startsWith('en'));
    if (anyEnglish) return anyEnglish;
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
  // SPEAK CHUNK — with Google TTS fallback for Indian languages
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
        playGoogleTTS(spoken, preferredLang, signal).then(resolve).catch(() => resolve());
        return;
      }
      // Hindi may or may not have voices — check
      if (preferredLang === 'hi' && !browserHasVoiceForLang('hi')) {
        playGoogleTTS(spoken, 'hi', signal).then(resolve).catch(() => resolve());
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
          // Try Google TTS as fallback even for languages that should have voices
          playGoogleTTS(spoken, preferredLang, signal).then(resolve).catch(() => resolve());
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

  const startProgressTimer = (estimatedSeconds: number, rangeStart: number, rangeEnd: number) => {
    const startTime = Date.now();
    const span = rangeEnd - rangeStart;
    const timer = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const pct = Math.min(95, (elapsed / Math.max(1, estimatedSeconds)) * 100);
      setVoiceProgress(rangeStart + Math.min(span, (pct / 100) * span));
      if (elapsed >= estimatedSeconds * 1.5) clearInterval(timer);
    }, 250);
    if (!audioRef.current) audioRef.current = {};
    audioRef.current._timer = timer;
    return () => clearInterval(timer);
  };

  // ============================================================
  // FETCH TEACHING FOR SLIDE
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

  // ============================================================
  // SLIDE CHANGE — stop voice, reset states, DON'T hide controls
  // ============================================================
  useEffect(() => {
    // Stop current voice when slide changes
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

    // Reset voice state but keep the tutor sidebar visible
    setVoiceMode(false);
    setVoicePlaying(false);
    setVoicePaused(false);
    setVoiceProgress(0);
    setVoicePhase('intro');
    setVoiceError(null);
    setQaInput('');
    setTeachError(null);
    setQuestionPopupOpen(false);
    setPopupAnswer(null);
    setPopupRevealed(false);
    setPopupWasCorrect(false);
    setShowWrongAnswerWarning(false);

    // Auto-fetch teaching for the new slide
    if (activeStep !== undefined) {
      fetchTeachingForSlide(activeStep);
    }

    if (stepRef.current) stepRef.current.scrollTop = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep]);

  // Reset on lesson change
  useEffect(() => {
    setActiveStep(0);
    setTeachings({});
    startedVoiceForSlide.current.clear();
    setTestAnswers({});
    setTestSubmitted(false);
    setTestPopupOpen(false);
  }, [lessonId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
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
  // VOICE-OVER MAIN FLOW
  // ============================================================
  const startVoiceOver = async (preloadedTeaching?: SlideTeaching) => {
    if (voiceLoading) return;

    // Stop any existing voice first
    if (abortRef.current) abortRef.current.abort();
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();

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

    // Speak a brief intro for this slide
    try {
      setVoicePhase('intro');
      const introText = `Slide ${activeStep + 1}: ${step.title}.`;
      const introSeconds = 3;
      const stopTimerIntro = startProgressTimer(introSeconds, 0, 5);
      setVoicePlaying(true);
      await speakChunk(introText, signal);
      if (signal.aborted) return;
      stopTimerIntro();
    } catch { /* continue */ }

    if (signal.aborted) return;

    // Fetch teaching if not already loaded
    let teaching = preloadedTeaching ?? teachings[activeStep];
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
            slideTitle: step.title,
            slideContent: step.content,
            slideCode: step.code,
            codeLanguage: step.codeLanguage,
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTeachings((prev) => ({ ...prev, [activeStep]: data }));
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
        step.content,
        `Let me explain. ${teaching.explanation}`,
      ].join(' ');
      const phase1WordCount = phase1Script.split(/\s+/).length;
      const phase1Seconds = Math.max(8, Math.round((phase1WordCount / 120) * 60));
      setVoicePhase('explanation');
      const stopTimer1 = startProgressTimer(phase1Seconds, 0, 35);
      setVoicePlaying(true);
      await speakChunk(phase1Script, signal);
      if (signal.aborted) return;
      stopTimer1();
      setVoicePlaying(false);

      // Ask mid-lesson question
      await speakChunk(
        `Now, before we continue, please answer this question. ` +
        `The question is: ${teaching.checkQuestion.question}. ` +
        `Pick the option you think is correct.`,
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
    const teaching = teachings[activeStep];
    if (!teaching) return;
    const isCorrect = popupAnswer === teaching.checkQuestion.correctAnswer;
    setPopupWasCorrect(isCorrect);
    setPopupRevealed(true);
    if (isCorrect) {
      speakChunk(`That's correct. ${teaching.checkQuestion.explanation} Let's continue with a real-world example.`).catch(() => {});
    } else {
      speakChunk(
        `That answer is not correct. The correct answer is: ${teaching.checkQuestion.options[teaching.checkQuestion.correctAnswer]}. ` +
        `${teaching.checkQuestion.explanation} Let me show you a real-world example.`
      ).catch(() => {});
      setShowWrongAnswerWarning(true);
    }
  };

  const continueAfterPopupAnswer = async () => {
    const teaching = teachings[activeStep];
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
      const phase3Script = `Watch out for this common pitfall. ${teaching.pitfall} That wraps up this step.`;
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
      setVoiceError(err instanceof Error ? err.message : 'Voice generation failed');
      setVoicePlaying(false);
    }
  };

  // ============================================================
  // VOICE CONTROL HANDLERS
  // ============================================================
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
    setVoicePhase('intro');
    setVoiceError(null);
    setQuestionPopupOpen(false);
    setPopupAnswer(null);
    setPopupRevealed(false);
    setPopupWasCorrect(false);
    setShowWrongAnswerWarning(false);
  };

  const handleLangChange = (lang: string) => {
    try {
      const raw = window.localStorage.getItem('marq-ai-tutor-intro-prefs') ?? '{}';
      const p = JSON.parse(raw);
      p.lang = lang;
      window.localStorage.setItem('marq-ai-tutor-intro-prefs', JSON.stringify(p));
    } catch { /* noop */ }
    // Restart voice-over in new language if currently playing
    if (voiceMode) {
      stopVoice();
      setTimeout(() => startVoiceOver(), 200);
    }
  };

  const handleSpeedChange = (speed: number) => {
    try {
      const raw = window.localStorage.getItem('marq-ai-tutor-intro-prefs') ?? '{}';
      const p = JSON.parse(raw);
      p.rate = speed;
      window.localStorage.setItem('marq-ai-tutor-intro-prefs', JSON.stringify(p));
    } catch { /* noop */ }
  };

  // ============================================================
  // VOICE CHAT — Web Speech API with pause/resume chapter logic
  // ============================================================
  const startVoiceChat = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Pause current chapter if playing
    if (voiceMode && voicePlaying) {
      setChapterPausedAt(activeStep);
      // Pause the current TTS
      if (window.speechSynthesis) {
        window.speechSynthesis.pause();
      }
      setVoicePaused(true);
      setVoicePlaying(false);
    } else if (voiceMode) {
      setChapterPausedAt(activeStep);
    } else {
      setChapterPausedAt(null);
    }

    setIsVoiceChatting(true);
    setTutorExpression('curious');
    setVoiceChatTranscript('');
    setVoiceChatResponse('');

    // Start SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Voice recognition not supported in this browser.');
      setIsVoiceChatting(false);
      setTutorExpression('neutral');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceChatTranscript(transcript);
      setIsVoiceChatting(false);
      setTutorExpression('thinking');
      setVoiceChatLoading(true);

      // Send to AI tutor
      try {
        const res = await fetch('/api/chapter-tutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'answer_question',
            courseId: course.id,
            courseContext: `${course.title} — ${course.subtitle}`,
            lessonTitle: lesson.title,
            slideTitle: step.title,
            slideContent: step.content,
            slideCode: step.code,
            codeLanguage: step.codeLanguage,
            studentQuestion: transcript,
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const answer = data.content;
        setVoiceChatResponse(answer);
        setVoiceChatLoading(false);
        setTutorExpression('happy');

        // Speak the answer via TTS
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(answer);
          utterance.rate = 0.9;
          utterance.onend = () => {
            // After TTS finishes, show continue prompt
            setShowContinuePrompt(true);
            setTutorExpression('neutral');
          };
          window.speechSynthesis.speak(utterance);
        } else {
          setShowContinuePrompt(true);
          setTutorExpression('neutral');
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to get response';
        setVoiceChatResponse(`Sorry, I couldn't answer right now. ${msg}`);
        setVoiceChatLoading(false);
        setTutorExpression('neutral');
        setShowContinuePrompt(true);
      }
    };

    recognition.onerror = () => {
      setIsVoiceChatting(false);
      setTutorExpression('neutral');
    };

    recognition.onend = () => {
      // Only reset if we didn't get a result (user cancelled)
      if (!voiceChatTranscript) {
        setIsVoiceChatting(false);
        setTutorExpression('neutral');
      }
    };

    recognition.start();
    speechRecognitionRef.current = recognition;
  }, [voiceMode, voicePlaying, activeStep, course.id, course.title, course.subtitle, lesson.title, step.title, step.content, step.code, step.codeLanguage, voiceChatTranscript]);

  const stopVoiceChat = useCallback(() => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      speechRecognitionRef.current = null;
    }
    setIsVoiceChatting(false);
    setTutorExpression('neutral');
  }, []);

  const handleContinueClass = useCallback(() => {
    setShowContinuePrompt(false);
    setVoiceChatTranscript('');
    setVoiceChatResponse('');

    // Resume chapter from where it was paused
    if (chapterPausedAt !== null) {
      if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setVoicePlaying(true);
        setVoicePaused(false);
      } else {
        // Restart voice over for the current slide
        startVoiceOver();
      }
    }
    setChapterPausedAt(null);
  }, [chapterPausedAt]);

  const handleStayInChat = useCallback(() => {
    setShowContinuePrompt(false);
    // Keep the chat open, don't resume the chapter
    setTutorOpen(true);
    setChapterPausedAt(null);
  }, [setTutorOpen]);

  const handlePrevSlide = () => {
    stopVoice();
    if (activeStep > 0) setActiveStep((s) => s - 1);
  };

  const handleNextSlide = () => {
    stopVoice();
    if (activeStep < totalSlides - 1) {
      setActiveStep((s) => s + 1);
    } else {
      setTestPopupOpen(true);
    }
  };

  const askQuestion = async () => {
    const q = qaInput.trim();
    if (!q || slideQA[activeStep]?.loading) return;
    setSlideQA((prev) => ({ ...prev, [activeStep]: { q, a: '', loading: true } }));
    try {
      const res = await fetch('/api/chapter-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'answer_question',
          courseId: course.id,
          courseContext: `${course.title} — ${course.subtitle}`,
          lessonTitle: lesson.title,
          slideTitle: step.title,
          slideContent: step.content,
          slideCode: step.code,
          codeLanguage: step.codeLanguage,
          studentQuestion: q,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const answer = data.content;
      setSlideQA((prev) => ({ ...prev, [activeStep]: { q, a: answer, loading: false } }));
      setQaHistory((prev) => [
        ...prev,
        { slideIdx: activeStep, slideTitle: step.title, question: q, answer, askedAt: Date.now() },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed';
      const fallback = `Sorry, I could not answer right now. ${msg}`;
      setSlideQA((prev) => ({ ...prev, [activeStep]: { q, a: fallback, loading: false } }));
    }
  };

  const submitTest = () => {
    setTestSubmitted(true);
    const score = lesson.quiz.reduce(
      (acc, q) => (testAnswers[q.id] === q.correctAnswer ? acc + 1 : acc),
      0,
    );
    const pct = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
    if (pct >= 60) markLessonTestPassed(lessonId);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isSpeaking = voiceMode && voicePlaying && !voicePaused;
  const teaching = teachings[activeStep];
  const score = lesson.quiz.reduce(
    (acc, q) => (testAnswers[q.id] === q.correctAnswer ? acc + 1 : acc),
    0,
  );
  const scorePct = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
  const passed = scorePct >= 60;

  return (
    <div className="bg-background">
      {/* Desktop Syllabus Sidebar - Fixed position */}
      {syllabusVisible && (
        <SyllabusSidebar
          courseId={courseId}
          currentModuleId={moduleId}
          currentLessonId={lessonId}
        />
      )}

      {/* Mobile Syllabus Drawer */}
      <SyllabusDrawer
        courseId={courseId}
        currentModuleId={moduleId}
        currentLessonId={lessonId}
        open={syllabusDrawerOpen}
        onOpenChange={setSyllabusDrawerOpen}
      />

      {/* Main content wrapper - shift right when syllabus is visible on desktop */}
      <div className={`${syllabusVisible ? 'lg:ml-[280px]' : ''}`}>
        {/* Breadcrumb + header */}
        <div className="border-b bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => openCourse(courseId)}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> {c.title}
              </button>
              {/* Mobile Syllabus Toggle */}
              <div className="hidden lg:flex items-center gap-2 ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSyllabusVisible(!syllabusVisible)}
                  className="gap-1.5"
                >
                  {syllabusVisible ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
                  <span className="hidden sm:inline">{syllabusVisible ? 'Hide' : 'Syllabus'}</span>
                </Button>
              </div>
              {/* Mobile: Syllabus Drawer Toggle */}
              <div className="lg:hidden ml-auto">
                <SyllabusDrawerToggle onClick={() => setSyllabusDrawerOpen(true)} />
              </div>
            </div>
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

        {/* Main layout: Full-width lesson content with floating AI tutor popup */}
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Lesson Content */}
        <div ref={stepRef} className="min-w-0 space-y-5">
          {/* Video */}
          <Card className="overflow-hidden">
            <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
              <Video className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium">Video Training</span>
              <span className="ml-auto text-xs text-muted-foreground">~{lesson.duration}</span>
            </div>
            <div className="relative aspect-video bg-black">
              {lesson.videoUrl.includes('youtube.com/embed') ? (
                <iframe
                  key={lesson.videoUrl}
                  src={lesson.videoUrl}
                  title="Video Training"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              ) : (
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
              )}
              {!lesson.videoUrl.includes('youtube.com/embed') && (
                <div
                  style={{ display: 'none' }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 text-center text-zinc-200"
                >
                  <Video className="h-10 w-10 text-emerald-400" />
                  <p className="text-sm font-medium">Video preview unavailable</p>
                  <p className="max-w-md text-xs text-zinc-400">
                    The walkthrough video could not be loaded right now. The step-by-step guide below is complete and self-contained.
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
              )}
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
                    onClick={() => { stopVoice(); setActiveStep(i); }}
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

              <div className="space-y-5 p-5 sm:p-6">
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

                {/* AI Teaching Content */}
                {loadingTeach && !teaching && (
                  <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
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
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => startVoiceOver(teaching)}>
                    <Volume2 className="mr-1.5 h-4 w-4" /> Replay voice-over
                  </Button>
                )}

                {/* Step nav */}
                <div className="flex items-center justify-between border-t pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activeStep === 0}
                    onClick={() => { stopVoice(); setActiveStep((s) => Math.max(0, s - 1)); }}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Previous step
                  </Button>
                  {activeStep < lesson.steps.length - 1 ? (
                    <Button
                      size="sm"
                      onClick={() => { stopVoice(); setActiveStep((s) => s + 1); }}
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

          {/* Q&A section */}
          <div className="rounded-xl border bg-background/60 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" /> Ask {tutor.name} a follow-up
            </p>
            {slideQA[activeStep] && (
              <div className="mt-3 space-y-2">
                <div className="rounded-md bg-emerald-500/10 px-2.5 py-1.5 text-xs">
                  <span className="font-semibold">You: </span>{slideQA[activeStep].q}
                </div>
                {slideQA[activeStep].loading ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> {tutor.name} is thinking...
                  </div>
                ) : (
                  <div className="rounded-md bg-muted/50 px-2.5 py-1.5 text-xs">
                    <span className="font-semibold">{tutor.name}: </span>{slideQA[activeStep].a}
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
      </div>

      {/* Mid-lesson question popup */}
      <Dialog open={questionPopupOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={`grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br ${
                tutor.gender === 'female' ? 'from-emerald-500 to-teal-600' : 'from-blue-500 to-indigo-600'
              } text-white`}>
                <span className="text-sm font-bold">{tutor.initial}</span>
              </div>
              Quick Check — Are you following?
            </DialogTitle>
            <DialogDescription>
              {teachings[activeStep]?.checkQuestion.question ?? 'Loading question...'}
            </DialogDescription>
          </DialogHeader>
          {teachings[activeStep] && (
            <div className="space-y-3">
              {teachings[activeStep].checkQuestion.options.map((opt, oi) => {
                const picked = popupAnswer === oi;
                const isCorrect = oi === teachings[activeStep].checkQuestion.correctAnswer;
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
                    {popupRevealed && isWrongPick && <span className="h-4 w-4 text-rose-600">✕</span>}
                  </button>
                );
              })}
              {showWrongAnswerWarning && !popupWasCorrect && popupRevealed && (
                <div className="rounded-lg border-2 border-rose-500/50 bg-rose-500/10 p-3 text-sm text-rose-900 dark:text-rose-200">
                  <p className="flex items-center gap-1.5 font-semibold"><AlertTriangle className="h-4 w-4" /> Please listen carefully</p>
                  <p className="mt-1 text-xs">That answer is not correct. {tutor.name} will walk you through a real-world example.</p>
                </div>
              )}
              {popupWasCorrect && popupRevealed && (
                <div className="rounded-lg border-2 border-emerald-500/50 bg-emerald-500/10 p-3 text-sm text-emerald-900 dark:text-emerald-200">
                  <p className="flex items-center gap-1.5 font-semibold"><CheckCircle2 className="h-4 w-4" /> Correct!</p>
                  <p className="mt-1 text-xs">{teachings[activeStep].checkQuestion.explanation}</p>
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
          {!teachings[activeStep] && (
            <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading question...
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Voice Chat Continue Prompt Dialog */}
      <Dialog open={showContinuePrompt} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Animated3DTutorAvatar speaking={false} expression="happy" size={40} />
              Shall we continue the class?
            </DialogTitle>
            <DialogDescription>
              {voiceChatTranscript && (
                <div className="space-y-2 mt-2">
                  <div className="rounded-md bg-muted/50 px-3 py-2 text-xs">
                    <span className="font-semibold">You asked: </span>{voiceChatTranscript}
                  </div>
                  {voiceChatResponse && (
                    <div className="rounded-md bg-emerald-500/10 px-3 py-2 text-xs">
                      <span className="font-semibold">{tutor.name}: </span>{voiceChatResponse}
                    </div>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleStayInChat} className="flex-1">
              <MessageSquare className="mr-1.5 h-4 w-4" /> Keep Chatting
            </Button>
            <Button onClick={handleContinueClass} className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700">
              <Play className="mr-1.5 h-4 w-4" /> Continue Class
            </Button>
          </DialogFooter>
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
              <span className={`grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br ${c.gradient} text-white`}>
                <ListChecks className="h-4 w-4" />
              </span>
              Chapter Test · {lesson.title}
            </DialogTitle>
            <DialogDescription>
              {testAlreadyPassed
                ? 'You have already passed this test. You can retake it any time.'
                : 'Pass with 60% or higher to unlock the next chapter.'}
            </DialogDescription>
          </DialogHeader>
          {!testAlreadyPassed && (
            <div className="rounded-lg border-2 border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200">
              <p className="flex items-center gap-1.5 font-semibold"><AlertTriangle className="h-4 w-4" /> Next chapter is locked</p>
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
                    {passed ? <CheckCircle2 className="h-7 w-7" /> : <HelpCircle className="h-7 w-7" />}
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
                                  {isWrongPick && <span className="h-4 w-4 text-rose-600">✕</span>}
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
                  <Button variant="outline" size="sm" onClick={() => { setTestSubmitted(false); setTestAnswers({}); setTestPopupOpen(false); }}>
                    <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to lesson
                  </Button>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setTutorOpen(true)}>
                      <Sparkles className="mr-1.5 h-4 w-4" /> Ask {tutor.name}
                    </Button>
                    {passed && nextLesson ? (
                      <Button size="sm" onClick={() => { setTestPopupOpen(false); useAppStore.getState().openLesson(nextLesson.courseId, nextLesson.moduleId, nextLesson.lessonId); }}
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
                        Retry test
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating AI Tutor Popup — always visible, draggable, zoomable */}
      <FloatingTutorPopup
        tutor={tutor}
        courseId={courseId}
        course={course}
        isSpeaking={isSpeaking}
        voiceMode={voiceMode}
        voicePlaying={voicePlaying}
        voicePaused={voicePaused}
        voicePhase={voicePhase}
        voiceProgress={voiceProgress}
        voiceLoading={voiceLoading}
        voiceError={voiceError}
        getPreferredLang={getPreferredLang}
        onPlay={() => startVoiceOver()}
        onPauseResume={togglePlayPause}
        onStop={stopVoice}
        onLangChange={handleLangChange}
        onSpeedChange={handleSpeedChange}
        onPrevSlide={handlePrevSlide}
        onNextSlide={handleNextSlide}
        currentSlide={activeStep}
        totalSlides={totalSlides}
        slideProgress={stepProgress}
        isVoiceChatting={isVoiceChatting}
        onStartVoiceChat={startVoiceChat}
        onStopVoiceChat={stopVoiceChat}
        tutorExpression={tutorExpression}
        showContinuePrompt={showContinuePrompt}
        onContinueClass={handleContinueClass}
        onStayInChat={handleStayInChat}
      />
      </div>
    </div>
  );
}
