import { NextRequest, NextResponse } from 'next/server';
import { resolveZAIConfig, callZAIChat } from '@/lib/zai-config';
import type { InterviewReport, InterviewTurn, InterviewQuestion } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 90;

// ============================================================
// POST /api/interview/evaluate
// Body: {
//   courseId, courseTitle, candidateName,
//   questions: InterviewQuestion[],
//   turns: Array<{ questionId, questionPrompt, transcript, responseSeconds }>
// }
// Returns: { report: InterviewReport }
//
// Evaluates the candidate's transcribed answers + emits a structured
// report (per-turn scores, overall score, pass/fail, summary, recommendation).
// Pass threshold = 60.
// ============================================================

const PASS_THRESHOLD = 60;

interface EvaluateRequestBody {
  courseId: string;
  courseTitle: string;
  candidateName?: string;
  questions: InterviewQuestion[];
  turns: Array<{
    questionId: string;
    questionPrompt: string;
    transcript: string;
    responseSeconds: number;
  }>;
}

const SYSTEM_PROMPT = `You are a senior technical interviewer at marqaicourses evaluating a candidate's recorded interview answers. For each answer, you must:
1. Score it 0-100 based on technical accuracy, depth, and communication.
2. List which expected key points the candidate covered (coveredKeyPoints) and which they missed (missedKeyPoints).
3. Write 1-2 sentences of qualitative feedback.

Then produce an overall report with:
- overallScorePct (weighted average, longer questions weighted more)
- passed (true if overallScorePct >= 60)
- skillScores (map of skill -> 0-100 score, aggregated from the questions that assess that skill)
- strengths (3-5 short bullets)
- improvements (3-5 short bullets)
- summary (2-3 paragraph narrative)
- recommendation: "issue_certificate" | "retry_interview" | "fail"

Return ONLY a JSON object (no markdown, no prose before/after) with this shape:
{
  "turns": [
    {
      "questionId": "q1",
      "scorePct": 85,
      "feedback": "1-2 sentences",
      "coveredKeyPoints": ["point1", "point2"],
      "missedKeyPoints": ["point3"]
    }
  ],
  "overallScorePct": 78,
  "passed": true,
  "skillScores": { "Python Core": 88, "Web Development": 74 },
  "strengths": ["short bullet 1", "short bullet 2"],
  "improvements": ["short bullet 1", "short bullet 2"],
  "summary": "2-3 paragraph narrative string",
  "recommendation": "issue_certificate"
}`;

// ---------- Fallback evaluator (deterministic, used when ZAI is not configured) ----------
//
// Scores each answer by counting keyword matches against expected key points.
// Not as smart as an LLM, but always produces a usable report.

function keywordScore(transcript: string, expectedKeyPoints: string[]): {
  covered: string[];
  missed: string[];
  scorePct: number;
} {
  const lower = transcript.toLowerCase();
  const covered: string[] = [];
  const missed: string[] = [];
  for (const kp of expectedKeyPoints) {
    // Match if any 2+ word phrase from the key point appears, OR if the
    // key point is a single word and it (or a stem) appears.
    const words = kp.toLowerCase().split(/\s+/);
    let hit = false;
    if (words.length >= 2) {
      // Check if any 2-gram of the key point appears in the transcript
      for (let i = 0; i < words.length - 1; i++) {
        const bigram = `${words[i]} ${words[i + 1]}`;
        if (lower.includes(bigram)) {
          hit = true;
          break;
        }
      }
      // Also accept if all significant words (len > 3) appear
      if (!hit) {
        const significant = words.filter((w) => w.length > 3);
        if (significant.length > 0 && significant.every((w) => lower.includes(w))) {
          hit = true;
        }
      }
    } else if (words.length === 1 && words[0].length > 3) {
      // Single long word — check substring
      if (lower.includes(words[0])) hit = true;
    } else {
      // Short single word — require word-boundary match
      const re = new RegExp(`\\b${words[0]}\\b`, 'i');
      if (re.test(transcript)) hit = true;
    }
    if (hit) covered.push(kp);
    else missed.push(kp);
  }
  const total = expectedKeyPoints.length || 1;
  const scorePct = Math.round((covered.length / total) * 100);
  return { covered, missed, scorePct };
}

function fallbackEvaluate(body: EvaluateRequestBody): InterviewReport {
  const turns: InterviewTurn[] = body.turns.map((t) => {
    const q = body.questions.find((x) => x.id === t.questionId);
    const expected = q?.expectedKeyPoints ?? [];
    const { covered, missed, scorePct } = keywordScore(t.transcript, expected);
    // Penalty for empty / very short answers
    const wordCount = t.transcript.trim().split(/\s+/).filter(Boolean).length;
    const lengthAdj = wordCount < 10 ? -30 : wordCount < 25 ? -10 : 0;
    const finalScore = Math.max(0, Math.min(100, scorePct + lengthAdj));
    const feedback =
      wordCount < 10
        ? 'Answer was too short to demonstrate understanding. Try to elaborate with examples.'
        : missed.length === 0
        ? 'Excellent — covered all the key points clearly.'
        : `Covered ${covered.length} of ${expected.length} key points. Consider addressing: ${missed.slice(0, 2).join(', ')}.`;
    return {
      questionId: t.questionId,
      questionPrompt: t.questionPrompt,
      transcript: t.transcript,
      responseSeconds: t.responseSeconds,
      scorePct: finalScore,
      feedback,
      coveredKeyPoints: covered,
      missedKeyPoints: missed,
    };
  });

  // Overall = simple average of turn scores
  const overallScorePct = turns.length > 0
    ? Math.round(turns.reduce((s, t) => s + t.scorePct, 0) / turns.length)
    : 0;

  // Aggregate skill scores
  const skillBuckets: Record<string, number[]> = {};
  for (const t of turns) {
    const q = body.questions.find((x) => x.id === t.questionId);
    if (!q) continue;
    for (const skill of q.assesses.length > 0 ? q.assesses : ['General']) {
      if (!skillBuckets[skill]) skillBuckets[skill] = [];
      skillBuckets[skill].push(t.scorePct);
    }
  }
  const skillScores: Record<string, number> = {};
  for (const [skill, scores] of Object.entries(skillBuckets)) {
    skillScores[skill] = Math.round(scores.reduce((s, x) => s + x, 0) / scores.length);
  }

  const passed = overallScorePct >= PASS_THRESHOLD;
  const strengths: string[] = [];
  const improvements: string[] = [];
  for (const t of turns) {
    if (t.scorePct >= 80 && strengths.length < 5) {
      const q = body.questions.find((x) => x.id === t.questionId);
      strengths.push(`Strong answer on: ${q?.prompt.slice(0, 60) ?? t.questionId}…`);
    }
    if (t.scorePct < 60 && improvements.length < 5) {
      const q = body.questions.find((x) => x.id === t.questionId);
      improvements.push(`Review topic: ${q?.prompt.slice(0, 60) ?? t.questionId}…`);
    }
  }
  if (strengths.length === 0) strengths.push('Attempted all questions');
  if (improvements.length === 0) improvements.push('Aim for more concrete examples in your answers');

  const candidateName = body.candidateName ?? 'The candidate';
  const summary = `${candidateName} completed the AI interview for ${body.courseTitle} with an overall score of ${overallScorePct}%. ${
    turns.length
  } questions were asked, covering ${Object.keys(skillScores).length} skill area(s). ${
    passed
      ? 'The candidate demonstrated sufficient competence to be considered for certification.'
      : 'The candidate did not meet the pass threshold and should review the course material before retrying.'
  } The detailed per-question feedback below highlights specific strengths and areas for improvement. This report is generated by a deterministic evaluator (no LLM credentials configured on this deployment); for richer, qualitative feedback, set the ZAI_API_KEY environment variable.`;

  const recommendation: InterviewReport['recommendation'] = passed
    ? overallScorePct >= 80
      ? 'issue_certificate'
      : 'issue_certificate'
    : overallScorePct >= 45
    ? 'retry_interview'
    : 'fail';

  return {
    id: `ivr-${Date.now()}`,
    userId: '', // filled in by the caller
    courseId: body.courseId,
    courseTitle: body.courseTitle,
    startedAt: Date.now() - turns.reduce((s, t) => s + t.responseSeconds, 0) * 1000,
    completedAt: Date.now(),
    durationSeconds: turns.reduce((s, t) => s + t.responseSeconds, 0),
    status: 'completed',
    turns,
    overallScorePct,
    passed,
    skillScores,
    strengths,
    improvements,
    summary,
    recommendation,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as EvaluateRequestBody;
    if (!body.courseId || !body.questions || !body.turns) {
      return NextResponse.json(
        { error: 'courseId, questions, and turns are required' },
        { status: 400 },
      );
    }
    if (!Array.isArray(body.questions) || !Array.isArray(body.turns)) {
      return NextResponse.json(
        { error: 'questions and turns must be arrays' },
        { status: 400 },
      );
    }

    const config = await resolveZAIConfig();

    // -------- Fallback: deterministic evaluator --------
    if (!config) {
      const report = fallbackEvaluate(body);
      return NextResponse.json({ report, fallback: true });
    }

    // -------- LLM: qualitative evaluation --------
    const turnsDigest = body.turns
      .map((t, i) => {
        const q = body.questions.find((x) => x.id === t.questionId);
        return `--- Q${i + 1} (${q?.type ?? 'conceptual'}) [assesses: ${(q?.assesses ?? []).join(', ')}] ---
Question: ${t.questionPrompt}
Expected key points: ${(q?.expectedKeyPoints ?? []).join(' | ')}
Candidate's transcribed answer (${t.responseSeconds}s, ${t.transcript.split(/\s+/).filter(Boolean).length} words):
"${t.transcript}"`;
      })
      .join('\n\n');

    const userPrompt = `Course: ${body.courseTitle} (${body.courseId})
Candidate: ${body.candidateName ?? 'Anonymous'}

Interview transcript:
${turnsDigest}

Evaluate this interview. Return ONLY a JSON object with this exact shape:
{
  "turns": [
    { "questionId": "q1", "scorePct": 85, "feedback": "1-2 sentences", "coveredKeyPoints": ["..."], "missedKeyPoints": ["..."] }
  ],
  "overallScorePct": 78,
  "passed": true,
  "skillScores": { "Skill1": 80, "Skill2": 70 },
  "strengths": ["short bullet 1", "short bullet 2", "short bullet 3"],
  "improvements": ["short bullet 1", "short bullet 2", "short bullet 3"],
  "summary": "2-3 paragraph narrative",
  "recommendation": "issue_certificate" | "retry_interview" | "fail"
}

Pass threshold is 60. Do NOT include any markdown or prose outside the JSON.`;

    const raw = await callZAIChat(
      config,
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.3, maxTokens: 2500 },
    );

    if (!raw) {
      const report = fallbackEvaluate(body);
      return NextResponse.json({ report, fallback: true });
    }

    // Parse the JSON object
    let cleaned = raw.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    }
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) {
      const report = fallbackEvaluate(body);
      return NextResponse.json({ report, fallback: true });
    }
    const jsonStr = cleaned.slice(start, end + 1);
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      const report = fallbackEvaluate(body);
      return NextResponse.json({ report, fallback: true });
    }

    // Build the InterviewReport from the LLM's JSON
    const turns: InterviewTurn[] = body.turns.map((t) => {
      const llmTurn = (parsed.turns as Array<Record<string, unknown>> | undefined)?.find(
        (x) => x.questionId === t.questionId,
      );
      const q = body.questions.find((x) => x.id === t.questionId);
      // If the LLM skipped a turn, score it via the fallback keyword matcher
      if (!llmTurn) {
        const { covered, missed, scorePct } = keywordScore(t.transcript, q?.expectedKeyPoints ?? []);
        return {
          questionId: t.questionId,
          questionPrompt: t.questionPrompt,
          transcript: t.transcript,
          responseSeconds: t.responseSeconds,
          scorePct,
          feedback: 'Evaluation unavailable from LLM; keyword-based score applied.',
          coveredKeyPoints: covered,
          missedKeyPoints: missed,
        };
      }
      return {
        questionId: t.questionId,
        questionPrompt: t.questionPrompt,
        transcript: t.transcript,
        responseSeconds: t.responseSeconds,
        scorePct: typeof llmTurn.scorePct === 'number' ? Math.max(0, Math.min(100, llmTurn.scorePct)) : 0,
        feedback: typeof llmTurn.feedback === 'string' ? llmTurn.feedback : '',
        coveredKeyPoints: Array.isArray(llmTurn.coveredKeyPoints) ? (llmTurn.coveredKeyPoints as string[]) : [],
        missedKeyPoints: Array.isArray(llmTurn.missedKeyPoints) ? (llmTurn.missedKeyPoints as string[]) : [],
      };
    });

    const overallScorePct =
      typeof parsed.overallScorePct === 'number'
        ? Math.max(0, Math.min(100, Math.round(parsed.overallScorePct)))
        : Math.round(turns.reduce((s, t) => s + t.scorePct, 0) / Math.max(1, turns.length));

    const passed =
      typeof parsed.passed === 'boolean' ? parsed.passed : overallScorePct >= PASS_THRESHOLD;

    const skillScores: Record<string, number> =
      (parsed.skillScores as Record<string, number> | undefined) ?? {};

    const strengths: string[] = Array.isArray(parsed.strengths)
      ? (parsed.strengths as string[]).slice(0, 6)
      : [];
    const improvements: string[] = Array.isArray(parsed.improvements)
      ? (parsed.improvements as string[]).slice(0, 6)
      : [];

    const summary: string =
      typeof parsed.summary === 'string'
        ? parsed.summary
        : `${body.candidateName ?? 'The candidate'} completed the AI interview for ${body.courseTitle} with an overall score of ${overallScorePct}%.`;

    const recommendation: InterviewReport['recommendation'] =
      parsed.recommendation === 'issue_certificate' ||
      parsed.recommendation === 'retry_interview' ||
      parsed.recommendation === 'fail'
        ? parsed.recommendation
        : passed
        ? 'issue_certificate'
        : overallScorePct >= 45
        ? 'retry_interview'
        : 'fail';

    const report: InterviewReport = {
      id: `ivr-${Date.now()}`,
      userId: '',
      courseId: body.courseId,
      courseTitle: body.courseTitle,
      startedAt: Date.now() - turns.reduce((s, t) => s + t.responseSeconds, 0) * 1000,
      completedAt: Date.now(),
      durationSeconds: turns.reduce((s, t) => s + t.responseSeconds, 0),
      status: 'completed',
      turns,
      overallScorePct,
      passed,
      skillScores,
      strengths,
      improvements,
      summary,
      recommendation,
    };

    return NextResponse.json({ report });
  } catch (err) {
    console.error('Interview evaluate API error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to evaluate interview', detail: message },
      { status: 500 },
    );
  }
}
