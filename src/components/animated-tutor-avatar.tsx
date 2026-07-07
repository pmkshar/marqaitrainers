'use client';

import React, { Component } from 'react';
import dynamic from 'next/dynamic';

// ============================================================
// Animated3DTutorAvatar — 3D human tutor avatar wrapper
// ============================================================
// Dynamically imports the React Three Fiber 3D avatar with
// SSR disabled (Three.js Canvas cannot render on the server).
// Falls back to an SVG avatar on loading or WebGL errors.
// ============================================================

export interface Animated3DTutorAvatarProps {
  speaking: boolean;
  expression?: 'neutral' | 'explaining' | 'thinking' | 'happy' | 'curious';
  size?: number; // default 120
}

// ────────────── SVG Fallback Avatar ──────────────
// A simple 2D representation that shows while the 3D component
// loads or when WebGL is unavailable.

function FallbackAvatar({ speaking, expression = 'neutral', size = 120 }: Animated3DTutorAvatarProps) {
  const browRaise   = expression === 'curious' || expression === 'thinking' ? -3 : 0;
  const happyEyes   = expression === 'happy';
  const smileCurve  = expression === 'happy' ? 6 : expression === 'curious' ? 3 : 0;
  const mouthOpen   = speaking ? 5 : 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Tutor avatar"
    >
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
      <path
        d={`M 48 74 Q 60 ${74 + smileCurve + mouthOpen} 72 74`}
        stroke="#c4726a"
        strokeWidth="2.5"
        fill={speaking ? '#2a0808' : 'none'}
        strokeLinecap="round"
      />
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
// Catches WebGL / Three.js runtime errors and shows fallback.

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

// ────────────── Dynamic 3D Import (SSR disabled) ──────────────

const TutorAvatar3DInternal = dynamic(() => import('./tutor-avatar-3d'), {
  ssr: false,
});

// ────────────── Exported Component ──────────────

export function Animated3DTutorAvatar({
  speaking,
  expression = 'neutral',
  size = 120,
}: Animated3DTutorAvatarProps) {
  const fallback = <FallbackAvatar speaking={speaking} expression={expression} size={size} />;

  return (
    <AvatarErrorBoundary fallback={fallback}>
      <React.Suspense fallback={fallback}>
        <TutorAvatar3DInternal speaking={speaking} expression={expression} size={size} />
      </React.Suspense>
    </AvatarErrorBoundary>
  );
}
