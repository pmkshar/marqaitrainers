'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Send, Trash2, Bot, User, Loader2, Mic, MicOff, Volume2, VolumeX,
  Pause, Square, MessageSquare, ChevronLeft, ChevronRight, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { findCourse, findLesson } from '@/lib/courses';
import type { ChatMessage } from '@/lib/types';
import { Animated3DTutorAvatar } from './animated-tutor-avatar';

const SUGGESTIONS = [
  'Explain gradient descent in simple terms',
  'What is the difference between supervised and unsupervised learning?',
  'How does a neural network learn?',
  'What is backpropagation?',
];

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi! I'm MARQ AI — your AI tutor. I can help you understand concepts, write and debug code, and guide your learning path. What would you like to learn today?",
  timestamp: Date.now(),
};

// ============================================================
// Indian Language TTS Helpers with Google Translate Fallback
// ============================================================

const INDIAN_LANGS = ['hi', 'te', 'ta', 'kn'];

function browserHasVoiceForLang(lang: string): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  const voices = window.speechSynthesis.getVoices();
  const prefix = lang.toLowerCase();
  return voices.some(v => v.lang.toLowerCase().startsWith(prefix));
}

interface GoogleTTSController {
  stop: () => void;
}

function playGoogleTTS(text: string, lang: string, onEnd?: () => void, onSpeak?: () => void): GoogleTTSController {
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
  let currentAudio: HTMLAudioElement | null = null;
  let stopped = false;

  function playNext() {
    if (stopped) { onEnd?.(); return; }
    if (chunkIdx >= chunks.length) { onEnd?.(); return; }
    const chunk = chunks[chunkIdx];
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${ttsLang}&client=tw-ob`;
    currentAudio = new Audio(url);
    if (chunkIdx === 0) onSpeak?.();
    currentAudio.onended = () => { chunkIdx++; playNext(); };
    currentAudio.onerror = () => { onEnd?.(); };
    currentAudio.play().catch(() => onEnd?.());
  }

  playNext();

  return {
    stop: () => {
      stopped = true;
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      onEnd?.();
    },
  };
}

// ============================================================
// Animated 3D-Style Avatar — now using shared Animated3DTutorAvatar
// ============================================================

// Local wrapper that maps the old API to the new component
function AnimatedTutorAvatar({ speaking, size = 100 }: { speaking: boolean; size?: number }) {
  return (
    <Animated3DTutorAvatar
      speaking={speaking}
      expression={speaking ? 'explaining' : 'neutral'}
      size={size}
    />
  );
}

// ============================================================
// Main AI Tutor Sidebar Component
// ============================================================

export function TutorChat() {
  const {
    currentUserId,
    view,
    chatMessages,
    addMessage,
    clearChat,
    tutorSidebarExpanded,
    setTutorSidebarExpanded,
    tutorSidebarChatOpen,
    setTutorSidebarChatOpen,
    tutorVoiceLang,
    setTutorVoiceLang,
    tutorVoicePausedPosition,
    tutorVoiceProgress,
    tutorVoiceLastText,
    setTutorVoiceState,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const googleTtsRef = useRef<GoogleTTSController | null>(null);

  // Sidebar visibility - show only when logged in and not on home page
  const isVisible = currentUserId !== null && view.name !== 'home';
  const sidebarWidth = tutorSidebarExpanded ? 400 : 320;

  // Build a context string based on current view
  const courseContext = (() => {
    if (view.name === 'course') {
      const c = findCourse(view.courseId!);
      return c ? `${c.title} — ${c.subtitle}` : undefined;
    }
    if (view.name === 'lesson' || view.name === 'quiz') {
      const r = findLesson(view.courseId!, view.moduleId!, view.lessonId!);
      return r ? `${r.course.title} / ${r.module.title} / ${r.lesson.title}` : undefined;
    }
    return undefined;
  })();

  const messages = chatMessages.length > 0 ? chatMessages : [WELCOME];

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
      // Load voices
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Focus input when chat opens
  useEffect(() => {
    if (tutorSidebarChatOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [tutorSidebarChatOpen]);

  // Convert markdown to spoken text
  const toSpokenText = useCallback((md: string) => {
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
  }, []);

  // Speak text using TTS with Indian language fallback
  const speakText = useCallback((text: string) => {
    if (!text) return;

    const lang = tutorVoiceLang ?? 'en';
    const plainText = toSpokenText(text);

    // Check if we should use Google TTS fallback for Indian languages
    if (INDIAN_LANGS.includes(lang) && !browserHasVoiceForLang(lang)) {
      googleTtsRef.current = playGoogleTTS(
        plainText,
        lang,
        () => {
          setIsSpeaking(false);
          setIsPaused(false);
          setTutorVoiceState(0, 100, '');
        },
        () => {
          setIsSpeaking(true);
          setIsPaused(false);
        }
      );
      return;
    }

    // Use browser speechSynthesis
    if (!synthRef.current) return;

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = lang === 'en' ? 'en-IN' : lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setTutorVoiceState(0, 100, text);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);

    // Save voice state for resume
    setTutorVoiceState(0, 0, text);
  }, [tutorVoiceLang, toSpokenText, setTutorVoiceState]);

  // Pause speech
  const pauseSpeech = useCallback(() => {
    if (synthRef.current && isSpeaking) {
      synthRef.current.pause();
      setIsPaused(true);
      setIsSpeaking(false);
      // Save paused position
      setTutorVoiceState(50, tutorVoiceProgress, tutorVoiceLastText);
    }
  }, [isSpeaking, tutorVoiceProgress, tutorVoiceLastText, setTutorVoiceState]);

  // Resume speech
  const resumeSpeech = useCallback(() => {
    if (synthRef.current && isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
      setIsSpeaking(true);
    } else if (tutorVoiceLastText && !isSpeaking) {
      // Resume from saved state
      speakText(tutorVoiceLastText);
    }
  }, [isPaused, isSpeaking, tutorVoiceLastText, speakText]);

  // Stop speech
  const stopSpeech = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (googleTtsRef.current) {
      googleTtsRef.current.stop();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setTutorVoiceState(0, 0, '');
  }, [setTutorVoiceState]);

  // Play/Read aloud - speak last AI response
  const playLastResponse = useCallback(() => {
    const assistantMessages = chatMessages.filter(m => m.role === 'assistant' && m.id !== 'welcome');
    if (assistantMessages.length > 0) {
      speakText(assistantMessages[assistantMessages.length - 1].content);
    }
  }, [chatMessages, speakText]);

  // Voice input: start/stop listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please try Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = tutorVoiceLang === 'en' ? 'en-IN' : tutorVoiceLang ?? 'en-IN';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        send(transcript);
      }
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, tutorVoiceLang]);

  // Cleanup speech on logout or visibility change
  useEffect(() => {
    if (!isVisible) {
      stopSpeech();
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    }
  }, [isVisible, stopSpeech, isListening]);

  // Send message function
  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    setInput('');
    setIsSending(true);

    // Auto-open chat when user sends a message
    setTutorSidebarChatOpen(true);

    try {
      const history = useAppStore.getState().chatMessages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, courseContext }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Request failed: ${res.status}`);
      }
      const data = await res.json();
      addMessage({
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.content,
        timestamp: data.timestamp ?? Date.now(),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      addMessage({
        id: `e-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I couldn't respond right now. ${msg}`,
        timestamp: Date.now(),
      });
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Left Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full z-40 bg-background border-r border-border shadow-lg transition-all duration-300 ease-in-out flex flex-col`}
        style={{ width: `${sidebarWidth}px` }}
      >
        {/* Animated Profile Section (top) */}
        <div className="p-4 border-b border-border bg-gradient-to-b from-emerald-50/50 to-background dark:from-emerald-950/20">
          <div className="flex flex-col items-center">
            {/* Avatar with breathing animation */}
            <AnimatedTutorAvatar speaking={isSpeaking} size={100} />

            {/* AI TUTOR badge */}
            <Badge className="mt-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold tracking-wide text-xs px-3 py-1">
              AI TUTOR
            </Badge>

            {/* Stats row */}
            <p className="mt-2 text-xs text-muted-foreground font-medium">
              10+ yrs | 2,500+ students | 4.9★
            </p>

            {/* Speaking/Paused status badges */}
            {isSpeaking && (
              <Badge className="mt-2 animate-pulse bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px]">
                <Volume2 className="mr-1 h-3 w-3" /> Speaking...
              </Badge>
            )}
            {isPaused && (
              <Badge className="mt-2 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px]">
                <Pause className="mr-1 h-3 w-3" /> Paused
              </Badge>
            )}
          </div>

          {/* Language selector */}
          <div className="mt-4">
            <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Language</label>
            <select
              value={tutorVoiceLang ?? 'en'}
              onChange={e => setTutorVoiceLang(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-xs cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
            </select>
          </div>
        </div>

        {/* Control Buttons (5-column grid) */}
        <div className="p-3 border-b border-border bg-muted/30">
          <div className="grid grid-cols-5 gap-1">
            {/* Play/Read Aloud */}
            <Button
              size="sm"
              variant={isSpeaking ? 'default' : 'outline'}
              className={`h-10 flex flex-col items-center justify-center gap-0.5 text-[10px] ${isSpeaking ? 'bg-emerald-600 text-white' : 'text-emerald-600 border-emerald-500/50'}`}
              onClick={playLastResponse}
              disabled={chatMessages.length === 0 || isSending}
              title="Read aloud last AI response"
            >
              <Volume2 className="h-4 w-4" />
              <span>Play</span>
            </Button>

            {/* Pause */}
            <Button
              size="sm"
              variant={isPaused ? 'default' : 'outline'}
              className={`h-10 flex flex-col items-center justify-center gap-0.5 text-[10px] ${isPaused ? 'bg-amber-600 text-white' : 'text-amber-600 border-amber-500/50'}`}
              onClick={isPaused ? resumeSpeech : pauseSpeech}
              disabled={!isSpeaking && !isPaused}
              title={isPaused ? 'Resume speech' : 'Pause speech'}
            >
              <Pause className="h-4 w-4" />
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </Button>

            {/* Stop */}
            <Button
              size="sm"
              variant="outline"
              className="h-10 flex flex-col items-center justify-center gap-0.5 text-[10px] text-rose-600 border-rose-500/50 hover:bg-rose-50"
              onClick={stopSpeech}
              disabled={!isSpeaking && !isPaused}
              title="Stop speech"
            >
              <Square className="h-4 w-4" />
              <span>Stop</span>
            </Button>

            {/* Record/Mic */}
            <Button
              size="sm"
              variant={isListening ? 'default' : 'outline'}
              className={`h-10 flex flex-col items-center justify-center gap-0.5 text-[10px] ${isListening ? 'bg-rose-600 text-white animate-pulse' : 'text-rose-600 border-rose-500/50'}`}
              onClick={toggleListening}
              title={isListening ? 'Stop voice input' : 'Start voice input'}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              <span>{isListening ? 'Stop' : 'Mic'}</span>
            </Button>

            {/* Chat toggle */}
            <Button
              size="sm"
              variant={tutorSidebarChatOpen ? 'default' : 'outline'}
              className={`h-10 flex flex-col items-center justify-center gap-0.5 text-[10px] ${tutorSidebarChatOpen ? 'bg-emerald-600 text-white' : 'text-emerald-600 border-emerald-500/50'}`}
              onClick={() => setTutorSidebarChatOpen(!tutorSidebarChatOpen)}
              title={tutorSidebarChatOpen ? 'Hide chat' : 'Show chat'}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Chat</span>
            </Button>
          </div>
        </div>

        {/* Expand/Collapse Toggle Button */}
        <button
          className="absolute -right-3 top-20 z-50 h-6 w-6 rounded-full bg-background border border-border shadow-md hover:bg-muted flex items-center justify-center"
          onClick={() => setTutorSidebarExpanded(!tutorSidebarExpanded)}
          title={tutorSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {tutorSidebarExpanded ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>

        {/* Chat Section (toggleable, bottom) */}
        {tutorSidebarChatOpen && (
          <div className="flex-1 flex flex-col min-h-0 border-t border-border">
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[300px]">
              {messages.map(m => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {isSending && (
                <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  <span>AI Tutor is thinking...</span>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {chatMessages.length === 0 && (
              <div className="px-3 pb-2 border-t border-border bg-muted/20">
                <p className="mb-1.5 text-[10px] font-medium text-muted-foreground">Try asking:</p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border bg-background px-2.5 py-1 text-[11px] text-foreground transition-colors hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Composer */}
            <div className="p-3 border-t border-border bg-background">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  placeholder="Ask AI Tutor anything..."
                  rows={1}
                  className="max-h-24 min-h-[40px] flex-1 resize-none rounded-xl border bg-muted/40 px-2.5 py-2 text-sm outline-none transition-colors focus:border-emerald-500 focus:bg-background"
                />
                <Button
                  onClick={() => send(input)}
                  disabled={!input.trim() || isSending}
                  className="h-10 shrink-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Clear chat */}
              {chatMessages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-7 text-xs text-muted-foreground hover:text-rose-600"
                  onClick={() => {
                    if (confirm('Clear the conversation?')) clearChat();
                  }}
                >
                  <Trash2 className="mr-1 h-3 w-3" /> Clear chat
                </Button>
              )}
            </div>
          </div>
        )}

        {/* When chat is closed, show a button to open it */}
        {!tutorSidebarChatOpen && (
          <div className="flex-1 flex items-center justify-center p-4">
            <button
              className="flex flex-col items-center gap-2 text-muted-foreground hover:text-emerald-600 transition-colors"
              onClick={() => setTutorSidebarChatOpen(true)}
            >
              <MessageSquare className="h-8 w-8" />
              <span className="text-xs">Open Chat</span>
            </button>
          </div>
        )}
      </aside>

      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes breathing {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.03); opacity: 0.8; }
          75% { transform: scale(0.98); opacity: 0.7; }
        }
        .animate-breathing {
          animation: breathing 3s ease-in-out infinite;
        }
        @keyframes head-bob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-2px) rotate(-1deg); }
          75% { transform: translateY(2px) rotate(1deg); }
        }
        .animate-head-bob {
          animation: head-bob 0.8s ease-in-out infinite;
        }
        @keyframes sound-wave-1 {
          0%, 100% { height: 6px; }
          50% { height: 12px; }
        }
        @keyframes sound-wave-2 {
          0%, 100% { height: 8px; }
          50% { height: 20px; }
        }
        @keyframes sound-wave-3 {
          0%, 100% { height: 6px; }
          50% { height: 12px; }
        }
        .animate-sound-wave-1 {
          animation: sound-wave-1 0.4s ease-in-out infinite;
        }
        .animate-sound-wave-2 {
          animation: sound-wave-2 0.4s ease-in-out infinite 0.1s;
        }
        .animate-sound-wave-3 {
          animation: sound-wave-3 0.4s ease-in-out infinite 0.2s;
        }
      `}</style>
    </>
  );
}

// ============================================================
// Message Bubble Component
// ============================================================

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${
          isUser ? 'bg-muted text-muted-foreground' : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
        }`}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </span>
      <div
        className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
          isUser ? 'bg-emerald-600 text-white' : 'bg-muted text-foreground'
        }`}
      >
        <MarkdownLite content={message.content} />
      </div>
    </div>
  );
}

// ============================================================
// Markdown Lite Renderer
// ============================================================

function MarkdownLite({ content }: { content: string }) {
  const parts = content.split(/```([\s\S]*?)```/g);
  return (
    <div className="space-y-1.5">
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          const lines = part.split('\n');
          const lang = lines[0]?.trim() || '';
          const code = lines.slice(lang ? 1 : 0).join('\n').replace(/\n$/, '');
          return (
            <pre key={i} className="overflow-x-auto rounded-lg bg-zinc-950 p-2 text-[12px] leading-relaxed text-emerald-200">
              {lang && <div className="mb-0.5 text-[10px] uppercase tracking-wider text-zinc-500">{lang}</div>}
              <code>{code}</code>
            </pre>
          );
        }
        return (
          <div key={i} className="whitespace-pre-wrap leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: renderInline(part) }} />
        );
      })}
    </div>
  );
}

function renderInline(text: string): string {
  let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // inline code
  html = html.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[12px]">$1</code>');
  // bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // headings (### at start of line)
  html = html.replace(/^###\s+(.+)$/gm, '<div class="font-semibold mt-1">$1</div>');
  html = html.replace(/^##\s+(.+)$/gm, '<div class="font-semibold text-base mt-1">$1</div>');
  // bullet list items
  html = html.replace(/^[-*]\s+(.+)$/gm, '<div class="pl-3 before:content-[\'•\'] before:mr-1.5 before:text-muted-foreground">$1</div>');
  return html;
}