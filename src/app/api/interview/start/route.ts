import { NextRequest, NextResponse } from 'next/server';
import { resolveZAIConfig, callZAIChat } from '@/lib/zai-config';
import type { InterviewQuestion } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ============================================================
// POST /api/interview/start
// Body: { courseId, courseTitle, courseSkills: string[] }
// Returns: { questions: InterviewQuestion[] }
//
// Generates 5 skill-assessment interview questions tailored to the
// course's syllabus + skills. The candidate will answer these aloud
// during the live AI video interview; the answers are then evaluated
// by /api/interview/evaluate.
// ============================================================

interface StartRequestBody {
  courseId: string;
  courseTitle: string;
  courseSkills?: string[];
}

const SYSTEM_PROMPT = `You are a senior technical interviewer at Marq AI Tech Pvt Ltd. You design fair, rigorous skill-assessment interviews for candidates who just completed a training course.

Your job: produce 5 interview questions that test the candidate's understanding of the course material. Mix conceptual, applied, and code-walkthrough questions. Each question must:
- Be answerable verbally in 60-120 seconds
- Test a specific skill from the course
- Have 3-5 expected key points that a strong answer should cover
- Be appropriate for an intermediate-level candidate

Return ONLY a JSON array (no markdown, no explanation) of 5 question objects with this exact shape:
[
  {
    "type": "conceptual" | "applied" | "code_walkthrough" | "behavioural" | "system_design",
    "prompt": "the question text",
    "code": "optional code snippet for code_walkthrough only",
    "codeLanguage": "python|java|javascript|csharp|dart etc — only if code present",
    "assesses": ["skill1", "skill2"],
    "suggestedSeconds": 90,
    "expectedKeyPoints": ["point 1", "point 2", "point 3"]
  }
]`;

// ============================================================
// Fallback question bank (one per course family) — used when no
// ZAI credentials are configured. Deterministic so the candidate
// always gets a usable interview.
// ============================================================

function fallbackQuestions(courseId: string, courseTitle: string): InterviewQuestion[] {
  const base: InterviewQuestion[] = [
    {
      id: 'q1',
      type: 'conceptual',
      prompt: `Walk me through the most important concept you learned in the ${courseTitle} course, and explain it as if I am a junior engineer.`,
      assesses: ['core concepts', 'communication'],
      suggestedSeconds: 90,
      expectedKeyPoints: [
        'identifies a single key concept (not a list)',
        'explains the why, not just the what',
        'uses a concrete example',
        'avoids jargon or defines it on first use',
      ],
    },
    {
      id: 'q2',
      type: 'applied',
      prompt: `Describe a realistic scenario where you would apply what you learned in this course. What would you build, and which specific techniques from the course would you use?`,
      assesses: ['applied knowledge', 'scenario design'],
      suggestedSeconds: 120,
      expectedKeyPoints: [
        'concrete, realistic scenario',
        'names specific course techniques',
        'considers tradeoffs or alternatives',
        'mentions testing or validation',
      ],
    },
    {
      id: 'q3',
      type: 'code_walkthrough',
      prompt: `Walk me through how you would structure a small project that uses the skills from this course. What files, modules, or components would you create, and why?`,
      assesses: ['project structure', 'architecture'],
      suggestedSeconds: 120,
      expectedKeyPoints: [
        'clear separation of concerns',
        'sensible file/module layout',
        'mentions dependencies or libraries',
        'considers error handling or edge cases',
      ],
    },
    {
      id: 'q4',
      type: 'conceptual',
      prompt: `What is the most common pitfall or misconception in this topic, and how would you avoid it?`,
      assesses: ['pitfalls', 'defensive thinking'],
      suggestedSeconds: 75,
      expectedKeyPoints: [
        'names a specific pitfall (not generic)',
        'explains why it happens',
        'gives a mitigation strategy',
        'shows personal experience or intuition',
      ],
    },
    {
      id: 'q5',
      type: 'behavioural',
      prompt: `If a teammate disagreed with your approach to a problem in this domain, how would you handle it? Walk me through your reasoning.`,
      assesses: ['collaboration', 'reasoning'],
      suggestedSeconds: 90,
      expectedKeyPoints: [
        'listens first, then explains',
        'uses data or evidence',
        'considers the other viewpoint',
        'proposes a way to validate the decision',
      ],
    },
  ];

  // Course-specific first question to make the interview feel tailored
  const courseSpecific: Record<string, InterviewQuestion> = {
    'python-pro': {
      id: 'q0',
      type: 'conceptual',
      prompt: "Walk me through how Python's GIL affects multi-threaded CPU-bound workloads.",
      assesses: ['Python concurrency'],
      suggestedSeconds: 90,
      expectedKeyPoints: [
        'GIL serializes bytecode execution',
        'multiprocessing is preferred for CPU-bound',
        'GIL is released on I/O',
        'mentions alternative interpreters',
      ],
    },
    'ai-ml': {
      id: 'q0',
      type: 'conceptual',
      prompt: 'Explain gradient descent in plain English, and describe one common pitfall when tuning the learning rate.',
      assesses: ['ML fundamentals'],
      suggestedSeconds: 90,
      expectedKeyPoints: [
        'iterative optimization',
        'moves opposite to the gradient',
        'learning rate too high diverges',
        'learning rate too low is slow',
      ],
    },
    'java-fullstack': {
      id: 'q0',
      type: 'conceptual',
      prompt: 'What is the difference between Spring and Spring Boot, and when would you choose one over the other?',
      assesses: ['Spring ecosystem'],
      suggestedSeconds: 90,
      expectedKeyPoints: [
        'Spring is the core framework',
        'Spring Boot is opinionated auto-config',
        'Boot embeds a server',
        'Boot for new projects, Spring for legacy',
      ],
    },
    'dotnet-fullstack': {
      id: 'q0',
      type: 'conceptual',
      prompt: 'Explain how dependency injection works in ASP.NET Core and why it matters.',
      assesses: ['.NET DI'],
      suggestedSeconds: 90,
      expectedKeyPoints: [
        'container resolves dependencies',
        'constructor injection',
        'loose coupling / testability',
        'service lifetimes (scoped, singleton, transient)',
      ],
    },
    'mobile-dev': {
      id: 'q0',
      type: 'conceptual',
      prompt: 'How does React Native render native UI components from JavaScript? Walk me through the bridge.',
      assesses: ['React Native internals'],
      suggestedSeconds: 90,
      expectedKeyPoints: [
        'JS thread + native thread',
        'bridge serializes messages',
        'async batched updates',
        'new architecture (Fabric) eliminates bridge',
      ],
    },
    'flutter-dev': {
      id: 'q0',
      type: 'conceptual',
      prompt: 'Explain how Flutter renders UI without using native OEM widgets. Walk me through the rendering pipeline.',
      assesses: ['Flutter internals'],
      suggestedSeconds: 90,
      expectedKeyPoints: [
        'everything is a widget',
        'Skia/Impeller renders directly',
        'no OEM widget bridge',
        'hot reload via widget tree diff',
      ],
    },
  };

  const specific = courseSpecific[courseId];
  return specific ? [specific, ...base.slice(0, 4)] : base;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as StartRequestBody;
    if (!body.courseId || !body.courseTitle) {
      return NextResponse.json(
        { error: 'courseId and courseTitle are required' },
        { status: 400 },
      );
    }

    const config = await resolveZAIConfig();

    // -------- Fallback: deterministic question bank --------
    if (!config) {
      const questions = fallbackQuestions(body.courseId, body.courseTitle);
      return NextResponse.json({
        questions,
        fallback: true,
        note: 'Using deterministic question bank (ZAI_API_KEY not configured).',
      });
    }

    // -------- LLM: generate tailored questions --------
    const skillsList = body.courseSkills?.length
      ? body.courseSkills.join(', ')
      : 'general software engineering';

    const userPrompt = `Generate 5 interview questions for a candidate who just completed the "${body.courseTitle}" course (courseId: ${body.courseId}).

The course covers these skills: ${skillsList}.

Return ONLY a JSON array of 5 question objects with this exact shape:
[
  {
    "type": "conceptual" | "applied" | "code_walkthrough" | "behavioural" | "system_design",
    "prompt": "string",
    "code": "string (optional, only for code_walkthrough)",
    "codeLanguage": "string (optional)",
    "assesses": ["skill1", "skill2"],
    "suggestedSeconds": 90,
    "expectedKeyPoints": ["point 1", "point 2", "point 3", "point 4"]
  }
]

Do NOT include any text before or after the JSON array. Do NOT wrap in markdown code fences.`;

    const raw = await callZAIChat(
      config,
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.6, maxTokens: 2000 },
    );

    if (!raw) {
      const questions = fallbackQuestions(body.courseId, body.courseTitle);
      return NextResponse.json({ questions, fallback: true });
    }

    // Parse the JSON array out of the model's response (it sometimes wraps
    // in markdown fences despite the instruction not to)
    let cleaned = raw.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    }
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');
    if (start === -1 || end === -1) {
      const questions = fallbackQuestions(body.courseId, body.courseTitle);
      return NextResponse.json({ questions, fallback: true });
    }
    const jsonStr = cleaned.slice(start, end + 1);
    let parsed: Array<Omit<InterviewQuestion, 'id'>>;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      const questions = fallbackQuestions(body.courseId, body.courseTitle);
      return NextResponse.json({ questions, fallback: true });
    }

    // Assign IDs + sanitize
    const questions: InterviewQuestion[] = parsed.slice(0, 6).map((q, idx) => ({
      id: `q${idx + 1}`,
      type: (['conceptual', 'applied', 'code_walkthrough', 'behavioural', 'system_design'].includes(q.type)
        ? q.type
        : 'conceptual') as InterviewQuestion['type'],
      prompt: typeof q.prompt === 'string' ? q.prompt : '',
      code: typeof q.code === 'string' ? q.code : undefined,
      codeLanguage: typeof q.codeLanguage === 'string' ? q.codeLanguage : undefined,
      assesses: Array.isArray(q.assesses) ? q.assesses.slice(0, 5) : [],
      suggestedSeconds: typeof q.suggestedSeconds === 'number' ? q.suggestedSeconds : 90,
      expectedKeyPoints: Array.isArray(q.expectedKeyPoints) ? q.expectedKeyPoints.slice(0, 6) : [],
    }));

    if (questions.length === 0) {
      return NextResponse.json({
        questions: fallbackQuestions(body.courseId, body.courseTitle),
        fallback: true,
      });
    }

    return NextResponse.json({ questions });
  } catch (err) {
    console.error('Interview start API error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to generate interview questions', detail: message },
      { status: 500 },
    );
  }
}
