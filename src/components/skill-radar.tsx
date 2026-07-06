'use client';

/**
 * SkillRadar — PRD §3.4 "Visual charts (e.g., skill radar charts, completion percentages)"
 *
 * Renders a radar (spider) chart of a user's proficiency across the skills
 * they have practiced via completed lessons. Skill levels are derived from
 * the SkillMatrixEntry type: beginner (1) → intermediate (2) → advanced (3) → expert (4).
 *
 * Built on recharts (already in deps).
 */

import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import { useAppStore } from '@/lib/store';
import { COURSES, findCourse } from '@/lib/courses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp } from 'lucide-react';

interface SkillDatum {
  skill: string;
  level: number;        // 0-100 (scaled for radar axis)
  rawLevel: string;     // human-readable: "Beginner" | "Intermediate" | "Advanced" | "Expert"
  courses: number;      // how many courses contributed to this skill
}

const LEVEL_TO_SCORE: Record<string, number> = {
  'beginner': 25,
  'intermediate': 50,
  'advanced': 75,
  'expert': 100,
};

const LEVEL_LABELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export function SkillRadar() {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users) ?? [];
  const completedLessons = useAppStore((s) => s.completedLessons) ?? [];
  const skillMatrix = useAppStore((s) => s.skillMatrix) ?? [];
  const user = currentUserId ? users.find((u) => u.id === currentUserId) ?? null : null;

  if (!user) return null;

  // Aggregate skills from two sources:
  // 1. skillMatrix entries (corporate skill assessments)
  // 2. completedLessons → look up the skills each lesson teaches
  const skillMap = new Map<string, { totalScore: number; courses: Set<string>; assessments: number }>();

  // Source 1: corporate skill matrix
  for (const entry of skillMatrix) {
    if (entry.userId !== user.id) continue;
    const course = findCourse(entry.courseId);
    if (!course?.skills) continue;
    for (const skill of course.skills) {
      if (!skillMap.has(skill)) {
        skillMap.set(skill, { totalScore: 0, courses: new Set(), assessments: 0 });
      }
      const s = skillMap.get(skill)!;
      s.totalScore += LEVEL_TO_SCORE[entry.level] ?? 50;
      s.assessments += 1;
      s.courses.add(entry.courseId);
    }
  }

  // Source 2: completed lessons → skills taught
  for (const course of COURSES) {
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        if (!completedLessons.includes(lesson.id)) continue;
        const skills = lesson.skills ?? course.skills ?? [];
        for (const skill of skills) {
          if (!skillMap.has(skill)) {
            skillMap.set(skill, { totalScore: 0, courses: new Set(), assessments: 0 });
          }
          const s = skillMap.get(skill)!;
          // Each completed lesson adds ~10 points (capped at 100)
          s.totalScore = Math.min(100, s.totalScore + 10);
          s.courses.add(course.id);
          s.assessments += 1;
        }
      }
    }
  }

  // If user has no skill data yet, show sample data so they can see how
  // the radar chart will look once they complete a few lessons. This is
  // a "preview" / "sample" view — clearly labeled so the candidate knows
  // the numbers are illustrative, not their own.
  if (skillMap.size === 0 && completedLessons.length === 0) {
    const sampleData: SkillDatum[] = [
      { skill: 'Python',         level: 65, rawLevel: 'Intermediate', courses: 2 },
      { skill: 'Data Analysis',  level: 50, rawLevel: 'Intermediate', courses: 1 },
      { skill: 'Machine Learning', level: 40, rawLevel: 'Beginner',   courses: 1 },
      { skill: 'Java',           level: 25, rawLevel: 'Beginner',     courses: 1 },
      { skill: 'React',          level: 30, rawLevel: 'Beginner',     courses: 1 },
      { skill: 'System Design',  level: 15, rawLevel: 'Beginner',     courses: 0 },
      { skill: 'Testing',        level: 20, rawLevel: 'Beginner',     courses: 0 },
      { skill: 'DevOps',         level: 10, rawLevel: 'Beginner',     courses: 0 },
    ];
    const sampleAvg = sampleData.reduce((s, d) => s + d.level, 0) / sampleData.length;
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Skill Radar
            </CardTitle>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300">
              Sample preview
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Illustrative view — your skills will populate here as you complete lessons. Sample avg {Math.round(sampleAvg)}%.
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={sampleData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  tickCount={5}
                />
                <Radar
                  name="Sample level"
                  dataKey="level"
                  stroke="hsl(38 92% 50%)"
                  fill="hsl(38 92% 50%)"
                  fillOpacity={0.25}
                  strokeWidth={2}
                  strokeDasharray="4 2"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, _name: string, props: { payload?: SkillDatum }) => [
                    `${value}% (${props?.payload?.rawLevel ?? '-'})`,
                    'Sample proficiency',
                  ]}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Skill breakdown bars (sample) */}
          <div className="mt-4 space-y-2">
            {sampleData.slice(0, 5).map((d) => (
              <div key={d.skill} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{d.skill}</span>
                  <span className="text-muted-foreground">
                    {d.rawLevel} · {d.level}% · {d.courses} course{d.courses !== 1 ? 's' : ''}
                  </span>
                </div>
                <Progress value={d.level} className="h-1.5" />
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-dashed border-emerald-500/40 bg-emerald-500/[0.04] p-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">How this works:</span>{' '}
            Each completed lesson adds ~10 points to its related skills. Completing
            the chapter test or scoring well on assessments pushes you from Beginner
            → Intermediate → Advanced → Expert. Enroll in your first course to start
            populating this radar with real data.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Convert to chart data, sorted by score descending, take top 8
  const data: SkillDatum[] = Array.from(skillMap.entries())
    .map(([skill, s]) => {
      const avgScore = s.totalScore / Math.max(1, s.assessments);
      const levelIdx = avgScore >= 87 ? 3 : avgScore >= 62 ? 2 : avgScore >= 37 ? 1 : 0;
      return {
        skill,
        level: Math.round(avgScore),
        rawLevel: LEVEL_LABELS[levelIdx],
        courses: s.courses.size,
      };
    })
    .sort((a, b) => b.level - a.level)
    .slice(0, 8);

  const avgScore = data.reduce((sum, d) => sum + d.level, 0) / Math.max(1, data.length);
  const topSkill = data[0];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Skill Radar
          </CardTitle>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            Avg {Math.round(avgScore)}%
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {data.length} skills tracked · top skill: <span className="font-medium text-foreground">{topSkill.skill}</span> ({topSkill.rawLevel})
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickCount={5}
              />
              <Radar
                name="Your level"
                dataKey="level"
                stroke="hsl(158 64% 52%)"
                fill="hsl(158 64% 52%)"
                fillOpacity={0.35}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number, _name: string, props: { payload?: SkillDatum }) => [
                  `${value}% (${props?.payload?.rawLevel ?? '-'})`,
                  'Proficiency',
                ]}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Skill breakdown bars */}
        <div className="mt-4 space-y-2">
          {data.slice(0, 5).map((d) => (
            <div key={d.skill} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{d.skill}</span>
                <span className="text-muted-foreground">
                  {d.rawLevel} · {d.level}% · {d.courses} course{d.courses !== 1 ? 's' : ''}
                </span>
              </div>
              <Progress value={d.level} className="h-1.5" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
