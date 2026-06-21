'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparkles, Send, X, Trash2, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useAppStore } from '@/lib/store';
import { findCourse, findLesson } from '@/lib/courses';
import type { ChatMessage } from '@/lib/types';

const SUGGESTIONS = [
  'Explain gradient descent in simple terms',
  'What is the difference between Spring and Spring Boot?',
  'How do I center a div in Flutter?',
  'Help me choose between React Native and Flutter',
];

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi! I'm **TutorAI**, your personal software engineering tutor. \n\nI can help you with **AI/ML, Full Stack Java, .NET, Mobile App Development, and Flutter** — explaining concepts, writing code snippets, debugging errors, and guiding your learning path.\n\nWhat would you like to learn today?",
  timestamp: Date.now(),
};

export function TutorChat() {
  const {
    isTutorOpen, setTutorOpen, chatMessages, addMessage, clearChat,
    view,
  } = useAppStore();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  const messages = chatMessages.length > 0 ? chatMessages : [WELCOME];

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
        className="w-full gap-0 p-0 sm:max-w-[480px] [&_[data-slot=sheet-close]]:hidden"
      >
        <SheetHeader className="border-b bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 backdrop-blur">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <SheetTitle className="text-white">TutorAI</SheetTitle>
                <SheetDescription className="text-white/80">
                  {courseContext ? `Context: ${courseContext}` : 'Your 24/7 AI software tutor'}
                </SheetDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
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

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="space-y-4 p-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {isSending && (
              <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                <span>TutorAI is thinking…</span>
              </div>
            )}
          </div>
        </div>

        {/* Suggestions */}
        {chatMessages.length === 0 && (
          <div className="border-t bg-muted/30 p-3">
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

        {/* Composer */}
        <div className="border-t bg-background p-3">
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
              placeholder="Ask anything about your course…"
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
            Enter to send · Shift+Enter for new line · TutorAI may make mistakes — verify important info.
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
