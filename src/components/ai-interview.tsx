'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  ArrowLeft, Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Clock, Loader2,
  AlertTriangle, CheckCircle2, XCircle, Sparkles, ChevronRight, FileText,
  Camera, RefreshCw, Award, Eye, Brain, User as UserIcon, UserX, Focus, Activity,
  Pause, Play, AlertCircle, Logs, BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { COURSES, findCourse } from '@/lib/courses';
import { CourseIcon } from './navbar';
import type { 
  InterviewQuestion, InterviewReport, InterviewTurn, User,
  GazeDirection, ProctoringSnapshot, ProctoringIncident,
} from '@/lib/types';

function useCurrentUser(): User | null {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);
  return useMemo(
    () => (currentUserId ? users.find((u) => u.id === currentUserId) ?? null : null),
    [currentUserId, users],
  );
}

// ============================================================
// Proctoring Analysis Functions
// ============================================================

/**
 * Detect face presence using YCbCr skin-color analysis
 * YCbCr color space is better for skin detection than RGB
 */
function detectFacePresence(imageData: ImageData): { faceDetected: boolean; facePresencePct: number } {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  
  let skinPixels = 0;
  let totalPixels = width * height;
  
  // Focus on the center-top region (where face typically appears)
  const startX = Math.floor(width * 0.2);
  const endX = Math.floor(width * 0.8);
  const startY = Math.floor(height * 0.1);
  const endY = Math.floor(height * 0.6);
  
  const faceRegionWidth = endX - startX;
  const faceRegionHeight = endY - startY;
  const faceRegionPixels = faceRegionWidth * faceRegionHeight;
  
  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Convert RGB to YCbCr
      // Y = 0.299R + 0.587G + 0.114B
      // Cb = -0.169R - 0.331G + 0.5B + 128
      // Cr = 0.5R - 0.419G - 0.081B + 128
      const yVal = 0.299 * r + 0.587 * g + 0.114 * b;
      const cb = -0.169 * r - 0.331 * g + 0.5 * b + 128;
      const cr = 0.5 * r - 0.419 * g - 0.081 * b + 128;
      
      // Skin color detection thresholds in YCbCr
      // These thresholds work for various skin tones
      const isSkinColor = 
        yVal >= 80 && yVal <= 230 &&
        cb >= 77 && cb <= 127 &&
        cr >= 133 && cr <= 173;
      
      // Additional RGB-based checks for robustness
      const rG = r / (g + 1);
      const isSkinRgb = 
        r > 95 && g > 40 && b > 20 &&
        r > g && r > b &&
        Math.abs(r - g) > 15 &&
        rG > 1.0 && rG < 2.5;
      
      if (isSkinColor || isSkinRgb) {
        skinPixels++;
      }
    }
  }
  
  // Calculate face presence percentage
  const facePresencePct = Math.round((skinPixels / faceRegionPixels) * 100);
  
  // Face is detected if at least 5% of the face region has skin-colored pixels
  // This threshold accounts for different face sizes and lighting conditions
  const faceDetected = facePresencePct >= 5;
  
  return { faceDetected, facePresencePct: Math.min(100, facePresencePct * 2) }; // Scale for display
}

/**
 * Estimate gaze direction by analyzing the eye region
 * Uses brightness distribution to detect where eyes might be pointing
 */
function estimateGazeDirection(imageData: ImageData): GazeDirection {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  
  // Define eye region (upper center of the face region)
  const eyeCenterY = Math.floor(height * 0.25);
  const eyeHeight = Math.floor(height * 0.08);
  const eyeWidth = Math.floor(width * 0.3);
  
  // Split eye region into 5 zones: left, center-left, center, center-right, right
  const zones: { name: GazeDirection; xStart: number; xEnd: number; brightness: number }[] = [
    { name: 'left', xStart: Math.floor(width * 0.15), xEnd: Math.floor(width * 0.35), brightness: 0 },
    { name: 'center', xStart: Math.floor(width * 0.35), xEnd: Math.floor(width * 0.65), brightness: 0 },
    { name: 'right', xStart: Math.floor(width * 0.65), xEnd: Math.floor(width * 0.85), brightness: 0 },
  ];
  
  // Calculate average brightness for each zone
  for (const zone of zones) {
    let totalBrightness = 0;
    let pixelCount = 0;
    
    for (let y = eyeCenterY - eyeHeight / 2; y < eyeCenterY + eyeHeight / 2; y++) {
      for (let x = zone.xStart; x < zone.xEnd; x++) {
        const i = (y * width + x) * 4;
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        totalBrightness += brightness;
        pixelCount++;
      }
    }
    
    zone.brightness = pixelCount > 0 ? totalBrightness / pixelCount : 0;
  }
  
  // Also check for upward/downward gaze by comparing upper vs lower eye region
  const upperEyeY = eyeCenterY - eyeHeight / 4;
  const lowerEyeY = eyeCenterY + eyeHeight / 4;
  let upperBrightness = 0;
  let lowerBrightness = 0;
  let centerXStart = Math.floor(width * 0.4);
  let centerXEnd = Math.floor(width * 0.6);
  
  for (let x = centerXStart; x < centerXEnd; x++) {
    // Upper eye region
    const upperI = (upperEyeY * width + x) * 4;
    upperBrightness += (data[upperI] + data[upperI + 1] + data[upperI + 2]) / 3;
    // Lower eye region
    const lowerI = (lowerEyeY * width + x) * 4;
    lowerBrightness += (data[lowerI] + data[lowerI + 1] + data[lowerI + 2]) / 3;
  }
  
  // Determine gaze direction
  // Eyes typically have darker pixels where they're looking (pupil absorbs light)
  const darkestZone = zones.reduce((min, z) => z.brightness < min.brightness ? z : min, zones[0]);
  const brightestZone = zones.reduce((max, z) => z.brightness > max.brightness ? z : max, zones[0]);
  
  // Check if looking up or down
  const brightnessDiff = upperBrightness - lowerBrightness;
  if (brightnessDiff > 20) {
    return 'up'; // Upper region brighter means eyes looking down (pupil in lower area)
  } else if (brightnessDiff < -20) {
    return 'down'; // Lower region brighter means eyes looking up
  }
  
  // If center zone is darkest, likely looking at camera
  if (zones[1].brightness < zones[0].brightness && zones[1].brightness < zones[2].brightness) {
    return 'center';
  }
  
  // Otherwise return the direction with the darkest zone (where pupil likely is)
  return darkestZone.name;
}

/**
 * Calculate concentration score based on face presence and gaze direction
 */
function calculateConcentrationScore(
  faceDetected: boolean,
  facePresencePct: number,
  gazeDirection: GazeDirection
): number {
  if (!faceDetected) {
    return 0;
  }
  
  // Base score from face presence
  const faceScore = Math.min(50, facePresencePct / 2);
  
  // Gaze contribution
  const gazeScores: Record<GazeDirection, number> = {
    center: 50,
    left: 25,
    right: 25,
    up: 30,
    down: 30,
  };
  
  const gazeScore = gazeScores[gazeDirection];
  
  return Math.min(100, faceScore + gazeScore);
}

// ============================================================
// AIInterview — live AI video interview with proctoring
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

type Phase = 'setup' | 'intro' | 'requesting_av' | 'live' | 'paused' | 'evaluating' | 'done' | 'error';

interface AiInterviewProps {
  interviewId?: string;
}

export function AIInterview({ interviewId }: AiInterviewProps) {
  const user = useCurrentUser();
  const viewCourseId = useAppStore((s) => s.view.courseId);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const proctoringIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [phase, setPhase] = useState<Phase>(interviewId ? 'intro' : 'setup');
  const [activeInterviewId, setActiveInterviewId] = useState<string | undefined>(interviewId);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(viewCourseId ?? '');
  const [startingInterview, setStartingInterview] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [evaluatingStep, setEvaluatingStep] = useState<string>('');
  const [finalReport, setFinalReport] = useState<InterviewReport | null>(null);

  // Proctoring state
  const [faceDetected, setFaceDetected] = useState(true);
  const [facePresencePct, setFacePresencePct] = useState(100);
  const [gazeDirection, setGazeDirection] = useState<GazeDirection>('center');
  const [concentrationScore, setConcentrationScore] = useState(90);
  const [noFaceDuration, setNoFaceDuration] = useState(0);
  const [autoPauseCount, setAutoPauseCount] = useState(0);
  const [proctoringIncidents, setProctoringIncidents] = useState<ProctoringIncident[]>([]);
  const [showPauseOverlay, setShowPauseOverlay] = useState(false);
  const [lastGazeDirection, setLastGazeDirection] = useState<GazeDirection>('center');

  // Use activeInterviewId (set after setup) or the prop interviewId
  const effectiveInterviewId = activeInterviewId ?? interviewId;
  const session = useAppStore((s) =>
    effectiveInterviewId ? s.interviewSessions.find((x) => x.id === effectiveInterviewId) : undefined,
  );
  const appendInterviewTurn = useAppStore((s) => s.appendInterviewTurn);
  const advanceInterviewQuestion = useAppStore((s) => s.advanceInterviewQuestion);
  const completeInterviewSession = useAppStore((s) => s.completeInterviewSession);
  const abandonInterviewSession = useAppStore((s) => s.abandonInterviewSession);
  const openInterviewReport = useAppStore((s) => s.openInterviewReport);
  const goHome = useAppStore((s) => s.goHome);
  const openDashboard = useAppStore((s) => s.openDashboard);
  const addProctoringSnapshot = useAppStore((s) => s.addProctoringSnapshot);
  const addProctoringIncident = useAppStore((s) => s.addProctoringIncident);
  const updateProctoringData = useAppStore((s) => s.updateProctoringData);
  const createInterviewSession = useAppStore((s) => s.createInterviewSession);

  const currentQuestion: InterviewQuestion | undefined = session?.questions[session.currentQuestionIdx];

  // ---------- Speech recognition (defined early for use in proctoring) ----------
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
      const currentPhase = useAppStore.getState().view;
      if (currentPhase && micOn) {
        try { r.start(); } catch { /* noop */ }
      }
    };
    try {
      r.start();
      recognitionRef.current = r;
    } catch (err) {
      console.warn('SR start error:', err);
    }
  }, [micOn]);

  // ---------- Proctoring Analysis ----------
  const runProctoringAnalysis = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !cameraOn) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx || video.readyState < 2) return;
    
    // Draw video frame to canvas
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data for analysis
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Run face detection
    const faceResult = detectFacePresence(imageData);
    setFaceDetected(faceResult.faceDetected);
    setFacePresencePct(faceResult.facePresencePct);
    
    // Run gaze estimation only if face is detected
    if (faceResult.faceDetected) {
      const gaze = estimateGazeDirection(imageData);
      setGazeDirection(gaze);
      
      // Log gaze change incidents
      if (lastGazeDirection === 'center' && gaze !== 'center') {
        const incident: ProctoringIncident = {
          id: `inc-${Date.now()}`,
          type: 'looking_away',
          timestamp: Date.now(),
          gazeDirection: gaze,
          note: `Candidate started looking ${gaze}`,
        };
        setProctoringIncidents((prev) => [...prev.slice(-50), incident]);
        if (session) {
          addProctoringIncident(session.id, incident);
        }
      }
      setLastGazeDirection(gaze);
    }
    
    // Calculate concentration score
    const concentration = calculateConcentrationScore(
      faceResult.faceDetected,
      faceResult.facePresencePct,
      faceResult.faceDetected ? gazeDirection : 'center'
    );
    setConcentrationScore(concentration);
    
    // Add snapshot every 5 seconds
    const now = Date.now();
    if (session && now % 5000 < 600) {
      const snapshot: ProctoringSnapshot = {
        timestamp: now,
        faceDetected: faceResult.faceDetected,
        facePresencePct: faceResult.facePresencePct,
        gazeDirection: faceResult.faceDetected ? gazeDirection : lastGazeDirection,
        concentrationScore: concentration,
      };
      addProctoringSnapshot(session.id, snapshot);
    }
    
    // Handle no face duration for auto-pause
    if (!faceResult.faceDetected) {
      setNoFaceDuration((prev) => {
        const newDuration = prev + 0.5; // Add 500ms each check
        
        // Auto-pause after 10 seconds of no face
        if (newDuration >= 10 && phase === 'live') {
          setPhase('paused');
          setShowPauseOverlay(true);
          setAutoPauseCount((c) => c + 1);
          
          // Log incident
          const incident: ProctoringIncident = {
            id: `inc-${Date.now()}`,
            type: 'face_missing',
            timestamp: Date.now(),
            duration: newDuration,
            note: 'Interview auto-paused: face not detected for 10+ seconds',
          };
          setProctoringIncidents((prev) => [...prev.slice(-50), incident]);
          if (session) {
            addProctoringIncident(session.id, incident);
            updateProctoringData(session.id, {
              lastFaceDetectedAt: Date.now() - newDuration * 1000,
              noFaceDuration: newDuration,
              autoPauseCount: autoPauseCount + 1,
            });
          }
          
          // Stop speech recognition during pause
          stopRecognition();
        }
        
        return newDuration;
      });
    } else {
      // Reset no face duration when face is detected
      if (noFaceDuration > 0) {
        // Log the end of face missing incident
        if (noFaceDuration >= 5) {
          const incident: ProctoringIncident = {
            id: `inc-${Date.now()}`,
            type: 'face_missing',
            timestamp: Date.now(),
            duration: noFaceDuration,
            note: `Face missing for ${Math.round(noFaceDuration)}s - now detected`,
          };
          setProctoringIncidents((prev) => [...prev.slice(-50), incident]);
          if (session) {
            addProctoringIncident(session.id, incident);
          }
        }
        setNoFaceDuration(0);
        if (session) {
          updateProctoringData(session.id, {
            lastFaceDetectedAt: Date.now(),
            noFaceDuration: 0,
            autoPauseCount: autoPauseCount,
          });
        }
      }
      
      // Resume from paused state when face detected
      if (phase === 'paused') {
        setPhase('live');
        setShowPauseOverlay(false);
        startRecognition();
      }
    }
  }, [cameraOn, gazeDirection, lastGazeDirection, noFaceDuration, phase, session, addProctoringSnapshot, addProctoringIncident, updateProctoringData, autoPauseCount, stopRecognition, startRecognition]);

  // ---------- Start proctoring interval ----------
  useEffect(() => {
    if (phase === 'live' && cameraOn) {
      // Run proctoring analysis every 500ms
      proctoringIntervalRef.current = setInterval(runProctoringAnalysis, 500);
    } else {
      if (proctoringIntervalRef.current) {
        clearInterval(proctoringIntervalRef.current);
        proctoringIntervalRef.current = null;
      }
    }
    
    return () => {
      if (proctoringIntervalRef.current) {
        clearInterval(proctoringIntervalRef.current);
      }
    };
  }, [phase, cameraOn, runProctoringAnalysis]);

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
    setProctoringIncidents([]);
    setAutoPauseCount(0);
    setNoFaceDuration(0);
    // Speak the first question after a short delay
    setTimeout(() => {
      if (session.questions[0]) {
        speakQuestion(`Question 1. ${session.questions[0].prompt}`);
        startRecognition();
      }
    }, 800);
  }, [session, speakQuestion, startCamera, startRecognition]);

  // ---------- Manual resume from pause ----------
  const resumeFromPause = useCallback(() => {
    if (faceDetected) {
      setPhase('live');
      setShowPauseOverlay(false);
      startRecognition();
    }
  }, [faceDetected, startRecognition]);

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
          // Include proctoring data
          proctoringIncidents: proctoringIncidents,
          proctoringSummary: {
            avgConcentration: concentrationScore,
            faceDetectedPct: facePresencePct,
            autoPauseCount: autoPauseCount,
          },
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
  }, [session, user, completeInterviewSession, stopStream, stopRecognition, proctoringIncidents, concentrationScore, facePresencePct, autoPauseCount]);

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
      if (proctoringIntervalRef.current) {
        clearInterval(proctoringIntervalRef.current);
      }
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

  // ---------- Setup: start a new interview ----------
  const handleStartInterview = useCallback(async () => {
    if (!user || !selectedCourseId) return;
    setStartingInterview(true);
    setSetupError(null);
    try {
      const course = findCourse(selectedCourseId);
      const courseTitle = course?.title ?? selectedCourseId;
      // Call the API to generate questions
      const resp = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourseId,
          courseTitle,
          courseSkills: course?.tags ?? [],
        }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const questions: InterviewQuestion[] = data.questions;
      if (!questions?.length) throw new Error('No questions returned');
      // Create session in the store
      const newId = createInterviewSession(user.id, selectedCourseId, courseTitle, questions);
      setActiveInterviewId(newId);
      setPhase('intro');
    } catch (err) {
      console.error('Start interview error:', err);
      setSetupError(err instanceof Error ? err.message : 'Failed to start interview');
    } finally {
      setStartingInterview(false);
    }
  }, [user, selectedCourseId, createInterviewSession]);

  // ---------- SETUP PHASE (no interview session yet) ----------
  if (phase === 'setup') {
    const enrolledCourses = user
      ? COURSES.filter((c) => (user.enrolledCourseIds ?? []).includes(c.id))
      : [];

    if (!user) {
      return (
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <p className="text-sm text-muted-foreground">Please sign in to start an AI Interview.</p>
        </div>
      );
    }

    return (
      <div className="bg-background">
        <section className="border-b bg-gradient-to-br from-indigo-50/60 to-background dark:from-indigo-950/20">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <button onClick={openDashboard} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </button>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                <Brain className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">AI Interview</h1>
                <p className="text-sm text-muted-foreground">
                  Select a course and practice your skills with an AI interviewer
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {setupError && (
            <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm text-amber-900 dark:text-amber-200">
              <AlertTriangle className="mr-2 inline h-4 w-4" /> {setupError}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-indigo-600" /> Select a course
              </CardTitle>
            </CardHeader>
            <CardContent>
              {enrolledCourses.length === 0 ? (
                <div className="py-6 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    You need to be enrolled in at least one course to take an interview.
                  </p>
                  <Button onClick={() => useAppStore.getState().goHome()} variant="outline" size="sm" className="mt-2">
                    Browse courses
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {enrolledCourses.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCourseId(c.id)}
                      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                        selectedCourseId === c.id
                          ? 'border-indigo-500 bg-indigo-500/5 shadow-sm'
                          : 'border-border hover:bg-muted/40'
                      }`}
                    >
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${c.gradient} text-white`}>
                        <CourseIcon name={c.icon} className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{c.title}</p>
                        <p className="text-xs text-muted-foreground">{c.level} · {c.duration}</p>
                      </div>
                      {selectedCourseId === c.id && (
                        <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-4 flex flex-col items-center gap-3">
            <Button
              onClick={handleStartInterview}
              disabled={!selectedCourseId || startingInterview}
              size="lg"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
            >
              {startingInterview ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating questions…</>
              ) : (
                <><Video className="mr-2 h-5 w-5" /> Start Interview</>
              )}
            </Button>
            <button onClick={openDashboard} className="text-xs text-muted-foreground hover:text-foreground">
              Cancel and return to dashboard
            </button>
          </div>
        </section>
      </div>
    );
  }

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
                <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-emerald-900 dark:text-emerald-200">
                  <Focus className="mr-1 inline h-3.5 w-3.5" />
                  <strong>AI Proctoring:</strong> Your face presence and gaze direction are monitored to ensure interview integrity. If you look away or leave the camera for extended periods, the interview will auto-pause.
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

  // ---------- PAUSED OVERLAY ----------
  const PauseOverlay = () => (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
      <Card className="max-w-md border-amber-500/40 bg-amber-500/5">
        <CardContent className="p-6 text-center">
          <Pause className="mx-auto h-12 w-12 text-amber-500" />
          <h2 className="mt-4 text-xl font-semibold text-amber-700 dark:text-amber-300">Interview Paused</h2>
          <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
            Your face has not been detected for more than 10 seconds. The interview will resume automatically when you return to the camera.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button 
              onClick={resumeFromPause} 
              disabled={!faceDetected}
              className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Play className="mr-2 h-4 w-4" /> Resume now
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {faceDetected 
              ? 'Face detected - you can resume now'
              : 'Please position yourself in front of the camera to resume'}
          </p>
        </CardContent>
      </Card>
    </div>
  );

  // ---------- PROCTORING PANEL ----------
  const ProctoringPanel = () => (
    <Card className="border-slate-700/40 bg-slate-900/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4 text-emerald-600" /> AI Proctoring
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Concentration Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Concentration</span>
            <span className={`font-bold ${concentrationScore >= 80 ? 'text-emerald-600' : concentrationScore >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
              {concentrationScore}%
            </span>
          </div>
          <Progress 
            value={concentrationScore} 
            className="h-2"
            // Color based on score
            style={{
              background: concentrationScore >= 80 ? '#10b981' : concentrationScore >= 50 ? '#f59e0b' : '#ef4444',
            }}
          />
        </div>

        {/* Face Detection Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {faceDetected ? (
              <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/20 text-emerald-600">
                <UserIcon className="h-3.5 w-3.5" />
              </span>
            ) : (
              <span className="grid h-6 w-6 place-items-center rounded-full bg-rose-500/20 text-rose-600 animate-pulse">
                <UserX className="h-3.5 w-3.5" />
              </span>
            )}
            <span className="text-xs font-medium">
              {faceDetected ? 'Face detected' : 'No face detected'}
            </span>
          </div>
          <Badge variant={faceDetected ? 'default' : 'destructive'} className="text-xs">
            {facePresencePct}%
          </Badge>
        </div>

        {/* Gaze Direction */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`grid h-6 w-6 place-items-center rounded-full ${gazeDirection === 'center' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-amber-500/20 text-amber-600'}`}>
              <Eye className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-medium">
              Looking: <span className={gazeDirection === 'center' ? 'text-emerald-600' : 'text-amber-600'}>{gazeDirection}</span>
            </span>
          </div>
          {gazeDirection !== 'center' && (
            <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-600">
              Warning
            </Badge>
          )}
        </div>

        {/* Auto-Pause Warning */}
        {noFaceDuration > 5 && noFaceDuration < 10 && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-300">
            <AlertCircle className="mr-1 inline h-3 w-3" />
            Face missing for {Math.round(noFaceDuration)}s - interview will pause at 10s
          </div>
        )}

        {/* Incident Log */}
        {proctoringIncidents.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Logs className="h-3 w-3" /> Incident log
            </div>
            <ScrollArea className="h-24 rounded border bg-muted/30 p-2">
              <div className="space-y-1.5">
                {proctoringIncidents.slice(-10).map((incident) => (
                  <div key={incident.id} className="flex items-start gap-1.5 text-xs">
                    <span className={`shrink-0 ${incident.type === 'face_missing' ? 'text-rose-600' : 'text-amber-600'}`}>
                      {incident.type === 'face_missing' ? '⚠' : '👁'}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(incident.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-foreground">
                      {incident.type === 'face_missing' ? 'Face missing' : `Looking ${incident.gazeDirection}`}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Auto-Pause Count */}
        {autoPauseCount > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Auto-pauses:</span>
            <Badge variant="destructive" className="text-xs">
              {autoPauseCount}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // ---------- LIVE ----------
  return (
    <div className="bg-background">
      {/* Hidden canvas for proctoring analysis */}
      <canvas ref={canvasRef} className="hidden" />
      
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
              {/* Proctoring status badge */}
              <Badge 
                variant={concentrationScore >= 80 ? 'default' : concentrationScore >= 50 ? 'secondary' : 'destructive'}
                className={`${concentrationScore >= 80 ? 'bg-emerald-600 text-white' : ''} ${concentrationScore >= 50 && concentrationScore < 80 ? 'bg-amber-600 text-white' : ''}`}
              >
                <Focus className="mr-1 h-3 w-3" /> {concentrationScore}%
              </Badge>
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

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: webcam + proctoring panel */}
          <div className="space-y-4 lg:col-span-1">
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
                
                {/* Face detected badge */}
                <div className={`absolute left-3 bottom-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${faceDetected ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white animate-pulse'}`}>
                  {faceDetected ? <UserIcon className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                  {faceDetected ? 'Face OK' : 'No Face'}
                </div>
                
                {/* Looking-away warning overlay */}
                {gazeDirection !== 'center' && faceDetected && (
                  <div className="absolute inset-0 border-4 border-amber-500/60 animate-pulse" />
                )}
                
                {/* AI interviewer badge */}
                <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Sparkles className="h-3 w-3" />
                  </span>
                  marqaicourses Interviewer
                </div>
                
                {/* Live indicator */}
                <div className={`absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white ${phase === 'paused' ? 'bg-amber-600' : 'bg-rose-600'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full bg-white ${phase !== 'paused' ? 'animate-pulse' : ''}`} />
                  {phase === 'paused' ? 'PAUSED' : 'Live'}
                </div>
                
                {/* Pause overlay */}
                {showPauseOverlay && <PauseOverlay />}
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

            {/* Proctoring Panel */}
            <ProctoringPanel />

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
          <div className="space-y-4 lg:col-span-2">
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
                    disabled={phase === 'paused'}
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" /> Submit answer
                  </Button>
                  <Button onClick={skipQuestion} variant="outline" size="sm" disabled={phase === 'paused'}>
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
  const proctoring = report.proctoring;
  
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

        {/* Proctoring Report */}
        {proctoring && (
          <Card className="mb-6 border-slate-500/40 bg-slate-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-slate-600" /> Proctoring Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{proctoring.avgConcentrationScore}%</p>
                  <p className="text-xs text-muted-foreground">Avg Concentration</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{proctoring.faceDetectedPct}%</p>
                  <p className="text-xs text-muted-foreground">Face Detected</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{proctoring.gazeCenterPct}%</p>
                  <p className="text-xs text-muted-foreground">Looking Center</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${proctoring.proctoringPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {proctoring.totalIncidents}
                  </p>
                  <p className="text-xs text-muted-foreground">Incidents</p>
                </div>
              </div>
              
              <div className={`rounded-lg p-3 ${proctoring.proctoringPassed ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>
                <div className="flex items-center gap-2">
                  {proctoring.proctoringPassed ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <span className="font-medium">{proctoring.proctoringPassed ? 'Proctoring Passed' : 'Proctoring Concerns'}</span>
                </div>
                <p className="mt-1 text-sm">{proctoring.proctoringNote}</p>
              </div>
              
              {proctoring.autoPauseEvents.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Auto-Pause Events:</p>
                  {proctoring.autoPauseEvents.map((event, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-amber-600">
                      <Pause className="h-3 w-3" />
                      <span>{new Date(event.timestamp).toLocaleTimeString()} - {event.duration}s pause</span>
                    </div>
                  ))}
                </div>
              )}
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