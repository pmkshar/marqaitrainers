'use client';

import { useEffect, useRef, useState } from 'react';
import {
  X, Maximize2, Minimize2, Volume2, VolumeX, Pause, Play,
  Square, ChevronLeft, ChevronRight, Mic, MicOff,
  Loader2, CheckCircle2, Sparkles, BookOpen, ChevronDown,
  ChevronRight as ChevronRightIcon, Clock, ListChecks, PlayCircle,
  MessageSquare, PenTool, Circle, Folder, FolderOpen, Eraser,
  Type, Trash2, Wand2, Phone, PhoneOff, Send,
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
// Three tabs:
//   1. AI Tutor   — avatar + voice controls (play/pause/stop)
//   2. Voice Chat — dedicated voice chat with "hold class" logic
//   3. Whiteboard — drawing/annotation board
//
// When the candidate starts voice chat, the tutor announces it
// is holding the class (if tutoring is active). After answering
// doubts, it asks "Anything else?" and then continues the held
// class.
// ============================================================

type PopupSize = 'mini' | 'medium' | 'large' | 'fullscreen';
type TabType = 'tutor' | 'voicechat' | 'whiteboard';

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
  // Voice chat transcript/response
  voiceChatTranscript?: string;
  voiceChatResponse?: string;
  voiceChatLoading?: boolean;
  // Class holding state
  isClassHeld?: boolean;
  // External open/close control
  defaultOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// ============================================================
// HalfCircle progress icon — SVG half-filled circle
// ============================================================
function HalfCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" className="text-muted-foreground/30" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2 A10 10 0 0 1 12 22 Z"
        className="text-amber-500"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
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
  voiceChatTranscript,
  voiceChatResponse,
  voiceChatLoading,
  isClassHeld,
  defaultOpen = false,
  isOpen: isOpenProp,
  onOpenChange,
}: FloatingTutorPopupProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  // Use external state if provided, otherwise internal
  const isPopupOpen = onOpenChange ? (isOpenProp ?? internalIsOpen) : internalIsOpen;
  const setPopupOpen = onOpenChange
    ? (open: boolean) => { onOpenChange(open); }
    : setInternalIsOpen;
  const [popupSize, setPopupSize] = useState<PopupSize>('medium');
  const [activeTab, setActiveTab] = useState<TabType>('tutor');
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  // Auto-switch to voice chat tab when voice chat starts
  useEffect(() => {
    if (isVoiceChatting) {
      setActiveTab('voicechat');
    }
  }, [isVoiceChatting]);

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
    fullscreen: { width: typeof window !== 'undefined' ? window.innerWidth - 48 : 1200, height: typeof window !== 'undefined' ? window.innerHeight - 80 : 800, avatarSize: 160 },
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
  if (!isPopupOpen) {
    return (
      <button
        onClick={() => setPopupOpen(true)}
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
          {isClassHeld && (
            <div className="absolute -bottom-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 ring-2 ring-background">
              <Pause className="h-2.5 w-2.5 text-white" />
            </div>
          )}
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
            <div className="whitespace-nowrap rounded-lg bg-popover px-3 py-1.5 text-xs font-medium text-popover-foreground shadow-lg border">
              {isVoiceChatting ? 'Voice chat active...' : isSpeaking ? 'AI Tutor is speaking...' : 'Click to open AI Tutor'}
            </div>
          </div>
        </div>
      </button>
    );
  }

  // Popup is open
  const isFullscreen = popupSize === 'fullscreen';
  return (
    <div
      ref={popupRef}
      className={`fixed z-50 flex flex-col overflow-hidden bg-background shadow-2xl shadow-emerald-500/10 animate-popup-enter transition-all duration-200 ${
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
              onClick={() => handleSizeChange('fullscreen')}
              className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${popupSize === 'fullscreen' ? 'bg-white/30' : 'hover:bg-white/20'}`}
              title="Fullscreen"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
            </button>
            <button
              onClick={() => setPopupOpen(false)}
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
          {isClassHeld && (
            <span className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/20 px-1.5 py-0.5 rounded animate-pulse">
              <Pause className="h-2.5 w-2.5 inline mr-0.5" /> Class on hold
            </span>
          )}
        </div>
      </div>

      {/* Tab Bar — 3 tabs: AI Tutor, Voice Chat, Whiteboard */}
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
          onClick={() => setActiveTab('voicechat')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors relative ${
            activeTab === 'voicechat'
              ? 'border-b-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Mic className="h-3.5 w-3.5" /> Voice Chat
          {isVoiceChatting && (
            <span className="absolute top-1.5 right-3 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('whiteboard')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'whiteboard'
              ? 'border-b-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <PenTool className="h-3.5 w-3.5" /> Whiteboard
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
                {isClassHeld && (
                  <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px]">
                    <Pause className="mr-1 h-3 w-3" /> Class held
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
        ) : activeTab === 'voicechat' ? (
          /* Voice Chat Tab — dedicated voice chat with hold class behavior */
          <div className="p-4 space-y-4" data-nodrag>
            {/* Avatar with speaking animation */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <Animated3DTutorAvatar
                  speaking={isSpeaking || isVoiceChatting}
                  expression={isVoiceChatting ? 'curious' : expression}
                  size={currentSize.avatarSize * 0.8}
                />
                {/* Live indicator */}
                {isVoiceChatting && (
                  <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 ring-2 ring-background animate-pulse">
                    <Mic className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Class held notice */}
            {isClassHeld && (
              <Card className="border-amber-500/40 bg-amber-50 dark:bg-amber-950/30">
                <CardContent className="p-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Pause className="h-4 w-4 text-amber-600" />
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Class is on hold</p>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    I am holding the class for you. Please share your doubts and I will explain everything. Once you are done, we will continue the class.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Voice Chat Button */}
            <Card className="overflow-hidden border-2 border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Voice Chat with Tutor</p>
                  {isVoiceChatting && (
                    <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 animate-pulse text-[9px]">
                      <Phone className="mr-1 h-2.5 w-2.5" /> Live
                    </Badge>
                  )}
                </div>

                {/* Start/Stop button */}
                <Button
                  onClick={isVoiceChatting ? onStopVoiceChat : onStartVoiceChat}
                  className={`w-full h-11 text-sm font-medium transition-all ${
                    isVoiceChatting
                      ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/20'
                  }`}
                  disabled={!onStartVoiceChat}
                >
                  {isVoiceChatting ? (
                    <><PhoneOff className="mr-2 h-5 w-5" /> End Voice Chat</>
                  ) : (
                    <><Phone className="mr-2 h-5 w-5" /> Start Voice Chat</>
                  )}
                </Button>

                {/* Live waveform visualization */}
                {isVoiceChatting && (
                  <div className="flex items-center justify-center gap-1 py-2">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 bg-emerald-500 rounded-full animate-voice-bar"
                        style={{
                          height: `${12 + Math.random() * 20}px`,
                          animationDelay: `${i * 0.08}s`,
                          animationDuration: `${0.4 + Math.random() * 0.3}s`,
                        }}
                      />
                    ))}
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 ml-2 font-medium">Listening to you...</span>
                  </div>
                )}

                <p className="text-[10px] text-muted-foreground text-center">
                  {isVoiceChatting
                    ? 'Speak naturally — Marq AI is listening to your doubts'
                    : isClassHeld
                    ? 'You have doubts on hold. Tap to resume voice chat.'
                    : 'Tap to ask your doubts by voice. The tutor will hold the class for you.'}
                </p>
              </CardContent>
            </Card>

            {/* Transcript section */}
            {voiceChatTranscript && (
              <Card className="border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20">
                <CardContent className="p-3 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Your Question</p>
                  <p className="text-sm text-foreground">{voiceChatTranscript}</p>
                </CardContent>
              </Card>
            )}

            {/* Loading */}
            {voiceChatLoading && (
              <Card className="border-emerald-500/20">
                <CardContent className="p-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  <p className="text-xs text-muted-foreground">Marq AI is thinking about your question...</p>
                </CardContent>
              </Card>
            )}

            {/* Response section */}
            {voiceChatResponse && !voiceChatLoading && (
              <Card className="border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Marq AI Response</p>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{voiceChatResponse}</p>
                </CardContent>
              </Card>
            )}

            {/* Continue prompt in voice chat tab */}
            {showContinuePrompt && onContinueClass && (
              <Card className="border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Anything else you want to ask?</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground">If you are done with your doubts, we can continue the class.</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={onStartVoiceChat} className="flex-1 h-8 text-xs border-emerald-500/40 text-emerald-700 dark:text-emerald-300">
                      <Mic className="mr-1 h-3.5 w-3.5" /> Ask another doubt
                    </Button>
                    <Button size="sm" onClick={onContinueClass} className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 h-8 text-xs">
                      <Play className="mr-1 h-3.5 w-3.5" /> Continue class
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info section */}
            <Card className="border-muted">
              <CardContent className="p-3 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">How Voice Chat Works</p>
                <ul className="text-[10px] text-muted-foreground space-y-1">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-0.5">1.</span>
                    <span>Tap &quot;Start Voice Chat&quot; to begin speaking with Marq AI</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-0.5">2.</span>
                    <span>If a class is in progress, the tutor will hold it for you</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-0.5">3.</span>
                    <span>Ask your doubts naturally — the tutor will explain everything</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-0.5">4.</span>
                    <span>After answering, you can ask more or continue the class</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Whiteboard Tab */
          <div className="p-3 flex flex-col gap-2" data-nodrag>
            {/* Toolbar */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" title="Pen tool">
                <PenTool className="h-3 w-3" /> Pen
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" title="Eraser">
                <Eraser className="h-3 w-3" /> Eraser
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" title="Text">
                <Type className="h-3 w-3" /> Text
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" title="Clear board">
                <Trash2 className="h-3 w-3" /> Clear
              </Button>
              <Button
                size="sm"
                className="h-7 text-[10px] gap-1 bg-emerald-600 text-white hover:bg-emerald-700 ml-auto"
                title="Ask AI to Explain"
                onClick={() => alert('Coming soon - AI will draw and explain on the board!')}
              >
                <Wand2 className="h-3 w-3" /> Ask AI to Explain
              </Button>
            </div>

            {/* Whiteboard iframe */}
            <div className="relative flex-1 rounded-lg border overflow-hidden bg-white" style={{ minHeight: 320 }}>
              <iframe
                src="https://woowhiteboard.com/online-whiteboard-for-teaching"
                className="w-full h-full border-0"
                style={{ minHeight: 320 }}
                title="Whiteboard"
                allow="clipboard-read; clipboard-write"
              />
            </div>

            {/* Note */}
            <p className="text-[10px] text-muted-foreground text-center italic">
              AI Tutor can explain concepts on this board. Use the tools to write or draw.
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
