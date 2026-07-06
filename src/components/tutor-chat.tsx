'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Sparkles, Send, X, Trash2, Bot, User, Loader2, Mic, MicOff, Volume2, VolumeX, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useAppStore } from '@/lib/store';
import { findCourse, findLesson } from '@/lib/courses';
import type { ChatMessage } from '@/lib/types';

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

export function TutorChat() {
  const {
    isTutorOpen, setTutorOpen, chatMessages, addMessage, clearChat,
    view,
  } = useAppStore();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isExplanationActive, setIsExplanationActive] = useState(false);
  const [whiteboardNotes, setWhiteboardNotes] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Build a context string based on current view
  const courseContext = (() => {
    if (view.name === 'course') {
      const c = findCourse(view.courseId);
      return c ? `${c.title} — ${c.subtitle}` : undefined;
    }
    if (view.name === 'lesson' || view.name === 'quiz') {
      const r = findLesson(view.courseId, view.moduleId, view.lessonId);
      return r ? `${r.course.title} / ${r.module.title} / ${r.lesson.title}` : undefined;
    }
    return undefined;
  })();

  // Contextual subtitle based on course
  const headerSubtitle = (() => {
    if (courseContext) return courseContext;
    if (view.courseId) {
      const c = findCourse(view.courseId);
      if (c) return `AI & Machine Learning Tutor · ${c.title}`;
    }
    return 'AI & Machine Learning Tutor';
  })();

  const messages = chatMessages.length > 0 ? chatMessages : [WELCOME];

  // Extract whiteboard notes from conversation
  useEffect(() => {
    const assistantMessages = chatMessages.filter((m) => m.role === 'assistant' && m.id !== 'welcome');
    if (assistantMessages.length === 0) {
      setWhiteboardNotes([]);
      return;
    }
    const notes: string[] = [];
    const lastMsg = assistantMessages[assistantMessages.length - 1];
    // Extract key points: headings, bold text, bullet points
    const headingMatches = lastMsg.content.match(/^#{1,3}\s+(.+)$/gm);
    if (headingMatches) {
      headingMatches.forEach((h) => notes.push(h.replace(/^#+\s+/, '').trim()));
    }
    const boldMatches = lastMsg.content.match(/\*\*([^*]+)\*\*/g);
    if (boldMatches) {
      boldMatches.slice(0, 5).forEach((b) => notes.push(b.replace(/\*\*/g, '').trim()));
    }
    const bulletMatches = lastMsg.content.match(/^[-*]\s+(.+)$/gm);
    if (bulletMatches) {
      bulletMatches.slice(0, 5).forEach((b) => notes.push(b.replace(/^[-*]\s+/, '').trim()));
    }
    // Deduplicate and limit
    const unique = [...new Set(notes)].slice(0, 8);
    setWhiteboardNotes(unique);
  }, [chatMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isTutorOpen]);

  useEffect(() => {
    if (isTutorOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isTutorOpen]);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Speak the last assistant message when explanation is active
  const speakText = useCallback((text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    // Strip markdown for speech
    const plain = text
      .replace(/```[\s\S]*?```/g, ' code block ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/#{1,6}\s+/g, '')
      .replace(/[-*]\s+/g, '')
      .replace(/\n/g, '. ');
    const utterance = new SpeechSynthesisUtterance(plain);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  }, []);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // Toggle explanation mode
  const toggleExplanation = useCallback(() => {
    if (isExplanationActive) {
      stopSpeaking();
      setIsExplanationActive(false);
    } else {
      setIsExplanationActive(true);
      // Speak the last assistant message
      const assistantMessages = chatMessages.filter((m) => m.role === 'assistant' && m.id !== 'welcome');
      if (assistantMessages.length > 0) {
        speakText(assistantMessages[assistantMessages.length - 1].content);
      }
    }
  }, [isExplanationActive, chatMessages, speakText, stopSpeaking]);

  // Voice input: start/stop listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    // Start listening
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please try Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        send(transcript);
      }
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  // Auto-speak when explanation is active and new assistant message arrives
  useEffect(() => {
    if (!isExplanationActive) return;
    const lastMsg = chatMessages[chatMessages.length - 1];
    if (lastMsg && lastMsg.role === 'assistant' && lastMsg.id !== 'welcome') {
      speakText(lastMsg.content);
    }
  }, [chatMessages, isExplanationActive, speakText]);

  // Cleanup speech on close
  useEffect(() => {
    if (!isTutorOpen) {
      stopSpeaking();
      setIsExplanationActive(false);
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    }
  }, [isTutorOpen, stopSpeaking, isListening]);

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

    try {
      const history = useAppStore.getState().chatMessages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

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

  return (
    <Sheet open={isTutorOpen} onOpenChange={setTutorOpen}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-[480px] [&_[data-slot=sheet-close]]:hidden flex flex-col"
      >
        {/* ── Header ── */}
        <SheetHeader className="border-b bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 backdrop-blur">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <SheetTitle className="text-white text-lg font-bold tracking-wide">MARQ AI</SheetTitle>
                <SheetDescription className="text-white/80 text-xs">
                  {headerSubtitle}
                </SheetDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Voice Chat Button */}
              <Button
                size="sm"
                className={`h-8 gap-1.5 rounded-full text-xs font-semibold ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
                onClick={toggleListening}
                aria-label={isListening ? 'Stop voice chat' : 'Start voice chat'}
              >
                {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                {isListening ? 'Listening…' : 'Voice Chat'}
              </Button>
              {chatMessages.length > 0 && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => {
                    if (confirm('Clear the conversation?')) clearChat();
                  }}
                  aria-label="Clear chat"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setTutorOpen(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* ── Messages ── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="space-y-4 p-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {isSending && (
              <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                <span>MARQ AI is thinking…</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Suggestions ── */}
        {chatMessages.length === 0 && (
          <div className="border-t bg-muted/30 p-3 shrink-0">
            <p className="mb-2 px-1 text-xs font-medium text-muted-foreground">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border bg-card px-3 py-1.5 text-xs text-foreground transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/5"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── MARQ AI's Whiteboard ── */}
        <div className="shrink-0 border-t-2 border-amber-700/30 bg-amber-50 dark:bg-amber-950/30 p-3">
          <div className="flex items-center gap-2 mb-2">
            <PenTool className="h-4 w-4 text-amber-700 dark:text-amber-400" />
            <div>
              <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">MARQ AI&apos;s Whiteboard</h4>
              <p className="text-[10px] text-amber-700/70 dark:text-amber-400/70">Visual notes while explaining</p>
            </div>
          </div>
          {whiteboardNotes.length > 0 ? (
            <ul className="space-y-1 pl-1">
              {whiteboardNotes.map((note, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-amber-800 dark:text-amber-300">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400" />
                  {note}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-amber-700/50 dark:text-amber-400/50 italic">Start a conversation to see notes here…</p>
          )}
        </div>

        {/* ── MARQ AI's Explanation ── */}
        <div className={`shrink-0 border-t-2 p-3 transition-colors ${
          isExplanationActive
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
            : 'border-emerald-500/30 bg-background'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Volume2 className={`h-4 w-4 ${isExplanationActive ? 'text-emerald-600' : 'text-muted-foreground'}`} />
              <div>
                <h4 className={`text-sm font-semibold ${isExplanationActive ? 'text-emerald-700 dark:text-emerald-300' : 'text-foreground'}`}>
                  MARQ AI&apos;s Explanation
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  {isExplanationActive ? (isSpeaking ? 'Speaking now…' : 'Ready to voice-over') : 'Ready to start voice-over'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isExplanationActive && isSpeaking && (
                <Badge className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 animate-pulse">
                  EXPLANATION · SPEAKING NOW
                </Badge>
              )}
              <Button
                size="sm"
                variant={isExplanationActive ? 'default' : 'outline'}
                className={`h-7 gap-1 text-xs ${
                  isExplanationActive
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                }`}
                onClick={toggleExplanation}
                aria-label={isExplanationActive ? 'Stop explanation' : 'Start explanation'}
              >
                {isExplanationActive ? (
                  <>
                    <VolumeX className="h-3 w-3" />
                    Stop
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3 w-3" />
                    Play
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Composer ── */}
        <div className="border-t bg-background p-3 shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask MARQ AI anything..."
              rows={1}
              className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border bg-muted/40 px-3 py-2.5 text-sm outline-none transition-colors focus:border-emerald-500 focus:bg-background"
            />
            <Button
              onClick={() => send(input)}
              disabled={!input.trim() || isSending}
              className="h-11 shrink-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
              size="icon"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-1.5 px-1 text-[10px] text-muted-foreground">
            Enter to send · Shift+Enter for new line · MARQ AI may make mistakes — verify important info.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
          isUser ? 'bg-muted text-muted-foreground' : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </span>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
          isUser
            ? 'bg-emerald-600 text-white'
            : 'bg-muted text-foreground'
        }`}
      >
        <MarkdownLite content={message.content} />
      </div>
    </div>
  );
}

// Tiny markdown renderer: code blocks, inline code, bold, headings, lists.
function MarkdownLite({ content }: { content: string }) {
  // Split by code blocks
  const parts = content.split(/```([\s\S]*?)```/g);
  return (
    <div className="space-y-2">
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          // code block
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
        // inline markdown
        return <div key={i} className="whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: renderInline(part) }} />;
      })}
    </div>
  );
}

function renderInline(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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
