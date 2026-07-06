import { NextRequest, NextResponse } from 'next/server';
import { resolveZAIConfig, callZAIChat } from '@/lib/zai-config';
import { RESUME_TEMPLATES } from '@/lib/types';
import type { ResumeTemplateId } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ============================================================
// POST /api/resume/reform
// Body: {
//   originalResumeText: string,
//   templateId: ResumeTemplateId,
//   candidateName, candidateEmail,
//   completedCourses: Array<{ title: string; skills: string[]; scorePct: number }>,
//   certificates: Array<{ courseTitle: string; code: string; scorePct: number; issuedAt: number }>
// }
// Returns: { reformedText: string }
//
// Calls the LLM to rewrite the candidate's uploaded resume in the
// chosen template style, augmented with their newly-acquired skills
// and marqaicourses certifications.
// ============================================================

interface ReformRequestBody {
  originalResumeText: string;
  templateId: ResumeTemplateId;
  candidateName: string;
  candidateEmail?: string;
  completedCourses?: Array<{ title: string; skills: string[]; scorePct: number }>;
  certificates?: Array<{ courseTitle: string; code: string; scorePct: number; issuedAt: number }>;
}

function buildSystemPrompt(styleHint: string): string {
  return `You are an expert resume writer who rewrites candidate resumes to maximize hiring outcomes. You are given the candidate's original resume text plus a list of courses they completed on the marqaicourses online courses platform (with associated skills and certification scores).

Your job: produce a single, ready-to-use resume in PLAIN TEXT (not HTML, not Markdown) using a ${styleHint}. The resume MUST:

1. Open with the candidate's name and contact info at the top.
2. Include a 2-3 line professional summary that reflects their training and target role.
3. List skills as chips / comma-separated tags, derived from BOTH the original resume AND the marqaicourses course skills (deduplicate, prioritise the most relevant).
4. Include a "Certifications" section listing each marqaicourses certificate with: course title, "marqaicourses", score %, validation code, issue date.
5. Include a "marqaicourses Training" section listing each completed course with: title, skills covered, score %.
6. Preserve the candidate's prior work experience, education, and projects from the original resume — but rephrase for impact (action verbs, quantified outcomes where possible).
7. Use clear section headers (uppercase, on their own line).
8. Be honest — do not invent jobs, degrees, or skills the candidate did not mention.
9. Use plain text only (no Markdown asterisks, no HTML tags). Section headers on their own line, items on subsequent lines with a leading "• ".

Return ONLY the resume text. No preamble, no postamble, no code fences.`;
}

function fallbackReform(body: ReformRequestBody): string {
  const tpl = RESUME_TEMPLATES.find((t) => t.id === body.templateId);
  const styleHint = tpl?.styleHint ?? 'modern layout';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { year: 'numeric', month: 'short' });

  const skillsSet = new Set<string>();
  // Extract skills from completed courses
  for (const c of body.completedCourses ?? []) {
    for (const s of c.skills) skillsSet.add(s);
  }
  // Also try to extract skills from the original resume text (simple heuristic:
  // look for the "Skills" section)
  const skillsMatch = body.originalResumeText.match(/skills?\s*[:\-\n]([\s\S]{0,500}?)(?:\n\n|\n[A-Z]|\Z)/i);
  if (skillsMatch) {
    const tokens = skillsMatch[1]
      .split(/[,\n•|]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 40);
    for (const t of tokens) skillsSet.add(t);
  }
  const skills = Array.from(skillsSet).slice(0, 16);

  const certs = body.certificates ?? [];
  const courses = body.completedCourses ?? [];

  // Style-specific formatting
  const SEP = '─'.repeat(60);
  const lines: string[] = [];
  if (body.templateId === 'classic' || body.templateId === 'minimal') {
    lines.push(body.candidateName.toUpperCase());
    if (body.candidateEmail) lines.push(body.candidateEmail);
    lines.push('');
    lines.push('PROFESSIONAL SUMMARY');
    lines.push(SEP);
    lines.push(`A motivated software engineer with practical training from marqaicourses in ${courses.length} course(s)${certs.length > 0 ? ` and ${certs.length} industry-recognized certification(s)` : ''}. Skilled in ${skills.slice(0, 6).join(', ')}. Eager to apply structured, project-based learning to real-world engineering teams.`);
    lines.push('');
    if (skills.length > 0) {
      lines.push('SKILLS');
      lines.push(SEP);
      lines.push(skills.join(' • '));
      lines.push('');
    }
    if (certs.length > 0) {
      lines.push('CERTIFICATIONS');
      lines.push(SEP);
      for (const c of certs) {
        lines.push(`• ${c.courseTitle} — marqaicourses`);
        lines.push(`  Score: ${c.scorePct}% · Code: ${c.code} · Issued: ${new Date(c.issuedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}`);
      }
      lines.push('');
    }
    if (courses.length > 0) {
      lines.push('MARQAICOURSES TRAINING');
      lines.push(SEP);
      for (const c of courses) {
        lines.push(`• ${c.title} — ${c.scorePct}% score`);
        if (c.skills.length > 0) lines.push(`  Skills: ${c.skills.join(', ')}`);
      }
      lines.push('');
    }
    // Echo original experience
    lines.push('EXPERIENCE & EDUCATION (from uploaded resume)');
    lines.push(SEP);
    lines.push(body.originalResumeText.trim());
  } else {
    // Modern / Tech — slightly more visual layout
    lines.push(`▌ ${body.candidateName}`);
    if (body.candidateEmail) lines.push(`  ${body.candidateEmail}`);
    lines.push('');
    lines.push('► PROFESSIONAL SUMMARY');
    lines.push(body.candidateName + ' is a software engineer with hands-on training from marqaicourses. Completed ' + courses.length + ' structured course(s)' + (certs.length > 0 ? ` and earned ${certs.length} certification(s)` : '') + '. Strengths: ' + skills.slice(0, 6).join(', ') + '.');
    lines.push('');
    if (skills.length > 0) {
      lines.push('► SKILLS');
      lines.push(skills.map((s) => `[${s}]`).join(' '));
      lines.push('');
    }
    if (certs.length > 0) {
      lines.push('► CERTIFICATIONS');
      for (const c of certs) {
        lines.push(`★ ${c.courseTitle}`);
        lines.push(`  marqaicourses · ${c.scorePct}% · ${c.code} · ${new Date(c.issuedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}`);
      }
      lines.push('');
    }
    if (courses.length > 0) {
      lines.push('► MARQAICOURSES TRAINING');
      for (const c of courses) {
        lines.push(`▸ ${c.title} — ${c.scorePct}% score`);
        if (c.skills.length > 0) lines.push(`  Skills: ${c.skills.join(', ')}`);
      }
      lines.push('');
    }
    lines.push('► EXPERIENCE & EDUCATION (from uploaded resume)');
    lines.push(body.originalResumeText.trim());
  }

  // Fallback note appended for transparency
  lines.push('');
  lines.push(`— Generated by marqaicourses Resume Studio (${tpl?.name ?? 'Template'} · ${styleHint}) on ${dateStr}. Deterministic fallback used (no LLM credentials configured).`);

  return lines.join('\n');
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ReformRequestBody;
    if (!body.originalResumeText || !body.templateId) {
      return NextResponse.json(
        { error: 'originalResumeText and templateId are required' },
        { status: 400 },
      );
    }
    const tpl = RESUME_TEMPLATES.find((t) => t.id === body.templateId);
    if (!tpl) {
      return NextResponse.json(
        { error: `Unknown templateId. Valid: ${RESUME_TEMPLATES.map((t) => t.id).join(', ')}` },
        { status: 400 },
      );
    }

    const config = await resolveZAIConfig();

    // -------- Fallback: deterministic rewriter --------
    if (!config) {
      const reformedText = fallbackReform(body);
      return NextResponse.json({ reformedText, fallback: true });
    }

    // -------- LLM: qualitative rewrite --------
    const coursesDigest = (body.completedCourses ?? [])
      .map((c, i) => `${i + 1}. ${c.title} — score ${c.scorePct}%, skills: ${c.skills.join(', ')}`)
      .join('\n');
    const certsDigest = (body.certificates ?? [])
      .map((c, i) => `${i + 1}. ${c.courseTitle} — marqaicourses, score ${c.scorePct}%, code ${c.code}, issued ${new Date(c.issuedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}`)
      .join('\n');

    const userPrompt = `Candidate name: ${body.candidateName}
Candidate email: ${body.candidateEmail ?? '(not provided)'}

ORIGINAL RESUME TEXT (uploaded by candidate):
"""
${body.originalResumeText}
"""

COMPLETED MARQAICOURSES COURSES:
${coursesDigest || '(none)'}

MARQAICOURSES CERTIFICATES:
${certsDigest || '(none)'}

Rewrite the resume using a ${tpl.styleHint}. Return ONLY the resume plain text — no Markdown, no HTML, no preamble.`;

    const raw = await callZAIChat(
      config,
      [
        { role: 'system', content: buildSystemPrompt(tpl.styleHint) },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.4, maxTokens: 1800 },
    );

    if (!raw) {
      const reformedText = fallbackReform(body);
      return NextResponse.json({ reformedText, fallback: true });
    }

    // Strip any accidental markdown fences
    let cleaned = raw.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:text|plain)?\s*/i, '').replace(/\s*```$/i, '');
    }

    return NextResponse.json({ reformedText: cleaned });
  } catch (err) {
    console.error('Resume reform API error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to reform resume', detail: message },
      { status: 500 },
    );
  }
}
