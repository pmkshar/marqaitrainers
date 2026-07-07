// ============================================================
// Tutor Personas
// ------------------------------------------------------------
// Each course has a named AI tutor — branded as "Marq AI".
// The super admin can assign either a female or male voice
// per course. The gender controls voice selection in the
// browser's TTS.
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
  /** Gender — used to pick the right browser voice for voice-over */
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

// Female tutor — Marq AI
const MAYA_BASE: Omit<TutorPersona, 'title' | 'tagline' | 'introText' | 'avatarGradient'> = {
  name: 'Marq AI',
  voice: 'tongtong',
  gender: 'female',
  initial: 'M',
  speed: 0.95,
};

// Male tutor — Arjun
const ARJUN_BASE: Omit<TutorPersona, 'title' | 'tagline' | 'introText' | 'avatarGradient'> = {
  name: 'Arjun',
  voice: 'jam',
  gender: 'male',
  initial: 'A',
  speed: 0.95,
};

// Default persona — used when no course context
export const DEFAULT_TUTOR: TutorPersona = {
  ...MAYA_BASE,
  title: 'Your AI Software Engineering Tutor',
  tagline: 'Always here to help you learn.',
  avatarGradient: 'from-emerald-500 to-teal-600',
  introText: `Hello! I am Marq AI, your AI Software Engineering Tutor. I have years of experience in software engineering and I am passionate about helping learners like you master programming and technology. I believe in interactive learning — I will explain concepts step by step, ask you questions along the way to make sure you are following, and give you real-world examples so everything clicks. If you ever give a wrong answer, don't worry — I will gently remind you to listen carefully, and then we will continue together. Let us begin!`,
};

// Per-course female tutors (Marq AI)
const FEMALE_TUTORS: Record<string, Omit<TutorPersona, 'gender' | 'voice' | 'speed' | 'name' | 'initial'>> = {
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

// Per-course male tutors (Arjun) — same titles but male intro text
const MALE_TUTORS: Record<string, Omit<TutorPersona, 'gender' | 'voice' | 'speed' | 'name' | 'initial'>> = {};
for (const [courseId, femaleConfig] of Object.entries(FEMALE_TUTORS)) {
  MALE_TUTORS[courseId] = {
    ...femaleConfig,
    introText: femaleConfig.introText.replace(/I am Marq AI/g, 'I am Arjun'),
  };
}

// Course-specific tutor mapping (defaults to female/Marq AI)
export const COURSE_TUTORS: Record<string, TutorPersona> = {};
for (const [courseId, config] of Object.entries(FEMALE_TUTORS)) {
  COURSE_TUTORS[courseId] = { ...MAYA_BASE, ...config };
}

export function getTutorForCourse(courseId?: string): TutorPersona {
  if (!courseId) return DEFAULT_TUTOR;

  // Check if super admin has overridden the gender for this course
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem('marq-ai-tutor-gender-overrides');
      if (raw) {
        const overrides: Record<string, TutorGender> = JSON.parse(raw);
        const gender = overrides[courseId];
        if (gender === 'male') {
          const maleConfig = MALE_TUTORS[courseId];
          if (maleConfig) return { ...ARJUN_BASE, ...maleConfig };
          // Fallback: create a male variant
          const femaleConfig = FEMALE_TUTORS[courseId];
          if (femaleConfig) return { ...ARJUN_BASE, ...femaleConfig, introText: femaleConfig.introText.replace(/I am Marq AI/g, 'I am Arjun') };
          return { ...ARJUN_BASE, title: DEFAULT_TUTOR.title, tagline: DEFAULT_TUTOR.tagline, avatarGradient: 'from-blue-500 to-indigo-600', introText: DEFAULT_TUTOR.introText.replace(/I am Marq AI/g, 'I am Arjun') };
        }
      }
    } catch { /* noop */ }
  }

  return COURSE_TUTORS[courseId] ?? DEFAULT_TUTOR;
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
