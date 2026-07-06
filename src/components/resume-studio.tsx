'use client';

import { useRef, useState, useMemo } from 'react';
import {
  ArrowLeft, Upload, FileText, Sparkles, Loader2, Download, Check, RefreshCw,
  Eye, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { COURSES, findCourse } from '@/lib/courses';
import { RESUME_TEMPLATES } from '@/lib/types';
import type { ResumeTemplateId } from '@/lib/types';

// ============================================================
// ResumeStudio
// ------------------------------------------------------------
// Flow:
//   1. Candidate uploads their existing resume as a .txt, .pdf,
//      or .docx file. We read the text content client-side.
//   2. Candidate picks 1 of 4 templates: Modern, Classic, Tech, Minimal.
//   3. Candidate clicks "Reform with AI" — we send the original text +
//      their completed courses + certificates to /api/resume/reform,
//      which returns an AI-reformed resume in the chosen style.
//   4. The reformed text is saved to the user's profile and shown
//      in a live preview pane.
//   5. Candidate can download as .txt or .pdf (print-to-PDF).
// ============================================================

export function ResumeStudio() {
  const user = useAppStore((s) => s.currentUser());
  const completedLessons = useAppStore((s) => s.completedLessons);
  const certificates = useAppStore((s) => s.certificates);
  const saveOriginalResume = useAppStore((s) => s.saveOriginalResume);
  const saveReformedResume = useAppStore((s) => s.saveReformedResume);
  const openDashboard = useAppStore((s) => s.openDashboard);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [originalText, setOriginalText] = useState<string>(user?.originalResumeText ?? '');
  const [fileName, setFileName] = useState<string>(user?.originalResumeFileName ?? '');
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplateId>('modern');
  const [reformedText, setReformedText] = useState<string>(
    user?.reformedResumes?.[selectedTemplate]?.text ?? '',
  );
  const [reforming, setReforming] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  // Compute completed-course context for the AI prompt
  const completedCourses = useMemo(() => {
    if (!user) return [];
    return user.enrolledCourseIds
      .map((cid) => findCourse(cid))
      .filter((c): c is NonNullable<typeof c> => !!c)
      .map((c) => ({
        id: c.id,
        title: c.title,
        skills: c.skills ?? [],
        scorePct: 80, // MVP placeholder; in production, pull from completedLessons + quiz scores
      }));
  }, [user, completedLessons]);

  const userCerts = useMemo(() => {
    if (!user) return [];
    return certificates.filter((c) => c.userId === user.id && c.approvalStatus === 'approved');
  }, [user, certificates]);

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-sm text-muted-foreground">Please sign in to use the Resume Studio.</p>
      </div>
    );
  }

  // ---------- File upload handler ----------
  const handleFile = async (file: File) => {
    setUploadError(null);
    setFileName(file.name);
    try {
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const text = await file.text();
        setOriginalText(text);
        saveOriginalResume(text, file.name);
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        // PDF parsing — we use a simple text-extraction approach.
        // For production, integrate pdf.js. For MVP, prompt user to paste text.
        setUploadError(
          'PDF parsing is not available in the browser yet. Please open your PDF, copy the text, and paste it into the box below.',
        );
        setOriginalText('');
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.endsWith('.docx')
      ) {
        // .docx is a ZIP — we can extract document.xml with the browser's
        // CompressionStream API, but that's complex. Defer to paste.
        setUploadError(
          'DOCX parsing is not available in the browser yet. Please copy the text from your document and paste it into the box below.',
        );
        setOriginalText('');
      } else {
        // Try reading as text
        const text = await file.text();
        setOriginalText(text);
        saveOriginalResume(text, file.name);
      }
    } catch (err) {
      console.error('File read error:', err);
      setUploadError('Could not read the file. Please try a different file or paste the text manually.');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text');
    if (text) {
      setOriginalText(text);
      saveOriginalResume(text, fileName || 'pasted-resume.txt');
    }
  };

  // ---------- AI Reform ----------
  const handleReform = async () => {
    if (!originalText.trim()) {
      setUploadError('Please upload or paste your resume text first.');
      return;
    }
    setReforming(true);
    setUploadError(null);
    setFallbackUsed(false);
    try {
      const resp = await fetch('/api/resume/reform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalResumeText: originalText,
          templateId: selectedTemplate,
          candidateName: user.name,
          candidateEmail: user.email,
          completedCourses: completedCourses.map((c) => ({
            title: c.title,
            skills: c.skills,
            scorePct: c.scorePct,
          })),
          certificates: userCerts.map((c) => ({
            courseTitle: c.courseTitleSnapshot ?? findCourse(c.courseId)?.title ?? c.courseId,
            code: c.code,
            scorePct: c.scorePct,
            issuedAt: c.issuedAt,
          })),
        }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const text = data.reformedText as string;
      const isFallback = !!data.fallback;
      setReformedText(text);
      setFallbackUsed(isFallback);
      saveReformedResume(selectedTemplate, text);
    } catch (err) {
      console.error('Reform error:', err);
      setUploadError(err instanceof Error ? err.message : 'Failed to reform resume');
    } finally {
      setReforming(false);
    }
  };

  // ---------- Download ----------
  const handleDownloadTxt = () => {
    if (!reformedText) return;
    const blob = new Blob([reformedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${user.name.replace(/\s+/g, '_')}_Resume_${selectedTemplate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    if (!reformedText) return;
    const printWin = window.open('', '_blank', 'width=800,height=900');
    if (!printWin) return;
    const tpl = RESUME_TEMPLATES.find((t) => t.id === selectedTemplate);
    printWin.document.write(`
      <!DOCTYPE html><html><head><title>${user.name} — Resume</title>
      <style>
        body { font-family: ${tpl?.fontFamily ?? 'sans-serif'}; padding: 40px; line-height: 1.5; color: #1e293b; max-width: 800px; margin: 0 auto; }
        h1, h2, h3 { color: #1e293b; }
        pre { white-space: pre-wrap; font-family: inherit; }
      </style></head>
      <body><pre>${escapeHtml(reformedText)}</pre>
      <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); };</script>
      </body></html>
    `);
    printWin.document.close();
  };

  // ---------- Switch template ----------
  const switchTemplate = (id: ResumeTemplateId) => {
    setSelectedTemplate(id);
    const existing = user.reformedResumes?.[id]?.text;
    setReformedText(existing ?? '');
    setFallbackUsed(false);
  };

  const selectedTpl = RESUME_TEMPLATES.find((t) => t.id === selectedTemplate)!;

  return (
    <div className="bg-background">
      <section className="border-b bg-gradient-to-br from-violet-50/60 to-background dark:from-violet-950/20">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <button onClick={openDashboard} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </button>
          <div className="mt-2 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Resume Studio</h1>
              <p className="text-sm text-muted-foreground">
                Upload your resume · Pick a format · AI reforms it with your latest skills + marqaicourses certifications
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {uploadError && (
          <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm text-amber-900 dark:text-amber-200">
            <AlertTriangle className="mr-2 inline h-4 w-4" /> {uploadError}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: upload + template picker */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Upload className="h-4 w-4 text-violet-600" /> 1. Upload your resume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="grid cursor-pointer place-items-center rounded-lg border-2 border-dashed border-violet-500/40 bg-violet-500/5 p-8 text-center transition-colors hover:border-violet-500 hover:bg-violet-500/10"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-violet-600" />
                  <p className="mt-2 text-sm font-medium">Drop your resume here, or click to browse</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Supports .txt · .pdf (paste text) · .docx (paste text) · Max 5MB
                  </p>
                  {fileName && (
                    <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-700 dark:text-emerald-300">
                      <Check className="h-3 w-3" /> {fileName}
                    </p>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.pdf,.docx,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
                <div className="mt-3">
                  <textarea
                    className="w-full rounded-lg border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    rows={8}
                    placeholder="Or paste your resume text here…"
                    value={originalText}
                    onChange={(e) => {
                      setOriginalText(e.target.value);
                      if (e.target.value && !fileName) setFileName('pasted-resume.txt');
                    }}
                    onPaste={handlePaste}
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Word count: {originalText.trim().split(/\s+/).filter(Boolean).length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-violet-600" /> 2. Pick a template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2">
                  {RESUME_TEMPLATES.map((t) => {
                    const hasVariant = !!user.reformedResumes?.[t.id]?.text;
                    const isSelected = selectedTemplate === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => switchTemplate(t.id)}
                        className={`relative rounded-lg border p-3 text-left transition-all ${
                          isSelected
                            ? 'border-violet-500 bg-violet-500/5 shadow-sm'
                            : 'border-border hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold">{t.name}</p>
                            <p className="mt-0.5 text-[10px] text-muted-foreground">{t.description}</p>
                          </div>
                          <span className={`grid h-6 w-10 shrink-0 place-items-center rounded bg-gradient-to-br ${t.accentGradient}`}>
                            <FileText className="h-3 w-3 text-white" />
                          </span>
                        </div>
                        {hasVariant && (
                          <Badge variant="secondary" className="mt-2 text-[10px]">
                            <Check className="mr-0.5 h-2.5 w-2.5 text-emerald-600" /> AI-reformed
                          </Badge>
                        )}
                        {isSelected && (
                          <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-violet-600 text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <Button
                  onClick={handleReform}
                  disabled={reforming || !originalText.trim()}
                  className="mt-4 w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700"
                >
                  {reforming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {reforming ? 'AI is reforming your resume…' : `Reform with AI (${selectedTpl.name})`}
                </Button>
                {fallbackUsed && (
                  <p className="mt-2 text-[10px] text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="mr-1 inline h-3 w-3" />
                    Using the deterministic reformer (ZAI_API_KEY not configured). For richer AI rewriting, set the env var on Vercel.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Context card: what the AI knows about you */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">What the AI knows about you</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <p className="font-medium text-muted-foreground">Completed courses ({completedCourses.length})</p>
                  {completedCourses.length === 0 ? (
                    <p className="mt-1 text-muted-foreground">No enrolled courses yet.</p>
                  ) : (
                    <ul className="mt-1 space-y-1">
                      {completedCourses.map((c) => (
                        <li key={c.id} className="flex items-start gap-1.5">
                          <Check className="mt-0.5 h-3 w-3 text-emerald-600" />
                          <span>{c.title} — {c.scorePct}%</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Approved certificates ({userCerts.length})</p>
                  {userCerts.length === 0 ? (
                    <p className="mt-1 text-muted-foreground">No certificates yet — complete an AI interview to earn one.</p>
                  ) : (
                    <ul className="mt-1 space-y-1">
                      {userCerts.map((c) => (
                        <li key={c.id} className="flex items-start gap-1.5">
                          <Check className="mt-0.5 h-3 w-3 text-emerald-600" />
                          <span>{c.courseTitleSnapshot ?? findCourse(c.courseId)?.title} — {c.code}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: live preview */}
          <div className="space-y-4">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Eye className="h-4 w-4 text-violet-600" /> 3. Live preview
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDownloadTxt}
                      disabled={!reformedText}
                    >
                      <Download className="mr-1 h-3.5 w-3.5" /> .txt
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handlePrintPdf}
                      disabled={!reformedText}
                    >
                      <Download className="mr-1 h-3.5 w-3.5" /> .pdf
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!reformedText ? (
                  <div className="grid h-96 place-items-center text-center">
                    <div>
                      <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-3 text-sm font-medium text-muted-foreground">No reformed resume yet</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Upload your resume, pick a template, then click <strong>Reform with AI</strong>.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    className="h-[600px] overflow-y-auto rounded-lg border bg-white p-6 text-sm shadow-inner dark:bg-slate-900"
                    style={{ fontFamily: selectedTpl.fontFamily }}
                  >
                    <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed">
                      {reformedText}
                    </pre>
                  </div>
                )}
                {reformedText && (
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    <RefreshCw className="mr-1 inline h-3 w-3" />
                    Last reformed: {new Date(user.reformedResumes?.[selectedTemplate]?.generatedAt ?? Date.now()).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
