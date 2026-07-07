'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  X, Maximize2, Minimize2, Send, Sparkles,
  CheckCircle2, MessageSquare, Plus, RotateCcw,
  Bot, User, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Animated3DTutorAvatar } from './animated-tutor-avatar';
import { useAppStore } from '@/lib/store';
import { getTutorForCourse } from '@/lib/tutor-personas';
import type { ChatMessage } from '@/lib/types';

// ============================================================
// GlobalTutorPopup — Global AI Tutor popup for all pages
// ------------------------------------------------------------
// Renders a floating AI tutor chat popup that works on ALL pages,
// not just lesson-view. The navbar "Ask AI" button sets
// isTutorOpen=true in the store, and this component responds.
// ============================================================

type PopupSize = 'mini' | 'medium' | 'large' | 'fullscreen';

interface LocalMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// Default tutor persona for the global popup
const defaultTutor = getTutorForCourse('ai-ml');

// Greeting message shown when the popup first opens
const GREETING: LocalMessage = {
  id: 'greeting',
  role: 'assistant',
  content: `Hi there! 👋 I'm **${defaultTutor.name}**, your AI tutor on MarqAI Courses.\n\nI can help you with:\n- 📚 **Course concepts** — AI/ML, Java, .NET, Python, Mobile Dev, Flutter\n- 💻 **Code help** — write, debug, and review code\n- 🗺️ **Learning paths** — plan your study journey\n- ❓ **Questions** — ask me anything about software engineering\n\nWhat would you like to learn today?`,
  timestamp: Date.now(),
};

// Simulated AI response generator — produces contextual replies
function generateSimulatedReply(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  // Course-related questions
  if (lower.includes('course') || lower.includes('learn') || lower.includes('study') || lower.includes('recommend')) {
    return `Great question! MarqAI Courses offers a range of comprehensive programs:\n\n1. **AI & Machine Learning** — Master neural networks, transformers, and LLMs\n2. **Full Stack Java** — From JVM internals to Spring Boot microservices\n3. **.NET & C#** — Build production-grade apps with ASP.NET Core\n4. **Mobile Development** — React Native & Expo for cross-platform apps\n5. **Flutter & Dart** — Pixel-perfect cross-platform UI\n6. **Python Programming** — From basics to async, web, and data science\n\nEach course features step-wise lessons, AI voice tutoring, video walkthroughs, and verified certificates. Which topic interests you most?`;
  }

  // AI/ML questions
  if (lower.includes('ai') || lower.includes('machine learning') || lower.includes('ml') || lower.includes('neural') || lower.includes('deep learning')) {
    return `AI and Machine Learning is a fascinating field! Here's a quick overview:\n\n**Machine Learning** is about teaching computers to learn from data without explicit programming.\n\n### Key areas:\n- **Supervised Learning** — labeled data (classification, regression)\n- **Unsupervised Learning** — unlabeled data (clustering, dimensionality reduction)\n- **Deep Learning** — neural networks with many layers\n- **NLP & Transformers** — the tech behind ChatGPT\n\n### Getting started:\n1. Learn Python and math fundamentals (linear algebra, statistics)\n2. Study classical ML algorithms (linear regression, decision trees)\n3. Move to deep learning with PyTorch\n4. Explore transformers and LLMs\n\nWould you like me to explain any of these in more detail? You can also enroll in our **AI & Machine Learning** course for a structured learning path!`;
  }

  // Python questions
  if (lower.includes('python')) {
    return `Python is one of the most versatile and beginner-friendly languages! 🐍\n\n### Why Python?\n- **Easy to read** — clean, expressive syntax\n- **Huge ecosystem** — web (Django/Flask), data (pandas/NumPy), AI (PyTorch/TensorFlow)\n- **In demand** — #1 language on TIOBE index\n\n### Quick example:\n\`\`\`python\n# List comprehension\neven_squares = [x**2 for x in range(10) if x % 2 == 0]\nprint(even_squares)  # [0, 4, 16, 36, 64]\n\`\`\`\n\nOur **Python Programming** course covers everything from basics to async, web frameworks, and data science. Want to know more?`;
  }

  // Java/Spring questions
  if (lower.includes('java') || lower.includes('spring')) {
    return `Java remains a powerhouse in enterprise development! ☕\n\n### Java Strengths:\n- **Platform independence** — write once, run anywhere (JVM)\n- **Strong typing** — catches errors at compile time\n- **Massive ecosystem** — Spring Boot, Maven, Gradle\n\n### Spring Boot quick start:\n\`\`\`java\n@RestController\n@RequestMapping("/api")\npublic class HelloController {\n    @GetMapping("/hello")\n    public Map<String, String> hello() {\n        return Map.of("message", "Hello, World!");\n    }\n}\n\`\`\`\n\nCheck out our **Full Stack Java** course for a complete journey from JVM basics to microservices!`;
  }

  // Help / hello / greeting
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('help')) {
    return `Hello! 😊 I'm here to help you on your learning journey.\n\nYou can ask me about:\n- 📖 Any **concept** in our courses (AI, Java, .NET, Python, Mobile, Flutter)\n- 💻 **Code** — I can write, explain, or debug code\n- 🗺️ **Career advice** — which skills to learn, learning paths\n- 📝 **Course guidance** — which course is right for you\n\nJust type your question and I'll do my best to help!`;
  }

  // Default / fallback
  return `That's a great question! Let me think about that...\n\nAs your AI tutor on MarqAI Courses, I can help with:\n\n- **Concepts** — I'll explain things step by step\n- **Code** — I can write, review, and debug code snippets\n- **Comparisons** — React vs Vue, Python vs Java, etc.\n- **Learning paths** — I'll suggest the best order to learn topics\n\nFeel free to ask me anything about software engineering, and I'll provide a detailed, helpful answer. You can also explore our courses for structured, hands-on learning!\n\n*Tip: Try asking about specific topics like "explain neural networks" or "help me with Python".*`;
}

export function GlobalTutorPopup() {
  const isTutorOpen = useAppStore((s) => s.isTutorOpen);
  const setTutorOpen = useAppStore((s) => s.setTutorOpen);

  const [popupSize, setPopupSize] = useState<PopupSize>('medium');
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [messages, setMessages] = useState<LocalMessage[]>([GREETING]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const popupRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Size configurations — consistent with FloatingTutorPopup
  const sizeConfig = {
    mini: { width: 380, height: 480, avatarSize: 60 },
    medium: { width: 440, height: 580, avatarSize: 80 },
    large: { width: 520, height: 700, avatarSize: 100 },
    fullscreen: {
      width: typeof window !== 'undefined' ? window.innerWidth - 48 : 1200,
      height: typeof window !== 'undefined' ? window.innerHeight - 80 : 800,
      avatarSize: 120,
    },
  };

  const currentSize = sizeConfig[popupSize];
  const isFullscreen = popupSize === 'fullscreen';

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input when popup opens
  useEffect(() => {
    if (isTutorOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isTutorOpen]);

  // Zoom animation
  const handleSizeChange = (newSize: PopupSize) => {
    setIsZooming(true);
    setTimeout(() => {
      setPopupSize(newSize);
      setIsZooming(false);
    }, 200);
  };

  // Dragging logic
  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, textarea, [data-nodrag]')) return;
    setIsDragging(true);
    const rect = popupRef.current?.getBoundingClientRect();
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: rect ? rect.left : position.x,
      posY: rect ? rect.top : position.y,
    };
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPosition({
        x: dragStartRef.current.posX + dx,
        y: Math.max(0, dragStartRef.current.posY + dy),
      });
    };
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging]);

  // Close popup
  const handleClose = () => {
    setTutorOpen(false);
  };

  // Minimize popup (close to icon)
  const handleMinimize = () => {
    setTutorOpen(false);
  };

  // New chat
  const handleNewChat = () => {
    setMessages([GREETING]);
    setInput('');
    setIsSending(false);
    setIsTyping(false);
    if (inputRef.current) inputRef.current.focus();
  };

  // Send message
  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMsg: LocalMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);
    setIsTyping(true);

    // Try to call the API first
    try {
      const history = [...messages, userMsg]
        .filter((m) => m.id !== 'greeting')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: data.content,
            timestamp: data.timestamp ?? Date.now(),
          },
        ]);
        setIsSending(false);
        return;
      }
    } catch {
      // Fall through to simulated response
    }

    // Simulated AI response with a delay
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      const reply = generateSimulatedReply(trimmed);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: reply,
          timestamp: Date.now(),
        },
      ]);
      setIsSending(false);
    }, delay);
  }, [input, isSending, messages]);

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Render message content with basic markdown support
  const renderContent = (content: string) => {
    // Split by newlines and render
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let codeKey = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          elements.push(
            <pre key={`code-${codeKey++}`} className="my-1.5 overflow-x-auto rounded-md bg-zinc-900 dark:bg-zinc-800 p-2.5 text-[11px] text-emerald-300 font-mono leading-relaxed">
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          // Start code block
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      // Regular line
      if (line.startsWith('### ')) {
        elements.push(<h4 key={`h-${i}`} className="font-bold text-sm mt-2 mb-0.5 text-foreground">{line.slice(4)}</h4>);
      } else if (line.startsWith('## ')) {
        elements.push(<h3 key={`h-${i}`} className="font-bold text-sm mt-2 mb-0.5 text-foreground">{line.slice(3)}</h3>);
      } else if (line.startsWith('- **')) {
        const match = line.match(/^- \*\*(.+?)\*\*\s*[-—]?\s*(.*)/);
        if (match) {
          elements.push(
            <div key={`li-${i}`} className="flex gap-1.5 ml-2 my-0.5">
              <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
              <span className="text-sm"><strong className="text-foreground">{match[1]}</strong>{match[2] ? ` ${match[2]}` : ''}</span>
            </div>
          );
        } else {
          elements.push(<div key={`li-${i}`} className="flex gap-1.5 ml-2 my-0.5"><span className="text-emerald-500 mt-0.5 shrink-0">•</span><span className="text-sm">{line.slice(2)}</span></div>);
        }
      } else if (line.startsWith('- ')) {
        elements.push(<div key={`li-${i}`} className="flex gap-1.5 ml-2 my-0.5"><span className="text-emerald-500 mt-0.5 shrink-0">•</span><span className="text-sm">{line.slice(2)}</span></div>);
      } else if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^(\d+)\.\s(.+)/);
        if (match) {
          elements.push(
            <div key={`ol-${i}`} className="flex gap-1.5 ml-2 my-0.5">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm shrink-0">{match[1]}.</span>
              <span className="text-sm">{match[2]}</span>
            </div>
          );
        }
      } else if (line.trim() === '') {
        elements.push(<div key={`br-${i}`} className="h-1.5" />);
      } else {
        // Regular text with inline markdown
        const formatted = line
          .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>')
          .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-muted text-emerald-600 dark:text-emerald-400 text-[11px] font-mono">$1</code>');
        elements.push(<p key={`p-${i}`} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />);
      }
    }

    return elements;
  };

  // ---- Floating chatbot icon (when closed) ----
  if (!isTutorOpen) {
    return (
      <button
        onClick={() => setTutorOpen(true)}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Open AI Tutor"
      >
        <div className="relative">
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-pulse" />
          {/* Main button */}
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/30 transition-all duration-300 hover:scale-110 hover:shadow-emerald-500/50">
            <Animated3DTutorAvatar
              speaking={false}
              expression="neutral"
              size={46}
            />
          </div>
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
            <div className="whitespace-nowrap rounded-lg bg-popover px-3 py-1.5 text-xs font-medium text-popover-foreground shadow-lg border">
              Chat with Marq AI Tutor
            </div>
          </div>
        </div>
      </button>
    );
  }

  // ---- Open popup ----
  return (
    <div
      ref={popupRef}
      className={`fixed z-50 flex flex-col overflow-hidden bg-background shadow-2xl shadow-emerald-500/10 transition-all duration-200 ${
        isFullscreen ? 'inset-6 rounded-2xl border-2 border-emerald-500/30' : 'rounded-2xl border-2 border-emerald-500/30'
      }`}
      style={isFullscreen ? undefined : {
        width: currentSize.width,
        height: currentSize.height,
        right: position.x === 0 && position.y === 0 ? 24 : undefined,
        bottom: position.x === 0 && position.y === 0 ? 24 : undefined,
        left: position.x !== 0 || position.y !== 0 ? position.x : undefined,
        top: position.y !== 0 ? position.y : undefined,
        transform: isZooming ? 'scale(0.9)' : 'scale(1)',
        opacity: isZooming ? 0.7 : 1,
      }}
    >
      {/* ---- Draggable Header — green gradient ---- */}
      <div
        onMouseDown={handleDragStart}
        className="cursor-move select-none"
      >
        <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3">
          {/* Avatar */}
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/40 bg-emerald-700/30 overflow-hidden">
              <Animated3DTutorAvatar speaking={isTyping} expression={isTyping ? 'explaining' : 'neutral'} size={36} />
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-emerald-600 ${isTyping ? 'bg-green-400 animate-pulse' : 'bg-emerald-300'}`} />
          </div>
          {/* Name & title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white truncate">{defaultTutor.name}</h3>
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-300 shrink-0" />
            </div>
            <p className="text-[10px] text-emerald-100 truncate">{defaultTutor.title}</p>
            <p className="text-[9px] text-emerald-200/80 italic truncate">{defaultTutor.tagline}</p>
          </div>
          {/* Size & close controls */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => handleSizeChange('mini')}
              className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${popupSize === 'mini' ? 'bg-white/30' : 'hover:bg-white/20'}`}
              title="Small"
            >
              <Minimize2 className="h-3 w-3 text-white" />
            </button>
            <button
              onClick={() => handleSizeChange('medium')}
              className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${popupSize === 'medium' ? 'bg-white/30' : 'hover:bg-white/20'}`}
              title="Medium"
            >
              <Maximize2 className="h-3 w-3 text-white" />
            </button>
            <button
              onClick={() => handleSizeChange('large')}
              className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${popupSize === 'large' ? 'bg-white/30' : 'hover:bg-white/20'}`}
              title="Large"
            >
              <Maximize2 className="h-3.5 w-3.5 text-white" />
            </button>
            <button
              onClick={() => handleSizeChange('fullscreen')}
              className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${popupSize === 'fullscreen' ? 'bg-white/30' : 'hover:bg-white/20'}`}
              title="Fullscreen"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
            </button>
            <button
              onClick={handleMinimize}
              className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-white/20 transition-colors ml-0.5"
              title="Minimize"
            >
              <X className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-3 bg-emerald-700/20 px-4 py-1.5 border-b border-emerald-500/20">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className="text-[10px] text-amber-400">★</span>
            ))}
            <span className="text-[9px] text-muted-foreground ml-0.5">4.9</span>
          </div>
          <span className="text-[9px] text-amber-600 dark:text-amber-400 font-medium bg-amber-500/10 px-1.5 py-0.5 rounded">8+ years</span>
          <span className="text-[9px] text-muted-foreground">1,800+ sessions</span>
        </div>
      </div>

      {/* ---- Chat Messages Area ---- */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        data-nodrag
        style={{ maxHeight: isFullscreen ? undefined : currentSize.height - 160 }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="shrink-0 mt-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
                  <Animated3DTutorAvatar speaking={false} expression="neutral" size={26} />
                </div>
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-br-sm'
                  : 'bg-muted/80 text-foreground rounded-bl-sm border border-border/50'
              }`}
            >
              <div className={`${msg.role === 'user' ? 'text-sm' : ''}`}>
                {msg.role === 'user' ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  renderContent(msg.content)
                )}
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="shrink-0 mt-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <User className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2.5 justify-start">
            <div className="shrink-0 mt-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
                <Animated3DTutorAvatar speaking expression="explaining" size={26} />
              </div>
            </div>
            <div className="bg-muted/80 rounded-2xl rounded-bl-sm px-4 py-3 border border-border/50">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---- Quick suggestions (shown when only greeting) ---- */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2" data-nodrag>
          <div className="flex flex-wrap gap-1.5">
            {['What courses are available?', 'Help me with Python', 'Explain machine learning', 'Career advice'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setInput(suggestion);
                  setTimeout(() => {
                    const userMsg: LocalMessage = {
                      id: `u-${Date.now()}`,
                      role: 'user',
                      content: suggestion,
                      timestamp: Date.now(),
                    };
                    setMessages((prev) => [...prev, userMsg]);
                    setIsSending(true);
                    setIsTyping(true);

                    // Try API then fallback
                    (async () => {
                      try {
                        const history = [...messages, userMsg]
                          .filter((m) => m.id !== 'greeting')
                          .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
                        const res = await fetch('/api/tutor', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ messages: history }),
                        });
                        if (res.ok) {
                          const data = await res.json();
                          setIsTyping(false);
                          setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: data.content, timestamp: data.timestamp ?? Date.now() }]);
                          setIsSending(false);
                          return;
                        }
                      } catch { /* fall through */ }
                      const delay = 800 + Math.random() * 1200;
                      setTimeout(() => {
                        setIsTyping(false);
                        setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: generateSimulatedReply(suggestion), timestamp: Date.now() }]);
                        setIsSending(false);
                      }, delay);
                    })();
                    setInput('');
                  }, 50);
                }}
                className="rounded-full border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---- Input Area ---- */}
      <div className="border-t border-border/60 bg-background px-3 py-2.5" data-nodrag>
        <div className="flex items-center gap-2">
          {/* New chat button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewChat}
            className="h-8 w-8 p-0 shrink-0 text-muted-foreground hover:text-foreground"
            title="New chat"
          >
            <Plus className="h-4 w-4" />
          </Button>
          {/* Input field */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Marq AI anything..."
              rows={1}
              className="w-full resize-none rounded-xl border border-border/60 bg-muted/50 px-3.5 py-2 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
              style={{ maxHeight: 80 }}
            />
          </div>
          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="h-8 w-8 p-0 shrink-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 disabled:opacity-40"
            title="Send message"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-[9px] text-muted-foreground text-center mt-1">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
