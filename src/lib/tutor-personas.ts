// ============================================================
// Tutor Personas
// ------------------------------------------------------------
// Single AI tutor identity: Marq AI
// Used everywhere — home page (doubt clearing) and lesson
// view (full teaching with controls).
// ============================================================

export type TutorGender = 'female' | 'male';

export interface TutorPersona {
  /** Display name, shown to every user including super_admin */
  name: string;
  /** Short title shown under the name */
  title: string;
  /** Tagline shown on the tutor screen */
  tagline: string;
  /** Voice ID for ZAI TTS API */
  voice: 'tongtong' | 'chuichui' | 'xiaochen' | 'jam' | 'kazi' | 'douji' | 'luodo';
  /** Gender — kept for backward compat (voice pitch selection) */
  gender: TutorGender;
  /** Tailwind gradient classes for avatar */
  avatarGradient: string;
  /** Initial letter for avatar fallback */
  initial: string;
  /** Speaking speed (1.0 = normal) */
  speed: number;
  /** Intro text — spoken at the start of each course session */
  introText: string;
}

// ────────────── Marq AI — Universal tutor ──────────────

const MARQAI_BASE: Omit<TutorPersona, 'title' | 'tagline' | 'introText' | 'avatarGradient'> = {
  name: 'Marq AI',
  voice: 'tongtong',
  gender: 'female',
  initial: 'M',
  speed: 0.95,
};

// Default persona for home page (course info / doubts)
export const DEFAULT_TUTOR: TutorPersona = {
  ...MARQAI_BASE,
  title: 'Your AI Course Advisor',
  tagline: 'Here to help you find the right course.',
  avatarGradient: 'from-emerald-500 to-teal-600',
  introText: `Hello! I am Marq AI, your AI Course Advisor. I can help you understand our courses, pricing, and learning paths. Feel free to ask me anything about our platform — from course details to career guidance. I am here to help you make the best choice for your learning journey!`,
};

// Marq AI default for lesson view
export const DEFAULT_LESSON_TUTOR: TutorPersona = {
  ...MARQAI_BASE,
  voice: 'jam',
  title: 'Your AI Software Engineering Tutor',
  tagline: 'Always here to help you learn.',
  avatarGradient: 'from-emerald-500 to-teal-600',
  introText: `Hello! I am Marq AI, your AI Software Engineering Tutor. I have years of experience in software engineering and I am passionate about helping learners like you master programming and technology. I believe in interactive learning — I will explain concepts step by step, ask you questions along the way to make sure you are following, and give you real-world examples so everything clicks. If you ever give a wrong answer, don't worry — I will gently remind you to listen carefully, and then we will continue together. Let us begin!`,
};

// Per-course Marq AI tutors (home page — for course info queries)
const HOME_TUTOR_CONFIGS: Record<string, Omit<TutorPersona, 'gender' | 'voice' | 'speed' | 'name' | 'initial'>> = {
  'ai-ml': {
    title: 'AI & Machine Learning Advisor',
    tagline: 'I can help you understand our AI/ML course.',
    avatarGradient: 'from-emerald-500 to-teal-600',
    introText: `Hello! I am Marq AI, your AI and Machine Learning Course Advisor. I can help you understand what this course covers, the career opportunities it opens up, and whether it is the right fit for you. Ask me anything!`,
  },
  'java-fullstack': {
    title: 'Full Stack Java Advisor',
    tagline: 'I can help you understand our Java course.',
    avatarGradient: 'from-orange-500 to-red-600',
    introText: `Hello! I am Marq AI, your Full Stack Java Course Advisor. I can help you understand what this course covers, from JVM internals to enterprise Spring Boot applications. Ask me about the curriculum, prerequisites, or career outcomes!`,
  },
  'dotnet-fullstack': {
    title: '.NET & C# Advisor',
    tagline: 'I can help you understand our .NET course.',
    avatarGradient: 'from-violet-500 to-purple-600',
    introText: `Hello! I am Marq AI, your .NET and C# Course Advisor. I can help you understand what this course covers, from ASP.NET Core to production-grade applications. Ask me anything about the curriculum or career paths!`,
  },
  'mobile-dev': {
    title: 'Mobile App Dev Advisor',
    tagline: 'I can help you understand our Mobile Dev course.',
    avatarGradient: 'from-sky-500 to-indigo-600',
    introText: `Hello! I am Marq AI, your Mobile App Development Course Advisor. I can help you understand what this course covers, from React Native to shipping apps to the stores. Ask me about the curriculum or career opportunities!`,
  },
  'flutter-dev': {
    title: 'Flutter & Dart Advisor',
    tagline: 'I can help you understand our Flutter course.',
    avatarGradient: 'from-cyan-500 to-blue-600',
    introText: `Hello! I am Marq AI, your Flutter and Dart Course Advisor. I can help you understand what this course covers, from cross-platform UI to deploying beautiful apps. Ask me anything!`,
  },
  'python-pro': {
    title: 'Python Programming Advisor',
    tagline: 'I can help you understand our Python course.',
    avatarGradient: 'from-yellow-500 to-amber-600',
    introText: `Hello! I am Marq AI, your Python Programming Course Advisor. I can help you understand what this course covers, from basics to async programming and data science. Ask me about the curriculum or career paths!`,
  },
};

// Per-course Marq AI tutors (lesson view — for actual teaching)
const LESSON_TUTOR_CONFIGS: Record<string, Omit<TutorPersona, 'gender' | 'voice' | 'speed' | 'name' | 'initial'>> = {
  'ai-ml': {
    title: 'AI & Machine Learning Tutor',
    tagline: 'I make neural networks and transformers click.',
    avatarGradient: 'from-emerald-500 to-teal-600',
    introText: `Hello! I am Marq AI, your AI and Machine Learning Tutor. I have years of experience in artificial intelligence, deep learning, and data science, and I am passionate about helping learners like you master these cutting-edge technologies. I believe in interactive learning — I will explain concepts step by step, ask you questions along the way to make sure you are following, and give you real-world examples so everything clicks. If you ever give a wrong answer, don't worry — I will gently remind you to listen carefully, and then we will continue together. Let us begin this chapter!`,
  },
  'java-fullstack': {
    title: 'Full Stack Java Tutor',
    tagline: 'From JVM internals to Spring Boot microservices.',
    avatarGradient: 'from-orange-500 to-red-600',
    introText: `Hello! I am Marq AI, your Full Stack Java Tutor. I have years of experience in Java development, from JVM internals to enterprise Spring Boot applications, and I am passionate about helping learners like you become proficient Java developers. I believe in interactive learning — I will explain concepts step by step, ask you questions along the way to make sure you are following, and give you real-world examples so everything clicks. If you ever give a wrong answer, don't worry — I will gently remind you to listen carefully, and then we will continue together. Let us begin this chapter!`,
  },
  'dotnet-fullstack': {
    title: '.NET & C# Tutor',
    tagline: 'Building production-grade apps with .NET 8 and ASP.NET Core.',
    avatarGradient: 'from-violet-500 to-purple-600',
    introText: `Hello! I am Marq AI, your .NET and C# Tutor. I have years of experience building production-grade applications with .NET and ASP.NET Core, and I am passionate about helping learners like you master the Microsoft ecosystem. I believe in interactive learning — I will explain concepts step by step, ask you questions along the way to make sure you are following, and give you real-world examples so everything clicks. If you ever give a wrong answer, don't worry — I will gently remind you to listen carefully, and then we will continue together. Let us begin this chapter!`,
  },
  'mobile-dev': {
    title: 'Mobile App Development Tutor',
    tagline: 'React Native, Expo, and shipping to App Store + Play Store.',
    avatarGradient: 'from-sky-500 to-indigo-600',
    introText: `Hello! I am Marq AI, your Mobile App Development Tutor. I have years of experience building mobile applications with React Native and Expo, and I am passionate about helping learners like you ship apps to the App Store and Play Store. I believe in interactive learning — I will explain concepts step by step, ask you questions along the way to make sure you are following, and give you real-world examples so everything clicks. If you ever give a wrong answer, don't worry — I will gently remind you to listen carefully, and then we will continue together. Let us begin this chapter!`,
  },
  'flutter-dev': {
    title: 'Flutter & Dart Tutor',
    tagline: 'Pixel-perfect cross-platform UI with Flutter.',
    avatarGradient: 'from-cyan-500 to-blue-600',
    introText: `Hello! I am Marq AI, your Flutter and Dart Tutor. I have years of experience building pixel-perfect cross-platform applications with Flutter, and I am passionate about helping learners like you create beautiful mobile and web apps. I believe in interactive learning — I will explain concepts step by step, ask you questions along the way to make sure you are following, and give you real-world examples so everything clicks. If you ever give a wrong answer, don't worry — I will gently remind you to listen carefully, and then we will continue together. Let us begin this chapter!`,
  },
  'python-pro': {
    title: 'Python Programming Tutor',
    tagline: 'From Python basics to async, web, and data science.',
    avatarGradient: 'from-yellow-500 to-amber-600',
    introText: `Hello! I am Marq AI, your Python Programming Tutor. I have years of experience in Python development, from basics to async programming, web frameworks, and data science, and I am passionate about helping learners like you become proficient Python developers. I believe in interactive learning — I will explain concepts step by step, ask you questions along the way to make sure you are following, and give you real-world examples so everything clicks. If you ever give a wrong answer, don't worry — I will gently remind you to listen carefully, and then we will continue together. Let us begin this chapter!`,
  },
};

// Course-specific Marq AI mapping (home page — for course info)
export const HOME_TUTORS: Record<string, TutorPersona> = {};
for (const [courseId, config] of Object.entries(HOME_TUTOR_CONFIGS)) {
  HOME_TUTORS[courseId] = { ...MARQAI_BASE, ...config };
}

// Course-specific Marq AI mapping (lesson view — for teaching)
export const COURSE_TUTORS: Record<string, TutorPersona> = {};
for (const [courseId, config] of Object.entries(LESSON_TUTOR_CONFIGS)) {
  COURSE_TUTORS[courseId] = { ...MARQAI_BASE, voice: 'jam', ...config };
}

/** Get Marq AI tutor for home page (course info / doubts) */
export function getHomeTutor(courseId?: string): TutorPersona {
  if (!courseId) return DEFAULT_TUTOR;
  return HOME_TUTORS[courseId] ?? DEFAULT_TUTOR;
}

/** Get Marq AI tutor for lesson/chapter view (teaching with controls) */
export function getTutorForCourse(courseId?: string): TutorPersona {
  if (!courseId) return DEFAULT_LESSON_TUTOR;
  return COURSE_TUTORS[courseId] ?? DEFAULT_LESSON_TUTOR;
}

/** Get the current gender override for a course (used by admin UI). */
export function getCourseTutorGender(courseId: string): TutorGender {
  if (typeof window === 'undefined') return 'female';
  try {
    const raw = window.localStorage.getItem('marq-ai-tutor-gender-overrides');
    if (raw) {
      const overrides: Record<string, TutorGender> = JSON.parse(raw);
      return overrides[courseId] ?? 'female';
    }
  } catch { /* noop */ }
  return 'female';
}
