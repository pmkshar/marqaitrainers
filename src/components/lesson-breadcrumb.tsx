'use client';

import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// LessonBreadcrumb
// ------------------------------------------------------------
// Course › Module › Lesson clickable breadcrumb trail.
// Replaces the single back button on the old lesson header.
// ============================================================

interface Crumb {
  label: string;
  onClick?: () => void;
}

interface LessonBreadcrumbProps {
  items: Crumb[];
  className?: string;
}

export function LessonBreadcrumb({ items, className }: LessonBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex flex-wrap items-center gap-1 text-sm text-muted-foreground', className)}
    >
      <Home className="h-3.5 w-3.5 text-muted-foreground/70" />
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
            {item.onClick && !isLast ? (
              <button
                onClick={item.onClick}
                className="rounded px-1 py-0.5 transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </button>
            ) : (
              <span
                className={cn(
                  'rounded px-1 py-0.5',
                  isLast ? 'font-medium text-foreground' : '',
                )}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
