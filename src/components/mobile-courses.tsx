'use client';

import { useState } from 'react';
import {
  Search, Clock, Star, ChevronRight, Filter, BookOpen, Video,
  FileQuestion, Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CourseIcon } from './navbar';
import { useAppStore } from '@/lib/store';
import { COURSES } from '@/lib/courses';
import { cn } from '@/lib/utils';

// ============================================================
// Mobile Courses — Full course catalog with search & filters
// ============================================================

const CATEGORIES = ['All', ...Array.from(new Set(COURSES.map(c => c.level)))];

export function MobileCourses() {
  const { openCourse } = useAppStore();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = COURSES.filter(c => {
    const matchesQuery = !query.trim() ||
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      c.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));
    const matchesCat = activeCategory === 'All' || c.level === activeCategory;
    return matchesQuery && matchesCat;
  });

  return (
    <div className="animate-page-enter">
      {/* Search */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses..."
            className="h-11 w-full rounded-xl border bg-card pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
                activeCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-muted text-muted-foreground active:bg-muted/80'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course list */}
      <div className="px-4 space-y-3 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-2 font-semibold">No courses found</p>
            <p className="text-sm text-muted-foreground">Try a different search or category</p>
          </div>
        ) : (
          filtered.map(course => (
            <button
              key={course.id}
              onClick={() => openCourse(course.id)}
              className="w-full rounded-2xl border bg-card overflow-hidden active:scale-[0.98] transition-transform text-left"
            >
              {/* Course banner */}
              <div className={cn('h-28 bg-gradient-to-br flex items-center justify-between px-5', course.gradient)}>
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/20 backdrop-blur">
                    <CourseIcon name={course.icon} className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-bold truncate">{course.title}</p>
                    <p className="text-white/80 text-xs truncate">{course.instructor}</p>
                  </div>
                </div>
              </div>

              {/* Course info */}
              <div className="p-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{course.subtitle}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <Badge variant="secondary" className="text-[9px]">{course.level}</Badge>
                  <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" /> {course.duration}
                  </span>
                  <span className="flex items-center gap-0.5 text-[11px] text-amber-600">
                    <Star className="h-3 w-3 fill-amber-400" /> {course.rating}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{course.studentsCount} students</span>
                </div>
                {/* Tags */}
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {course.tags.slice(0, 4).map(tag => (
                    <span key={tag} className="rounded-md bg-muted px-2 py-0.5 text-[9px] text-muted-foreground">{tag}</span>
                  ))}
                </div>
                {/* CTA */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">View Course</span>
                  <ChevronRight className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
