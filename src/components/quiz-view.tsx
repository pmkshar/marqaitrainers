'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, XCircle, Trophy, FileQuestion, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { findCourse, findLesson } from '@/lib/courses';
import { useAppStore } from '@/lib/store';
import { CourseIcon } from './navbar';

export function QuizView({ courseId, moduleId, lessonId }: { courseId: string; moduleId: string; lessonId: string }) {
  const result = findLesson(courseId, moduleId, lessonId);
  const course = findCourse(courseId);
  const { openLesson, openCourse, setTutorOpen, markLessonComplete } = useAppStore();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!result || !course) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4">
        <div className="text-center">
          <p className="text-lg font-semibold">Quiz not found.</p>
          <Button onClick={() => openCourse(courseId)} className="mt-4">Back to course</Button>
        </div>
      </div>
    );
  }

  const { course: c, module: mod, lesson } = result;

  const total = lesson.quiz.length;
  const answered = Object.keys(answers).length;
  const score = lesson.quiz.reduce((acc, q) => (answers[q.id] === q.correctAnswer ? acc + 1 : acc), 0);
  const scorePct = total ? Math.round((score / total) * 100) : 0;
  const passed = scorePct >= 60;

  const handleSubmit = () => {
    setSubmitted(true);
    if (passed) markLessonComplete(lessonId);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => openLesson(courseId, moduleId, lessonId)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to lesson
          </button>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${c.gradient} text-white`}>
              <FileQuestion className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Sample Test · {c.title}</p>
              <h1 className="truncate text-xl font-bold sm:text-2xl">{lesson.title} — Quiz</h1>
            </div>
            <Badge variant="outline">{total} questions</Badge>
            <Badge variant="outline">Pass: 60%</Badge>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Progress / score banner */}
        {!submitted ? (
          <Card className="mb-6">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Progress</p>
                <p className="text-sm text-muted-foreground">{answered} of {total} answered</p>
              </div>
              <Progress value={total ? (answered / total) * 100 : 0} className="mt-2" />
            </CardContent>
          </Card>
        ) : (
          <Card className={`mb-6 ${passed ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-amber-500/50 bg-amber-500/5'}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <span className={`grid h-14 w-14 place-items-center rounded-full ${passed ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'}`}>
                  <Trophy className="h-7 w-7" />
                </span>
                <div className="flex-1">
                  <p className="text-2xl font-bold">{score} / {total} correct · {scorePct}%</p>
                  <p className={`text-sm ${passed ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
                    {passed ? 'Great work — you passed this test! Lesson marked complete.' : 'Almost there — review the explanations below and try again.'}
                  </p>
                </div>
                <Button onClick={handleRetry} variant="outline" size="sm">
                  <RotateCcw className="mr-1.5 h-4 w-4" /> Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions */}
        <div className="space-y-5">
          {lesson.quiz.map((q, qi) => {
            const userAnswer = answers[q.id];
            const isCorrect = submitted && userAnswer === q.correctAnswer;
            const isWrong = submitted && userAnswer !== undefined && userAnswer !== q.correctAnswer;
            return (
              <Card key={q.id} className={submitted ? (isCorrect ? 'border-emerald-500/40' : isWrong ? 'border-rose-500/40' : '') : ''}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold">
                      {qi + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-relaxed">{q.question}</p>
                      <RadioGroup
                        value={userAnswer !== undefined ? String(userAnswer) : ''}
                        onValueChange={(v) => !submitted && setAnswers((a) => ({ ...a, [q.id]: Number(v) }))}
                        className="mt-3 space-y-2"
                      >
                        {q.options.map((opt, oi) => {
                          const isUserPick = userAnswer === oi;
                          const isRight = submitted && oi === q.correctAnswer;
                          const isWrongPick = submitted && isUserPick && oi !== q.correctAnswer;
                          return (
                            <Label
                              key={oi}
                              htmlFor={`${q.id}-${oi}`}
                              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
                                submitted
                                  ? isRight
                                    ? 'border-emerald-500/50 bg-emerald-500/5'
                                    : isWrongPick
                                    ? 'border-rose-500/50 bg-rose-500/5'
                                    : 'border-border'
                                  : isUserPick
                                  ? 'border-emerald-500 bg-emerald-500/5'
                                  : 'border-border hover:bg-muted/50'
                              } ${submitted ? 'cursor-default' : ''}`}
                            >
                              <RadioGroupItem id={`${q.id}-${oi}`} value={String(oi)} disabled={submitted} />
                              <span className="flex-1">{opt}</span>
                              {isRight && <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                              {isWrongPick && <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />}
                            </Label>
                          );
                        })}
                      </RadioGroup>
                      {submitted && (
                        <div className={`mt-3 rounded-lg border p-3 text-sm ${
                          isCorrect ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-900 dark:text-emerald-200' :
                          'border-border bg-muted/40 text-muted-foreground'
                        }`}>
                          <span className="font-semibold">{isCorrect ? 'Correct. ' : 'Explanation: '}</span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" onClick={() => openLesson(courseId, moduleId, lessonId)}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Review lesson
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setTutorOpen(true)}
            >
              <Sparkles className="mr-1.5 h-4 w-4" /> Ask AI Tutor
            </Button>
            {!submitted ? (
              <Button
                onClick={handleSubmit}
                disabled={answered < total}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Submit answers {answered < total && `(${total - answered} left)`}
              </Button>
            ) : (
              <Button
                onClick={() => openCourse(courseId)}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Back to course <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
