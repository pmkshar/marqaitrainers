'use client';

import { useEffect, useState } from 'react';

// ============================================================
// AnimatedTutor — cartoon avatar with speaking animations
// ------------------------------------------------------------
// Shows a cartoon-style SVG tutor that animates when speaking.
// The animation includes:
//   - Mouth opens/closes (speaking animation)
//   - Subtle head bob
//   - Blinking eyes
//   - Sound wave indicators
// ============================================================

interface AnimatedTutorProps {
  /** Tutor initial letter */
  initial: string;
  /** Tailwind gradient classes */
  gradient: string;
  /** Whether the tutor is currently speaking */
  speaking: boolean;
  /** Tutor name for alt text */
  name: string;
  /** Size in pixels (default 80) */
  size?: number;
}

export function AnimatedTutor({ initial, gradient, speaking, name, size = 80 }: AnimatedTutorProps) {
  const [mouthOpen, setMouthOpen] = useState(false);
  const [blink, setBlink] = useState(false);

  // Animate mouth when speaking
  useEffect(() => {
    if (!speaking) {
      setMouthOpen(false);
      return;
    }
    const interval = setInterval(() => {
      setMouthOpen((prev) => !prev);
    }, 180); // Mouth flap speed
    return () => clearInterval(interval);
  }, [speaking]);

  // Random blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  const scale = size / 80;

  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 80 80"
        width={size}
        height={size}
        role="img"
        aria-label={`${name} avatar${speaking ? ' speaking' : ''}`}
        className={speaking ? 'animate-subtle-bob' : ''}
      >
        {/* Background circle with gradient */}
        <defs>
          <linearGradient id={`grad-${initial}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--grad-start, #10b981)" />
            <stop offset="100%" stopColor="var(--grad-end, #0d9488)" />
          </linearGradient>
        </defs>

        {/* Head */}
        <circle cx="40" cy="36" r="26" fill={`url(#grad-${initial})`} />

        {/* Hair / top of head detail */}
        <ellipse cx="40" cy="16" rx="20" ry="8" fill={`url(#grad-${initial})`} opacity="0.8" />

        {/* Face background */}
        <circle cx="40" cy="38" r="20" fill="#FEF3C7" />

        {/* Eyes */}
        {blink ? (
          <>
            <line x1="32" y1="34" x2="36" y2="34" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
            <line x1="44" y1="34" x2="48" y2="34" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="34" cy="33" r="3" fill="#1F2937" />
            <circle cx="46" cy="33" r="3" fill="#1F2937" />
            {/* Eye highlights */}
            <circle cx="35" cy="32" r="1" fill="white" />
            <circle cx="47" cy="32" r="1" fill="white" />
          </>
        )}

        {/* Eyebrows — slightly raised when speaking */}
        <line
          x1="30" y1={speaking ? 27 : 28} x2="38" y2={speaking ? 27 : 28}
          stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round"
        />
        <line
          x1="42" y1={speaking ? 27 : 28} x2="50" y2={speaking ? 27 : 28}
          stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round"
        />

        {/* Nose */}
        <ellipse cx="40" cy="38" rx="1.5" ry="2" fill="#D97706" opacity="0.5" />

        {/* Mouth — animated when speaking */}
        {speaking ? (
          mouthOpen ? (
            <ellipse cx="40" cy="46" rx="5" ry="4" fill="#DC2626" opacity="0.9" />
          ) : (
            <ellipse cx="40" cy="45" rx="4" ry="2" fill="#DC2626" opacity="0.8" />
          )
        ) : (
          /* Smile when not speaking */
          <path d="M35 44 Q40 49 45 44" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />
        )}

        {/* Cheeks — blush when speaking */}
        {speaking && (
          <>
            <circle cx="28" cy="41" r="4" fill="#FCA5A5" opacity="0.5" />
            <circle cx="52" cy="41" r="4" fill="#FCA5A5" opacity="0.5" />
          </>
        )}
      </svg>

      {/* Sound wave indicators when speaking */}
      {speaking && (
        <div className="absolute -right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          <div className="w-0.5 h-2 rounded-full bg-emerald-500 animate-sound-wave-1" />
          <div className="w-0.5 h-3 rounded-full bg-emerald-500 animate-sound-wave-2" />
          <div className="w-0.5 h-2 rounded-full bg-emerald-500 animate-sound-wave-3" />
        </div>
      )}
    </div>
  );
}

// Larger animated tutor for the voice-over panel
export function AnimatedTutorLarge({ initial, gradient, speaking, name }: {
  initial: string;
  gradient: string;
  speaking: boolean;
  name: string;
}) {
  return (
    <div className="relative inline-flex flex-col items-center">
      <AnimatedTutor initial={initial} gradient={gradient} speaking={speaking} name={name} size={100} />
      <span className="mt-1 text-xs font-semibold text-foreground/80">{name}</span>
    </div>
  );
}
