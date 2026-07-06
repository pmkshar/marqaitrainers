'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AudioLines, ChevronDown, Globe, Pause, Play, RotateCcw, Sparkles, X,
  Volume2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// =========================================================================
// Multilingual AI Tutor Intro
// -------------------------------------------------------------------------
// Shows before a candidate starts a lesson. The AI tutor introduces itself
// in the user's chosen language using the Web Speech API (speechSynthesis).
// Subtitles are shown in sync with the spoken text. A "Don't show again"
// toggle persists in localStorage.
// =========================================================================

type LangCode = 'en' | 'hi' | 'es' | 'fr' | 'ar' | 'zh' | 'pt' | 'de' | 'ta' | 'te';

interface LanguageOption {
  code: LangCode;
  label: string;
  flag: string;
  bcp47: string; // BCP-47 tag used by speechSynthesis
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English',    flag: '🇬🇧', bcp47: 'en-US' },
  { code: 'hi', label: 'हिन्दी',      flag: '🇮🇳', bcp47: 'hi-IN' },
  { code: 'ta', label: 'தமிழ்',       flag: '🇮🇳', bcp47: 'ta-IN' },
  { code: 'te', label: 'తెలుగు',      flag: '🇮🇳', bcp47: 'te-IN' },
  { code: 'es', label: 'Español',    flag: '🇪🇸', bcp47: 'es-ES' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷', bcp47: 'fr-FR' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪', bcp47: 'de-DE' },
  { code: 'pt', label: 'Português',  flag: '🇵🇹', bcp47: 'pt-BR' },
  { code: 'ar', label: 'العربية',     flag: '🇸🇦', bcp47: 'ar-SA' },
  { code: 'zh', label: '中文',         flag: '🇨🇳', bcp47: 'zh-CN' },
];

// The script is keyed by language code. Each line is spoken + shown as a
// subtitle separately so the user can follow along.
interface Script {
  greeting: string;
  intro: string;
  whatYouWillLearn: string;
  tip: string;
  goodbye: string;
}

const SCRIPTS: Record<LangCode, Script> = {
  en: {
    greeting: "Hello! I'm TutorAI, your personal AI Software Tutor.",
    intro: 'I will be with you throughout this lesson — explaining concepts, answering questions, and reviewing your code.',
    whatYouWillLearn: "In this session, you'll walk through step-by-step examples, watch a short video, and finish with a quick test.",
    tip: 'If you get stuck at any point, just click the Ask AI Tutor button on the top right and I will help you out.',
    goodbye: "Ready? Let's begin your training session now.",
  },
  hi: {
    greeting: 'नमस्ते! मैं TutorAI हूँ, आपका निजी एआई सॉफ्टवेयर ट्यूटर।',
    intro: 'मैं इस पूरे पाठ में आपके साथ रहूँगा — अवधारणाएँ समझाऊँगा, सवालों के जवाब दूँगा, और आपके कोड की समीक्षा करूँगा।',
    whatYouWillLearn: 'इस सत्र में आप चरण-दर-चरण उदाहरण देखेंगे, एक छोटा वीडियो देखेंगे, और एक छोटे परीक्षण के साथ समाप्त करेंगे।',
    tip: 'यदि किसी भी बिंदु पर आप अटक जाएँ, तो ऊपर दाएँ Ask AI Tutor बटन पर क्लिक करें, मैं आपकी मदद करूँगा।',
    goodbye: 'तैयार? चलिए अब आपका प्रशिक्षण सत्र शुरू करते हैं।',
  },
  ta: {
    greeting: 'வணக்கம்! நான் TutorAI, உங்களின் தனிப்பட்ட AI மென்பொருள் ஆசிரியர்.',
    intro: 'இந்தப் பாடத்தில் நான் முழுவதுமாக உங்களுடன் இருப்பேன் — கருத்துகளை விளக்குவேன், கேள்விகளுக்கு பதிலளிப்பேன், குறியீட்டை மதிப்பாய்வு செய்வேன்.',
    whatYouWillLearn: 'இந்த அமர்வில் படிப்படியான எடுத்துக்காட்டுகள், குறுகிய வீடியோ, மற்றும் சிறிய தேர்வுடன் முடிவடையும்.',
    tip: 'எப்போது தடைப்பட்டாலும், மேல் வலது Ask AI Tutor பொத்தானை அழுத்தவும், நான் உதவுகிறேன்.',
    goodbye: 'தயாரா? உங்கள் பயிற்சி அமர்வை இப்போது தொடங்கலாம்.',
  },
  te: {
    greeting: 'నమస్తే! నేను TutorAI, మీ వ్యక్తిగత AI సాఫ్ట్‌వేర్ ట్యూటర్.',
    intro: 'ఈ పాఠం అంతటా నేను మీతో ఉంటాను — భావనలను వివరిస్తాను, ప్రశ్నలకు సమాధానమిస్తాను, మీ కోడ్‌ను సమీక్షిస్తాను.',
    whatYouWillLearn: 'ఈ సెషన్‌లో మీరు దశలవారీగా ఉదాహరణలు, చిన్న వీడియో, చిన్న పరీక్షతో ముగించం.',
    tip: 'ఎప్పుడైనా ఇబ్బంది పడితే, పై కుడి Ask AI Tutor బటన్ నొక్కండి, నేను సహాయం చేస్తాను.',
    goodbye: 'సిద్ధమా? మీ శిక్షణ సెషన్ ఇప్పుడే ప్రారంభిద్దాం.',
  },
  es: {
    greeting: '¡Hola! Soy TutorAI, tu tutor de software personal con IA.',
    intro: 'Estaré contigo durante toda esta lección: explicando conceptos, respondiendo preguntas y revisando tu código.',
    whatYouWillLearn: 'En esta sesión verás ejemplos paso a paso, un video corto y terminarás con un pequeño examen.',
    tip: 'Si te atascas en algún momento, haz clic en el botón Ask AI Tutor arriba a la derecha y te ayudaré.',
    goodbye: '¿Listo? Comencemos tu sesión de entrenamiento ahora.',
  },
  fr: {
    greeting: "Bonjour ! Je suis TutorAI, votre tuteur logiciel IA personnel.",
    intro: "Je serai avec vous tout au long de cette leçon — j'expliquerai les concepts, répondrai aux questions et examinerai votre code.",
    whatYouWillLearn: "Dans cette session, vous suivrez des exemples pas à pas, regarderez une courte vidéo et terminerez avec un petit test.",
    tip: "Si vous êtes bloqué à tout moment, cliquez sur le bouton Ask AI Tutor en haut à droite et je vous aiderai.",
    goodbye: "Prêt ? Commençons votre session de formation maintenant.",
  },
  de: {
    greeting: 'Hallo! Ich bin TutorAI, dein persönlicher KI-Software-Tutor.',
    intro: 'Ich werde dich durch die gesamte Lektion begleiten — Konzepte erklären, Fragen beantworten und deinen Code überprüfen.',
    whatYouWillLearn: 'In dieser Sitzung gehst du Schritt für Schritt durch Beispiele, schaust ein kurzes Video und beendest mit einem kleinen Test.',
    tip: 'Wenn du irgendwo feststeckst, klicke oben rechts auf Ask AI Tutor und ich helfe dir.',
    goodbye: 'Bereit? Lass uns jetzt mit deiner Trainingssitzung beginnen.',
  },
  pt: {
    greeting: 'Olá! Sou o TutorAI, seu tutor de software com IA pessoal.',
    intro: 'Estarei com você durante toda esta lição — explicando conceitos, respondendo perguntas e revisando seu código.',
    whatYouWillLearn: 'Nesta sessão, você verá exemplos passo a passo, assistirá a um vídeo curto e terminará com um pequeno teste.',
    tip: 'Se você travar em qualquer ponto, clique no botão Ask AI Tutor no canto superior direito e eu ajudarei.',
    goodbye: 'Pronto? Vamos começar sua sessão de treinamento agora.',
  },
  ar: {
    greeting: 'مرحبًا! أنا TutorAI، مدرس البرمجة الشخصي المدعوم بالذكاء الاصطناعي.',
    intro: 'سأكون معك طوال هذا الدرس — أشرح المفاهيم، أجيب على الأسئلة، وأراجع الكود الخاص بك.',
    whatYouWillLearn: 'في هذه الجلسة، ستتبع أمثلة خطوة بخطوة، تشاهد مقطع فيديو قصير، وتنهي باختبار قصير.',
    tip: 'إذا تعثرت في أي لحظة، انقر على زر Ask AI Tutor في الأعلى يمينًا وسأساعدك.',
    goodbye: 'مستعد؟ لنبدأ جلسة التدريب الآن.',
  },
  zh: {
    greeting: '你好！我是 TutorAI，你的个人 AI 软件导师。',
    intro: '在整个课程中，我会一直陪伴你 — 解释概念、回答问题并审查你的代码。',
    whatYouWillLearn: '在本次课程中，你将逐步学习示例、观看短视频，最后完成一个小测试。',
    tip: '如果任何时候你遇到困难，点击右上角的 Ask AI Tutor 按钮，我会帮助你。',
    goodbye: '准备好了吗？让我们现在开始你的培训课程。',
  },
};

interface AITutorIntroProps {
  /** Title of the lesson the candidate is about to start (used in dynamic content). */
  lessonTitle?: string;
  /** Title of the course. */
  courseTitle?: string;
  /** Called when the user dismisses the intro and is ready to start training. */
  onStart: () => void;
  /** Whether to show the "Don't show again" toggle (default true). */
  allowDisable?: boolean;
}

const STORAGE_KEY = 'marq-ai-tutor-intro-prefs';

interface IntroPrefs {
  enabled: boolean;
  lang: LangCode;
  rate: number;     // 0.5–2.0
  voiceURI?: string; // preferred voice
}

const DEFAULT_PREFS: IntroPrefs = {
  enabled: true,
  lang: 'en',
  rate: 1.0,
};

function loadPrefs(): IntroPrefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(p: IntroPrefs) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // ignore quota errors
  }
}

export function AITutorIntro({ lessonTitle, courseTitle, onStart, allowDisable = true }: AITutorIntroProps) {
  const [prefs, setPrefs] = useState<IntroPrefs>(DEFAULT_PREFS);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [supported, setSupported] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeLineIdx, setActiveLineIdx] = useState(0);
  const [langPickerOpen, setLangPickerOpen] = useState(false);

  // Refs for managing the speech queue
  const queueRef = useRef<SpeechSynthesisUtterance[]>([]);
  const currentIdxRef = useRef(0);

  // -------- init: load prefs, populate voices, register handlers --------
  useEffect(() => {
    const p = loadPrefs();
    setPrefs(p);

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }

    const refreshVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) setVoices(v);
    };
    refreshVoices();
    window.speechSynthesis.onvoiceschanged = refreshVoices;

    return () => {
      // Cancel any in-flight speech when unmounting
      try { window.speechSynthesis.cancel(); } catch { /* noop */ }
    };
  }, []);

  // -------- script for current language --------
  const script = SCRIPTS[prefs.lang];
  const lines = useMemo(
    () => [script.greeting, script.intro, script.whatYouWillLearn, script.tip, script.goodbye],
    [script],
  );

  // -------- voice selection for the current language --------
  const preferredVoice = useMemo<SpeechSynthesisVoice | undefined>(() => {
    if (!voices.length) return undefined;
    const lang = LANGUAGES.find((l) => l.code === prefs.lang);
    if (!lang) return undefined;
    // 1) user-pinned voice
    if (prefs.voiceURI) {
      const pinned = voices.find((v) => v.voiceURI === prefs.voiceURI);
      if (pinned) return pinned;
    }
    // 2) exact BCP-47 match
    const exact = voices.find((v) => v.lang === lang.bcp47);
    if (exact) return exact;
    // 3) language prefix match (e.g. en-* matches en-US)
    const prefix = lang.bcp47.split('-')[0];
    const prefixMatch = voices.find((v) => v.lang.toLowerCase().startsWith(prefix.toLowerCase()));
    return prefixMatch;
  }, [voices, prefs.lang, prefs.voiceURI]);

  // -------- speak the script --------
  const cancelSpeech = useCallback(() => {
    if (!supported) return;
    try { window.speechSynthesis.cancel(); } catch { /* noop */ }
    setIsPlaying(false);
    setIsPaused(false);
  }, [supported]);

  const speak = useCallback(() => {
    if (!supported) return;
    try { window.speechSynthesis.cancel(); } catch { /* noop */ }

    const utterances: SpeechSynthesisUtterance[] = lines.map((text, idx) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = LANGUAGES.find((l) => l.code === prefs.lang)?.bcp47 ?? 'en-US';
      u.rate = prefs.rate;
      u.pitch = 1.0;
      u.volume = 1.0;
      if (preferredVoice) u.voice = preferredVoice;
      u.onstart = () => setActiveLineIdx(idx);
      u.onend = () => {
        if (idx === lines.length - 1) {
          setIsPlaying(false);
          setIsPaused(false);
        }
      };
      u.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };
      return u;
    });

    queueRef.current = utterances;
    currentIdxRef.current = 0;
    setActiveLineIdx(0);
    setIsPlaying(true);
    setIsPaused(false);

    for (const u of utterances) {
      window.speechSynthesis.speak(u);
    }
  }, [supported, lines, prefs.lang, prefs.rate, preferredVoice]);

  const pause = useCallback(() => {
    if (!supported) return;
    try { window.speechSynthesis.pause(); } catch { /* noop */ }
    setIsPaused(true);
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    try { window.speechSynthesis.resume(); } catch { /* noop */ }
    setIsPaused(false);
  }, [supported]);

  const replay = useCallback(() => {
    speak();
  }, [speak]);

  // -------- handlers --------
  const handleLanguageChange = (lang: LangCode) => {
    const next = { ...prefs, lang };
    setPrefs(next);
    savePrefs(next);
    setLangPickerOpen(false);
    // Stop current speech (it's in the wrong language now)
    cancelSpeech();
  };

  const handleRateChange = (rate: number) => {
    const next = { ...prefs, rate };
    setPrefs(next);
    savePrefs(next);
  };

  const handleVoiceChange = (voiceURI: string) => {
    const next = { ...prefs, voiceURI };
    setPrefs(next);
    savePrefs(next);
  };

  const handleDisable = (enabled: boolean) => {
    const next = { ...prefs, enabled };
    setPrefs(next);
    savePrefs(next);
  };

  const handleStart = () => {
    cancelSpeech();
    onStart();
  };

  const currentLang = LANGUAGES.find((l) => l.code === prefs.lang)!;
  const voicesForLang = voices.filter((v) =>
    v.lang.toLowerCase().startsWith(currentLang.bcp47.split('-')[0].toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border bg-card shadow-2xl">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white">
          <button
            onClick={handleStart}
            aria-label="Skip intro"
            className="absolute right-4 top-4 rounded-full bg-white/15 p-1.5 text-white/90 transition hover:bg-white/25"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-white/80">marqaicourses Online Courses</p>
              <h2 className="text-xl font-bold">TutorAI Introduction</h2>
            </div>
          </div>
          {(lessonTitle || courseTitle) && (
            <div className="mt-3 text-sm text-white/90">
              {courseTitle && <span className="font-medium">Next: {courseTitle}</span>}
              {lessonTitle && <span className="text-white/70"> · {lessonTitle}</span>}
            </div>
          )}
        </div>

        {/* Body — avatar + subtitles + controls */}
        <div className="space-y-5 p-6">
          {/* Avatar + speaking indicator */}
          <div className="flex items-center gap-4">
            <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Sparkles className="h-7 w-7" />
              {isPlaying && !isPaused && (
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/30" />
              )}
              {isPlaying && !isPaused && (
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px]">
                  <AudioLines className="h-3 w-3" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">TutorAI</p>
              <p className="text-xs text-muted-foreground">
                {supported
                  ? `Speaking in ${currentLang.flag} ${currentLang.label}`
                  : 'Voice not supported in this browser — showing subtitles only'}
              </p>
            </div>
            {/* Language picker */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLangPickerOpen((o) => !o)}
                className="gap-1.5"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{currentLang.flag}</span>
                <span className="hidden sm:inline">{currentLang.label}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
              {langPickerOpen && (
                <div className="absolute right-0 z-10 mt-1 max-h-72 w-48 overflow-auto rounded-lg border bg-popover p-1 shadow-lg">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleLanguageChange(l.code)}
                      className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-accent ${
                        l.code === prefs.lang ? 'bg-accent/60 font-medium' : ''
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Subtitle area */}
          <div className="min-h-[7.5rem] rounded-xl border bg-muted/30 p-4">
            {lines.map((line, idx) => (
              <p
                key={idx}
                className={`text-sm leading-relaxed transition-colors ${
                  idx === activeLineIdx
                    ? 'font-medium text-foreground'
                    : idx < activeLineIdx
                    ? 'text-muted-foreground/60'
                    : 'text-muted-foreground/40'
                } ${idx > 0 ? 'mt-2' : ''}`}
              >
                {line}
              </p>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {!isPlaying ? (
              <Button onClick={speak} disabled={!supported} className="bg-emerald-600 text-white hover:bg-emerald-700">
                <Play className="mr-1.5 h-4 w-4" />
                {activeLineIdx > 0 ? 'Play again' : 'Play introduction'}
              </Button>
            ) : isPaused ? (
              <Button onClick={resume} className="bg-emerald-600 text-white hover:bg-emerald-700">
                <Play className="mr-1.5 h-4 w-4" /> Resume
              </Button>
            ) : (
              <Button onClick={pause} variant="outline">
                <Pause className="mr-1.5 h-4 w-4" /> Pause
              </Button>
            )}
            <Button onClick={replay} disabled={!supported || !isPlaying} variant="outline" size="icon" aria-label="Replay">
              <RotateCcw className="h-4 w-4" />
            </Button>

            <div className="ml-auto flex items-center gap-3">
              {/* Speed slider */}
              <div className="hidden items-center gap-2 sm:flex">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <input
                  type="range"
                  min={0.5}
                  max={1.5}
                  step={0.1}
                  value={prefs.rate}
                  onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                  className="h-1 w-24 cursor-pointer accent-emerald-600"
                  aria-label="Speech speed"
                />
                <span className="w-10 text-xs tabular-nums text-muted-foreground">
                  {prefs.rate.toFixed(1)}x
                </span>
              </div>

              {allowDisable && (
                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={!prefs.enabled}
                    onChange={(e) => handleDisable(!e.target.checked)}
                    className="h-3.5 w-3.5 accent-emerald-600"
                  />
                  Don&apos;t show again
                </label>
              )}
            </div>
          </div>

          {/* Voice picker — only show if multiple voices available for the language */}
          {supported && voicesForLang.length > 1 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Voice:</span>
              <select
                value={prefs.voiceURI ?? preferredVoice?.voiceURI ?? ''}
                onChange={(e) => handleVoiceChange(e.target.value)}
                className="rounded border bg-background px-2 py-1 text-xs"
              >
                {voicesForLang.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Start training CTA */}
          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {supported
                ? 'Tap play to hear the introduction, or skip ahead whenever you are ready.'
                : 'Your browser does not support speech synthesis. Read the introduction above, then start training.'}
            </p>
            <Button onClick={handleStart} size="lg" className="bg-emerald-600 text-white hover:bg-emerald-700">
              Start training
              <Sparkles className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// Hook: useAITutorIntro
// -------------------------------------------------------------------------
// Convenience wrapper that reads localStorage prefs and returns whether the
// intro should be shown. Used by LessonView to gate the intro overlay.
// =========================================================================

export function useShouldShowIntro(): boolean {
  const [shouldShow, setShouldShow] = useState(false);
  useEffect(() => {
    const p = loadPrefs();
    setShouldShow(p.enabled);
  }, []);
  return shouldShow;
}

export function setIntroEnabled(enabled: boolean) {
  const p = loadPrefs();
  savePrefs({ ...p, enabled });
}
