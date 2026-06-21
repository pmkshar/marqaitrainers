export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface LessonStep {
  title: string;
  content: string;
  code?: string;
  codeLanguage?: string;
  tip?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  steps: LessonStep[];
  quiz: QuizQuestion[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  icon: string;
  color: string;
  gradient: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  duration: string;
  lessonsCount: number;
  studentsCount: string;
  rating: number;
  instructor: string;
  instructorTitle: string;
  tags: string[];
  whatYouLearn: string[];
  prerequisites: string[];
  modules: Module[];
}

export type View =
  | { name: 'home' }
  | { name: 'course'; courseId: string }
  | { name: 'lesson'; courseId: string; moduleId: string; lessonId: string }
  | { name: 'quiz'; courseId: string; moduleId: string; lessonId: string };

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}
