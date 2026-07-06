'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  ArrowLeft, Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Clock, Loader2,
  AlertTriangle, CheckCircle2, XCircle, Sparkles, ChevronRight, FileText,
  Camera, RefreshCw, Award, Eye, Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store';
import { findCourse } from '@/lib/courses';
import type { InterviewQuestion, InterviewReport, InterviewTurn, User } from '@/lib/types';

function useCurrentUser(): User | null {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);
  return useMemo(
    () => (currentUserId ? users.find((u) => u.id === currentUserId) ?? null : null),
    [currentUserId, users],
  );
}

// ============================================================
// AIInterview — live AI video interview
// ------------------------------------------------------------
// Flow:
//   1. Candidate opens this view from a completed course.
//   2. We hit /api/interview/start to get 5 tailored questions.
//   3. Webcam + microphone permissions requested.
//   4. For each question:
//      a. AI speaks the question aloud (Web Speech API).
//      b. SpeechRecognition starts transcribing the candidate's answer.
//      c. Candidate clicks "Submit answer" (or auto-submit after timeout).
//   5. After all questions, we hit /api/interview/evaluate with the transcript.
//   6. The report is saved to the store; if passed, a pending certificate is
//      issued for super-admin approval.
// ============================================================

type Phase = 'intro' | 'requesting_av' | 'live' | 'evaluating' | 'done' | 'error';

interface AiInterviewProps {
  interviewId: string;
}

export function AIInterview({ interviewId }: AiInterviewProps) {
  const user = useCurrentUser();
  const session = useAppStore((s) =>
    s.interviewSessions.find((x) => x.id === interviewId),
  );
  const appendInterviewTurn = useAppStore((s) => s.appendInterviewTurn);
  const advanceInterviewQuestion = useAppStore((s) => s.advanceInterviewQuestion);
  const completeInterviewSession = useAppStore((s) => s.completeInterviewSession);
  const abandonInterviewSession = useAppStore((s) => s.abandonInterviewSession);
  const openInterviewReport = useAppStore((s) => s.openInterviewReport);
  const goHome = useAppStore((s) => s.goHome);
  const openDashboard = useAppStore((s) => s.openDashboard);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const [phase, setPhase] = useState<Phase>('intro');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [evaluatingStep, setEvaluatingStep] = useState<string>('');
  const [finalReport, setFinalReport] = useState<InterviewReport | null>(null);

  const currentQuestion: InterviewQuestion | undefined = session?.questions[session.currentQuestionIdx];

  // ---------- Webcam + mic ----------
  const stopStream = useCallback(() => {
    const s = streamRef.current;
    if (s) {
      s.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraOn(true);
      setMicOn(true);
      return true;
    } catch (err) {
      console.error('getUserMedia error:', err);
      setErrorMessage(
        'We could not access your camera or microphone. Please allow permissions in your browser and try again. You can still complete the interview without video — only your voice will be transcribed.',
      );
      return false;
    }
  }, []);

  // ---------- Speech recognition ----------
  const stopRecognition = useCallback(() => {
    const r = recognitionRef.current;
    if (r) {
      try { r.stop(); } catch { /* noop */ }
      recognitionRef.current = null;
    }
  }, []);

  const startRecognition = useCallback(() => {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setErrorMessage(
        "Your browser does not support speech recognition. Use Chrome or Edge. You can still type your answer in the text box below — the interview will work without voice input.",
      );
      return;
    }
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = 'en-IN'; // Indian English
    let finalChunk = '';
    r.onresult = (ev: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }> }) => {
      let interim = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const res = ev.results[i];
        const txt = res[0].transcript;
        if (res.isFinal) {
          finalChunk += txt;
        } else {
          interim += txt;
        }
      }
      setTranscript((prev) => (finalChunk ? finalChunk : prev));
      setInterimTranscript(interim);
    };
    r.onerror = (ev: { error: string }) => {
      if (ev.error === 'no-speech' || ev.error === 'aborted') return;
      console.warn('SpeechRecognition error:', ev.error);
      if (ev.error === 'not-allowed') {
        setErrorMessage('Microphone permission denied. Please allow mic access in your browser settings.');
      }
    };
    r.onend = () => {
      // Auto-restart if we are still in the live phase and mic is on
      // (Chrome stops recognition after ~60s of silence)
      if (phase === 'live' && micOn) {
        try { r.start(); } catch { /* noop */ }
      }
    };
    try {
      r.start();
      recognitionRef.current = r;
    } catch (err) {
      console.warn('SR start error:', err);
    }
  }, [micOn, phase]);

  // ---------- Speak a question aloud ----------
  const speakQuestion = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-IN';
      u.rate = 0.95;
      u.pitch = 1.0;
      // Pick an Indian English voice if available
      const voices = window.speechSynthesis.getVoices();
      const enIn = voices.find((v) => v.lang === 'en-IN' || v.lang === 'en-IN');
      if (enIn) u.voice = enIn;
      window.speechSynthesis.speak(u);
    } catch (err) {
      console.warn('TTS error:', err);
    }
  }, []);

  // ---------- Timer ----------
  useEffect(() => {
    if (phase !== 'live') return;
    const t = setInterval(() => {
      if (questionStartTime) {
        setElapsedSec(Math.floor((Date.now() - questionStartTime) / 1000));
      }
    }, 500);
    return () => clearInterval(t);
  }, [phase, questionStartTime]);

  // ---------- Begin ----------
  const beginInterview = useCallback(async () => {
    if (!session) return;
    setPhase('requesting_av');
    setErrorMessage(null);
    await startCamera();
    setPhase('live');
    setQuestionStartTime(Date.now());
    setElapsedSec(0);
    setTranscript('');
    setInterimTranscript('');
    // Speak the first question after a short delay
    setTimeout(() => {
      if (session.questions[0]) {
        speakQuestion(`Question 1. ${session.questions[0].prompt}`);
        startRecognition();
      }
    }, 800);
  }, [session, speakQuestion, startCamera, startRecognition]);

  // ---------- Submit current answer ----------
  const submitAnswer = useCallback(async () => {
    if (!session || !currentQuestion) return;
    stopRecognition();
    const t = (transcript || interimTranscript || '').trim();
    const responseSeconds = Math.max(1, Math.floor((Date.now() - questionStartTime) / 1000));

    // If no transcript at all, prompt the candidate to try again
    if (!t || t.length < 5) {
      setErrorMessage('Your answer was too short or empty. Please speak your answer aloud, or type it in the text box, then click Submit again.');
      startRecognition();
      return;
    }

    setPhase('evaluating');
    setEvaluatingStep('Scoring your answer…');

    const turn: InterviewTurn = {
      questionId: currentQuestion.id,
      questionPrompt: currentQuestion.prompt,
      transcript: t,
      responseSeconds,
      scorePct: 0, // filled in by /evaluate at the end
      feedback: '',
      coveredKeyPoints: [],
      missedKeyPoints: [],
    };
    appendInterviewTurn(session.id, turn);

    // Advance to next question OR finish
    const nextIdx = session.currentQuestionIdx + 1;
    advanceInterviewQuestion(session.id);

    if (nextIdx < session.questions.length) {
      // Next question
      setTranscript('');
      setInterimTranscript('');
      setQuestionStartTime(Date.now());
      setElapsedSec(0);
      setPhase('live');
      setErrorMessage(null);
      setTimeout(() => {
        speakQuestion(`Question ${nextIdx + 1}. ${session.questions[nextIdx].prompt}`);
        startRecognition();
      }, 800);
    } else {
      // All questions answered — evaluate the full interview
      await finishInterview();
    }
  }, [session, currentQuestion, transcript, interimTranscript, questionStartTime, stopRecognition, startRecognition, appendInterviewTurn, advanceInterviewQuestion, speakQuestion]);

  // ---------- Finish + evaluate ----------
  const finishInterview = useCallback(async () => {
    if (!session || !user) return;
    setPhase('evaluating');
    setEvaluatingStep('Generating your interview report…');

    // Pull the latest session state (with all appended turns)
    const fresh = useAppStore.getState().interviewSessions.find((s) => s.id === session.id);
    if (!fresh) return;
    const course = findCourse(session.courseId);

    try {
      const resp = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: session.courseId,
          courseTitle: session.courseTitle,
          candidateName: user.name,
          questions: fresh.questions,
          turns: fresh.turns.map((t) => ({
            questionId: t.questionId,
            questionPrompt: t.questionPrompt,
            transcript: t.transcript,
            responseSeconds: t.responseSeconds,
          })),
        }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json() as { report: InterviewReport };
      const report = data.report;
      report.userId = user.id;
      // Fill per-turn data from the session (the LLM only returns scores/feedback;
      // the transcript + question prompt come from the session)
      report.turns = report.turns.map((rt) => {
        const sessTurn = fresh.turns.find((st) => st.questionId === rt.questionId);
        return {
          ...rt,
          transcript: sessTurn?.transcript ?? rt.transcript,
          questionPrompt: sessTurn?.questionPrompt ?? rt.questionPrompt,
          responseSeconds: sessTurn?.responseSeconds ?? rt.responseSeconds,
        };
      });
      completeInterviewSession(session.id, report);
      setFinalReport(report);
      setPhase('done');
      stopStream();
      stopRecognition();
    } catch (err) {
      console.error('Evaluate error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to evaluate interview');
      setPhase('error');
    }
  }, [session, user, completeInterviewSession, stopStream, stopRecognition]);

  // ---------- Skip question ----------
  const skipQuestion = useCallback(() => {
    if (!session || !currentQuestion) return;
    stopRecognition();
    const turn: InterviewTurn = {
      questionId: currentQuestion.id,
      questionPrompt: currentQuestion.prompt,
      transcript: '(skipped)',
      responseSeconds: Math.max(1, Math.floor((Date.now() - questionStartTime) / 1000)),
      scorePct: 0,
      feedback: 'Candidate skipped this question.',
      coveredKeyPoints: [],
      missedKeyPoints: currentQuestion.expectedKeyPoints,
    };
    appendInterviewTurn(session.id, turn);
    const nextIdx = session.currentQuestionIdx + 1;
    advanceInterviewQuestion(session.id);
    if (nextIdx < session.questions.length) {
      setTranscript('');
      setInterimTranscript('');
      setQuestionStartTime(Date.now());
      setElapsedSec(0);
      setTimeout(() => {
        speakQuestion(`Question ${nextIdx + 1}. ${session.questions[nextIdx].prompt}`);
        startRecognition();
      }, 400);
    } else {
      finishInterview();
    }
  }, [session, currentQuestion, questionStartTime, stopRecognition, appendInterviewTurn, advanceInterviewQuestion, speakQuestion, startRecognition, finishInterview]);

  // ---------- End early ----------
  const endEarly = useCallback(() => {
    if (!session) return;
    if (session.turns.length === 0) {
      // No answers recorded — abandon
      abandonInterviewSession(session.id);
      openDashboard();
      return;
    }
    // Otherwise evaluate what we have
    finishInterview();
  }, [session, abandonInterviewSession, openDashboard, finishInterview]);

  // ---------- Cleanup on unmount ----------
  useEffect(() => {
    return () => {
      stopStream();
      stopRecognition();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try { window.speechSynthesis.cancel(); } catch { /* noop */ }
      }
    };
  }, [stopStream, stopRecognition]);

  // ---------- Warm up voices on mount (Chrome loads async) ----------
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  if (!user || !session) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
        <h2 className="mt-4 text-xl font-semibold">Interview not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This interview session does not exist or you do not have access to it.
        </p>
        <Button onClick={openDashboard} className="mt-4">Back to dashboard</Button>
      </div>
    );
  }

  const course = findCourse(session.courseId);
  const questionIdx = session.currentQuestionIdx;
  const totalQuestions = session.questions.length;
  const progressPct = totalQuestions > 0 ? (questionIdx / totalQuestions) * 100 : 0;

  // ---------- INTRO PHASE ----------
  if (phase === 'intro') {
    return (
      <div className="bg-background">
        <section className="border-b bg-gradient-to-br from-indigo-50/60 to-background dark:from-indigo-950/20">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <button onClick={openDashboard} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </button>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                <Video className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">AI Video Interview</h1>
                <p className="text-sm text-muted-foreground">
                  {course?.title ?? session.courseTitle} · {totalQuestions} questions · ~10 minutes
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="h-4 w-4 text-indigo-600" /> How this works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p><strong className="text-foreground">1.</strong> The AI interviewer will ask you {totalQuestions} questions, one at a time, tailored to the {course?.title ?? 'course'} syllabus.</p>
                <p><strong className="text-foreground">2.</strong> Your webcam and microphone will be activated. The AI speaks each question aloud; you answer verbally.</p>
                <p><strong className="text-foreground">3.</strong> Your answers are transcribed in real time and evaluated by the AI for technical accuracy, depth, and communication.</p>
                <p><strong className="text-foreground">4.</strong> After the interview, you receive a structured report with per-question scores, strengths, and improvement areas.</p>
                <p><strong className="text-foreground">5.</strong> If you score 60% or above, a certificate is automatically queued for <strong className="text-foreground">Super Admin approval</strong>. Once approved, you can download it anytime.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Camera className="h-4 w-4 text-indigo-600" /> Before you begin
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <ChecklistRow ok label="Quiet room with good lighting" />
                <ChecklistRow ok label="Chrome, Edge, or Safari browser" />
                <ChecklistRow ok label="Working webcam + microphone" />
                <ChecklistRow ok label="Stable internet connection (≥ 1 Mbps)" />
                <ChecklistRow ok label="10–15 minutes of uninterrupted time" />
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
                  Your video stays on your device — it is NOT uploaded. Only your transcribed answers are sent to the AI evaluator.
                </div>
                <div className="mt-3 rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-3 text-xs text-indigo-900 dark:text-indigo-200">
                  <Sparkles className="mr-1 inline h-3.5 w-3.5" />
                  <strong>Tip:</strong> Add a profile photo in Settings before the interview — it will appear on your certificate if you pass.
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <Button
              onClick={beginInterview}
              size="lg"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
            >
              <Video className="mr-2 h-5 w-5" /> Start live interview
            </Button>
            <button onClick={openDashboard} className="text-xs text-muted-foreground hover:text-foreground">
              Cancel and return to dashboard
            </button>
          </div>
        </section>
      </div>
    );
  }

  // ---------- REQUESTING AV ----------
  if (phase === 'requesting_av') {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-2xl place-items-center px-4 text-center">
        <div>
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-500" />
          <h2 className="mt-4 text-xl font-semibold">Requesting camera & microphone…</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please allow access in your browser. The interview cannot start without it.
          </p>
        </div>
      </div>
    );
  }

  // ---------- ERROR ----------
  if (phase === 'error') {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-2xl place-items-center px-4 text-center">
        <Card className="max-w-md">
          <CardContent className="p-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
            <h2 className="mt-4 text-xl font-semibold">Something went wrong</h2>
            <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
            <div className="mt-4 flex justify-center gap-2">
              <Button onClick={() => setPhase('live')} variant="outline">Retry</Button>
              <Button onClick={openDashboard} className="bg-indigo-600 text-white hover:bg-indigo-700">Back to dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------- EVALUATING ----------
  if (phase === 'evaluating') {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-2xl place-items-center px-4 text-center">
        <div>
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-500" />
          <h2 className="mt-4 text-xl font-semibold">{evaluatingStep || 'Evaluating…'}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The AI is analysing your answers. This usually takes 10–20 seconds.
          </p>
        </div>
      </div>
    );
  }

  // ---------- DONE ----------
  if (phase === 'done' && finalReport) {
    return <InterviewReportView report={finalReport} onContinue={() => openInterviewReport(session.id)} />;
  }

  // ---------- LIVE ----------
  return (
    <div className="bg-background">
      <section className="border-b bg-gradient-to-br from-indigo-50/60 to-background dark:from-indigo-950/20">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold sm:text-xl">AI Video Interview · {course?.title ?? session.courseTitle}</h1>
              <p className="text-xs text-muted-foreground">
                Question {questionIdx + 1} of {totalQuestions} · {elapsedSec}s elapsed
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={micOn ? 'default' : 'secondary'} className={micOn ? 'bg-emerald-600 text-white' : ''}>
                <Mic className="mr-1 h-3 w-3" /> {micOn ? 'Mic on' : 'Mic off'}
              </Badge>
              <Button onClick={endEarly} variant="outline" size="sm" className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                <PhoneOff className="mr-1 h-3.5 w-3.5" /> End
              </Button>
            </div>
          </div>
          <Progress value={progressPct} className="mt-2 h-1" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {errorMessage && (
          <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm text-amber-900 dark:text-amber-200">
            <AlertTriangle className="mr-2 inline h-4 w-4" /> {errorMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: webcam + controls */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-slate-900">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
                {!cameraOn && (
                  <div className="absolute inset-0 grid place-items-center bg-slate-900 text-slate-400">
                    <div className="text-center">
                      <VideoOff className="mx-auto h-10 w-10" />
                      <p className="mt-2 text-xs">Camera off</p>
                    </div>
                  </div>
                )}
                {/* AI interviewer badge */}
                <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Sparkles className="h-3 w-3" />
                  </span>
                  marqaicourses Interviewer
                </div>
                {/* Live indicator */}
                <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Live
                </div>
              </div>
              <CardContent className="p-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Your video stays on your device — not uploaded.</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const s = streamRef.current;
                        if (s) {
                          s.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
                          setCameraOn((p) => !p);
                        }
                      }}
                    >
                      {cameraOn ? <VideoOff className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const s = streamRef.current;
                        if (s) {
                          s.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
                          setMicOn((p) => !p);
                        }
                      }}
                    >
                      {micOn ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-indigo-600" /> Timer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold tabular-nums">{formatDuration(elapsedSec)}</p>
                  {currentQuestion?.suggestedSeconds && (
                    <Badge variant="outline" className="text-xs">
                      suggested: {currentQuestion.suggestedSeconds}s
                    </Badge>
                  )}
                </div>
                <Progress
                  value={currentQuestion?.suggestedSeconds ? Math.min(100, (elapsedSec / currentQuestion.suggestedSeconds) * 100) : 0}
                  className="mt-2 h-1"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right: question + transcript */}
          <div className="space-y-4">
            <Card className="border-indigo-500/40">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-indigo-600" /> Question {questionIdx + 1}
                  </CardTitle>
                  <Badge variant="outline" className="capitalize text-xs">{currentQuestion?.type?.replace('_', ' ')}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-base font-medium leading-relaxed">{currentQuestion?.prompt}</p>
                {currentQuestion?.code && (
                  <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
                    <code>{currentQuestion.code}</code>
                  </pre>
                )}
                {currentQuestion?.assesses && currentQuestion.assesses.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {currentQuestion.assesses.map((s) => (
                      <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                    ))}
                  </div>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-2 text-xs text-indigo-600"
                  onClick={() => currentQuestion && speakQuestion(currentQuestion.prompt)}
                >
                  <RefreshCw className="mr-1 h-3 w-3" /> Replay question
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Mic className="h-4 w-4 text-emerald-600" /> Your answer (live transcript)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="min-h-[120px] rounded-lg border bg-muted/30 p-3 text-sm">
                  {transcript && <p className="text-foreground">{transcript}</p>}
                  {interimTranscript && (
                    <p className="mt-1 text-muted-foreground italic">{interimTranscript}…</p>
                  )}
                  {!transcript && !interimTranscript && (
                    <p className="text-muted-foreground">Speak your answer aloud. Your words will appear here as you speak…</p>
                  )}
                </div>
                <textarea
                  className="w-full rounded-lg border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Or type your answer here if you prefer not to speak…"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={submitAnswer}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                    size="sm"
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" /> Submit answer
                  </Button>
                  <Button onClick={skipQuestion} variant="outline" size="sm">
                    <ChevronRight className="mr-1.5 h-4 w-4" /> Skip
                  </Button>
                  {!micOn && (
                    <Button onClick={() => {
                      const s = streamRef.current;
                      if (s) {
                        s.getAudioTracks().forEach((t) => (t.enabled = true));
                        setMicOn(true);
                        startRecognition();
                      }
                    }} variant="outline" size="sm">
                      <Mic className="mr-1.5 h-4 w-4" /> Resume mic
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {session.turns.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" /> Previous answers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {session.turns.map((t, i) => (
                    <div key={t.questionId} className="rounded border p-2">
                      <p className="font-medium">Q{i + 1}: {t.questionPrompt.slice(0, 60)}…</p>
                      <p className="mt-1 text-muted-foreground">{t.transcript.slice(0, 120)}{t.transcript.length > 120 ? '…' : ''}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================
// Interview Report View (shown after the interview completes)
// ============================================================

function InterviewReportView({ report, onContinue }: { report: InterviewReport; onContinue: () => void }) {
  return (
    <div className="bg-background">
      <section className={`border-b ${report.passed ? 'bg-gradient-to-br from-emerald-50/60 to-background dark:from-emerald-950/20' : 'bg-gradient-to-br from-amber-50/60 to-background dark:from-amber-950/20'}`}>
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className={`grid h-12 w-12 place-items-center rounded-xl text-white ${report.passed ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'}`}>
              {report.passed ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {report.passed ? 'Interview passed!' : 'Interview completed'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {report.courseTitle} · {formatDuration(report.durationSeconds)} · {report.overallScorePct}% overall
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {report.passed && (
          <Card className="mb-6 border-emerald-500/40 bg-emerald-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Award className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-emerald-900 dark:text-emerald-200">Certificate queued for Super Admin approval</h3>
                  <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-300">
                    You scored {report.overallScorePct}% which is above the 60% pass threshold.
                    A certificate from <strong>marqaicourses</strong> has been queued and
                    will be released to your account once a Super Admin approves it. You will
                    receive an in-app notification when it is ready to download.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{report.summary}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Per-question breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.turns.map((t, i) => (
                  <div key={t.questionId} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium">Q{i + 1}: {t.questionPrompt}</p>
                      <Badge variant={t.scorePct >= 80 ? 'default' : t.scorePct >= 60 ? 'secondary' : 'destructive'} className="shrink-0">
                        {t.scorePct}%
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs italic text-muted-foreground">"{t.transcript.slice(0, 240)}{t.transcript.length > 240 ? '…' : ''}"</p>
                    <p className="mt-2 text-xs">{t.feedback}</p>
                    {t.coveredKeyPoints.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {t.coveredKeyPoints.map((k) => (
                          <Badge key={k} variant="secondary" className="bg-emerald-500/10 text-emerald-700 text-[10px] dark:text-emerald-300">
                            <CheckCircle2 className="mr-0.5 h-2.5 w-2.5" /> {k}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {t.missedKeyPoints.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {t.missedKeyPoints.map((k) => (
                          <Badge key={k} variant="secondary" className="bg-rose-500/10 text-rose-700 text-[10px] dark:text-rose-300">
                            <XCircle className="mr-0.5 h-2.5 w-2.5" /> {k}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-4 text-white">
                  <p className="text-xs text-white/80">Overall</p>
                  <p className="text-3xl font-bold">{report.overallScorePct}%</p>
                  <p className="mt-1 text-xs text-white/80">{report.passed ? 'Passed (≥ 60%)' : 'Below pass threshold'}</p>
                </div>
                {Object.entries(report.skillScores).map(([skill, score]) => (
                  <div key={skill}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>{skill}</span>
                      <span className="font-medium">{score}%</span>
                    </div>
                    <Progress value={score} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base text-emerald-700 dark:text-emerald-300">Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {report.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base text-amber-700 dark:text-amber-300">Improvements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {report.improvements.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Button onClick={onContinue} className="w-full bg-indigo-600 text-white hover:bg-indigo-700">
              <Eye className="mr-2 h-4 w-4" /> View full report
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================

function ChecklistRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <CheckCircle2 className={`h-4 w-4 ${ok ? 'text-emerald-600' : 'text-muted-foreground'}`} />
      <span>{label}</span>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
