'use client';

import React, { useState, useEffect, useRef, Component } from 'react';
import Image from 'next/image';

// ============================================================
// Animated3DTutorAvatar — Photorealistic AI tutor avatar
// ============================================================
// Uses AI-generated photorealistic image of a Korean woman
// (20s, messy high bun, cosmetic ad lighting, classroom).
// CSS animations simulate speaking, expressions, and micro-
// movements for a lifelike feel.
//
// All instances are named "Marq AI" — no gender variants needed.
// The 'gender' prop is kept for backward compatibility but
// ignored; everyone gets the same photorealistic avatar.
// ============================================================

export interface Animated3DTutorAvatarProps {
  speaking: boolean;
  expression?: 'neutral' | 'explaining' | 'thinking' | 'happy' | 'curious';
  size?: number; // default 120
  /** Kept for backward compat — no longer changes the avatar */
  gender?: 'male' | 'female';
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

// ────────────── Photorealistic Avatar with CSS Animations ──────────────

function PhotorealisticAvatar({
  speaking,
  expression = 'neutral',
  size = 120,
}: Animated3DTutorAvatarProps) {
  const [mounted, setMounted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const breathPhase = useRef(0);

  useEffect(() => {
    setMounted(true);
    // Gentle breathing animation
    let frame: number;
    let start: number | null = null;
    const animate = (ts: number) => {
      if (!start) start = ts;
      breathPhase.current = Math.sin((ts - start) / 2000) * 0.5;
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Expression-based CSS filters and transforms
  const expressionStyles: Record<string, React.CSSProperties> = {
    neutral: {
      filter: 'brightness(1) contrast(1) saturate(1)',
    },
    explaining: {
      filter: 'brightness(1.03) contrast(1.02) saturate(1.05)',
    },
    thinking: {
      filter: 'brightness(0.97) contrast(1.03) saturate(0.95)',
    },
    happy: {
      filter: 'brightness(1.06) contrast(1) saturate(1.1)',
    },
    curious: {
      filter: 'brightness(1.02) contrast(1.04) saturate(1.05)',
    },
  };

  const currentExpressionStyle = expressionStyles[expression] || expressionStyles.neutral;

  // If image fails to load, show a simple gradient avatar with "M" initial
  if (imgError) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg"
      >
        <span style={{ fontSize: size * 0.35 }}>M</span>
      </div>
    );
  }

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Outer glow ring — visible when speaking */}
      {speaking && (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)',
            animation: 'avatarSpeakPulse 1.2s ease-in-out infinite',
          }}
        />
      )}

      {/* Expression tint overlay — subtle color shifts */}
      {mounted && expression !== 'neutral' && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              expression === 'happy'
                ? 'radial-gradient(circle at 50% 40%, rgba(255,215,0,0.08) 0%, transparent 60%)'
                : expression === 'thinking'
                ? 'radial-gradient(circle at 50% 40%, rgba(100,149,237,0.06) 0%, transparent 60%)'
                : 'transparent',
            zIndex: 3,
          }}
        />
      )}

      {/* Main avatar image */}
      <div
        className="relative w-full h-full rounded-full overflow-hidden shadow-xl"
        style={{
          ...currentExpressionStyle,
          transition: 'filter 0.4s ease, transform 0.4s ease',
          transform: speaking
            ? `scale(${1 + Math.sin(Date.now() / 300) * 0.008})`
            : 'scale(1)',
          animation: speaking
            ? 'avatarBreathe 2s ease-in-out infinite'
            : 'avatarIdle 4s ease-in-out infinite',
          border: `3px solid ${speaking ? 'rgba(16,185,129,0.6)' : 'rgba(16,185,129,0.25)'}`,
        }}
      >
        <Image
          src="/marq-ai-tutor-icon.png"
          alt="Marq AI Tutor"
          fill
          className="object-cover object-top"
          priority
          sizes={`${size}px`}
          onError={() => setImgError(true)}
        />
      </div>

      {/* Speaking indicator — animated sound waves */}
      {speaking && (
        <>
          <div
            className="absolute rounded-full border-2 border-emerald-400/50"
            style={{
              width: size * 1.1,
              height: size * 1.1,
              animation: 'avatarSoundWave 1.5s ease-out infinite',
            }}
          />
          <div
            className="absolute rounded-full border-2 border-emerald-400/30"
            style={{
              width: size * 1.25,
              height: size * 1.25,
              animation: 'avatarSoundWave 1.5s ease-out infinite 0.3s',
            }}
          />
        </>
      )}

      {/* Expression indicator badge — small icon bottom-right */}
      {mounted && expression !== 'neutral' && (
        <div
          className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-md"
          style={{ width: size * 0.22, height: size * 0.22, zIndex: 5 }}
        >
          <span style={{ fontSize: size * 0.12 }}>
            {expression === 'happy' && '😊'}
            {expression === 'thinking' && '🤔'}
            {expression === 'curious' && '💡'}
            {expression === 'explaining' && '📖'}
          </span>
        </div>
      )}

      {/* CSS Keyframes — injected inline for SSR compat */}
      <style jsx global>{`
        @keyframes avatarBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.012); }
        }
        @keyframes avatarIdle {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.003) rotate(0.3deg); }
          75% { transform: scale(1.003) rotate(-0.3deg); }
        }
        @keyframes avatarSpeakPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes avatarSoundWave {
          0% { opacity: 0.6; transform: scale(0.9); }
          100% { opacity: 0; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

// ────────────── Exported Component ──────────────

export function Animated3DTutorAvatar({
  speaking,
  expression = 'neutral',
  size = 120,
  gender, // ignored — same avatar everywhere
}: Animated3DTutorAvatarProps) {
  return (
    <AvatarErrorBoundary
      fallback={
        <div
          style={{ width: size, height: size }}
          className="rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg"
        >
          <span style={{ fontSize: size * 0.35 }}>M</span>
        </div>
      }
    >
      <PhotorealisticAvatar
        speaking={speaking}
        expression={expression}
        size={size}
      />
    </AvatarErrorBoundary>
  );
}
