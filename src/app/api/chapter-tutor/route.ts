import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface TeachRequestBody {
  mode: 'teach' | 'answer_question';
  courseId: string;
  courseContext: string;
  lessonTitle: string;
  slideTitle: string;
  slideContent: string;
  slideCode?: string;
  codeLanguage?: string;
  studentQuestion?: string;
}

// =============================================================================
// Rule-based teaching content generator
// =============================================================================
// Generates explanation, example, pitfall, and a check question for any slide.
// Uses the slide content itself to create meaningful teaching material.

interface TeachingResponse {
  explanation: string;
  example: string;
  pitfall: string;
  checkQuestion: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
}

function generateTeachingContent(body: TeachRequestBody): TeachingResponse {
  const { slideTitle, slideContent, slideCode, codeLanguage } = body;
  const hasCode = !!slideCode;

  const explanation = `Let me break down **${slideTitle}** for you.\n\n${slideContent}\n\n${
    hasCode
      ? `The code example above demonstrates this concept in ${codeLanguage || 'the given language'}. Pay close attention to how the key logic is structured — each part serves a specific purpose in making the solution work correctly.`
      : `This is a foundational concept that you'll use throughout your software engineering career. The key is understanding not just the "what" but the "why" behind it.`
  }\n\nWhen you understand the reasoning, you can apply the same pattern to new problems you haven't seen before.`;

  const example = `**Real-world scenario:** Imagine you're building a production application and you encounter a situation involving ${slideTitle.toLowerCase()}.\n\n${
    hasCode
      ? `For instance, in a real codebase, you might write something like:\n\`\`\`${codeLanguage || ''}\n// Production implementation of ${slideTitle}\n${slideCode}\n\`\`\`\n\nThe key difference between the learning example and production code is error handling, edge cases, and testing. In practice, you'd wrap this in try-catch blocks, add input validation, and write unit tests.`
      : `In practice, teams often apply ${slideTitle.toLowerCase()} by starting with the simplest approach, then refactoring as requirements evolve. The best engineers iterate quickly and test often.`
  }`;

  const pitfall = `**Watch out!** A common mistake with ${slideTitle.toLowerCase()} is ${
    hasCode
      ? `copying the code without understanding each line. If you just memorize the syntax without grasping the logic, you'll struggle when the problem changes even slightly.`
      : `thinking you understand it after reading about it once. True understanding comes from practice — write code, break things, debug, and fix them.`
  }\n\nAnother pitfall: not considering edge cases. What happens when the input is empty? What if the value is null? What if the network is slow? Always think about failure modes.`;

  // Generate contextual check question
  const questionOptions = [
    `What is the main purpose of ${slideTitle.toLowerCase()}?`,
    `Which best describes ${slideTitle.toLowerCase()}?`,
    `What is the key takeaway from ${slideTitle}?`,
  ];
  const question = questionOptions[Math.floor(slideTitle.length % questionOptions.length)];

  const optA = `It provides a structured way to handle this specific problem in software development`;
  const optB = `It is only used in rare edge cases and is not commonly needed`;
  const optC = `It replaces the need for any other technique or pattern`;
  const optD = `It is a deprecated approach that should be avoided in modern code`;

  return {
    explanation,
    example,
    pitfall,
    checkQuestion: {
      question,
      options: [optA, optB, optC, optD],
      correctAnswer: 0,
      explanation: `The correct answer highlights that ${slideTitle.toLowerCase()} provides a structured, proven approach. The other options are incorrect because: (B) this is not a rare technique, (C) it doesn't replace all other approaches — it complements them, and (D) it is not deprecated — it's widely used in modern software development.`,
    },
  };
}

function generateAnswer(body: TeachRequestBody): string {
  const { studentQuestion, slideTitle, slideContent } = body;

  return `Great question about **${slideTitle}**!\n\nYou asked: *"${studentQuestion}"*\n\nBased on what we've covered: ${slideContent}\n\nHere's a more detailed explanation:\n\nThe key thing to understand is that ${slideTitle.toLowerCase()} works by breaking down the problem into manageable parts. Think of it like building blocks — each piece serves a purpose, and together they create a complete solution.\n\nIf you're still unsure, try this: re-read the explanation above, then try to explain it in your own words. If you can explain it simply, you truly understand it. If not, that's a sign to revisit the fundamentals.\n\nFeel free to ask more questions — I'm here to help!`;
}

// =============================================================================
// ZAI LLM-powered teaching (when API key is configured)
// =============================================================================

async function resolveZAIConfig() {
  const envKey = process.env.ZAI_API_KEY;
  const envBase = process.env.ZAI_BASE_URL;
  if (envKey && envBase) return { baseUrl: envBase, apiKey: envKey };
  if (envKey) return { baseUrl: 'https://api.z.ai/api/paas/v4', apiKey: envKey };

  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const os = await import('os');
    const candidates = [
      path.join(process.cwd(), '.z-ai-config'),
      path.join(os.default.homedir(), '.z-ai-config'),
      '/etc/.z-ai-config',
    ];
    for (const p of candidates) {
      try {
        const raw = await fs.default.readFile(p, 'utf-8');
        const cfg = JSON.parse(raw);
        if (cfg.baseUrl && cfg.apiKey) return cfg;
      } catch { /* skip */ }
    }
  } catch { /* fs unavailable */ }

  return null;
}

async function generateAITeaching(body: TeachRequestBody): Promise<TeachingResponse | null> {
  const config = await resolveZAIConfig();
  if (!config) return null;

  const systemPrompt = `You are TutorAI, an expert software engineering instructor. Generate a JSON teaching response for the given slide content.

You MUST respond with ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "explanation": "Detailed explanation of the concept in 3-5 sentences. Use markdown formatting for emphasis.",
  "example": "A real-world practical example with a short code snippet if applicable. Use markdown.",
  "pitfall": "A common mistake developers make with this concept and how to avoid it. Use markdown.",
  "checkQuestion": {
    "question": "A comprehension question to check if the student understood the material",
    "options": ["Correct answer", "Plausible wrong answer 1", "Plausible wrong answer 2", "Plausible wrong answer 3"],
    "correctAnswer": 0,
    "explanation": "Why the correct answer is right and the others are wrong"
  }
}`;

  const userPrompt = body.mode === 'teach'
    ? `Course: ${body.courseContext}\nLesson: ${body.lessonTitle}\nSlide: ${body.slideTitle}\nContent: ${body.slideContent}\n${body.slideCode ? `Code (${body.codeLanguage || ''}):\n${body.slideCode}` : ''}\n\nGenerate the teaching content for this slide.`
    : `Course: ${body.courseContext}\nLesson: ${body.lessonTitle}\nSlide: ${body.slideTitle}\nContent: ${body.slideContent}\nStudent asks: ${body.studentQuestion}\n\nAnswer the student's question in a helpful, educational way.`;

  try {
    const url = `${config.baseUrl.replace(/\/$/, '')}/chat/completions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
        'X-Z-AI-From': 'Z',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 2000,
        thinking: { type: 'disabled' },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;

    // Try to parse JSON from the response
    try {
      // Strip markdown code fences if present
      let jsonStr = content.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      return JSON.parse(jsonStr);
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TeachRequestBody;

    if (!body.mode || !body.slideTitle) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    if (body.mode === 'answer_question') {
      // Try AI first, fall back to rule-based
      const aiConfig = await resolveZAIConfig();
      if (aiConfig) {
        try {
          const url = `${aiConfig.baseUrl.replace(/\/$/, '')}/chat/completions`;
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${aiConfig.apiKey}`,
              'X-Z-AI-From': 'Z',
            },
            body: JSON.stringify({
              messages: [
                {
                  role: 'system',
                  content: `You are TutorAI, an expert software engineering instructor for the course "${body.courseContext}". Answer the student's question clearly and helpfully. Use markdown formatting. Keep it concise but thorough.`,
                },
                {
                  role: 'user',
                  content: `We're studying "${body.slideTitle}" in lesson "${body.lessonTitle}".\n\nSlide content: ${body.slideContent}\n\nStudent asks: ${body.studentQuestion}`,
                },
              ],
              temperature: 0.4,
              max_tokens: 1000,
              thinking: { type: 'disabled' },
            }),
          });
          if (response.ok) {
            const data = await response.json();
            const content = data?.choices?.[0]?.message?.content;
            if (content) {
              return NextResponse.json({ content });
            }
          }
        } catch { /* fall through */ }
      }
      return NextResponse.json({ content: generateAnswer(body) });
    }

    // mode === 'teach'
    // Try AI-powered generation first
    const aiTeaching = await generateAITeaching(body);
    if (aiTeaching && aiTeaching.explanation && aiTeaching.checkQuestion) {
      return NextResponse.json(aiTeaching);
    }

    // Fall back to rule-based generation
    return NextResponse.json(generateTeachingContent(body));
  } catch (err) {
    console.error('Chapter tutor API error:', err);
    return NextResponse.json(
      { error: 'Failed to generate teaching content.' },
      { status: 500 },
    );
  }
}
