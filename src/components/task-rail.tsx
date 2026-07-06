'use client';

import {
  BookOpen, CheckCircle2, Code2, Flag, Lightbulb,
  ListChecks, Trophy, Video, HelpCircle,
} from 'lucide-react';
import type { LessonStep, TaskType } from '@/lib/types';
import { cn } from '@/lib/utils';

// ============================================================
// TaskRail
// ------------------------------------------------------------
// Coursera-style vertical numbered task list with persistent
// ✓ checkmarks and an active-step indicator. Each task shows:
//   - A number badge (or ✓ if completed)
//   - A type icon (read/code/challenge/solution/video/quiz)
//   - The task title
//   - Estimated minutes (if provided)
//
// The rail is the primary in-lesson navigation on Coursera's
// guided-project workspace — clicking any task jumps to it.
// ============================================================

interface TaskRailProps {
  steps: LessonStep[];
  activeIdx: number;
  completedIdxs: number[];
  onSelect: (idx: number) => void;
  className?: string;
}

const TYPE_ICON: Record<TaskType, React.ComponentType<{ className?: string }>> = {
  read: BookOpen,
  code: Code2,
  challenge: Flag,
  solution: Trophy,
  video: Video,
  quiz: HelpCircle,
};

const TYPE_LABEL: Record<TaskType, string> = {
  read: 'Read',
  code: 'Code',
  challenge: 'Challenge',
  solution: 'Solution',
  video: 'Video',
  quiz: 'Quiz',
};

const TYPE_ACCENT: Record<TaskType, string> = {
  read: 'text-slate-500 bg-slate-100 dark:bg-slate-800/50 dark:text-slate-400',
  code: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400',
  challenge: 'text-amber-700 bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400',
  solution: 'text-violet-700 bg-violet-100 dark:bg-violet-950/40 dark:text-violet-400',
  video: 'text-sky-700 bg-sky-100 dark:bg-sky-950/40 dark:text-sky-400',
  quiz: 'text-rose-700 bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400',
};

export function TaskRail({ steps, activeIdx, completedIdxs, onSelect, className }: TaskRailProps) {
  const total = steps.length;
  const completedCount = completedIdxs.length;
  const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <nav className={cn('flex flex-col', className)} aria-label="Lesson tasks">
      {/* Header with progress */}
      <div className="border-b bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <ListChecks className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Learn step-by-step
          </h3>
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {completedCount} of {total} tasks completed
        </p>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Task list */}
      <ol className="flex flex-col">
        {steps.map((step, i) => {
          const isActive = i === activeIdx;
          const isCompleted = completedIdxs.includes(i);
          const isPast = i < activeIdx;
          const type = step.taskType ?? 'read';
          const Icon = TYPE_ICON[type];
          const accent = TYPE_ACCENT[type];
          const label = TYPE_LABEL[type];

          return (
            <li key={i} className="border-b last:border-b-0">
              <button
                onClick={() => onSelect(i)}
                className={cn(
                  'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
                  isActive
                    ? 'bg-emerald-500/10'
                    : 'hover:bg-muted/40',
                )}
              >
                {/* Number badge or checkmark */}
                <span
                  className={cn(
                    'mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 text-xs font-bold transition-colors',
                    isCompleted
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : isActive
                      ? 'border-emerald-500 bg-white text-emerald-600 dark:bg-transparent dark:text-emerald-400'
                      : isPast
                      ? 'border-muted-foreground/30 bg-muted text-muted-foreground'
                      : 'border-muted-foreground/30 bg-background text-muted-foreground',
                  )}
                  aria-hidden="true"
                >
                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </span>

                {/* Title + meta */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        'text-sm leading-snug',
                        isActive ? 'font-semibold text-foreground' : 'font-medium text-foreground/80',
                      )}
                    >
                      {step.title}
                    </p>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                        accent,
                      )}
                    >
                      <Icon className="h-2.5 w-2.5" />
                      {label}
                    </span>
                    {step.estimatedMinutes && (
                      <span className="text-[10px] text-muted-foreground">
                        ~{step.estimatedMinutes} min
                      </span>
                    )}
                  </div>
                </div>

                {/* Active indicator bar */}
                {isActive && (
                  <span
                    className="mt-1 h-7 w-1 shrink-0 rounded-full bg-emerald-500"
                    aria-hidden="true"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>

      {/* Footer CTA */}
      <div className="border-t bg-muted/30 p-3">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Lightbulb className="h-3 w-3" />
          <span>Tasks auto-complete as you visit them</span>
        </div>
      </div>
    </nav>
  );
}

export { TYPE_ICON as TASK_TYPE_ICON, TYPE_LABEL as TASK_TYPE_LABEL, TYPE_ACCENT as TASK_TYPE_ACCENT };
