'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  X, Maximize2, Minimize2, Send, Sparkles,
  CheckCircle2, MessageSquare, Plus,
  Bot, User, Loader2,
  Volume2, Pause, Play, Square, Mic, MicOff,
  ChevronLeft, ChevronRight, BookOpen, PenTool,
  ChevronDown, ChevronRight as ChevronRightIcon, Clock, ListChecks,
  Circle, Folder, FolderOpen, Eraser, Type, Trash2, Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Animated3DTutorAvatar } from './animated-tutor-avatar';
import { useAppStore } from '@/lib/store';
import { getTutorForCourse } from '@/lib/tutor-personas';
import { findCourse } from '@/lib/courses';
import type { ChatMessage, Course, Module, Lesson } from '@/lib/types';

// ============================================================
// GlobalTutorPopup — Global Marq AI Tutor popup for ALL pages
// ------------------------------------------------------------
// Renders a floating AI tutor popup that works on ALL pages,
// not just lesson-view. The navbar "Ask AI" button sets
// isTutorOpen=true in the store, and this component responds.
//
// Now includes:
//   - AI Tutor tab (chat + voice controls: play/pause/stop/voice chat)
//   - Syllabus tab (tree-view syllabus)
//   - Whiteboard tab
// ============================================================

type PopupSize = 'mini' | 'medium' | 'large' | 'fullscreen';
type TabType = 'tutor' | 'syllabus' | 'whiteboard';

interface LocalMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// Marq AI — male AI tutor for ALL pages
const defaultTutor = getTutorForCourse('ai-ml');

// Greeting message shown when the popup first opens
const GREETING: LocalMessage = {
  id: 'greeting',
  role: 'assistant',
  content: `Hi there! 👋 I'm **Marq AI**, your AI Tutor on MarqAI Courses.\n\nI can help you with:\n- 📚 **Course information** — details, pricing, and what each course covers\n- 🎓 **Learning paths** — which course is right for you\n- ❓ **Platform questions** — how MarqAI Courses works\n- 💡 **Career guidance** — which skills to learn for your goals\n- 🎙️ **Voice tutoring** — I can teach you with step-by-step voice explanations\n\nWhat would you like to know?`,
  timestamp: Date.now(),
};

// Simulated AI response generator — produces contextual replies
function generateSimulatedReply(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes('course') || lower.includes('learn') || lower.includes('study') || lower.includes('recommend')) {
    return `Great question! MarqAI Courses offers a range of comprehensive programs:\n\n1. **AI & Machine Learning** — Master neural networks, transformers, and LLMs\n2. **Full Stack Java** — From JVM internals to Spring Boot microservices\n3. **.NET & C#** — Build production-grade apps with ASP.NET Core\n4. **Mobile Development** — React Native & Expo for cross-platform apps\n5. **Flutter & Dart** — Pixel-perfect cross-platform UI\n6. **Python Programming** — From basics to async, web, and data science\n\nEach course features step-wise lessons, AI voice tutoring, video walkthroughs, and verified certificates. Which topic interests you most?`;
  }

  if (lower.includes('ai') || lower.includes('machine learning') || lower.includes('ml') || lower.includes('neural') || lower.includes('deep learning')) {
    return `AI and Machine Learning is a fascinating field! Here's a quick overview:\n\n**Machine Learning** is about teaching computers to learn from data without explicit programming.\n\n### Key areas:\n- **Supervised Learning** — labeled data (classification, regression)\n- **Unsupervised Learning** — unlabeled data (clustering, dimensionality reduction)\n- **Deep Learning** — neural networks with many layers\n- **NLP & Transformers** — the tech behind ChatGPT\n\n### Getting started:\n1. Learn Python and math fundamentals (linear algebra, statistics)\n2. Study classical ML algorithms (linear regression, decision trees)\n3. Move to deep learning with PyTorch\n4. Explore transformers and LLMs\n\nWould you like me to explain any of these in more detail? You can also enroll in our **AI & Machine Learning** course for a structured learning path!`;
  }

  if (lower.includes('python')) {
    return `Python is one of the most versatile and beginner-friendly languages! 🐍\n\n### Why Python?\n- **Easy to read** — clean, expressive syntax\n- **Huge ecosystem** — web (Django/Flask), data (pandas/NumPy), AI (PyTorch/TensorFlow)\n- **In demand** — #1 language on TIOBE index\n\n### Quick example:\n\`\`\`python\n# List comprehension\neven_squares = [x**2 for x in range(10) if x % 2 == 0]\nprint(even_squares)  # [0, 4, 16, 36, 64]\n\`\`\`\n\nOur **Python Programming** course covers everything from basics to async, web frameworks, and data science. Want to know more?`;
  }

  if (lower.includes('java') || lower.includes('spring')) {
    return `Java remains a powerhouse in enterprise development! ☕\n\n### Java Strengths:\n- **Platform independence** — write once, run anywhere (JVM)\n- **Strong typing** — catches errors at compile time\n- **Massive ecosystem** — Spring Boot, Maven, Gradle\n\n### Spring Boot quick start:\n\`\`\`java\n@RestController\n@RequestMapping("/api")\npublic class HelloController {\n    @GetMapping("/hello")\n    public Map<String, String> hello() {\n        return Map.of("message", "Hello, World!");\n    }\n}\n\`\`\`\n\nCheck out our **Full Stack Java** course for a complete journey from JVM basics to microservices!`;
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('help')) {
    return `Hello! 😊 I'm Marq AI, here to help you on your learning journey.\n\nYou can ask me about:\n- 📖 Any **concept** in our courses (AI, Java, .NET, Python, Mobile, Flutter)\n- 💻 **Code** — I can write, explain, or debug code\n- 🗺️ **Career advice** — which skills to learn, learning paths\n- 📝 **Course guidance** — which course is right for you\n- 🎙️ **Voice tutoring** — switch to the AI Tutor tab to hear me teach!\n\nJust type your question and I'll do my best to help!`;
  }

  return `That's a great question! Let me think about that...\n\nAs Marq AI on MarqAI Courses, I can help with:\n\n- **Concepts** — I'll explain things step by step\n- **Code** — I can write, review, and debug code snippets\n- **Comparisons** — React vs Vue, Python vs Java, etc.\n- **Learning paths** — I'll suggest the best order to learn topics\n\nFeel free to ask me anything about software engineering, and I'll provide a detailed, helpful answer. You can also explore our courses for structured, hands-on learning!\n\n*Tip: Try asking about specific topics like "explain neural networks" or "help me with Python".*`;
}

// ============================================================
// HalfCircle progress icon — SVG half-filled circle
// ============================================================
function HalfCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" className="text-muted-foreground/30" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2 A10 10 0 0 1 12 22 Z" className="text-amber-500" fill="currentColor" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// ============================================================
// SyllabusTree — Tree-style syllabus with progress indicators
// ============================================================
function SyllabusTree({ courseId, course }: { courseId: string; course: Course }) {
  const courseProgress = useAppStore((s) => s.courseProgress);

  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    if (course.modules.length > 0) {
      return new Set([course.modules[0].id]);
    }
    return new Set();
  });

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  const getLessonProgress = (lessonId: string): number => {
    return courseProgress[courseId]?.[lessonId] ?? 0;
  };

  const getLessonStatus = (lessonId: string): 'completed' | 'in_progress' | 'not_started' => {
    const pct = getLessonProgress(lessonId);
    if (pct >= 100) return 'completed';
    if (pct > 0) return 'in_progress';
    return 'not_started';
  };

  const getModuleProgress = (mod: Module): number => {
    if (mod.lessons.length === 0) return 0;
    const totalPct = mod.lessons.reduce((sum, l) => sum + getLessonProgress(l.id), 0);
    return Math.round(totalPct / mod.lessons.length);
  };

  const getCourseProgress = (): number => {
    if (totalLessons === 0) return 0;
    const allLessons = course.modules.flatMap(m => m.lessons);
    const totalPct = allLessons.reduce((sum, l) => sum + getLessonProgress(l.id), 0);
    return Math.round(totalPct / allLessons.length);
  };

  const getModuleCompletedCount = (mod: Module): number => {
    return mod.lessons.filter(l => getLessonStatus(l.id) === 'completed').length;
  };

  const coursePct = getCourseProgress();

  return (
    <div className="space-y-1.5 overflow-hidden" style={{ maxWidth: '100%' }}>
      <div className="space-y-0.5 overflow-hidden">
        <h4 className="text-[11px] font-bold truncate max-w-full">{course.title}</h4>
        <div className="flex items-center gap-1 text-[8px] text-muted-foreground flex-wrap">
          <span className="flex items-center gap-0.5"><BookOpen className="h-2 w-2" /> {course.modules.length} modules</span>
          <span>·</span>
          <span className="flex items-center gap-0.5"><ListChecks className="h-2 w-2" /> {totalLessons} lessons</span>
          <span>·</span>
          <span className="flex items-center gap-0.5"><Clock className="h-2 w-2" /> {course.duration}</span>
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-300">{coursePct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500" style={{ width: `${coursePct}%` }} />
          </div>
        </div>
      </div>

      <div className="space-y-0 overflow-hidden">
        {course.modules.map((mod, modIdx) => {
          const isExpanded = expandedModules.has(mod.id);
          const modPct = getModuleProgress(mod);
          const completedCount = getModuleCompletedCount(mod);
          const isLastModule = modIdx === course.modules.length - 1;

          return (
            <div key={mod.id} className="overflow-hidden">
              <div className="flex items-start">
                <div className="relative w-4 shrink-0 flex flex-col items-center">
                  {modIdx > 0 && <div className="absolute top-0 h-2 w-px bg-emerald-300 dark:bg-emerald-700" />}
                  <div className="absolute top-3 h-px w-2 bg-emerald-300 dark:bg-emerald-700 left-1/2" />
                  {isExpanded && <div className="absolute top-3.5 bottom-0 w-px bg-emerald-200 dark:bg-emerald-800" />}
                </div>
                <div className="flex-1 min-w-0 pb-0.5">
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="flex w-full items-center gap-1 rounded-md px-1 py-1 text-left transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950/30 group"
                  >
                    {isExpanded ? <FolderOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" /> : <Folder className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                    {isExpanded ? <ChevronDown className="h-2.5 w-2.5 text-emerald-600 shrink-0" /> : <ChevronRightIcon className="h-2.5 w-2.5 text-muted-foreground shrink-0" />}
                    <span className="flex-1 text-[11px] font-semibold truncate">{mod.title}</span>
                    <Badge variant="outline" className={`text-[8px] shrink-0 px-1 py-0 ${completedCount === mod.lessons.length && mod.lessons.length > 0 ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                      {completedCount}/{mod.lessons.length}
                    </Badge>
                  </button>
                  <div className="ml-5 mr-1 mb-0.5 space-y-0">
                    <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500" style={{ width: `${modPct}%` }} />
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="ml-3 mt-0.5 space-y-0">
                      {mod.lessons.map((lesson, lessonIdx) => {
                        const status = getLessonStatus(lesson.id);
                        const progressPct = getLessonProgress(lesson.id);
                        const isLastLesson = lessonIdx === mod.lessons.length - 1;
                        return (
                          <div key={lesson.id} className="flex items-start">
                            <div className="relative w-3 shrink-0 flex flex-col items-center">
                              <div className={`w-px bg-emerald-200 dark:bg-emerald-800 ${isLastLesson ? 'h-2.5' : 'h-full'}`} />
                              <div className="absolute top-2 h-px w-1.5 bg-emerald-200 dark:bg-emerald-800 left-1/2" />
                            </div>
                            <button
                              className="flex items-center gap-1 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer w-full min-h-[24px] overflow-hidden"
                              onClick={() => {
                                useAppStore.getState().openLesson(courseId, mod.id, lesson.id);
                              }}
                            >
                              {status === 'completed' ? <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" /> : status === 'in_progress' ? <HalfCircleIcon className="h-3 w-3 text-amber-500 shrink-0" /> : <Circle className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
                              <span className={`flex-1 text-[9px] truncate min-w-0 ${status === 'completed' ? 'text-emerald-700 dark:text-emerald-300 font-medium' : status === 'in_progress' ? 'text-amber-700 dark:text-amber-300 font-medium' : 'text-muted-foreground'}`}>
                                {lesson.title}
                              </span>
                              {status === 'in_progress' ? <span className="text-[8px] text-amber-600 dark:text-amber-400 tabular-nums shrink-0">{progressPct}%</span> : <span className="text-[8px] text-muted-foreground shrink-0">{lesson.duration}</span>}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              {!isLastModule && !isExpanded && <div className="ml-2 w-px h-1.5 bg-emerald-200 dark:bg-emerald-800" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function GlobalTutorPopup() {
  const isTutorOpen = useAppStore((s) => s.isTutorOpen);
  const setTutorOpen = useAppStore((s) => s.setTutorOpen);
  const view = useAppStore((s) => s.view);

  // Don't render GlobalTutorPopup on lesson view — FloatingTutorPopup handles it
  const isLessonView = view.name === 'lesson';

  const [popupSize, setPopupSize] = useState<PopupSize>('medium');
  const [activeTab, setActiveTab] = useState<TabType>('tutor');
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [messages, setMessages] = useState<LocalMessage[]>([GREETING]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Voice state (local for global popup)
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [voicePaused, setVoicePaused] = useState(false);
  const [isVoiceChatting, setIsVoiceChatting] = useState(false);

  // Try to find the current course for syllabus tab
  const currentCourseId = view.name === 'course' ? (view as { courseId?: string }).courseId : view.name === 'lesson' ? (view as { courseId?: string }).courseId : undefined;
  const currentCourse = currentCourseId ? findCourse(currentCourseId) : null;
  const tutor = currentCourseId ? getTutorForCourse(currentCourseId) : defaultTutor;

  const popupRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Size configurations
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
    if ((e.target as HTMLElement).closest('button, input, textarea, select, [data-nodrag]')) return;
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

  const handleClose = () => setTutorOpen(false);
  const handleMinimize = () => setTutorOpen(false);

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
    } catch {
      // Fall through to simulated response
    }

    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      const reply = generateSimulatedReply(trimmed);
      setIsTyping(false);
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: reply, timestamp: Date.now() }]);
      setIsSending(false);
    }, delay);
  }, [input, isSending, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Voice controls (local)
  const handlePlayVoice = () => {
    setIsSpeaking(true);
    setVoicePlaying(true);
    setVoicePaused(false);
    // Simulate speaking for a few seconds
    setTimeout(() => {
      setIsSpeaking(false);
      setVoicePlaying(false);
    }, 5000);
  };

  const handlePauseResume = () => {
    if (voicePaused) {
      setIsSpeaking(true);
      setVoicePaused(false);
    } else {
      setIsSpeaking(false);
      setVoicePaused(true);
    }
  };

  const handleStop = () => {
    setIsSpeaking(false);
    setVoicePlaying(false);
    setVoicePaused(false);
  };

  const handleVoiceChat = () => {
    if (isVoiceChatting) {
      setIsVoiceChatting(false);
      setIsSpeaking(false);
    } else {
      setIsVoiceChatting(true);
      setIsSpeaking(true);
    }
  };

  // Render message content with basic markdown support
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let codeKey = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(<pre key={`code-${codeKey++}`} className="my-1.5 overflow-x-auto rounded-md bg-zinc-900 dark:bg-zinc-800 p-2.5 text-[11px] text-emerald-300 font-mono leading-relaxed"><code>{codeBuffer.join('\n')}</code></pre>);
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        continue;
      }
      if (inCodeBlock) { codeBuffer.push(line); continue; }
      if (line.startsWith('### ')) { elements.push(<h4 key={`h-${i}`} className="font-bold text-sm mt-2 mb-0.5 text-foreground">{line.slice(4)}</h4>); }
      else if (line.startsWith('## ')) { elements.push(<h3 key={`h-${i}`} className="font-bold text-sm mt-2 mb-0.5 text-foreground">{line.slice(3)}</h3>); }
      else if (line.startsWith('- **')) {
        const match = line.match(/^- \*\*(.+?)\*\*\s*[-—]?\s*(.*)/);
        if (match) { elements.push(<div key={`li-${i}`} className="flex gap-1.5 ml-2 my-0.5"><span className="text-emerald-500 mt-0.5 shrink-0">•</span><span className="text-sm"><strong className="text-foreground">{match[1]}</strong>{match[2] ? ` ${match[2]}` : ''}</span></div>); }
        else { elements.push(<div key={`li-${i}`} className="flex gap-1.5 ml-2 my-0.5"><span className="text-emerald-500 mt-0.5 shrink-0">•</span><span className="text-sm">{line.slice(2)}</span></div>); }
      } else if (line.startsWith('- ')) { elements.push(<div key={`li-${i}`} className="flex gap-1.5 ml-2 my-0.5"><span className="text-emerald-500 mt-0.5 shrink-0">•</span><span className="text-sm">{line.slice(2)}</span></div>); }
      else if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^(\d+)\.\s(.+)/);
        if (match) { elements.push(<div key={`ol-${i}`} className="flex gap-1.5 ml-2 my-0.5"><span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm shrink-0">{match[1]}.</span><span className="text-sm">{match[2]}</span></div>); }
      } else if (line.trim() === '') { elements.push(<div key={`br-${i}`} className="h-1.5" />); }
      else {
        const formatted = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>').replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-muted text-emerald-600 dark:text-emerald-400 text-[11px] font-mono">$1</code>');
        elements.push(<p key={`p-${i}`} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />);
      }
    }
    return elements;
  };

  // Don't render on lesson view — FloatingTutorPopup handles it there
  if (isLessonView) return null;

  // ---- Floating chatbot icon (when closed) ----
  if (!isTutorOpen) {
    return (
      <button
        onClick={() => setTutorOpen(true)}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Open Marq AI Tutor"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-pulse" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/30 transition-all duration-300 hover:scale-110 hover:shadow-emerald-500/50">
            <Animated3DTutorAvatar
              speaking={false}
              expression="neutral"
              size={46}
            />
          </div>
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
            <div className="whitespace-nowrap rounded-lg bg-popover px-3 py-1.5 text-xs font-medium text-popover-foreground shadow-lg border">
              Chat with Marq AI
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
      <div onMouseDown={handleDragStart} className="cursor-move select-none">
        <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/40 bg-emerald-700/30 overflow-hidden">
              <Animated3DTutorAvatar speaking={isSpeaking || isTyping} expression={isSpeaking ? 'explaining' : isTyping ? 'explaining' : 'neutral'} size={36} />
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-emerald-600 ${(isSpeaking || isTyping) ? 'bg-green-400 animate-pulse' : 'bg-emerald-300'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white truncate">{tutor.name}</h3>
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-300 shrink-0" />
            </div>
            <p className="text-[10px] text-emerald-100 truncate">{tutor.title}</p>
            <p className="text-[9px] text-emerald-200/80 italic truncate">{tutor.tagline}</p>
          </div>
          <div className="flex items-center gap-0.5">
            <button onClick={() => handleSizeChange('mini')} className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${popupSize === 'mini' ? 'bg-white/30' : 'hover:bg-white/20'}`} title="Small"><Minimize2 className="h-3 w-3 text-white" /></button>
            <button onClick={() => handleSizeChange('medium')} className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${popupSize === 'medium' ? 'bg-white/30' : 'hover:bg-white/20'}`} title="Medium"><Maximize2 className="h-3 w-3 text-white" /></button>
            <button onClick={() => handleSizeChange('large')} className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${popupSize === 'large' ? 'bg-white/30' : 'hover:bg-white/20'}`} title="Large"><Maximize2 className="h-3.5 w-3.5 text-white" /></button>
            <button onClick={() => handleSizeChange('fullscreen')} className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${popupSize === 'fullscreen' ? 'bg-white/30' : 'hover:bg-white/20'}`} title="Fullscreen">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
            </button>
            <button onClick={handleMinimize} className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-white/20 transition-colors ml-0.5" title="Minimize"><X className="h-3.5 w-3.5 text-white" /></button>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-emerald-700/20 px-4 py-1.5 border-b border-emerald-500/20">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (<span key={i} className="text-[10px] text-amber-400">★</span>))}
            <span className="text-[9px] text-muted-foreground ml-0.5">4.9</span>
          </div>
          <span className="text-[9px] text-amber-600 dark:text-amber-400 font-medium bg-amber-500/10 px-1.5 py-0.5 rounded">8+ years</span>
          <span className="text-[9px] text-muted-foreground">1,800+ sessions</span>
        </div>
      </div>

      {/* Tab Bar — 3 tabs: AI Tutor, Syllabus, Whiteboard */}
      <div className="flex border-b" data-nodrag>
        <button
          onClick={() => setActiveTab('tutor')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'tutor' ? 'border-b-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" /> AI Tutor
        </button>
        <button
          onClick={() => setActiveTab('syllabus')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'syllabus' ? 'border-b-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" /> Syllabus
        </button>
        <button
          onClick={() => setActiveTab('whiteboard')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'whiteboard' ? 'border-b-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <PenTool className="h-3.5 w-3.5" /> Whiteboard
        </button>
      </div>

      {/* ---- Content Area ---- */}
      {activeTab === 'tutor' ? (
        <div className="flex-1 overflow-hidden flex flex-col" data-nodrag>
          {/* Avatar + Voice Controls Section */}
          <div className="p-4 space-y-3 border-b">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <Animated3DTutorAvatar
                  speaking={isSpeaking || isTyping}
                  expression={isSpeaking ? 'explaining' : isTyping ? 'explaining' : 'neutral'}
                  size={currentSize.avatarSize}
                />
                {/* Voice chat button overlaid */}
                <button
                  onClick={handleVoiceChat}
                  className={`absolute -bottom-1 -right-1 z-20 flex h-8 w-8 items-center justify-center rounded-full shadow-lg transition-all ${
                    isVoiceChatting ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'
                  }`}
                  title={isVoiceChatting ? 'Stop voice chat' : 'Start voice chat'}
                >
                  {isVoiceChatting ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                </button>
                {isVoiceChatting && <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full border-2 border-emerald-400 animate-pulse" />}
              </div>
              {/* Status badges */}
              <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
                {isVoiceChatting && <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 animate-pulse text-[10px]"><Mic className="mr-1 h-3 w-3" /> Listening...</Badge>}
                {voicePlaying && !voicePaused && !isVoiceChatting && <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 animate-pulse text-[10px]"><Volume2 className="mr-1 h-3 w-3" /> Speaking...</Badge>}
                {voicePaused && <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px]"><Pause className="mr-1 h-3 w-3" /> Paused</Badge>}
                {!voicePlaying && !isVoiceChatting && <Badge variant="outline" className="text-muted-foreground text-[10px]">Ready</Badge>}
              </div>
            </div>

            {/* Voice Controls */}
            <Card className="overflow-hidden">
              <CardContent className="p-3 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Voice Controls</p>
                <div className="flex items-center gap-1.5">
                  {!voicePlaying ? (
                    <Button className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 h-8 text-xs" onClick={handlePlayVoice}>
                      <Play className="mr-1 h-3.5 w-3.5" /> Play Voice
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={handlePauseResume} className="flex-1 h-8 text-xs">
                        {voicePaused ? <><Play className="mr-1 h-3.5 w-3.5" /> Resume</> : <><Pause className="mr-1 h-3.5 w-3.5" /> Pause</>}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={handleStop} className="flex-1 h-8 text-xs">
                        <Square className="mr-1 h-3.5 w-3.5" /> Stop
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Messages Area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="shrink-0 mt-1">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
                      <Animated3DTutorAvatar speaking={false} expression="neutral" size={26} />
                    </div>
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                  msg.role === 'user' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-br-sm' : 'bg-muted/80 text-foreground rounded-bl-sm border border-border/50'
                }`}>
                  <div className={`${msg.role === 'user' ? 'text-sm' : ''}`}>
                    {msg.role === 'user' ? <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p> : renderContent(msg.content)}
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

          {/* Quick suggestions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2" data-nodrag>
              <div className="flex flex-wrap gap-1.5">
                {['What courses are available?', 'Help me with Python', 'Explain machine learning', 'Career advice'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      setTimeout(() => {
                        const userMsg: LocalMessage = { id: `u-${Date.now()}`, role: 'user', content: suggestion, timestamp: Date.now() };
                        setMessages((prev) => [...prev, userMsg]);
                        setIsSending(true);
                        setIsTyping(true);
                        (async () => {
                          try {
                            const history = [...messages, userMsg].filter((m) => m.id !== 'greeting').map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
                            const res = await fetch('/api/tutor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }) });
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

          {/* Input Area */}
          <div className="border-t border-border/60 bg-background px-3 py-2.5" data-nodrag>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleNewChat} className="h-8 w-8 p-0 shrink-0 text-muted-foreground hover:text-foreground" title="New chat"><Plus className="h-4 w-4" /></Button>
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Marq AI..."
                  rows={1}
                  className="w-full resize-none rounded-xl border border-border/60 bg-muted/50 px-3.5 py-2 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                  style={{ maxHeight: 80 }}
                />
              </div>
              <Button onClick={handleSend} disabled={!input.trim() || isSending} className="h-8 w-8 p-0 shrink-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 disabled:opacity-40" title="Send message">
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-[9px] text-muted-foreground text-center mt-1">Press Enter to send • Shift+Enter for new line</p>
          </div>
        </div>
      ) : activeTab === 'syllabus' ? (
        /* Syllabus Tab — Tree View */
        <div className="flex-1 overflow-y-auto overflow-x-hidden" data-nodrag>
          <div className="p-2 overflow-hidden">
            {currentCourse ? (
              <SyllabusTree courseId={currentCourseId!} course={currentCourse} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">No course selected</p>
                <p className="text-xs mt-1">Open a course to see its syllabus here.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Whiteboard Tab */
        <div className="p-3 flex flex-col gap-2 flex-1" data-nodrag>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" title="Pen tool"><PenTool className="h-3 w-3" /> Pen</Button>
            <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" title="Eraser"><Eraser className="h-3 w-3" /> Eraser</Button>
            <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" title="Text"><Type className="h-3 w-3" /> Text</Button>
            <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" title="Clear board"><Trash2 className="h-3 w-3" /> Clear</Button>
            <Button size="sm" className="h-7 text-[10px] gap-1 bg-emerald-600 text-white hover:bg-emerald-700 ml-auto" title="Ask AI to Explain" onClick={() => alert('Coming soon - AI will draw and explain on the board!')}>
              <Wand2 className="h-3 w-3" /> Ask AI to Explain
            </Button>
          </div>
          <div className="relative flex-1 rounded-lg border overflow-hidden bg-white" style={{ minHeight: 320 }}>
            <iframe src="https://woowhiteboard.com/online-whiteboard-for-teaching" className="w-full h-full border-0" style={{ minHeight: 320 }} title="Whiteboard" allow="clipboard-read; clipboard-write" />
          </div>
          <p className="text-[10px] text-muted-foreground text-center italic">Marq AI can explain concepts on this board. Use the tools to write or draw.</p>
        </div>
      )}
    </div>
  );
}
