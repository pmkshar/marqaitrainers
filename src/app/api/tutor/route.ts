import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export const runtime = 'nodejs';

interface ChatRequestBody {
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  courseContext?: string;
}

const SYSTEM_PROMPT = `You are TutorAI, an expert software engineering instructor on a personalized learning platform.
You help students learn software development topics including: AI & Machine Learning, Full Stack Java, .NET, Mobile App Development (React Native), and Flutter.

Your teaching style:
- Be concise but thorough. Lead with the direct answer, then explain the "why".
- Use short code snippets (5-20 lines) with language tags when helpful.
- Prefer plain language; define jargon on first use.
- When a learner is confused, ask one clarifying question instead of dumping more information.
- Encourage best practices: testing, security, accessibility, and clean code.
- If a learner asks for the answer to a quiz, gently redirect them to reason through it themselves.
- Stay on the topic of software engineering and learning. Politely decline off-topic requests.

Keep responses focused. Use Markdown formatting (headings, lists, code blocks, bold) for readability.`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const messages = body.messages ?? [];

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided.' }, { status: 400 });
    }

    const zai = await ZAI.create();

    const contextualSystem = body.courseContext
      ? `${SYSTEM_PROMPT}\n\nThe learner is currently studying: ${body.courseContext}. Tailor examples to this course when relevant.`
      : SYSTEM_PROMPT;

    const fullMessages = [
      { role: 'assistant' as const, content: contextualSystem },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const completion = await zai.chat.completions.create({
      messages: fullMessages,
      temperature: 0.5,
      max_tokens: 1200,
      thinking: { type: 'disabled' },
    });

    const content = completion.choices[0]?.message?.content ?? 'Sorry, I could not generate a response.';

    return NextResponse.json({
      role: 'assistant',
      content,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error('Tutor API error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'The AI tutor is unavailable right now. Please try again in a moment.',
        detail: message,
      },
      { status: 500 }
    );
  }
}
