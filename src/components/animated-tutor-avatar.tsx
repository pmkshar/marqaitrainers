'use client';

import React, { Component } from 'react';
import dynamic from 'next/dynamic';

// ============================================================
// Animated3DTutorAvatar — 3D human tutor avatar wrapper
// ============================================================
// Dynamically imports the React Three Fiber 3D avatar with
// SSR disabled (Three.js Canvas cannot render on the server).
// Falls back to an SVG avatar on loading or WebGL errors.
//
// Supports two avatar variants:
//   - 'male' (default): Marq AI — professional male with glasses & coat
//   - 'female': MayaAI — Indian female teacher with bindhi
// ============================================================

export interface Animated3DTutorAvatarProps {
  speaking: boolean;
  expression?: 'neutral' | 'explaining' | 'thinking' | 'happy' | 'curious';
  size?: number; // default 120
  /** Avatar gender variant — 'male' for Marq AI, 'female' for MayaAI */
  gender?: 'male' | 'female';
}

// ────────────── SVG Fallback: Male (Marq AI) — Photorealistic ──────────────

function MaleFallbackAvatar({ speaking, expression = 'neutral', size = 120 }: Animated3DTutorAvatarProps) {
  const browRaise   = expression === 'curious' || expression === 'thinking' ? -3 : 0;
  const happyEyes   = expression === 'happy';
  const smileCurve  = expression === 'happy' ? 6 : expression === 'curious' ? 3 : 0;
  const mouthOpen   = speaking ? 5 : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Marq AI avatar">
      <defs>
        {/* Skin gradient with natural variation */}
        <radialGradient id="skinGrad" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#D4A574" />
          <stop offset="40%" stopColor="#C49A6C" />
          <stop offset="80%" stopColor="#B08558" />
          <stop offset="100%" stopColor="#9A7048" />
        </radialGradient>
        {/* Hair gradient */}
        <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="50%" stopColor="#2a2a3e" />
          <stop offset="100%" stopColor="#111122" />
        </linearGradient>
        {/* Eye iris gradient */}
        <radialGradient id="irisGrad" cx="45%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#5C3D1E" />
          <stop offset="50%" stopColor="#3d2b1f" />
          <stop offset="100%" stopColor="#1a1008" />
        </radialGradient>
        {/* Suit gradient */}
        <linearGradient id="suitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a2332" />
          <stop offset="50%" stopColor="#141c28" />
          <stop offset="100%" stopColor="#0e141e" />
        </linearGradient>
        {/* Glasses lens gradient */}
        <linearGradient id="lensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c8e8f8" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#8ec8e8" stopOpacity="0.08" />
        </linearGradient>
        {/* Lip color */}
        <linearGradient id="lipGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B06858" />
          <stop offset="50%" stopColor="#C47868" />
          <stop offset="100%" stopColor="#B06858" />
        </linearGradient>
        {/* Subtle face shadow */}
        <filter id="faceShadow" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="0" dy="1" />
          <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* Wet eye effect */}
        <radialGradient id="eyeWetL" cx="40%" cy="30%" r="40%">
          <stop offset="0%" stopColor="white" stopOpacity="0.6" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="eyeWetR" cx="60%" cy="30%" r="40%">
          <stop offset="0%" stopColor="white" stopOpacity="0.6" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── Hair back ── */}
      <ellipse cx="60" cy="34" rx="48" ry="30" fill="url(#hairGrad)" />
      {/* Hair side strands */}
      <path d="M 14 38 Q 16 28 24 22" stroke="#1a1a2e" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M 106 38 Q 104 28 96 22" stroke="#1a1a2e" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* ── Face with skin gradient ── */}
      <circle cx="60" cy="58" r="42" fill="url(#skinGrad)" />
      {/* Jaw */}
      <ellipse cx="60" cy="84" rx="30" ry="16" fill="url(#skinGrad)" />

      {/* Subtle cheek color */}
      <ellipse cx="38" cy="64" rx="8" ry="5" fill="#C87060" opacity="0.15" />
      <ellipse cx="82" cy="64" rx="8" ry="5" fill="#C87060" opacity="0.15" />

      {/* ── Bangs — styled modern ── */}
      <ellipse cx="60" cy="28" rx="36" ry="12" fill="url(#hairGrad)" />
      <path d="M 36 30 Q 42 22 55 20 Q 65 18 72 22 Q 78 26 76 32" fill="url(#hairGrad)" />
      {/* Styled top quiff */}
      <path d="M 42 24 Q 48 16 58 18 Q 68 16 72 24" fill="#2a2a3e" />
      {/* Hair strand detail */}
      <path d="M 48 22 Q 52 18 58 20" stroke="#3a3a4e" strokeWidth="0.8" fill="none" opacity="0.6" />
      <path d="M 56 20 Q 62 17 68 21" stroke="#3a3a4e" strokeWidth="0.8" fill="none" opacity="0.6" />

      {/* Stubble shadow */}
      <ellipse cx="60" cy="82" rx="22" ry="10" fill="#8a7a6a" opacity="0.15" />

      {/* ── Left eye — realistic ── */}
      <ellipse cx="45" cy="55" rx={7} ry={happyEyes ? 4 : 6} fill="white" />
      {/* Iris */}
      <circle cx="45" cy="55" r="4" fill="url(#irisGrad)" />
      {/* Pupil */}
      <circle cx="45" cy="55" r="2" fill="#0a0a0a" />
      {/* Eye highlight (wet look) */}
      <ellipse cx="43" cy="53" rx="1.5" ry="1" fill="white" opacity="0.8" />
      <circle cx="47" cy="56" r="0.6" fill="white" opacity="0.4" />
      {/* Eye wetness overlay */}
      <ellipse cx="45" cy="55" rx={7} ry={happyEyes ? 4 : 6} fill="url(#eyeWetL)" />
      {/* Upper eyelid line */}
      <path d={`M 37 53 Q 45 ${happyEyes ? 49 : 48} 53 53`} stroke="#6B4226" strokeWidth="1" fill="none" />
      {/* Lower eyelid subtle line */}
      <path d="M 38 57 Q 45 60 52 57" stroke="#9B7256" strokeWidth="0.5" fill="none" opacity="0.5" />

      {/* ── Right eye — realistic ── */}
      <ellipse cx="75" cy="55" rx={7} ry={happyEyes ? 4 : 6} fill="white" />
      <circle cx="75" cy="55" r="4" fill="url(#irisGrad)" />
      <circle cx="75" cy="55" r="2" fill="#0a0a0a" />
      <ellipse cx="73" cy="53" rx="1.5" ry="1" fill="white" opacity="0.8" />
      <circle cx="77" cy="56" r="0.6" fill="white" opacity="0.4" />
      <ellipse cx="75" cy="55" rx={7} ry={happyEyes ? 4 : 6} fill="url(#eyeWetR)" />
      <path d={`M 67 53 Q 75 ${happyEyes ? 49 : 48} 83 53`} stroke="#6B4226" strokeWidth="1" fill="none" />
      <path d="M 68 57 Q 75 60 82 57" stroke="#9B7256" strokeWidth="0.5" fill="none" opacity="0.5" />

      {/* ── Glasses — elegant rectangular ── */}
      {/* Left lens */}
      <rect x="33" y="47" width="24" height="17" rx="4" stroke="#2C3E50" strokeWidth="1.8" fill="url(#lensGrad)" />
      {/* Right lens */}
      <rect x="63" y="47" width="24" height="17" rx="4" stroke="#2C3E50" strokeWidth="1.8" fill="url(#lensGrad)" />
      {/* Bridge */}
      <path d="M 57 54 Q 60 52 63 54" stroke="#2C3E50" strokeWidth="1.8" fill="none" />
      {/* Temple arms */}
      <line x1="33" y1="53" x2="22" y2="51" stroke="#2C3E50" strokeWidth="1.5" />
      <line x1="87" y1="53" x2="98" y2="51" stroke="#2C3E50" strokeWidth="1.5" />
      {/* Subtle lens reflection */}
      <path d="M 36 50 Q 40 48 48 49" stroke="white" strokeWidth="0.5" fill="none" opacity="0.3" />
      <path d="M 66 50 Q 70 48 78 49" stroke="white" strokeWidth="0.5" fill="none" opacity="0.3" />

      {/* ── Eyebrows — natural arched ── */}
      <path d={`M 36 ${42 + browRaise} Q 42 ${39 + browRaise} 53 ${43 + browRaise}`} stroke="#1a1a1a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d={`M 67 ${43 + browRaise} Q 78 ${39 + browRaise} 84 ${42 + browRaise}`} stroke="#1a1a1a" strokeWidth="2.2" fill="none" strokeLinecap="round" />

      {/* ── Nose — defined with shadow ── */}
      <path d="M 57 58 Q 55 62 56 66 Q 58 68 60 68 Q 62 68 64 66 Q 65 62 63 58" stroke="#9A7048" strokeWidth="0.8" fill="none" opacity="0.6" />
      {/* Nose tip highlight */}
      <circle cx="60" cy="64" r="2.5" fill="#C49A6C" />
      <circle cx="59" cy="63" r="0.8" fill="#D4A574" opacity="0.6" />
      {/* Nostril shadows */}
      <ellipse cx="57" cy="66" rx="1.5" ry="1" fill="#9A7048" opacity="0.3" />
      <ellipse cx="63" cy="66" rx="1.5" ry="1" fill="#9A7048" opacity="0.3" />

      {/* ── Mouth — realistic ── */}
      <path d={`M 48 74 Q 54 ${74 + smileCurve * 0.5 + mouthOpen * 0.3} 60 ${74 + smileCurve + mouthOpen} Q 66 ${74 + smileCurve * 0.5 + mouthOpen * 0.3} 72 74`} stroke="url(#lipGrad)" strokeWidth="2.5" fill={speaking ? '#2a0808' : 'none'} strokeLinecap="round" />
      {speaking && (
        <>
          {/* Open mouth interior */}
          <path d={`M 50 74 Q 60 ${74 + smileCurve + mouthOpen} 70 74`} fill="#1a0505" />
          {/* Teeth hint */}
          <path d={`M 53 74 L 67 74`} stroke="white" strokeWidth="1" opacity="0.4" />
        </>
      )}
      {/* Lip detail line */}
      <path d="M 50 74 Q 60 73 70 74" stroke="#B06858" strokeWidth="0.5" fill="none" opacity="0.4" />

      {/* ── Neck ── */}
      <rect x="50" y="94" width="20" height="12" rx="5" fill="url(#skinGrad)" />
      {/* Neck shadow */}
      <path d="M 50 98 Q 60 100 70 98" stroke="#9A7048" strokeWidth="0.8" fill="none" opacity="0.3" />

      {/* ── Collar — crisp white ── */}
      <path d="M 42 103 L 50 98 L 60 108 L 70 98 L 78 103" stroke="#E8E8E8" strokeWidth="1.5" fill="#F5F5F5" />
      {/* Collar shadow */}
      <path d="M 50 98 L 60 108" stroke="#D0D0D0" strokeWidth="0.5" fill="none" />
      <path d="M 70 98 L 60 108" stroke="#D0D0D0" strokeWidth="0.5" fill="none" />

      {/* ── Tie — elegant deep blue ── */}
      <polygon points="58,104 62,104 61,118 59,118" fill="#0D3B66" />
      <polygon points="57.5,104 62.5,104 61,100 59,100" fill="#1A5276" />
      {/* Tie knot detail */}
      <path d="M 59 102 L 61 102" stroke="#0D3B66" strokeWidth="0.5" />
      {/* Tie fabric fold */}
      <line x1="60" y1="106" x2="60" y2="116" stroke="#0A2E4E" strokeWidth="0.5" opacity="0.4" />

      {/* ── Suit coat — elegant dark ── */}
      <path d="M 18 108 Q 38 100 60 108 Q 82 100 102 108 L 102 120 L 18 120 Z" fill="url(#suitGrad)" />
      {/* Lapels */}
      <path d="M 42 103 L 34 120" stroke="#1E2D3D" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 78 103 L 86 120" stroke="#1E2D3D" strokeWidth="3.5" strokeLinecap="round" />
      {/* Lapel highlight */}
      <path d="M 42 103 L 36 118" stroke="#243545" strokeWidth="0.8" fill="none" opacity="0.5" />
      <path d="M 78 103 L 84 118" stroke="#243545" strokeWidth="0.8" fill="none" opacity="0.5" />
      {/* Shoulder definition */}
      <path d="M 18 108 Q 28 105 38 108" stroke="#1a2332" strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M 82 108 Q 92 105 102 108" stroke="#1a2332" strokeWidth="1" fill="none" opacity="0.4" />
      {/* Pocket square hint */}
      <path d="M 74 108 L 78 104 L 82 108" stroke="#F5F5F5" strokeWidth="0.8" fill="#F5F5F5" opacity="0.6" />
    </svg>
  );
}

// ────────────── SVG Fallback: Female (MayaAI) ──────────────

function FemaleFallbackAvatar({ speaking, expression = 'neutral', size = 120 }: Animated3DTutorAvatarProps) {
  const browRaise   = expression === 'curious' || expression === 'thinking' ? -3 : 0;
  const happyEyes   = expression === 'happy';
  const smileCurve  = expression === 'happy' ? 6 : expression === 'curious' ? 3 : 0;
  const mouthOpen   = speaking ? 5 : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="MayaAI avatar">
      {/* Hair back */}
      <ellipse cx="60" cy="36" rx="50" ry="32" fill="#1a1a2e" />
      {/* Face */}
      <circle cx="60" cy="58" r="42" fill="#D2956A" />
      {/* Bangs */}
      <ellipse cx="60" cy="30" rx="38" ry="14" fill="#1a1a2e" />
      {/* Hair bun */}
      <circle cx="60" cy="24" r="12" fill="#1a1a2e" />
      {/* Left eye */}
      <ellipse cx="45" cy="55" rx="7" ry={happyEyes ? 4 : 6} fill="white" />
      <circle cx="45" cy="55" r="3.5" fill="#3d2b1f" />
      <circle cx="44" cy="54" r="1.2" fill="white" opacity="0.7" />
      {/* Right eye */}
      <ellipse cx="75" cy="55" rx="7" ry={happyEyes ? 4 : 6} fill="white" />
      <circle cx="75" cy="55" r="3.5" fill="#3d2b1f" />
      <circle cx="74" cy="54" r="1.2" fill="white" opacity="0.7" />
      {/* Eyebrows */}
      <line x1="38" y1={44 + browRaise} x2="52" y2={44 + browRaise} stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="68" y1={44 + browRaise} x2="82" y2={44 + browRaise} stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
      {/* Nose */}
      <circle cx="60" cy="64" r="3" fill="#C08050" />
      {/* Mouth */}
      <path d={`M 48 74 Q 60 ${74 + smileCurve + mouthOpen} 72 74`} stroke="#c4726a" strokeWidth="2.5" fill={speaking ? '#2a0808' : 'none'} strokeLinecap="round" />
      {/* Bindhi */}
      <circle cx="60" cy="43" r="3" fill="#cc0000" />
      {/* Earrings */}
      <circle cx="19" cy="60" r="3" fill="#ffd700" />
      <circle cx="101" cy="60" r="3" fill="#ffd700" />
      {/* Neck */}
      <rect x="50" y="95" width="20" height="10" rx="5" fill="#D2956A" />
      {/* Necklace */}
      <path d="M 42 98 Q 60 106 78 98" stroke="#ffd700" strokeWidth="1.5" fill="none" />
      <circle cx="60" cy="104" r="2" fill="#ffd700" />
      {/* Shoulders */}
      <ellipse cx="60" cy="112" rx="48" ry="16" fill="#4a6fa5" />
      {/* Clothing neckline trim */}
      <path d="M 44 100 Q 60 108 76 100" stroke="#ffd700" strokeWidth="1" fill="none" />
    </svg>
  );
}

// ────────────── Error Boundary ──────────────

interface EBProps { children: React.ReactNode; fallback: React.ReactNode }
interface EBState { hasError: boolean }

class AvatarErrorBoundary extends Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): EBState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// ────────────── Dynamic 3D Imports (SSR disabled) ──────────────

const MarqAIAvatar3DInternal = dynamic(() => import('./marq-ai-avatar-3d'), {
  ssr: false,
});

const TutorAvatar3DInternal = dynamic(() => import('./tutor-avatar-3d'), {
  ssr: false,
});

// ────────────── Exported Component ──────────────

export function Animated3DTutorAvatar({
  speaking,
  expression = 'neutral',
  size = 120,
  gender = 'male',
}: Animated3DTutorAvatarProps) {
  const isMale = gender === 'male';
  const fallback = isMale
    ? <MaleFallbackAvatar speaking={speaking} expression={expression} size={size} />
    : <FemaleFallbackAvatar speaking={speaking} expression={expression} size={size} />;

  const Avatar3D = isMale ? MarqAIAvatar3DInternal : TutorAvatar3DInternal;

  return (
    <AvatarErrorBoundary fallback={fallback}>
      <React.Suspense fallback={fallback}>
        <Avatar3D speaking={speaking} expression={expression} size={size} />
      </React.Suspense>
    </AvatarErrorBoundary>
  );
}
