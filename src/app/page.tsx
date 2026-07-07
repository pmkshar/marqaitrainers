'use client';

import { useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Hero, Features, TrainingFlow, CorporateTraining, CorporateClientsTicker, CorporatePlans, TrustedCompanies, MobileAppPromo, CtaSection, CourseSearchBar, ScrollingCourseIcons, InfographicStats, InfographicHowItWorks, CorporateCTABanner, CoursesPage } from '@/components/landing';
import { CourseDetail } from '@/components/course-detail';
import { LessonView } from '@/components/lesson-view';
import { QuizView } from '@/components/quiz-view';
import { AuthModal } from '@/components/auth-modal';
import { PricingPage } from '@/components/pricing-page';
import { TutorMarketplace } from '@/components/tutor-marketplace';
import { TutorPortal } from '@/components/tutor-portal';
import { AdminPortal } from '@/components/admin-portal';
import { CorporatePortal } from '@/components/corporate-portal';
import { MyLearning } from '@/components/my-learning';
import { Dashboard } from '@/components/dashboard';
import {
  CalendarPage, MembersPage, GroupsPage, MessagesPage,
  CertificatesPage, AchievementsPage, FeaturesPage,
} from '@/components/portal-pages';
import { ResumeStudio } from '@/components/resume-studio';
import { AIInterview } from '@/components/ai-interview';
import { ErrorBoundary } from '@/components/error-boundary';
import { useAppStore } from '@/lib/store';

export default function Home() {
  const view = useAppStore((s) => s.view);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const currentUser = useAppStore((s) => {
    const uid = s.currentUserId;
    if (!uid) return null;
    return s.users.find((u) => u.id === uid) ?? null;
  });
  const isCorporateUser = !!currentUser?.corporateId || currentUser?.role === 'corporate_admin' || currentUser?.role === 'corporate_user';

  // Scroll to top whenever the view changes
  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' });
  }, [view.name, (view as { courseId?: string }).courseId, (view as { lessonId?: string }).lessonId, (view as { adminTab?: string }).adminTab]);

  // Register service worker for PWA on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // ignore — PWA is progressive enhancement only
      });
    }
  }, []);

  // Auto-detect locale from GPS/timezone on first visit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      useAppStore.getState().detectLocaleFromGps();
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Wrap Navbar, Main, and Footer in a container that shifts when sidebar is visible */}
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <ErrorBoundary label={`view:${view.name}`}>
            {view.name === 'home' && (
              <>
                <ScrollingCourseIcons />
                <CourseSearchBar />
                <InfographicStats />
                <InfographicHowItWorks />
                {isCorporateUser && (
                  <>
                    <CorporateTraining />
                    <CorporateClientsTicker />
                    <CorporateCTABanner />
                  </>
                )}
                <Features />
                <TrustedCompanies />
                <MobileAppPromo />
                <CtaSection />
              </>
            )}
            {view.name === 'course' && <CourseDetail courseId={view.courseId!} />}
            {view.name === 'lesson' && (
              <LessonView key={view.lessonId} courseId={view.courseId!} moduleId={view.moduleId!} lessonId={view.lessonId!} />
            )}
            {view.name === 'quiz' && (
              <QuizView key={view.lessonId} courseId={view.courseId!} moduleId={view.moduleId!} lessonId={view.lessonId!} />
            )}
            {view.name === 'pricing' && <PricingPage />}
            {view.name === 'tutors' && <TutorMarketplace />}
            {view.name === 'tutor_portal' && <TutorPortal />}
            {view.name === 'admin' && <AdminPortal />}
            {view.name === 'corporate' && <CorporatePortal />}
            {view.name === 'my_learning' && <MyLearning />}
            {view.name === 'dashboard' && <Dashboard />}
            {view.name === 'calendar' && <CalendarPage />}
            {view.name === 'members' && <MembersPage />}
            {view.name === 'groups' && <GroupsPage />}
            {view.name === 'messages' && <MessagesPage />}
            {view.name === 'certificates' && <CertificatesPage />}
            {view.name === 'achievements' && <AchievementsPage />}
            {view.name === 'features' && <FeaturesPage />}
            {view.name === 'courses' && <CoursesPage />}
            {view.name === 'resume_studio' && <ResumeStudio />}
            {view.name === 'ai_interview' && <AIInterview />}
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
      <AuthModal />
    </div>
  );
}
