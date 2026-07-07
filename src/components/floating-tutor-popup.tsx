'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  X, Maximize2, Minimize2, Volume2, VolumeX, Pause, Play,
  Square, ChevronLeft, ChevronRight, Mic, MicOff,
  Loader2, CheckCircle2, Sparkles, BookOpen, ChevronDown,
  ChevronRight as ChevronRightIcon, Clock, ListChecks, PlayCircle,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Animated3DTutorAvatar } from './animated-tutor-avatar';
import { useAppStore } from '@/lib/store';
import type { TutorPersona } from '@/lib/tutor-personas';
import type { Course, Module, Lesson } from '@/lib/types';

// ============================================================
// FloatingTutorPopup — Draggable, zoomable AI tutor chatbot
// ------------------------------------------------------------
// A floating popup that shows the animated 3D tutor avatar with
// voice controls, syllabus navigation, and chat. Can be:
//   - Minimized to a floating icon (bottom-right)
//   - Expanded to a full popup panel
//   - Zoomed in/out (small, medium, large)
//   - Dragged around the screen
// ============================================================

type PopupSize = 'mini' | 'medium' | 'large';

interface FloatingTutorPopupProps {
  tutor: TutorPersona;
  courseId: string;
  course: Course;
  // Voice state
  isSpeaking: boolean;
  voiceMode: boolean;
  voicePlaying: boolean;
  voicePaused: boolean;
  voicePhase: string;
  voiceProgress: number;
  voiceLoading: boolean;
  voiceError: string | null;
  getPreferredLang: () => string;
  // Voice handlers
  onPlay: () => void;
  onPauseResume: () => void;
  onStop: () => void;
  onLangChange: (lang: string) => void;
  onSpeedChange: (speed: number) => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  currentSlide: number;
  totalSlides: number;
  slideProgress: number;
  // Voice chat
  isVoiceChatting?: boolean;
  onStartVoiceChat?: () => void;
  onStopVoiceChat?: () => void;
  tutorExpression?: 'neutral' | 'explaining' | 'thinking' | 'happy' | 'curious';
  // Continue prompt
  showContinuePrompt?: boolean;
  onContinueClass?: () => void;
  onStayInChat?: () => void;
}

export function FloatingTutorPopup({
  tutor,
  courseId,
  course,
  isSpeaking,
  voiceMode,
  voicePlaying,
  voicePaused,
  voicePhase,
  voiceProgress,
  voiceLoading,
  voiceError,
  getPreferredLang,
  onPlay,
  onPauseResume,
  onStop,
  onLangChange,
  onSpeedChange,
  onPrevSlide,
  onNextSlide,
  currentSlide,
  totalSlides,
  slideProgress,
  isVoiceChatting,
  onStartVoiceChat,
  onStopVoiceChat,
  tutorExpression,
  showContinuePrompt,
  onContinueClass,
  onStayInChat,
}: FloatingTutorPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [popupSize, setPopupSize] = useState<PopupSize>('medium');
  const [activeTab, setActiveTab] = useState<'tutor' | 'syllabus'>('tutor');
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  // Derive expression
  const expression = tutorExpression ?? (
    isVoiceChatting ? 'curious' :
    isSpeaking ? 'explaining' :
    voicePhase === 'awaiting_answer' ? 'curious' :
    voicePhase === 'done' ? 'happy' :
    'neutral'
  );

  // Size configurations
  const sizeConfig = {
    mini: { width: 380, height: 480, avatarSize: 80 },
    medium: { width: 440, height: 580, avatarSize: 100 },
    large: { width: 520, height: 700, avatarSize: 130 },
  };

  const currentSize = sizeConfig[popupSize];

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
    if ((e.target as HTMLElement).closest('button, input, select, [data-nodrag]')) return;
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

  // If not open, show the floating chatbot icon
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Open AI Tutor"
      >
        <div className="relative">
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-voice-pulse" />
          {/* Main button */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/30 animate-tutor-icon-pulse transition-all duration-300 hover:scale-110 hover:shadow-emerald-500/50">
            <Animated3DTutorAvatar
              speaking={isSpeaking}
              expression={expression}
              size={52}
            />
          </div>
          {/* Status indicator */}
          {isSpeaking && (
            <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-background">
              <Volume2 className="h-3 w-3 text-white" />
            </div>
          )}
          {isVoiceChatting && (
            <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 ring-2 ring-background animate-pulse">
              <Mic className="h-3 w-3 text-white" />
            </div>
          )}
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
            <div className="whitespace-nowrap rounded-lg bg-popover px-3 py-1.5 text-xs font-medium text-popover-foreground shadow-lg border">
              {isSpeaking ? 'AI Tutor is speaking...' : 'Click to open AI Tutor'}
            </div>
          </div>
        </div>
      </button>
    );
  }

  // Popup is open
  return (
    <div
      ref={popupRef}
      className="fixed z-50 flex flex-col overflow-hidden rounded-2xl border-2 border-emerald-500/30 bg-background shadow-2xl shadow-emerald-500/10 animate-popup-enter transition-all duration-200"
      style={{
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
      {/* Draggable Header — matching MARQ AI reference design */}
      <div
        onMouseDown={handleDragStart}
        className="cursor-move select-none"
      >
        {/* Green gradient header bar */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3">
          <div className="relative">
            {/* Circular avatar with white border */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/40 bg-emerald-700/30 overflow-hidden">
              <Animated3DTutorAvatar speaking={isSpeaking} expression={expression} size={36} />
            </div>
            {/* Online/speaking indicator dot */}
            <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-emerald-600 ${isSpeaking ? 'bg-green-400 animate-pulse' : 'bg-emerald-300'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white truncate">{tutor.name}</h3>
              {/* Verified badge */}
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-300 shrink-0" />
            </div>
            <p className="text-[10px] text-emerald-100 truncate">{tutor.title}</p>
            <p className="text-[9px] text-emerald-200/80 italic truncate">{tutor.tagline}</p>
          </div>
          {/* Zoom & close controls */}
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
              onClick={() => setIsOpen(false)}
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
            {[1,2,3,4,5].map(i => (
              <span key={i} className={`text-[10px] ${i <= Math.round(tutor.rating) ? 'text-amber-400' : 'text-zinc-400'}`}>★</span>
            ))}
            <span className="text-[9px] text-muted-foreground ml-0.5">{tutor.rating}</span>
          </div>
          <span className="text-[9px] text-amber-600 dark:text-amber-400 font-medium bg-amber-500/10 px-1.5 py-0.5 rounded">8+ years</span>
          <span className="text-[9px] text-muted-foreground">1,800+ sessions</span>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b" data-nodrag>
        <button
          onClick={() => setActiveTab('tutor')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'tutor'
              ? 'border-b-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" /> AI Tutor
        </button>
        <button
          onClick={() => setActiveTab('syllabus')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'syllabus'
              ? 'border-b-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" /> Syllabus
        </button>
      </div>

      {/* Content Area */}
      <ScrollArea className="flex-1 overflow-y-auto">
        {activeTab === 'tutor' ? (
          <div className="p-4 space-y-4" data-nodrag>
            {/* Animated Avatar */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <Animated3DTutorAvatar
                  speaking={isSpeaking}
                  expression={expression}
                  size={currentSize.avatarSize}
                />
                {/* Voice chat button overlaid */}
                {onStartVoiceChat && (
                  <button
                    onClick={isVoiceChatting ? onStopVoiceChat : onStartVoiceChat}
                    className={`absolute -bottom-1 -right-1 z-20 flex h-8 w-8 items-center justify-center rounded-full shadow-lg transition-all ${
                      isVoiceChatting
                        ? 'bg-rose-500 text-white hover:bg-rose-600'
                        : 'bg-emerald-500 text-white hover:bg-emerald-600'
                    }`}
                    title={isVoiceChatting ? 'Stop voice chat' : 'Start voice chat'}
                  >
                    {isVoiceChatting ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                  </button>
                )}
                {/* Voice chat pulse ring */}
                {isVoiceChatting && (
                  <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full border-2 border-emerald-400 animate-voice-pulse" />
                )}
              </div>
              {/* Status badges */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                {isVoiceChatting && (
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 animate-pulse text-[10px]">
                    <Mic className="mr-1 h-3 w-3" /> Listening...
                  </Badge>
                )}
                {voiceMode && voicePlaying && !voicePaused && !isVoiceChatting && (
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 animate-pulse text-[10px]">
                    <Volume2 className="mr-1 h-3 w-3" /> Speaking...
                  </Badge>
                )}
                {voiceMode && voicePaused && (
                  <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px]">
                    <Pause className="mr-1 h-3 w-3" /> Paused
                  </Badge>
                )}
                {voiceMode && voicePhase === 'done' && !voicePlaying && (
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px]">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Done
                  </Badge>
                )}
                {!voiceMode && !voiceLoading && !isVoiceChatting && (
                  <Badge variant="outline" className="text-muted-foreground text-[10px]">Ready</Badge>
                )}
                {voiceLoading && (
                  <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 text-[10px]">
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Loading...
                  </Badge>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {voiceMode && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="capitalize">{voicePhase === 'awaiting_answer' ? 'Waiting' : voicePhase}</span>
                  <span>{Math.round(voiceProgress)}%</span>
                </div>
                <Progress value={voiceProgress} className="h-1.5" />
              </div>
            )}

            {voiceError && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 text-center">{voiceError}</p>
            )}

            {/* Voice Controls */}
            <Card className="overflow-hidden">
              <CardContent className="p-3 space-y-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Voice Controls</p>

                {/* Language selector */}
                <div className="space-y-0.5">
                  <label className="text-[10px] font-medium text-muted-foreground">Language</label>
                  <select
                    value={getPreferredLang()}
                    onChange={(e) => onLangChange(e.target.value)}
                    className="w-full rounded-md border bg-background px-2 py-1.5 text-xs cursor-pointer"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="te">తెలుగు (Telugu)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                    <option value="kn">ಕನ್ನಡ (Kannada)</option>
                  </select>
                </div>

                {/* Speed slider */}
                <div className="space-y-0.5">
                  <label className="text-[10px] font-medium text-muted-foreground">Speed</label>
                  <input
                    type="range" min="0.5" max="1.5" step="0.1" defaultValue="0.9"
                    onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                    className="w-full h-1 cursor-pointer"
                  />
                </div>

                {/* Play / Pause / Stop */}
                <div className="flex items-center gap-1.5">
                  {!voiceMode ? (
                    <Button className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 h-8 text-xs" onClick={onPlay} disabled={voiceLoading}>
                      <Play className="mr-1 h-3.5 w-3.5" /> Play Voice
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={onPauseResume} className="flex-1 h-8 text-xs">
                        {voicePaused ? <><Play className="mr-1 h-3.5 w-3.5" /> Resume</> : <><Pause className="mr-1 h-3.5 w-3.5" /> Pause</>}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={onStop} className="flex-1 h-8 text-xs">
                        <Square className="mr-1 h-3.5 w-3.5" /> Stop
                      </Button>
                    </>
                  )}
                </div>

                {/* Slide navigation */}
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="sm" onClick={onPrevSlide} disabled={currentSlide === 0} className="flex-1 h-8 text-xs">
                    <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Prev
                  </Button>
                  <span className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">
                    {currentSlide + 1}/{totalSlides}
                  </span>
                  <Button variant="outline" size="sm" onClick={onNextSlide} className="flex-1 h-8 text-xs">
                    Next <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <Progress value={slideProgress} className="flex-1 h-1" />
                  <span className="text-[9px] text-muted-foreground tabular-nums">{slideProgress}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Continue prompt */}
            {showContinuePrompt && onContinueClass && (
              <Card className="border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30">
                <CardContent className="p-3 space-y-2">
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Shall we continue the class?</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={onContinueClass} className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 h-8 text-xs">
                      <Play className="mr-1 h-3.5 w-3.5" /> Yes, continue
                    </Button>
                    {onStayInChat && (
                      <Button size="sm" variant="outline" onClick={onStayInChat} className="flex-1 h-8 text-xs">
                        <MessageSquare className="mr-1 h-3.5 w-3.5" /> Stay in chat
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Syllabus Tab */
          <div className="p-3" data-nodrag>
            <SyllabusMini courseId={courseId} course={course} />
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// ============================================================
// SyllabusMini — Compact syllabus tree for the popup
// ============================================================

function SyllabusMini({ courseId, course }: { courseId: string; course: Course }) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  // Auto-expand first module
  useEffect(() => {
    if (course.modules.length > 0) {
      setExpandedModules(new Set([course.modules[0].id]));
    }
  }, [course.modules]);

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalDuration = course.duration;

  return (
    <div className="space-y-3">
      {/* Course info header */}
      <div className="space-y-1">
        <h4 className="text-sm font-bold">{course.title}</h4>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5"><BookOpen className="h-3 w-3" /> {course.modules.length} modules</span>
          <span>·</span>
          <span className="flex items-center gap-0.5"><ListChecks className="h-3 w-3" /> {totalLessons} lessons</span>
          <span>·</span>
          <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {totalDuration}</span>
        </div>
      </div>

      {/* Modules & Lessons tree */}
      <div className="space-y-1">
        {course.modules.map((mod) => {
          const isExpanded = expandedModules.has(mod.id);
          return (
            <div key={mod.id} className="rounded-lg border bg-card">
              {/* Module header */}
              <button
                onClick={() => toggleModule(mod.id)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-muted/50"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                )}
                <span className="flex-1 text-xs font-semibold truncate">{mod.title}</span>
                <Badge variant="outline" className="text-[9px] shrink-0">{mod.lessons.length}</Badge>
              </button>
              {/* Lessons list */}
              {isExpanded && (
                <div className="border-t px-3 py-1.5 space-y-0.5">
                  {mod.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
                      onClick={() => {
                        useAppStore.getState().openLesson(courseId, mod.id, lesson.id);
                      }}
                    >
                      <PlayCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="flex-1 truncate">{lesson.title}</span>
                      <span className="text-[9px] text-muted-foreground shrink-0">{lesson.duration}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


