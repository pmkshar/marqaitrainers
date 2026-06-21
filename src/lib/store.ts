import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { View, ChatMessage } from '@/lib/types';

interface AppState {
  view: View;
  isTutorOpen: boolean;
  isMenuOpen: boolean;
  chatMessages: ChatMessage[];
  completedLessons: string[];
  navigate: (view: View) => void;
  goHome: () => void;
  openCourse: (courseId: string) => void;
  openLesson: (courseId: string, moduleId: string, lessonId: string) => void;
  openQuiz: (courseId: string, moduleId: string, lessonId: string) => void;
  setTutorOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  toggleMenu: () => void;
  addMessage: (msg: ChatMessage) => void;
  setMessages: (msgs: ChatMessage[]) => void;
  clearChat: () => void;
  markLessonComplete: (lessonId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      view: { name: 'home' },
      isTutorOpen: false,
      isMenuOpen: false,
      chatMessages: [],
      completedLessons: [],

      navigate: (view) => {
        set({ view, isMenuOpen: false });
        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      goHome: () => set({ view: { name: 'home' }, isMenuOpen: false }),
      openCourse: (courseId) =>
        set({ view: { name: 'course', courseId }, isMenuOpen: false }),
      openLesson: (courseId, moduleId, lessonId) =>
        set({ view: { name: 'lesson', courseId, moduleId, lessonId }, isMenuOpen: false }),
      openQuiz: (courseId, moduleId, lessonId) =>
        set({ view: { name: 'quiz', courseId, moduleId, lessonId }, isMenuOpen: false }),
      setTutorOpen: (open) => set({ isTutorOpen: open }),
      setMenuOpen: (open) => set({ isMenuOpen: open }),
      toggleMenu: () => set((s) => ({ isMenuOpen: !s.isMenuOpen })),
      addMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
      setMessages: (msgs) => set({ chatMessages: msgs }),
      clearChat: () => set({ chatMessages: [] }),
      markLessonComplete: (lessonId) =>
        set((s) =>
          s.completedLessons.includes(lessonId)
            ? s
            : { completedLessons: [...s.completedLessons, lessonId] }
        ),
    }),
    {
      name: 'tutor-platform-storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : (undefined as never))),
      partialize: (s) => ({
        completedLessons: s.completedLessons,
        chatMessages: s.chatMessages.slice(-20),
      }),
    }
  )
);
