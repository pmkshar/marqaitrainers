'use client';

import { Star } from 'lucide-react';
import type { Course } from '@/lib/types';

// ============================================================
// CourseMetaBadges
// ------------------------------------------------------------
// Inline row of metadata badges for a lesson header, matching
// Coursera's pattern: Level · Language · Rating · Last updated.
// All fields gracefully fall back to "—" if missing.
// ============================================================

interface CourseMetaBadgesProps {
  course: Course;
  showInstructor?: boolean;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={
            n <= Math.round(rating)
              ? 'h-3 w-3 fill-amber-400 text-amber-400'
              : 'h-3 w-3 text-muted-foreground/40'
          }
        />
      ))}
    </span>
  );
}

export function CourseMetaBadges({ course, showInstructor = true }: CourseMetaBadgesProps) {
  const lastUpdatedLabel = course.lastUpdated
    ? new Date(course.lastUpdated).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
      {/* Level */}
      <span className="inline-flex items-center gap-1">
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-700 dark:text-emerald-300">
          {course.level}
        </span>
      </span>

      {/* Project type */}
      {course.projectType && (
        <span className="inline-flex items-center gap-1">
          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 font-medium text-blue-700 dark:text-blue-300">
            {course.projectType}
          </span>
        </span>
      )}

      {/* Language */}
      {course.language && (
        <span className="inline-flex items-center gap-1">
          <span className="font-medium text-foreground/70">{course.language}</span>
          {course.availableLanguages && course.availableLanguages.length > 1 && (
            <span className="text-muted-foreground/70">
              · {course.availableLanguages.length} languages available
            </span>
          )}
        </span>
      )}

      {/* Rating */}
      <span className="inline-flex items-center gap-1">
        <span className="font-semibold text-foreground">{course.rating.toFixed(1)}</span>
        <Stars rating={course.rating} />
        {course.reviewsCount && (
          <span className="text-muted-foreground/70">({course.reviewsCount.toLocaleString()} reviews)</span>
        )}
      </span>

      {/* Students */}
      {course.studentsCount && (
        <span className="inline-flex items-center gap-1">
          <span className="font-medium text-foreground/70">{course.studentsCount}</span>
          <span>learners</span>
        </span>
      )}

      {/* Last updated */}
      {lastUpdatedLabel && (
        <span className="inline-flex items-center gap-1">
          <span>Updated</span>
          <span className="font-medium text-foreground/70">{lastUpdatedLabel}</span>
        </span>
      )}

      {/* Instructor */}
      {showInstructor && course.instructor && (
        <span className="inline-flex items-center gap-1">
          <span>Instructor:</span>
          <span className="font-medium text-foreground/70">{course.instructor}</span>
        </span>
      )}
    </div>
  );
}

// ============================================================
// SkillsChips
// ------------------------------------------------------------
// Pill chips for "Skills you'll practice" / "Tools you'll use".
// Matches Coursera's #DAE1ED chip styling (but using our theme).
// ============================================================

interface SkillsChipsProps {
  skills?: string[];
  tools?: string[];
  skillsLabel?: string;
  toolsLabel?: string;
  className?: string;
}

export function SkillsChips({
  skills,
  tools,
  skillsLabel = 'Skills you\'ll practice',
  toolsLabel = 'Tools you\'ll use',
  className,
}: SkillsChipsProps) {
  if ((!skills || skills.length === 0) && (!tools || tools.length === 0)) return null;

  return (
    <div className={className}>
      {skills && skills.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {skillsLabel}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {skills.map((s, i) => (
              <span
                key={i}
                className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
      {tools && tools.length > 0 && (
        <div className={skills && skills.length > 0 ? 'mt-3' : ''}>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {toolsLabel}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tools.map((t, i) => (
              <span
                key={i}
                className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ReviewHistogram
// ------------------------------------------------------------
// 5-row rating distribution histogram. Coursera style:
// track #E9EEF7, fill #136EF0, 6px-tall bars, 8px radius.
// ============================================================

interface ReviewHistogramProps {
  distribution: [number, number, number, number, number]; // [5★,4★,3★,2★,1★]
  averageRating: number;
  totalReviews: number;
  className?: string;
}

export function ReviewHistogram({
  distribution,
  averageRating,
  totalReviews,
  className,
}: ReviewHistogramProps) {
  const total = distribution.reduce((a, b) => a + b, 0) || 1;
  const maxCount = Math.max(...distribution) || 1;

  return (
    <div className={className}>
      <div className="flex items-center gap-6">
        {/* Average score block */}
        <div className="shrink-0 text-center">
          <div className="text-4xl font-bold text-foreground">{averageRating.toFixed(1)}</div>
          <div className="mt-1 flex justify-center">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={
                  n <= Math.round(averageRating)
                    ? 'h-3.5 w-3.5 fill-amber-400 text-amber-400'
                    : 'h-3.5 w-3.5 text-muted-foreground/30'
                }
              />
            ))}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {totalReviews.toLocaleString()} reviews
          </div>
        </div>

        {/* Bars */}
        <div className="flex-1 space-y-1">
          {distribution.map((count, i) => {
            const star = 5 - i;
            const pct = (count / maxCount) * 100;
            const overallPct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-12 shrink-0 text-muted-foreground">{star} stars</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-muted-foreground">{overallPct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// InstructorCard
// ------------------------------------------------------------
// Coursera-style instructor card with photo/initials, name,
// title, bio, and stats (course count, learner count, rating).
// ============================================================

interface InstructorCardProps {
  name: string;
  title: string;
  bio?: string;
  avatar?: string;
  initial?: string;
  courseCount?: number;
  learnerCount?: string;
  rating?: number;
  className?: string;
}

export function InstructorCard({
  name,
  title,
  bio,
  avatar,
  initial,
  courseCount,
  learnerCount,
  rating,
  className,
}: InstructorCardProps) {
  const initials = initial ?? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className={className}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Instructor
      </h3>
      <div className="mt-3 flex gap-4">
        {/* Avatar */}
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="h-16 w-16 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xl font-bold text-white">
            {initials}
          </span>
        )}

        {/* Bio */}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{title}</p>

          {(courseCount || learnerCount || rating) && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              {courseCount && (
                <span>
                  <span className="font-semibold text-foreground/80">{courseCount}</span> courses
                </span>
              )}
              {learnerCount && (
                <span>
                  <span className="font-semibold text-foreground/80">{learnerCount}</span> learners
                </span>
              )}
              {rating && (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-foreground/80">{rating.toFixed(1)}</span>
                  <span>rating</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      {bio && <p className="mt-3 text-sm leading-relaxed text-foreground/80">{bio}</p>}
    </div>
  );
}

// ============================================================
// ReviewCard
// ------------------------------------------------------------
// Single review with initials avatar, stars, date, body.
// ============================================================

import type { CourseReview } from '@/lib/types';

export function ReviewCard({ review }: { review: CourseReview }) {
  const dateLabel = new Date(review.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="flex gap-3">
      {/* Initials avatar */}
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-600/30 text-xs font-bold text-emerald-700 dark:text-emerald-300">
        {review.authorInitials}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-foreground">{review.authorName}</span>
          <span className="inline-flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={
                  n <= review.rating
                    ? 'h-3 w-3 fill-amber-400 text-amber-400'
                    : 'h-3 w-3 text-muted-foreground/30'
                }
              />
            ))}
          </span>
          <span className="text-xs text-muted-foreground">Reviewed on {dateLabel}</span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">{review.body}</p>
        {review.upvotes && review.upvotes > 0 && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            {review.upvotes} people found this helpful
          </p>
        )}
      </div>
    </article>
  );
}
