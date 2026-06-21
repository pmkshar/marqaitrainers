'use client';

import { useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Hero, Features, CourseGrid, CtaSection } from '@/components/landing';
import { CourseDetail } from '@/components/course-detail';
import { LessonView } from '@/components/lesson-view';
import { QuizView } from '@/components/quiz-view';
import { TutorChat } from '@/components/tutor-chat';
import { useAppStore } from '@/lib/store';

export default function Home() {
  const view = useAppStore((s) => s.view);

  // Scroll to top whenever the view changes
  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' });
  }, [view.name, (view as { courseId?: string }).courseId, (view as { lessonId?: string }).lessonId]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        {view.name === 'home' && (
          <>
            <Hero />
            <Features />
            <CourseGrid />
            <CtaSection />
          </>
        )}
        {view.name === 'course' && <CourseDetail courseId={view.courseId} />}
        {view.name === 'lesson' && (
          <LessonView key={view.lessonId} courseId={view.courseId} moduleId={view.moduleId} lessonId={view.lessonId} />
        )}
        {view.name === 'quiz' && (
          <QuizView key={view.lessonId} courseId={view.courseId} moduleId={view.moduleId} lessonId={view.lessonId} />
        )}
      </main>
      <Footer />
      <TutorChat />
    </div>
  );
}
