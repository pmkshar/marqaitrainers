'use client';

import { useRef, useState } from 'react';
import {
  Award, Download, Share2, Loader2, AlertTriangle, CheckCircle2, XCircle,
  Clock, ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { findCourse } from '@/lib/courses';
import type { Certificate } from '@/lib/types';

// ============================================================
// CertificateDisplay — fully graphical certificate
// ------------------------------------------------------------
// Renders a high-fidelity certificate as an HTML canvas that can
// be downloaded as a PNG via the browser's native canvas API.
// Layout:
//   - Border + gradient background
//   - marqaicourses logo (top-left)
//   - "Certificate of Completion / Excellence / Mastery"
//   - Candidate name + photo
//   - Course title + skills + score
//   - Validation code + issue date
//   - Signature line
//
// The PNG download works WITHOUT any external library by:
//   1. Building an offscreen <canvas> at 2x render scale.
//   2. Drawing the same layout with the Canvas 2D API.
//   3. Calling canvas.toBlob() and triggering a download.
//
// This keeps the bundle small and avoids any SSR issues with
// html-to-image / dom-to-image libraries.
// ============================================================

interface CertificateDisplayProps {
  certificate: Certificate;
  /** Show full-page chrome (header, back button) — true on the dedicated
   * certificate view, false when embedded in a list. */
  fullPage?: boolean;
}

export function CertificateDisplay({ certificate, fullPage = false }: CertificateDisplayProps) {
  const user = useAppStore((s) => s.currentUser());
  const users = useAppStore((s) => s.users);
  const certUser = users.find((u) => u.id === certificate.userId) ?? user;
  const course = findCourse(certificate.courseId);
  const [downloading, setDownloading] = useState(false);
  const [shared, setShared] = useState(false);

  const candidateName = certificate.candidateNameSnapshot ?? certUser?.name ?? 'Candidate';
  const candidatePhotoUrl = certificate.candidatePhotoUrl ?? certUser?.profilePhotoUrl;
  const courseTitle = certificate.courseTitleSnapshot ?? course?.title ?? certificate.courseId;
  const skills = certificate.skillsSnapshot ?? course?.skills ?? [];
  const trainingHours = Math.round((course?.modules?.reduce((s, m) => s + m.lessons.length, 0) ?? 0) * 0.75); // ~45min/lesson
  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const approvedDate = certificate.approvedAt
    ? new Date(certificate.approvedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const isPending = certificate.approvalStatus === 'pending';
  const isApproved = certificate.approvalStatus === 'approved';
  const isRejected = certificate.approvalStatus === 'rejected';

  // Template → styling
  const tplStyle = (() => {
    switch (certificate.template) {
      case 'gold':
        return {
          bgGradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)',
          borderColor: '#d97706',
          accentColor: '#b45309',
          titleText: 'Certificate of Excellence',
          ribbonColor: 'from-amber-400 to-orange-500',
        };
      case 'platinum':
        return {
          bgGradient: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #ddd6fe 100%)',
          borderColor: '#7c3aed',
          accentColor: '#6d28d9',
          titleText: 'Certificate of Mastery',
          ribbonColor: 'from-violet-400 to-purple-500',
        };
      default:
        return {
          bgGradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)',
          borderColor: '#059669',
          accentColor: '#047857',
          titleText: 'Certificate of Completion',
          ribbonColor: 'from-emerald-500 to-teal-600',
        };
    }
  })();

  // ---------- Download as PNG ----------
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await renderCertificateToPng({
        candidateName,
        candidatePhotoUrl,
        courseTitle,
        skills,
        scorePct: certificate.scorePct,
        code: certificate.code,
        issuedDate,
        approvedDate,
        template: certificate.template,
        titleText: tplStyle.titleText,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `marqaicourses-Certificate-${certificate.code}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Certificate download error:', err);
      alert('Could not generate the certificate image. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // ---------- Share ----------
  const handleShare = async () => {
    const shareData = {
      title: `marqaicourses Certificate — ${courseTitle}`,
      text: `I earned a ${tplStyle.titleText} from marqaicourses for completing ${courseTitle} with ${certificate.scorePct}%. Validation code: ${certificate.code}`,
      url: typeof window !== 'undefined' ? `${window.location.origin}/?cert=${certificate.code}` : '',
    };
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title} — ${shareData.url}`);
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      }
    } catch { /* user cancelled */ }
  };

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className={fullPage ? 'mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8' : ''}>
      {fullPage && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Your certificate</h1>
            <p className="text-sm text-muted-foreground">
              Issued by marqaicourses · Validation code {certificate.code}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isApproved && (
              <Badge className="bg-emerald-600 text-white">
                <CheckCircle2 className="mr-1 h-3 w-3" /> Approved
              </Badge>
            )}
            {isPending && (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-300">
                <Clock className="mr-1 h-3 w-3" /> Pending approval
              </Badge>
            )}
            {isRejected && (
              <Badge variant="destructive">
                <XCircle className="mr-1 h-3 w-3" /> Not approved
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Approval banners */}
      {isPending && (
        <Card className="mb-4 border-amber-500/40 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-200">
                  Pending Super Admin approval
                </h3>
                <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
                  You passed the AI interview with {certificate.scorePct}%. Your certificate
                  has been queued and will be released for download once a Super Admin at
                  marqaicourses approves it. You will receive an in-app notification
                  when it is ready.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isRejected && (
        <Card className="mb-4 border-rose-500/40 bg-rose-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              <div>
                <h3 className="font-semibold text-rose-900 dark:text-rose-200">
                  Certificate not approved
                </h3>
                <p className="mt-1 text-sm text-rose-800 dark:text-rose-300">
                  The Super Admin did not approve this certificate.
                  {certificate.approvalNote && ` Reason: ${certificate.approvalNote}`}
                  {' '}You can retry the AI interview to earn a new certificate.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* The visual certificate */}
      <div
        className="relative overflow-hidden rounded-2xl border-4 shadow-2xl"
        style={{
          background: tplStyle.bgGradient,
          borderColor: tplStyle.borderColor,
        }}
      >
        {/* Decorative corner flourishes */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 -top-12 h-48 w-48 rounded-full opacity-10" style={{ background: tplStyle.borderColor }} />
          <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full opacity-10" style={{ background: tplStyle.borderColor }} />
        </div>

        {/* Watermark */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <Award className="h-64 w-64 opacity-[0.04]" style={{ color: tplStyle.borderColor }} />
        </div>

        <div className="relative p-8 sm:p-12">
          {/* Top bar: logo + issuer */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/marq-ai-logo.png"
                alt="marqaicourses logo"
                className="h-14 w-14 rounded-lg object-cover ring-2 ring-white/60"
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: tplStyle.accentColor }}>
                  marqaicourses
                </p>
                <p className="text-[10px] text-muted-foreground">Software Engineering Academy</p>
              </div>
            </div>
            <Badge className={`bg-gradient-to-r ${tplStyle.ribbonColor} text-white`}>
              <Award className="mr-1 h-3 w-3" /> Verified
            </Badge>
          </div>

          {/* Title */}
          <div className="mt-8 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              This is to certify that
            </p>
            <h2
              className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ color: tplStyle.accentColor }}
            >
              {tplStyle.titleText}
            </h2>
          </div>

          {/* Candidate name + photo */}
          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
            <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-lg">
              {candidatePhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={candidatePhotoUrl} alt={candidateName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-slate-400">
                  {candidateName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="text-center sm:text-left">
              <p className="text-2xl font-bold sm:text-3xl" style={{ color: tplStyle.accentColor }}>
                {candidateName}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">has successfully completed the training in</p>
            </div>
          </div>

          {/* Course title */}
          <div className="mt-6 text-center">
            <p className="text-xl font-semibold sm:text-2xl">{courseTitle}</p>
            {skills.length > 0 && (
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {skills.slice(0, 8).map((s) => (
                  <span
                    key={s}
                    className="rounded-full border px-2.5 py-0.5 text-[10px] font-medium"
                    style={{
                      borderColor: tplStyle.borderColor,
                      color: tplStyle.accentColor,
                      backgroundColor: 'rgba(255,255,255,0.6)',
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <Stat label="Final Score" value={`${certificate.scorePct}%`} accent={tplStyle.accentColor} />
            <Stat label="Training Hours" value={`${trainingHours}h`} accent={tplStyle.accentColor} />
            <Stat label="Issue Date" value={issuedDate} accent={tplStyle.accentColor} />
          </div>

          {/* Footer: code + signature */}
          <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t pt-6" style={{ borderColor: `${tplStyle.borderColor}40` }}>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Validation Code</p>
              <p className="font-mono text-sm font-bold" style={{ color: tplStyle.accentColor }}>
                {certificate.code}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Verify at marqai.dev/verify · Issued by marqaicourses
              </p>
            </div>
            <div className="text-right">
              <div className="mb-1 h-8 w-32 border-b-2 border-dashed" style={{ borderColor: tplStyle.borderColor }} />
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Authorised by</p>
              <p className="text-sm font-semibold">Super Admin</p>
              <p className="text-[10px] text-muted-foreground">marqaicourses</p>
              {approvedDate && (
                <p className="text-[10px] text-muted-foreground">Approved: {approvedDate}</p>
              )}
            </div>
          </div>

          {/* Status ribbon (when pending/rejected) */}
          {!isApproved && (
            <div className="absolute right-4 top-4 rotate-3">
              <div className={`rounded px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow ${
                isPending ? 'bg-amber-500' : 'bg-rose-500'
              }`}>
                {isPending ? 'Pending Approval' : 'Not Approved'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-emerald-600" />
          {isApproved
            ? 'This certificate is verified and ready to share with employers.'
            : isPending
            ? 'Certificate will be downloadable once approved.'
            : 'This certificate was not approved and should not be shared.'}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            disabled={!isApproved}
          >
            {shared ? <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="mr-1 h-3.5 w-3.5" />}
            {shared ? 'Copied!' : 'Share'}
          </Button>
          <Button
            onClick={handleDownload}
            size="sm"
            disabled={!isApproved || downloading}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {downloading ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1 h-3.5 w-3.5" />}
            Download PNG
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold" style={{ color: accent }}>{value}</p>
    </div>
  );
}

// ============================================================
// Canvas-based PNG renderer
// ------------------------------------------------------------
// Draws the certificate at 1754×1240 px (A4 landscape @ 150 DPI)
// using the native Canvas 2D API. No external dependencies.
// ============================================================

interface RenderOpts {
  candidateName: string;
  candidatePhotoUrl?: string;
  courseTitle: string;
  skills: string[];
  scorePct: number;
  code: string;
  issuedDate: string;
  approvedDate: string | null;
  template: Certificate['template'];
  titleText: string;
}

async function renderCertificateToPng(opts: RenderOpts): Promise<Blob> {
  const W = 1754;
  const H = 1240;
  const canvas = typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(W, H)
    : Object.assign(document.createElement('canvas'), { width: W, height: H });
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D not supported');

  // Colors per template
  const colors = (() => {
    switch (opts.template) {
      case 'gold': return { bg1: '#fffbeb', bg2: '#fde68a', border: '#d97706', accent: '#b45309', text: '#78350f' };
      case 'platinum': return { bg1: '#f5f3ff', bg2: '#ddd6fe', border: '#7c3aed', accent: '#6d28d9', text: '#5b21b6' };
      default: return { bg1: '#f0fdf4', bg2: '#bbf7d0', border: '#059669', accent: '#047857', text: '#064e3b' };
    }
  })();

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, colors.bg1);
  grad.addColorStop(0.5, colors.bg2);
  grad.addColorStop(1, colors.bg1);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Border (double-line)
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 12;
  ctx.strokeRect(20, 20, W - 40, H - 40);
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, W - 80, H - 80);

  // Watermark (Award icon as text)
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = colors.border;
  ctx.font = 'bold 600px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★', W / 2, H / 2);
  ctx.restore();

  // Logo (top-left) — load the logo image
  try {
    const logoImg = await loadImage('/marq-ai-logo.png');
    ctx.save();
    ctx.beginPath();
    const logoX = 80, logoY = 80, logoSize = 120;
    ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
    ctx.restore();
    // Logo label
    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('MARQ AI TECH PVT LTD', 220, 95);
    ctx.fillStyle = '#64748b';
    ctx.font = '14px sans-serif';
    ctx.fillText('Software Engineering Academy', 220, 125);
  } catch (err) {
    console.warn('Logo load failed:', err);
  }

  // "Verified" badge (top-right)
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  const bx = W - 220, by = 90, bw = 140, bh = 36;
  roundedRect(ctx, bx, by, bw, bh, 18);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★  VERIFIED', bx + bw / 2, by + bh / 2);

  // "This is to certify that"
  ctx.fillStyle = '#64748b';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('THIS IS TO CERTIFY THAT', W / 2, 240);

  // Title
  ctx.fillStyle = colors.accent;
  ctx.font = 'bold 56px serif';
  ctx.fillText(opts.titleText.toUpperCase(), W / 2, 300);

  // Candidate photo (circle)
  const photoX = W / 2 - 80, photoY = 360, photoSize = 160;
  if (opts.candidatePhotoUrl) {
    try {
      const photoImg = await loadImage(opts.candidatePhotoUrl);
      ctx.save();
      ctx.beginPath();
      ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.drawImage(photoImg, photoX, photoY, photoSize, photoSize);
      ctx.restore();
    } catch (err) {
      console.warn('Photo load failed:', err);
      drawInitialCircle(ctx, photoX, photoY, photoSize, opts.candidateName, colors.accent);
    }
  } else {
    drawInitialCircle(ctx, photoX, photoY, photoSize, opts.candidateName, colors.accent);
  }

  // Candidate name
  ctx.fillStyle = colors.accent;
  ctx.font = 'bold 48px serif';
  ctx.textAlign = 'center';
  ctx.fillText(opts.candidateName, W / 2, 580);

  // "has successfully completed the training in"
  ctx.fillStyle = '#64748b';
  ctx.font = '18px sans-serif';
  ctx.fillText('has successfully completed the training in', W / 2, 630);

  // Course title
  ctx.fillStyle = colors.text;
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText(opts.courseTitle, W / 2, 690);

  // Skills chips
  if (opts.skills.length > 0) {
    const chips = opts.skills.slice(0, 8);
    const chipW = 130, chipH = 28, gap = 8;
    const totalW = chips.length * chipW + (chips.length - 1) * gap;
    let cx = (W - totalW) / 2;
    const cy = 740;
    ctx.font = '12px sans-serif';
    for (const chip of chips) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1.5;
      roundedRect(ctx, cx, cy, chipW, chipH, 14);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = colors.accent;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const truncated = chip.length > 16 ? chip.slice(0, 14) + '…' : chip;
      ctx.fillText(truncated, cx + chipW / 2, cy + chipH / 2);
      cx += chipW + gap;
    }
  }

  // Stats row
  ctx.fillStyle = '#64748b';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FINAL SCORE', W * 0.25, 870);
  ctx.fillText('TRAINING HOURS', W * 0.5, 870);
  ctx.fillText('ISSUE DATE', W * 0.75, 870);

  const trainingHours = Math.round((opts.skills.length || 8) * 4); // approx
  ctx.fillStyle = colors.accent;
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(`${opts.scorePct}%`, W * 0.25, 910);
  ctx.fillText(`${trainingHours}h`, W * 0.5, 910);
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(opts.issuedDate, W * 0.75, 915);

  // Footer divider
  ctx.strokeStyle = `${colors.border}66`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(120, 1010);
  ctx.lineTo(W - 120, 1010);
  ctx.stroke();

  // Validation code (bottom-left)
  ctx.fillStyle = '#64748b';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('VALIDATION CODE', 120, 1040);
  ctx.fillStyle = colors.accent;
  ctx.font = 'bold 22px monospace';
  ctx.fillText(opts.code, 120, 1070);
  ctx.fillStyle = '#64748b';
  ctx.font = '11px sans-serif';
  ctx.fillText('Verify at marqai.dev/verify · Issued by marqaicourses', 120, 1100);

  // Signature (bottom-right)
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(W - 320, 1070);
  ctx.lineTo(W - 120, 1070);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#64748b';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('AUTHORISED BY', W - 120, 1100);
  ctx.fillStyle = colors.text;
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('Super Admin', W - 120, 1130);
  ctx.fillStyle = '#64748b';
  ctx.font = '11px sans-serif';
  ctx.fillText('marqaicourses', W - 120, 1155);
  if (opts.approvedDate) {
    ctx.fillText(`Approved: ${opts.approvedDate}`, W - 120, 1175);
  }

  // Status ribbon (when not approved)
  if (opts.approvedDate === null) {
    ctx.save();
    ctx.translate(W - 200, 180);
    ctx.rotate(Math.PI / 24);
    ctx.fillStyle = '#f59e0b';
    roundedRect(ctx, -80, -16, 160, 32, 4);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PENDING APPROVAL', 0, 0);
    ctx.restore();
  }

  // Convert to blob
  if (canvas instanceof OffscreenCanvas) {
    return await canvas.convertToBlob({ type: 'image/png' });
  }
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('toBlob returned null'));
    }, 'image/png');
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function roundedRect(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawInitialCircle(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  x: number, y: number, size: number, name: string, color: string,
) {
  ctx.save();
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.font = `bold ${size * 0.45}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText((name.charAt(0) || '?').toUpperCase(), x + size / 2, y + size / 2);
  ctx.restore();
}
