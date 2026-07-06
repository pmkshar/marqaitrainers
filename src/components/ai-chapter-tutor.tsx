'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight, Bot, CheckCircle2, ChevronLeft, ChevronRight, Clock,
  Lightbulb, Loader2, PlayCircle, Presentation, RefreshCw, Send,
  Sparkles, XCircle, GraduationCap, ListChecks, HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Course, Lesson, Module } from '@/lib/types';

// ============================================================
// AIChapterTutor
// ------------------------------------------------------------
// Replaces the irrelevant sample video player with an
// interactive AI-led chapter presentation:
//
//   1. Slide-by-slide teaching with a presentation layout
//   2. AI elaboration per slide (explanation, example, pitfall)
//   3. Inline quick-check question per slide
//   4. Chapter test (mini quiz) at the end
//   5. Estimated duration per slide and overall chapter
//
// Replicable across all courses — pass any Course + Lesson.
// ============================================================

interface AIChapterTutorProps {
  course: Course;
  module: Module;
  lesson: Lesson;
  /** Called when the student finishes the chapter test */
  onComplete?: (scorePct: number) => void;
  /** Called when the student wants to open the full chat tutor */
  onAskTutor?: () => void;
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

// Parse "45 min" / "1h 30 min" / "75 min" into minutes
function parseDurationMinutes(duration: string): number {
  const hMatch = duration.match(/(\d+)\s*h/i);
  const mMatch = duration.match(/(\d+)\s*min/i);
  const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
  const mins = mMatch ? parseInt(mMatch[1], 10) : 0;
  if (hours === 0 && mins === 0) {
    // Try parsing as plain number
    const n = parseInt(duration, 10);
    return isNaN(n) ? 30 : n;
  }
  return hours * 60 + mins;
}

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

export function AIChapterTutor({ course, module: mod, lesson, onComplete, onAskTutor }: AIChapterTutorProps) {
  const totalSlides = lesson.steps.length;
  const totalQuestions = lesson.quiz.length;

  const [stage, setStage] = useState<Stage>('slides');
  const [slideIdx, setSlideIdx] = useState(0);

  // Per-slide AI teaching
  const [teachings, setTeachings] = useState<Record<number, SlideTeaching>>({});
  const [loadingTeach, setLoadingTeach] = useState(false);
  const [teachError, setTeachError] = useState<string | null>(null);

  // Per-slide quick-check answers (slideIdx -> optionIndex)
  const [quickAnswers, setQuickAnswers] = useState<Record<number, number>>({});
  const [quickRevealed, setQuickRevealed] = useState<Record<number, boolean>>({});

  // Per-slide free-form question & answer
  const [slideQA, setSlideQA] = useState<Record<number, { q: string; a: string; loading: boolean }>>({});
  const [qaInput, setQaInput] = useState('');

  // Chapter test state
  const [testAnswers, setTestAnswers] = useState<Record<string, number>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);

  const slideRef = useRef<HTMLDivElement>(null);

  const totalMinutes = useMemo(() => parseDurationMinutes(lesson.duration), [lesson.duration]);
  const perSlideMinutes = totalSlides > 0 ? Math.max(3, Math.round(totalMinutes / totalSlides)) : 5;

  const slide = lesson.steps[slideIdx];
  const slideProgress = Math.round(((slideIdx + 1) / totalSlides) * 100);

  // Reset transient state when slide changes
  useEffect(() => {
    setQaInput('');
    setTeachError(null);
    if (slideRef.current) slideRef.current.scrollTop = 0;
  }, [slideIdx]);

  // ---- AI teaching actions ----
  const fetchTeaching = async () => {
    if (teachings[slideIdx] || loadingTeach) return;
    setLoadingTeach(true);
    setTeachError(null);
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
    } catch (err) {
      setTeachError(err instanceof Error ? err.message : 'Failed to load teaching');
    } finally {
      setLoadingTeach(false);
    }
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
      setSlideQA((prev) => ({ ...prev, [slideIdx]: { q, a: data.content, loading: false } }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed';
      setSlideQA((prev) => ({ ...prev, [slideIdx]: { q, a: `Sorry, I could not answer right now. ${msg}`, loading: false } }));
    }
  };

  // ---- Chapter test actions ----
  const submitTest = () => {
    setTestSubmitted(true);
    const score = lesson.quiz.reduce(
      (acc, q) => (testAnswers[q.id] === q.correctAnswer ? acc + 1 : acc),
      0,
    );
    const pct = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
    onComplete?.(pct);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const restartChapter = () => {
    setStage('slides');
    setSlideIdx(0);
    setQuickAnswers({});
    setQuickRevealed({});
    setTestAnswers({});
    setTestSubmitted(false);
  };

  const score = lesson.quiz.reduce(
    (acc, q) => (testAnswers[q.id] === q.correctAnswer ? acc + 1 : acc),
    0,
  );
  const scorePct = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
  const passed = scorePct >= 60;

  // ============================================================
  // STAGE 1: Slide presentation
  // ============================================================
  if (stage === 'slides') {
    return (
      <div ref={slideRef} className="space-y-4">
        {/* Chapter tutor header */}
        <Card className="overflow-hidden border-emerald-500/30">
          <div className={`bg-gradient-to-r ${course.gradient} px-5 py-4 text-white`}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 backdrop-blur">
                <Presentation className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wider text-white/80">
                  AI Chapter Tutor · {mod.title}
                </p>
                <h2 className="truncate text-lg font-bold sm:text-xl">{lesson.title}</h2>
              </div>
              <Badge className="border-white/30 bg-white/15 text-white">
                <Clock className="mr-1 h-3 w-3" /> {lesson.duration}
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-5 py-2.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Presentation className="h-3.5 w-3.5" /> Slide {slideIdx + 1} of {totalSlides}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> ~{formatMinutes(perSlideMinutes)} for this slide
            </span>
            <span className="flex items-center gap-1">
              <ListChecks className="h-3.5 w-3.5" /> {totalQuestions} questions in chapter test
            </span>
          </div>
        </Card>

        {/* Slide deck */}
        <Card className="overflow-hidden">
          {/* Slide tabs */}
          <div className="flex gap-1 overflow-x-auto border-b bg-muted/30 p-2">
            {lesson.steps.map((s, i) => (
              <button
                key={i}
                onClick={() => setSlideIdx(i)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  i === slideIdx
                    ? 'bg-emerald-600 text-white'
                    : i < slideIdx
                    ? 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300'
                    : 'bg-background text-muted-foreground hover:bg-muted'
                }`}
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-black/10 text-[10px]">
                  {i < slideIdx ? '✓' : i + 1}
                </span>
                <span className="max-w-[160px] truncate">{s.title}</span>
              </button>
            ))}
          </div>

          <CardContent className="space-y-5 p-5 sm:p-7">
            {/* Slide progress */}
            <div className="flex items-center gap-3">
              <Progress value={slideProgress} className="flex-1" />
              <span className="text-xs text-muted-foreground">{slideProgress}%</span>
            </div>

            {/* Slide content - presentation style */}
            <div>
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-600 text-base font-bold text-white">
                  {slideIdx + 1}
                </span>
                <h3 className="pt-1 text-2xl font-bold leading-tight sm:text-3xl">{slide.title}</h3>
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-foreground/90 sm:text-base">
                {slide.content}
              </p>
            </div>

            {/* Code block */}
            {slide.code && (
              <div className="overflow-hidden rounded-xl border bg-zinc-950">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                  <span className="text-xs font-medium text-zinc-400">
                    {slide.codeLanguage ?? 'code'}
                  </span>
                  <span className="text-[10px] text-zinc-500">copy &amp; paste</span>
                </div>
                <SyntaxHighlighter
                  language={slide.codeLanguage ?? 'text'}
                  style={oneDark}
                  customStyle={{ margin: 0, background: 'transparent', padding: '1rem', fontSize: '13px' }}
                  codeTagProps={{ style: { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' } }}
                >
                  {slide.code}
                </SyntaxHighlighter>
              </div>
            )}

            {/* Pro tip */}
            {slide.tip && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-900 dark:text-amber-200">
                <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div>
                  <p className="font-semibold">Pro tip</p>
                  <p className="mt-0.5">{slide.tip}</p>
                </div>
              </div>
            )}

            {/* AI Tutor elaboration panel */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.03] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">AI Tutor elaboration</p>
                    <p className="text-xs text-muted-foreground">
                      Get a detailed explanation, example &amp; common pitfall for this slide
                    </p>
                  </div>
                </div>
                {!teachings[slideIdx] && (
                  <Button
                    size="sm"
                    onClick={fetchTeaching}
                    disabled={loadingTeach}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                  >
                    {loadingTeach ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-1.5 h-4 w-4" />
                    )}
                    {loadingTeach ? 'Teaching…' : 'Explain this slide'}
                  </Button>
                )}
              </div>

              {teachError && (
                <p className="mt-3 text-xs text-rose-600 dark:text-rose-400">
                  Could not load AI teaching: {teachError}.{' '}
                  <button onClick={fetchTeaching} className="underline">Retry</button>
                </p>
              )}

              {teachings[slideIdx] && (
                <div className="mt-4 space-y-4 text-sm">
                  <TeachingSection title="Explanation" icon={<GraduationCap className="h-4 w-4" />}>
                    <MarkdownLite content={teachings[slideIdx].explanation} />
                  </TeachingSection>

                  <TeachingSection title="Real-world example" icon={<Lightbulb className="h-4 w-4" />}>
                    <MarkdownLite content={teachings[slideIdx].example} />
                  </TeachingSection>

                  <TeachingSection title="Common pitfall" icon={<HelpCircle className="h-4 w-4" />}>
                    <MarkdownLite content={teachings[slideIdx].pitfall} />
                  </TeachingSection>

                  {/* Quick check */}
                  <div className="rounded-lg border border-emerald-500/20 bg-background/60 p-3">
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Quick check
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      {teachings[slideIdx].checkQuestion.question}
                    </p>
                    <div className="mt-2 space-y-1.5">
                      {teachings[slideIdx].checkQuestion.options.map((opt, oi) => {
                        const picked = quickAnswers[slideIdx] === oi;
                        const revealed = quickRevealed[slideIdx];
                        const isCorrect = oi === teachings[slideIdx].checkQuestion.correctAnswer;
                        const isWrongPick = revealed && picked && !isCorrect;
                        return (
                          <button
                            key={oi}
                            disabled={revealed}
                            onClick={() => setQuickAnswers((p) => ({ ...p, [slideIdx]: oi }))}
                            className={`flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                              revealed
                                ? isCorrect
                                  ? 'border-emerald-500/50 bg-emerald-500/10'
                                  : isWrongPick
                                  ? 'border-rose-500/50 bg-rose-500/10'
                                  : 'border-border'
                                : picked
                                ? 'border-emerald-500 bg-emerald-500/5'
                                : 'border-border hover:bg-muted/50'
                            } ${revealed ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            <span className="flex-1">{opt}</span>
                            {revealed && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                            {revealed && isWrongPick && <XCircle className="h-4 w-4 text-rose-600" />}
                          </button>
                        );
                      })}
                    </div>
                    {!quickRevealed[slideIdx] ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2.5"
                        disabled={quickAnswers[slideIdx] === undefined}
                        onClick={() => setQuickRevealed((p) => ({ ...p, [slideIdx]: true }))}
                      >
                        Reveal answer
                      </Button>
                    ) : (
                      <p className="mt-2.5 rounded-md bg-muted/60 p-2 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">Explanation: </span>
                        {teachings[slideIdx].checkQuestion.explanation}
                      </p>
                    )}
                  </div>

                  {/* Free-form Q&A about this slide */}
                  <div className="rounded-lg border bg-background/60 p-3">
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <HelpCircle className="h-3.5 w-3.5" /> Ask a follow-up about this slide
                    </p>
                    {slideQA[slideIdx] && (
                      <div className="mt-2.5 space-y-2">
                        <div className="rounded-md bg-emerald-500/10 px-2.5 py-1.5 text-xs">
                          <span className="font-semibold">You: </span>{slideQA[slideIdx].q}
                        </div>
                        {slideQA[slideIdx].loading ? (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" /> TutorAI is thinking…
                          </div>
                        ) : (
                          <div className="rounded-md bg-muted/60 px-2.5 py-1.5 text-xs">
                            <span className="font-semibold">TutorAI: </span>
                            <MarkdownLite content={slideQA[slideIdx].a} />
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mt-2.5 flex gap-2">
                      <input
                        type="text"
                        value={qaInput}
                        onChange={(e) => setQaInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') askQuestion(); }}
                        placeholder="e.g. Why do we use learning rate 0.01?"
                        className="min-w-0 flex-1 rounded-md border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-emerald-500"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!qaInput.trim() || slideQA[slideIdx]?.loading}
                        onClick={askQuestion}
                      >
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Slide navigation */}
            <div className="flex items-center justify-between border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={slideIdx === 0}
                onClick={() => setSlideIdx((i) => Math.max(0, i - 1))}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
              </Button>
              {slideIdx < totalSlides - 1 ? (
                <Button
                  size="sm"
                  onClick={() => setSlideIdx((i) => i + 1)}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Next slide <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setStage('chapter_test')}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                >
                  <ListChecks className="mr-1.5 h-4 w-4" /> Take chapter test
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================================
  // STAGE 2: Chapter test (inline mini quiz)
  // ============================================================
  if (stage === 'chapter_test') {
    return (
      <Card className="overflow-hidden">
        <div className="border-b bg-muted/40 px-5 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${course.gradient} text-white`}>
              <ListChecks className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Chapter Test · {mod.title}
              </p>
              <h2 className="truncate text-lg font-bold sm:text-xl">{lesson.title}</h2>
            </div>
            <Badge variant="outline">{totalQuestions} questions</Badge>
            <Badge variant="outline">Pass: 60%</Badge>
          </div>
        </div>

        <CardContent className="space-y-5 p-5 sm:p-7">
          {!testSubmitted ? (
            <>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium">Progress</p>
                  <p className="text-muted-foreground">
                    {Object.keys(testAnswers).length} of {totalQuestions} answered
                  </p>
                </div>
                <Progress
                  value={totalQuestions ? (Object.keys(testAnswers).length / totalQuestions) * 100 : 0}
                  className="mt-2"
                />
              </div>

              {lesson.quiz.map((q, qi) => (
                <div key={q.id} className="rounded-xl border p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold">
                      {qi + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-relaxed">{q.question}</p>
                      <div className="mt-3 space-y-1.5">
                        {q.options.map((opt, oi) => {
                          const picked = testAnswers[q.id] === oi;
                          return (
                            <button
                              key={oi}
                              disabled={testSubmitted}
                              onClick={() =>
                                setTestAnswers((a) => ({ ...a, [q.id]: oi }))
                              }
                              className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${
                                picked
                                  ? 'border-emerald-500 bg-emerald-500/5'
                                  : 'border-border hover:bg-muted/50'
                              }`}
                            >
                              <span
                                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                                  picked
                                    ? 'border-emerald-500 bg-emerald-500 text-white'
                                    : 'border-muted-foreground/40'
                                }`}
                              >
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

              <div className="flex items-center justify-between border-t pt-4">
                <Button variant="outline" size="sm" onClick={() => setStage('slides')}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back to slides
                </Button>
                <Button
                  size="sm"
                  onClick={submitTest}
                  disabled={Object.keys(testAnswers).length < totalQuestions}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Submit test
                  {Object.keys(testAnswers).length < totalQuestions &&
                    ` (${totalQuestions - Object.keys(testAnswers).length} left)`}
                </Button>
              </div>
            </>
          ) : (
            // Result view
            <>
              <div
                className={`flex items-center gap-4 rounded-xl border p-5 ${
                  passed
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-amber-500/50 bg-amber-500/5'
                }`}
              >
                <span
                  className={`grid h-14 w-14 place-items-center rounded-full ${
                    passed
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {passed ? <GraduationCap className="h-7 w-7" /> : <HelpCircle className="h-7 w-7" />}
                </span>
                <div className="flex-1">
                  <p className="text-2xl font-bold">
                    {score} / {totalQuestions} correct · {scorePct}%
                  </p>
                  <p
                    className={`text-sm ${
                      passed
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {passed
                      ? 'Chapter complete — you passed this test!'
                      : 'Almost there — review the explanations below and try again.'}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={restartChapter}>
                  <RefreshCw className="mr-1.5 h-4 w-4" /> Retry
                </Button>
              </div>

              {lesson.quiz.map((q, qi) => {
                const userAnswer = testAnswers[q.id];
                const isCorrect = userAnswer === q.correctAnswer;
                const isWrong = userAnswer !== undefined && userAnswer !== q.correctAnswer;
                return (
                  <div
                    key={q.id}
                    className={`rounded-xl border p-4 ${
                      isCorrect
                        ? 'border-emerald-500/40'
                        : isWrong
                        ? 'border-rose-500/40'
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold">
                        {qi + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-relaxed">{q.question}</p>
                        <div className="mt-3 space-y-1.5">
                          {q.options.map((opt, oi) => {
                            const isUserPick = userAnswer === oi;
                            const isRight = oi === q.correctAnswer;
                            const isWrongPick = isUserPick && !isRight;
                            return (
                              <div
                                key={oi}
                                className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${
                                  isRight
                                    ? 'border-emerald-500/50 bg-emerald-500/5'
                                    : isWrongPick
                                    ? 'border-rose-500/50 bg-rose-500/5'
                                    : 'border-border'
                                }`}
                              >
                                <span className="flex-1">{opt}</span>
                                {isRight && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                                {isWrongPick && <XCircle className="h-4 w-4 text-rose-600" />}
                              </div>
                            );
                          })}
                        </div>
                        <div
                          className={`mt-3 rounded-lg border p-3 text-sm ${
                            isCorrect
                              ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-900 dark:text-emerald-200'
                              : 'border-border bg-muted/40 text-muted-foreground'
                          }`}
                        >
                          <span className="font-semibold">
                            {isCorrect ? 'Correct. ' : 'Explanation: '}
                          </span>
                          {q.explanation}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <Button variant="outline" size="sm" onClick={restartChapter}>
                  <RefreshCw className="mr-1.5 h-4 w-4" /> Restart chapter
                </Button>
                <Button
                  size="sm"
                  onClick={onAskTutor}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                >
                  <Sparkles className="mr-1.5 h-4 w-4" /> Ask AI Tutor for more
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}

// ============================================================
// Small helpers
// ============================================================

function TeachingSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
        {icon} {title}
      </p>
      <div className="mt-1.5 leading-relaxed text-foreground/90">{children}</div>
    </div>
  );
}

// Tiny markdown renderer: code blocks, inline code, bold, headings, lists.
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
            <pre
              key={i}
              className="overflow-x-auto rounded-lg bg-zinc-950 p-2.5 text-[12px] leading-relaxed text-emerald-200"
            >
              {lang && (
                <div className="mb-1 text-[10px] uppercase tracking-wider text-zinc-500">
                  {lang}
                </div>
              )}
              <code>{code}</code>
            </pre>
          );
        }
        return (
          <div
            key={i}
            className="whitespace-pre-wrap leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderInline(part) }}
          />
        );
      })}
    </div>
  );
}

function renderInline(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[12px]">$1</code>',
  );
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/^###\s+(.+)$/gm, '<div class="font-semibold mt-1">$1</div>');
  html = html.replace(/^##\s+(.+)$/gm, '<div class="font-semibold text-base mt-1">$1</div>');
  html = html.replace(
    /^[-*]\s+(.+)$/gm,
    '<div class="pl-3 before:content-[\'•\'] before:mr-1.5 before:text-muted-foreground">$1</div>',
  );
  return html;
}
