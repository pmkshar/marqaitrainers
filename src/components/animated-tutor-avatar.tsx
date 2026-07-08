'use client';

import React, { useState, useEffect, useRef, Component } from 'react';
import Image from 'next/image';

// ============================================================
// Animated3DTutorAvatar — Photorealistic AI tutor avatar
// ============================================================
// Uses AI-generated photorealistic image of a Korean woman
// (20s, messy high bun, cosmetic ad lighting, classroom).
//
// Natural animation approach:
//   - When speaking: gentle head bob, subtle face scaling that
//     creates the illusion of lip movement through rhythmic
//     vertical stretch/compress on the lower face region,
//     periodic blinking, and slight head tilt shifts
//   - When idle: slow breathing micro-movement, occasional
//     blinks, gentle sway
//   - Expression changes via CSS filters + very subtle
//     gradient overlays that tint the face naturally
//
// No crude mouth-overlay divs — all animations are CSS
// transforms and filters on the image itself for a natural look.
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

// ────────────── Photorealistic Avatar with Natural CSS Animations ──────────────

function PhotorealisticAvatar({
  speaking,
  expression = 'neutral',
  size = 120,
}: Animated3DTutorAvatarProps) {
  const [mounted, setMounted] = useState(false);
  const [imgError, setImgError] = useState(false);
  // Blink state — controlled by timer for natural random blinks
  const [blinking, setBlinking] = useState(false);
  // Speaking phase — drives the subtle lip/jaw animation cycle
  const [speakPhase, setSpeakPhase] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Natural blink timer — blinks every 2-5 seconds randomly
  useEffect(() => {
    if (!mounted) return;
    const scheduleBlink = () => {
      const delay = 2000 + Math.random() * 3000;
      return setTimeout(() => {
        setBlinking(true);
        setTimeout(() => setBlinking(false), 150); // blink duration
      }, delay);
    };
    let timer = scheduleBlink();
    const interval = setInterval(() => {
      clearTimeout(timer);
      timer = scheduleBlink();
    }, 100);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [mounted]);

  // Speaking animation cycle — drives the subtle transform rhythm
  useEffect(() => {
    if (!speaking) {
      setSpeakPhase(0);
      return;
    }
    // Use requestAnimationFrame for smooth 60fps mouth/jaw animation
    let raf: number;
    let start: number | null = null;
    const animate = (ts: number) => {
      if (!start) start = ts;
      // Create a natural speaking rhythm with mixed frequencies
      // Primary cycle ~4Hz (mouth open/close), secondary ~1.5Hz (head bob)
      const t = (ts - start) / 1000;
      const phase = Math.round((t * 8) % 6); // 6 distinct positions at ~8 transitions/s
      setSpeakPhase(phase);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [speaking]);

  // Expression-based CSS filters — very subtle, natural shifts
  const expressionStyles: Record<string, React.CSSProperties> = {
    neutral: {
      filter: 'brightness(1) contrast(1) saturate(1)',
    },
    explaining: {
      filter: 'brightness(1.02) contrast(1.01) saturate(1.03)',
    },
    thinking: {
      filter: 'brightness(0.98) contrast(1.02) saturate(0.97)',
    },
    happy: {
      filter: 'brightness(1.04) contrast(1) saturate(1.06)',
    },
    curious: {
      filter: 'brightness(1.01) contrast(1.02) saturate(1.03)',
    },
  };

  const currentExpressionStyle = expressionStyles[expression] || expressionStyles.neutral;

  // Speaking transform — creates natural-looking facial movement
  // Instead of overlaying a fake mouth, we use subtle scale transforms
  // on the lower face region that mimic the jaw/lip movement
  const getSpeakingTransform = (): React.CSSProperties => {
    if (!speaking) return {};

    // Map speakPhase to natural mouth/jaw positions
    // Phase 0: rest, 1: slight open, 2: open, 3: wider, 4: medium, 5: closing
    const jawShifts = [0, 0.003, 0.006, 0.008, 0.005, 0.002];
    const lipScales = [1, 1.003, 1.006, 1.008, 1.005, 1.002];
    const headTilts = [0, 0.1, -0.1, 0.15, -0.05, 0.1];

    const jawShift = jawShifts[speakPhase] || 0;
    const lipScale = lipScales[speakPhase] || 1;
    const headTilt = headTilts[speakPhase] || 0;

    return {
      // Subtle vertical shift on lower face creates jaw movement illusion
      transform: `
        scale(${lipScale})
        translateY(${jawShift * size}px)
        rotate(${headTilt}deg)
      `,
      // Slightly warm tint when speaking (natural flush)
      filter: `${currentExpressionStyle.filter} brightness(1.01)`,
    };
  };

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
            background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)',
            animation: 'avatarSpeakGlow 2s ease-in-out infinite',
          }}
        />
      )}

      {/* Main avatar image container */}
      <div
        className="relative w-full h-full rounded-full overflow-hidden shadow-xl"
        style={{
          ...currentExpressionStyle,
          transition: 'filter 0.5s ease',
          animation: speaking
            ? 'avatarSpeakRhythm 0.8s ease-in-out infinite'
            : 'avatarIdle 5s ease-in-out infinite',
          border: `3px solid ${speaking ? 'rgba(16,185,129,0.5)' : 'rgba(16,185,129,0.2)'}`,
        }}
      >
        {/* The actual image with natural speaking transforms */}
        <div
          className="w-full h-full"
          style={{
            transition: speaking ? 'transform 0.08s ease-out' : 'transform 0.5s ease',
            ...getSpeakingTransform(),
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

        {/* Natural blink overlay — thin dark line across eye area */}
        {mounted && blinking && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: '18%',
              right: '18%',
              top: '40%',
              height: size * 0.025,
              background: 'linear-gradient(180deg, transparent 0%, rgba(60,30,20,0.25) 30%, rgba(60,30,20,0.35) 50%, rgba(60,30,20,0.25) 70%, transparent 100%)',
              borderRadius: '50%',
              zIndex: 2,
              animation: 'avatarBlink 0.15s ease-in-out',
            }}
          />
        )}

        {/* Speaking: subtle lower-face shadow shift for lip/jaw illusion */}
        {mounted && speaking && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: '25%',
              right: '25%',
              top: '58%',
              height: size * 0.18,
              background: 'linear-gradient(180deg, transparent 0%, rgba(180,60,80,0.04) 40%, rgba(180,60,80,0.06) 60%, transparent 100%)',
              borderRadius: '50%',
              zIndex: 2,
              animation: 'avatarLipShift 0.6s ease-in-out infinite alternate',
            }}
          />
        )}

        {/* Speaking: very subtle warmth/flush on cheeks */}
        {mounted && speaking && (
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              background: 'radial-gradient(ellipse at 50% 55%, rgba(255,150,160,0.06) 0%, transparent 50%)',
              zIndex: 2,
            }}
          />
        )}

        {/* Expression: happy warm tint */}
        {mounted && expression === 'happy' && (
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              background: 'radial-gradient(circle at 50% 45%, rgba(255,220,100,0.05) 0%, transparent 50%)',
              zIndex: 2,
            }}
          />
        )}

        {/* Expression: thinking cool tint */}
        {mounted && expression === 'thinking' && (
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              background: 'radial-gradient(circle at 50% 45%, rgba(100,149,237,0.04) 0%, transparent 50%)',
              zIndex: 2,
            }}
          />
        )}
      </div>

      {/* Speaking indicator — animated sound waves (gentler) */}
      {speaking && (
        <>
          <div
            className="absolute rounded-full border border-emerald-400/30"
            style={{
              width: size * 1.12,
              height: size * 1.12,
              animation: 'avatarSoundWave 2s ease-out infinite',
            }}
          />
          <div
            className="absolute rounded-full border border-emerald-400/15"
            style={{
              width: size * 1.25,
              height: size * 1.25,
              animation: 'avatarSoundWave 2s ease-out infinite 0.5s',
            }}
          />
        </>
      )}

      {/* Expression indicator badge — small icon bottom-right */}
      {mounted && expression !== 'neutral' && (
        <div
          className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-md"
          style={{ width: size * 0.2, height: size * 0.2, zIndex: 5 }}
        >
          <span style={{ fontSize: size * 0.1 }}>
            {expression === 'happy' && '😊'}
            {expression === 'thinking' && '🤔'}
            {expression === 'curious' && '💡'}
            {expression === 'explaining' && '📖'}
          </span>
        </div>
      )}

      {/* CSS Keyframes — natural, subtle animations */}
      <style jsx global>{`
        @keyframes avatarIdle {
          0%, 100% { transform: scale(1) rotate(0deg); }
          20% { transform: scale(1.002) rotate(0.15deg); }
          50% { transform: scale(1.004) rotate(-0.1deg); }
          80% { transform: scale(1.002) rotate(0.1deg); }
        }
        @keyframes avatarSpeakRhythm {
          0%, 100% {
            transform: scale(1) translateY(0px);
          }
          15% {
            transform: scale(1.003) translateY(0.3px);
          }
          30% {
            transform: scale(1.005) translateY(0.6px);
          }
          50% {
            transform: scale(1.006) translateY(0.8px);
          }
          70% {
            transform: scale(1.004) translateY(0.4px);
          }
          85% {
            transform: scale(1.002) translateY(0.1px);
          }
        }
        @keyframes avatarSpeakGlow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.04); }
        }
        @keyframes avatarSoundWave {
          0% { opacity: 0.5; transform: scale(0.92); }
          100% { opacity: 0; transform: scale(1.18); }
        }
        @keyframes avatarBlink {
          0% { opacity: 0; }
          30% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes avatarLipShift {
          0% { opacity: 0.5; transform: translateY(0) scaleY(0.8); }
          100% { opacity: 1; transform: translateY(0.5px) scaleY(1.1); }
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
