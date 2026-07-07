'use client';

import { useEffect, useRef, useMemo, useState, useCallback } from 'react';

// ============================================================
// Animated3DTutorAvatar — 3D-style cartoon tutor with rich animations
// ============================================================

export interface Animated3DTutorAvatarProps {
  speaking: boolean;
  expression?: 'neutral' | 'explaining' | 'thinking' | 'happy' | 'curious';
  size?: number; // default 120
}

export function Animated3DTutorAvatar({
  speaking,
  expression = 'neutral',
  size = 120,
}: Animated3DTutorAvatarProps) {
  const [mouthPhase, setMouthPhase] = useState(0);
  const [blink, setBlink] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef<number>(0);

  // Lip-sync animation — cycle through mouth shapes when speaking
  useEffect(() => {
    if (!speaking) return;
    const interval = setInterval(() => {
      setMouthPhase((prev) => (prev + 1) % 8);
    }, 150);
    return () => clearInterval(interval);
  }, [speaking]);

  // Reset mouth phase when not speaking (done in interval cleanup, not effect body)
  useEffect(() => {
    if (!speaking) {
      const timeout = setTimeout(() => setMouthPhase(0), 0);
      return () => clearTimeout(timeout);
    }
  }, [speaking]);

  // Random blinking via timeout loop
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const doBlink = () => {
      setBlink(true);
      timeout = setTimeout(() => {
        setBlink(false);
        timeout = setTimeout(doBlink, 2500 + Math.random() * 3000);
      }, 120);
    };
    timeout = setTimeout(doBlink, 2000 + Math.random() * 2000);
    return () => clearTimeout(timeout);
  }, []);

  // Head bob when speaking + breathing when idle — apply via DOM ref
  useEffect(() => {
    let t = 0;
    const animate = () => {
      t += 0.04;
      if (speaking) {
        const y = Math.sin(t * 2.5) * 1.5;
        if (svgRef.current) {
          svgRef.current.style.transform = `translateY(${y}px) scale(1)`;
        }
      } else {
        const scale = 1 + Math.sin(t * 0.4) * 0.012;
        if (svgRef.current) {
          svgRef.current.style.transform = `translateY(0px) scale(${scale})`;
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [speaking]);

  // Expression-based configurations
  const config = useMemo(() => {
    switch (expression) {
      case 'explaining':
        return { eyeScale: 1.05, browY: -2, browAngle: -5, cheekOpacity: 0.5, smileWidth: 6, smileCurve: 3 };
      case 'thinking':
        return { eyeScale: 0.9, browY: 1, browAngle: 8, cheekOpacity: 0, smileWidth: 4, smileCurve: 1 };
      case 'happy':
        return { eyeScale: 0.85, browY: -1, browAngle: -3, cheekOpacity: 0.6, smileWidth: 8, smileCurve: 5 };
      case 'curious':
        return { eyeScale: 1.12, browY: -3, browAngle: -10, cheekOpacity: 0.2, smileWidth: 5, smileCurve: 2 };
      default:
        return { eyeScale: 1, browY: 0, browAngle: 0, cheekOpacity: 0, smileWidth: 5, smileCurve: 2 };
    }
  }, [expression]);

  // Mouth shape based on lip-sync phase
  const mouthShape = useMemo(() => {
    if (!speaking) {
      return { rx: config.smileWidth, ry: 0, type: 'smile' as const };
    }
    const shapes = [
      { rx: 4, ry: 5, type: 'open' as const },
      { rx: 3, ry: 3, type: 'open' as const },
      { rx: 5, ry: 2, type: 'open' as const },
      { rx: 2, ry: 4, type: 'open' as const },
      { rx: 5, ry: 6, type: 'open' as const },
      { rx: 3, ry: 2, type: 'open' as const },
      { rx: 4, ry: 5, type: 'open' as const },
      { rx: 3, ry: 1.5, type: 'open' as const },
    ];
    return shapes[mouthPhase % 8];
  }, [speaking, mouthPhase, config.smileWidth]);

  return (
    <div
      className="relative inline-block"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`AI Tutor avatar${speaking ? ' speaking' : ''} — ${expression}`}
    >
      {/* Glow ring with emerald pulse */}
      <div
        className={`absolute inset-0 rounded-full ${speaking ? 'animate-tutor-glow-active' : 'animate-tutor-glow-idle'}`}
        style={{
          background: 'conic-gradient(from 0deg, #10b981, #0d9488, #10b981)',
          opacity: speaking ? 0.7 : 0.4,
          filter: 'blur(6px)',
        }}
      />

      {/* Avatar SVG */}
      <svg
        ref={svgRef}
        viewBox="0 0 120 120"
        width={size}
        height={size}
        className="relative z-10"
        style={{ transformOrigin: 'center bottom' }}
      >
        <defs>
          <radialGradient id="headGrad3d" cx="45%" cy="35%" r="55%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="60%" stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#F59E0B" />
          </radialGradient>
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#78350F" />
            <stop offset="50%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E5E7EB" />
            <stop offset="100%" stopColor="#D1D5DB" />
          </linearGradient>
          <linearGradient id="tieGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E3A5F" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
          <filter id="tutorShadow3d">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.2" />
          </filter>
          <linearGradient id="notebookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="100%" stopColor="#FDE68A" />
          </linearGradient>
        </defs>

        {/* BODY / SHIRT */}
        <g transform="translate(60, 92)">
          <ellipse cx="0" cy="8" rx="32" ry="18" fill="url(#shirtGrad)" filter="url(#tutorShadow3d)" />
          <path d="M-8,0 L0,10 L8,0" fill="none" stroke="#9CA3AF" strokeWidth="1" />
          <path d="M0,6 L-3,18 L0,28 L3,18 Z" fill="url(#tieGrad)" />
          <circle cx="0" cy="5" r="2.5" fill="url(#tieGrad)" />
          {/* Notebook */}
          <g transform="translate(-28, 6)">
            <rect x="-6" y="-4" width="12" height="16" rx="1.5" fill="url(#notebookGrad)" stroke="#D97706" strokeWidth="0.8" />
            <line x1="-4" y1="0" x2="4" y2="0" stroke="#92400E" strokeWidth="0.4" opacity="0.5" />
            <line x1="-4" y1="3" x2="4" y2="3" stroke="#92400E" strokeWidth="0.4" opacity="0.5" />
            <line x1="-4" y1="6" x2="4" y2="6" stroke="#92400E" strokeWidth="0.4" opacity="0.5" />
            <ellipse cx="0" cy="-5" rx="5" ry="4" fill="#FCD34D" opacity="0.9" />
          </g>
          <ellipse cx="24" cy="10" rx="5" ry="4" fill="#FCD34D" opacity="0.9" />
        </g>

        {/* NECK */}
        <rect x="54" y="76" width="12" height="10" rx="4" fill="#FCD34D" />

        {/* HEAD */}
        <g transform={`translate(0, ${config.browY * 0.3})`}>
          <ellipse cx="60" cy="50" rx="28" ry="30" fill="url(#headGrad3d)" filter="url(#tutorShadow3d)" />

          {/* Ears */}
          <ellipse cx="32" cy="52" rx="5" ry="7" fill="#FCD34D" />
          <ellipse cx="32" cy="52" rx="3" ry="5" fill="#F59E0B" opacity="0.3" />
          <ellipse cx="88" cy="52" rx="5" ry="7" fill="#FCD34D" />
          <ellipse cx="88" cy="52" rx="3" ry="5" fill="#F59E0B" opacity="0.3" />

          {/* HAIR */}
          <path d="M32,42 Q32,18 60,16 Q88,18 88,42 Q88,32 80,28 Q72,24 60,23 Q48,24 40,28 Q32,32 32,42 Z" fill="url(#hairGrad)" />
          <path d="M48,22 Q50,12 56,14 Q52,18 50,24 Z" fill="#92400E" />
          <path d="M56,16 Q60,8 66,12 Q62,16 58,20 Z" fill="#78350F" />
          <path d="M32,40 Q30,32 36,28 Q34,36 34,42 Z" fill="#78350F" />
          <path d="M88,40 Q90,32 84,28 Q86,36 86,42 Z" fill="#78350F" />

          {/* GLASSES */}
          <circle cx="48" cy="50" r="9" fill="none" stroke="#1F2937" strokeWidth="1.8" />
          <circle cx="48" cy="50" r="9" fill="white" opacity="0.08" />
          <circle cx="72" cy="50" r="9" fill="none" stroke="#1F2937" strokeWidth="1.8" />
          <circle cx="72" cy="50" r="9" fill="white" opacity="0.08" />
          <path d="M57,49 Q60,47 63,49" fill="none" stroke="#1F2937" strokeWidth="1.5" />
          <line x1="39" y1="48" x2="33" y2="46" stroke="#1F2937" strokeWidth="1.3" />
          <line x1="81" y1="48" x2="87" y2="46" stroke="#1F2937" strokeWidth="1.3" />

          {/* EYEBROWS */}
          <line x1="39" y1={38 + config.browY} x2="56" y2={38 + config.browY + config.browAngle * 0.3} stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
          <line x1="64" y1={38 + config.browY + config.browAngle * 0.3} x2="81" y2={38 + config.browY} stroke="#78350F" strokeWidth="2" strokeLinecap="round" />

          {/* EYES */}
          {blink ? (
            <>
              <line x1="42" y1="50" x2="54" y2="50" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
              <line x1="66" y1="50" x2="78" y2="50" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
            </>
          ) : (
            <>
              <ellipse cx="48" cy="50" rx={3.5 * config.eyeScale} ry={4 * config.eyeScale} fill="#1F2937" />
              <circle cx="49.5" cy="48.5" r="1.3" fill="white" />
              <circle cx="46.5" cy="51" r="0.6" fill="white" opacity="0.5" />
              <ellipse cx="72" cy="50" rx={3.5 * config.eyeScale} ry={4 * config.eyeScale} fill="#1F2937" />
              <circle cx="73.5" cy="48.5" r="1.3" fill="white" />
              <circle cx="70.5" cy="51" r="0.6" fill="white" opacity="0.5" />
            </>
          )}

          {/* NOSE */}
          <path d="M58,54 Q60,59 62,54" fill="none" stroke="#D97706" strokeWidth="1" opacity="0.6" />

          {/* MOUTH */}
          {mouthShape.type === 'smile' ? (
            <path
              d={`M${60 - config.smileWidth},64 Q60,${64 + config.smileCurve} ${60 + config.smileWidth},64`}
              fill="none" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round"
            />
          ) : (
            <ellipse cx="60" cy="65" rx={mouthShape.rx} ry={mouthShape.ry} fill="#DC2626" opacity="0.9" />
          )}

          {/* CHEEKS (blush) */}
          {config.cheekOpacity > 0 && (
            <>
              <circle cx="38" cy="60" r="5" fill="#FCA5A5" opacity={config.cheekOpacity} />
              <circle cx="82" cy="60" r="5" fill="#FCA5A5" opacity={config.cheekOpacity} />
            </>
          )}
        </g>
      </svg>

      {/* Sound wave indicators when speaking */}
      {speaking && (
        <div className="absolute -right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 z-20">
          <div className="w-0.5 rounded-full bg-emerald-500 animate-sound-wave-1" style={{ height: '8px' }} />
          <div className="w-0.5 rounded-full bg-emerald-500 animate-sound-wave-2" style={{ height: '12px' }} />
          <div className="w-0.5 rounded-full bg-emerald-500 animate-sound-wave-3" style={{ height: '8px' }} />
        </div>
      )}
    </div>
  );
}
