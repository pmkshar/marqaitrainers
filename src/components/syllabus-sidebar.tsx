'use client';

import { useMemo, useState } from 'react';
import {
  ChevronDown, ChevronRight, CheckCircle2, Clock, ListChecks,
  PlayCircle, FileQuestion, BookOpen, X, Menu, Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';
import { findCourse, getAllLessons } from '@/lib/courses';
import { useAppStore } from '@/lib/store';
import type { Course, Module, Lesson } from '@/lib/types';

// ============================================================
// SyllabusSidebar Component
// ------------------------------------------------------------
// Fixed position on the left, shows full course curriculum
// with expandable modules, current lesson highlighted,
// completion status, and progress tracking
// ============================================================

interface SyllabusSidebarProps {
  courseId: string;
  currentModuleId?: string;
  currentLessonId?: string;
  onLessonSelect?: (moduleId: string, lessonId: string) => void;
  variant?: 'desktop' | 'mobile';
}

// Helper to parse duration string to minutes
function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)\s*(min|hour|hr|h|m)/i);
  if (!match) return 10;
  const num = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  if (unit.startsWith('h') || unit.startsWith('hour')) return num * 60;
  return num;
}

// Helper to format total minutes to readable duration
function formatTotalDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// Single lesson item component
function LessonItem({
  lesson,
  module,
  courseId,
  isCurrentLesson,
  isCompleted,
  isTestPassed,
  isExpanded,
  onToggleExpand,
  onSelect,
  index,
}: {
  lesson: Lesson;
  module: Module;
  courseId: string;
  isCurrentLesson: boolean;
  isCompleted: boolean;
  isTestPassed: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelect: () => void;
  index: number;
}) {
  const durationMinutes = parseDuration(lesson.duration);
  const stepCount = lesson.steps.length;
  const quizCount = lesson.quiz.length;

  return (
    <div className={`group relative ${isCurrentLesson ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''}`}>
      {/* Current lesson accent border */}
      {isCurrentLesson && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r" />
      )}

      <div
        className={`flex items-start gap-2 px-3 py-2.5 cursor-pointer transition-colors
          ${isCurrentLesson
            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30'
            : 'hover:bg-muted/50'
          }
          ${isCompleted ? 'opacity-90' : ''}`}
        onClick={onSelect}
      >
        {/* Lesson number / completion icon */}
        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md text-xs font-medium
          ${isCompleted
            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400'
            : isCurrentLesson
              ? 'bg-emerald-500 text-white'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
        </span>

        {/* Lesson info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className={`text-sm truncate ${isCurrentLesson ? 'font-semibold text-emerald-700 dark:text-emerald-400' : 'font-medium'}`}>
              {lesson.title}
            </p>
            {/* Test passed badge */}
            {isTestPassed && (
              <Badge variant="outline" className="shrink-0 h-5 px-1.5 text-xs bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                ✓
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {lesson.duration}
            </span>
            <span className="inline-flex items-center gap-1">
              <ListChecks className="h-3 w-3" /> {stepCount} steps
            </span>
            {quizCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <FileQuestion className="h-3 w-3" /> {quizCount}Q
              </span>
            )}
          </div>
        </div>

        {/* Expand steps button */}
        {stepCount > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
            className="shrink-0 h-6 w-6 grid place-items-center rounded hover:bg-muted"
          >
            {isExpanded
              ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
              : <ChevronRight className="h-4 w-4 text-muted-foreground" />
            }
          </button>
        )}
      </div>

      {/* Expandable steps list */}
      {isExpanded && stepCount > 0 && (
        <div className="ml-11 mr-3 pb-2 space-y-1">
          {lesson.steps.map((step, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-2 py-1.5 rounded text-xs bg-muted/30 hover:bg-muted/50"
            >
              <span className="shrink-0 h-4 w-4 grid place-items-center rounded bg-background text-muted-foreground font-medium">
                {i + 1}
              </span>
              <span className="truncate text-muted-foreground">{step.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Module section component
function ModuleSection({
  module,
  courseId,
  currentLessonId,
  expandedModules,
  expandedLessons,
  completedLessons,
  passedTests,
  onToggleModule,
  onToggleLesson,
  onSelectLesson,
  moduleIndex,
}: {
  module: Module;
  courseId: string;
  currentLessonId?: string;
  expandedModules: Set<string>;
  expandedLessons: Set<string>;
  completedLessons: string[];
  passedTests: string[];
  onToggleModule: (moduleId: string) => void;
  onToggleLesson: (lessonId: string) => void;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
  moduleIndex: number;
}) {
  const isExpanded = expandedModules.has(module.id);
  const completedCount = module.lessons.filter(l => completedLessons.includes(l.id)).length;
  const passedCount = module.lessons.filter(l => passedTests.includes(l.id)).length;
  const totalDuration = module.lessons.reduce((acc, l) => acc + parseDuration(l.duration), 0);

  return (
    <div className="border-b last:border-b-0">
      {/* Module header */}
      <button
        onClick={() => onToggleModule(module.id)}
        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors
          ${isExpanded ? 'bg-muted/30' : ''}`}
      >
        <span className={`shrink-0 h-8 w-8 grid place-items-center rounded-lg text-sm font-bold
          ${completedCount === module.lessons.length
            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400'
            : 'bg-muted text-muted-foreground'
          }`}
        >
          {String(moduleIndex + 1).padStart(2, '0')}
        </span>

        <div className="min-w-0 flex-1 text-left">
          <p className="font-semibold text-sm truncate">{module.title}</p>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
            <span>{completedCount}/{module.lessons.length} done</span>
            {passedCount > 0 && (
              <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                <Award className="h-3 w-3" /> {passedCount} passed
              </span>
            )}
            <span className="opacity-60">• {formatTotalDuration(totalDuration)}</span>
          </div>
        </div>

        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform
          ${isExpanded ? '' : '-rotate-90'}`}
        />
      </button>

      {/* Lessons list */}
      {isExpanded && (
        <div className="pb-1">
          {module.lessons.map((lesson, lessonIndex) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              module={module}
              courseId={courseId}
              isCurrentLesson={lesson.id === currentLessonId}
              isCompleted={completedLessons.includes(lesson.id)}
              isTestPassed={passedTests.includes(lesson.id)}
              isExpanded={expandedLessons.has(lesson.id)}
              onToggleExpand={() => onToggleLesson(lesson.id)}
              onSelect={() => onSelectLesson(module.id, lesson.id)}
              index={lessonIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Main Syllabus Sidebar Content (shared between desktop and mobile)
function SyllabusContent({
  course,
  currentModuleId,
  currentLessonId,
  onLessonSelect,
  showCloseButton,
  onClose,
}: {
  course: Course;
  currentModuleId?: string;
  currentLessonId?: string;
  onLessonSelect?: (moduleId: string, lessonId: string) => void;
  showCloseButton?: boolean;
  onClose?: () => void;
}) {
  const completedLessons = useAppStore((s) => s.completedLessons) ?? [];
  const passedTests = useAppStore((s) => s.passedLessonTests) ?? [];
  const openLesson = useAppStore((s) => s.openLesson);
  const openQuiz = useAppStore((s) => s.openQuiz);

  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    // Auto-expand module containing current lesson
    const set = new Set<string>();
    if (currentModuleId) set.add(currentModuleId);
    else if (course.modules.length > 0) set.add(course.modules[0].id);
    return set;
  });

  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  // Calculate overall progress
  const allLessons = useMemo(() => getAllLessons(course.id), [course.id]);
  const completedCount = allLessons.filter(l => completedLessons.includes(l.lessonId)).length;
  const progressPct = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;
  const totalCourseDuration = useMemo(() =>
    course.modules.reduce((acc, m) =>
      acc + m.lessons.reduce((a, l) => a + parseDuration(l.duration), 0), 0
    ), [course]
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const toggleLesson = (lessonId: string) => {
    setExpandedLessons(prev => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  };

  const handleSelectLesson = (moduleId: string, lessonId: string) => {
    if (onLessonSelect) {
      onLessonSelect(moduleId, lessonId);
    } else {
      openLesson(course.id, moduleId, lessonId);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-semibold">Course Syllabus</h2>
          </div>
          {showCloseButton && onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Course title */}
        <p className="text-sm text-muted-foreground truncate mb-3">{course.title}</p>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Progress</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {completedCount} of {allLessons.length} lessons complete
          </p>
        </div>

        {/* Total duration */}
        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Total duration: {formatTotalDuration(totalCourseDuration)}</span>
        </div>
      </div>

      {/* Scrollable curriculum */}
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {course.modules.map((module, moduleIndex) => (
            <ModuleSection
              key={module.id}
              module={module}
              courseId={course.id}
              currentLessonId={currentLessonId}
              expandedModules={expandedModules}
              expandedLessons={expandedLessons}
              completedLessons={completedLessons}
              passedTests={passedTests}
              onToggleModule={toggleModule}
              onToggleLesson={toggleLesson}
              onSelectLesson={handleSelectLesson}
              moduleIndex={moduleIndex}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// Desktop Sidebar (fixed position)
export function SyllabusSidebar({
  courseId,
  currentModuleId,
  currentLessonId,
  onLessonSelect,
}: SyllabusSidebarProps) {
  const course = findCourse(courseId);

  if (!course) return null;

  return (
    <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-[280px] border-r bg-background z-40">
      <SyllabusContent
        course={course}
        currentModuleId={currentModuleId}
        currentLessonId={currentLessonId}
        onLessonSelect={onLessonSelect}
      />
    </aside>
  );
}

// Mobile Drawer (slide-in from left)
export function SyllabusDrawer({
  courseId,
  currentModuleId,
  currentLessonId,
  onLessonSelect,
  open,
  onOpenChange,
}: SyllabusSidebarProps & { open: boolean; onOpenChange: (open: boolean) => void }) {
  const course = findCourse(courseId);

  if (!course) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Course Syllabus</SheetTitle>
        </SheetHeader>
        <SyllabusContent
          course={course}
          currentModuleId={currentModuleId}
          currentLessonId={currentLessonId}
          onLessonSelect={onLessonSelect}
          showCloseButton={false}
        />
      </SheetContent>
    </Sheet>
  );
}

// Toggle Button for mobile
export function SyllabusDrawerToggle({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-1.5"
    >
      <Menu className="h-4 w-4" />
      <span className="hidden sm:inline">Syllabus</span>
    </Button>
  );
}

// Export for standalone outline view (used in course detail page)
export function CourseOutlineView({ courseId }: { courseId: string }) {
  const course = findCourse(courseId);

  // Hooks must be called before any early return
  const completedLessons = useAppStore((s) => s.completedLessons) ?? [];
  const passedTests = useAppStore((s) => s.passedLessonTests) ?? [];
  const openLesson = useAppStore((s) => s.openLesson);

  const allLessons = useMemo(() => getAllLessons(courseId), [courseId]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    () => course ? new Set(course.modules.map(m => m.id)) : new Set()
  );

  // Early return after hooks
  if (!course) return null;

  const completedCount = allLessons.filter(l => completedLessons.includes(l.lessonId)).length;
  const progressPct = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;
  const totalCourseDuration = course.modules.reduce((acc, m) =>
    acc + m.lessons.reduce((a, l) => a + parseDuration(l.duration), 0), 0
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Summary header */}
      <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold text-sm">Total Training Time</span>
            </div>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formatTotalDuration(totalCourseDuration)}
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Overall Progress</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {completedCount} of {allLessons.length} lessons completed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modules */}
      <div className="space-y-2">
        {course.modules.map((module, moduleIndex) => {
          const isExpanded = expandedModules.has(module.id);
          const moduleCompletedCount = module.lessons.filter(l => completedLessons.includes(l.id)).length;
          const modulePassedCount = module.lessons.filter(l => passedTests.includes(l.id)).length;
          const moduleDuration = module.lessons.reduce((acc, l) => acc + parseDuration(l.duration), 0);

          return (
            <Card key={module.id} className="overflow-hidden">
              {/* Module header */}
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
              >
                <span className={`h-9 w-9 shrink-0 grid place-items-center rounded-lg text-sm font-bold
                  ${moduleCompletedCount === module.lessons.length
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400'
                    : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {String(moduleIndex + 1).padStart(2, '0')}
                </span>

                <div className="min-w-0 flex-1 text-left">
                  <p className="font-semibold">{module.title}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{module.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="text-xs">
                    {moduleCompletedCount}/{module.lessons.length}
                  </Badge>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform
                    ${isExpanded ? '' : '-rotate-90'}`}
                  />
                </div>
              </button>

              {/* Lessons */}
              {isExpanded && (
                <div className="border-t divide-y bg-muted/20">
                  {module.lessons.map((lesson, lessonIndex) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    const isPassed = passedTests.includes(lesson.id);

                    return (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 p-3 hover:bg-muted/30 cursor-pointer"
                        onClick={() => openLesson(course.id, module.id, lesson.id)}
                      >
                        <span className={`h-7 w-7 shrink-0 grid place-items-center rounded-md text-xs font-medium
                          ${isCompleted
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400'
                            : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : lessonIndex + 1}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{lesson.title}</p>
                            {isPassed && (
                              <Badge variant="outline" className="shrink-0 h-5 px-1.5 text-xs bg-emerald-50 text-emerald-600 border-emerald-200">
                                ✓
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {lesson.duration}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <ListChecks className="h-3 w-3" /> {lesson.steps.length} steps
                            </span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); openLesson(course.id, module.id, lesson.id); }}
                          className="shrink-0"
                        >
                          {isCompleted ? 'Review' : 'Start'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Summary footer */}
      <Card className="bg-muted/50">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{course.modules.length} modules</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <ListChecks className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{allLessons.length} lessons</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <Clock className="h-4 w-4" />
            {formatTotalDuration(totalCourseDuration)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Import Card component for CourseOutlineView
import { Card, CardContent } from '@/components/ui/card';