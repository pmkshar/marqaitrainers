'use client';

import { useEffect, useRef, useMemo, useState } from 'react';

// ============================================================
// Animated3DTutorAvatar — Rich 3D Pixar/DreamWorks-style cartoon tutor
// ============================================================

export interface Animated3DTutorAvatarProps {
  speaking: boolean;
  expression?: 'neutral' | 'explaining' | 'thinking' | 'happy' | 'curious';
  size?: number; // default 120
}

// Mouth shape definitions for lip-sync animation
const MOUTH_SHAPES = [
  { rx: 7, ry: 10, open: true },   // wide open "ah"
  { rx: 5, ry: 6, open: true },    // medium "oh"
  { rx: 9, ry: 4, open: true },    // wide "eh"
  { rx: 4, ry: 8, open: true },    // narrow "oo"
  { rx: 8, ry: 12, open: true },   // big open "ahh"
  { rx: 6, ry: 3, open: true },    // slight "mm"
  { rx: 5, ry: 9, open: true },    // "oh" variant
  { rx: 3, ry: 5, open: true },    // small "uh"
  { rx: 7, ry: 7, open: true },    // round "o"
  { rx: 9, ry: 5, open: true },    // flat "eh" variant
  { rx: 4, ry: 10, open: true },   // pursed "oo"
  { rx: 6, ry: 4, open: true },    // half "mm"
] as const;

// Expression configuration type
interface ExpressionConfig {
  eyeScaleY: number;      // vertical eye scale
  eyeScaleX: number;      // horizontal eye scale
  leftBrowY: number;      // left eyebrow Y offset
  rightBrowY: number;     // right eyebrow Y offset
  leftBrowAngle: number;  // left eyebrow rotation degrees
  rightBrowAngle: number; // right eyebrow rotation degrees
  cheekOpacity: number;   // blush opacity
  smileWidth: number;     // mouth width
  smileCurve: number;     // mouth curve depth
  headTilt: number;       // head tilt degrees
  irisY: number;          // iris vertical offset (looking direction)
  irisX: number;          // iris horizontal offset
  mouthOffsetY: number;   // mouth vertical offset
  showTeeth: boolean;     // show teeth in mouth
  eyeSquint: number;      // 0-1, how squinted (happy eyes)
}

export function Animated3DTutorAvatar({
  speaking,
  expression = 'neutral',
  size = 120,
}: Animated3DTutorAvatarProps) {
  const [mouthPhase, setMouthPhase] = useState(0);
  const [blink, setBlink] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(1);
  const prevExpression = useRef(expression);
  const svgRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef<number>(0);
  const transitionRafRef = useRef<number>(0);

  // Lip-sync animation — cycle through mouth shapes when speaking
  useEffect(() => {
    if (!speaking) return;
    const interval = setInterval(() => {
      setMouthPhase((prev) => (prev + 1) % MOUTH_SHAPES.length);
    }, 130);
    return () => clearInterval(interval);
  }, [speaking]);

  // Reset mouth phase when not speaking
  useEffect(() => {
    if (!speaking) {
      const timeout = setTimeout(() => setMouthPhase(0), 50);
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
        timeout = setTimeout(doBlink, 2000 + Math.random() * 3000);
      }, 130);
    };
    timeout = setTimeout(doBlink, 1500 + Math.random() * 2000);
    return () => clearTimeout(timeout);
  }, []);

  // Expression transition animation — deferred setState to avoid synchronous call in effect
  useEffect(() => {
    if (prevExpression.current !== expression) {
      prevExpression.current = expression;
      const start = performance.now();
      const duration = 300;
      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        setTransitionProgress(progress === 0 ? 0 : 1 - Math.pow(1 - progress, 3));
        if (progress < 1) {
          transitionRafRef.current = requestAnimationFrame(animate);
        }
      };
      // Defer animation start to next frame to avoid synchronous setState in effect body
      transitionRafRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(transitionRafRef.current);
  }, [expression]);

  // Head bob when speaking + breathing when idle
  useEffect(() => {
    let t = 0;
    const animate = () => {
      t += 0.04;
      if (speaking) {
        const y = Math.sin(t * 2.8) * 2;
        const x = Math.sin(t * 1.4) * 0.5;
        if (svgRef.current) {
          svgRef.current.style.transform = `translate(${x}px, ${y}px) scale(1)`;
        }
      } else {
        const scale = 1 + Math.sin(t * 0.4) * 0.008;
        const y = Math.sin(t * 0.6) * 0.5;
        if (svgRef.current) {
          svgRef.current.style.transform = `translate(0px, ${y}px) scale(${scale})`;
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [speaking]);

  // Expression-based configurations
  const config = useMemo<ExpressionConfig>(() => {
    switch (expression) {
      case 'explaining':
        return {
          eyeScaleY: 1.18, eyeScaleX: 1.05,
          leftBrowY: -5, rightBrowY: -5,
          leftBrowAngle: -8, rightBrowAngle: 8,
          cheekOpacity: 0.55,
          smileWidth: 14, smileCurve: 6,
          headTilt: 0,
          irisY: -1, irisX: 0,
          mouthOffsetY: 0,
          showTeeth: true,
          eyeSquint: 0,
        };
      case 'thinking':
        return {
          eyeScaleY: 0.88, eyeScaleX: 1.0,
          leftBrowY: -6, rightBrowY: 3,
          leftBrowAngle: -12, rightBrowAngle: 4,
          cheekOpacity: 0.15,
          smileWidth: 8, smileCurve: 2,
          headTilt: 5,
          irisY: -4, irisX: -2,
          mouthOffsetY: 1,
          showTeeth: false,
          eyeSquint: 0,
        };
      case 'happy':
        return {
          eyeScaleY: 0.65, eyeScaleX: 1.1,
          leftBrowY: -2, rightBrowY: -2,
          leftBrowAngle: -3, rightBrowAngle: 3,
          cheekOpacity: 0.7,
          smileWidth: 18, smileCurve: 10,
          headTilt: -2,
          irisY: 0, irisX: 0,
          mouthOffsetY: -1,
          showTeeth: true,
          eyeSquint: 0.6,
        };
      case 'curious':
        return {
          eyeScaleY: 1.25, eyeScaleX: 1.1,
          leftBrowY: -6, rightBrowY: -7,
          leftBrowAngle: -10, rightBrowAngle: 10,
          cheekOpacity: 0.3,
          smileWidth: 10, smileCurve: 4,
          headTilt: -4,
          irisY: -2, irisX: 1,
          mouthOffsetY: 0,
          showTeeth: false,
          eyeSquint: 0,
        };
      default: // neutral
        return {
          eyeScaleY: 1, eyeScaleX: 1,
          leftBrowY: 0, rightBrowY: 0,
          leftBrowAngle: -2, rightBrowAngle: 2,
          cheekOpacity: 0.2,
          smileWidth: 12, smileCurve: 4,
          headTilt: 0,
          irisY: 0, irisX: 0,
          mouthOffsetY: 0,
          showTeeth: false,
          eyeSquint: 0,
        };
    }
  }, [expression]);

  // Current mouth shape
  const mouthShape = useMemo(() => {
    if (!speaking) {
      return null; // use smile
    }
    return MOUTH_SHAPES[mouthPhase % MOUTH_SHAPES.length];
  }, [speaking, mouthPhase]);

  // Interpolated head tilt with transition
  const headTilt = config.headTilt * transitionProgress;

  return (
    <div
      className="relative inline-block"
      style={{ width: size, height: size * (220 / 200) }}
      role="img"
      aria-label={`AI Tutor avatar${speaking ? ' speaking' : ''} — ${expression}`}
    >
      {/* Glow ring with emerald pulse */}
      <div
        className={`absolute inset-0 rounded-full ${speaking ? 'animate-tutor-glow-active' : 'animate-tutor-glow-idle'}`}
        style={{
          background: 'conic-gradient(from 0deg, #10b981, #0d9488, #14b8a6, #10b981)',
          opacity: speaking ? 0.6 : 0.35,
          filter: 'blur(8px)',
          width: size,
          height: size,
          top: 0,
          left: 0,
        }}
      />

      {/* Avatar SVG */}
      <svg
        ref={svgRef}
        viewBox="0 0 200 220"
        width={size}
        height={size * (220 / 200)}
        className="relative z-10"
        style={{ transformOrigin: '100px 120px' }}
      >
        <defs>
          {/* Skin gradient — realistic warm 3D tone with undertones */}
          <radialGradient id="skinGrad" cx="48%" cy="38%" r="52%" fx="45%" fy="35%">
            <stop offset="0%" stopColor="#FDDCB5" />
            <stop offset="20%" stopColor="#F8CCA0" />
            <stop offset="45%" stopColor="#F0BA88" />
            <stop offset="70%" stopColor="#E4A870" />
            <stop offset="90%" stopColor="#D49660" />
            <stop offset="100%" stopColor="#C08550" />
          </radialGradient>

          {/* Skin highlight for forehead/nose bridge — enhanced */}
          <radialGradient id="skinHighlight" cx="50%" cy="30%" r="35%">
            <stop offset="0%" stopColor="#FFF0E0" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#FFE8D0" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFE8D0" stopOpacity="0" />
          </radialGradient>

          {/* Ear skin gradient */}
          <radialGradient id="earGrad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#F5C090" />
            <stop offset="100%" stopColor="#D4925A" />
          </radialGradient>

          {/* Hair gradient — rich dark brown with realistic depth */}
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#4A3020" />
            <stop offset="15%" stopColor="#3D2212" />
            <stop offset="30%" stopColor="#5C3A28" />
            <stop offset="50%" stopColor="#4A2E1C" />
            <stop offset="75%" stopColor="#3A2015" />
            <stop offset="100%" stopColor="#2C1810" />
          </linearGradient>

          {/* Hair highlight shine — more natural */}
          <linearGradient id="hairShine" x1="30%" y1="0%" x2="70%" y2="40%">
            <stop offset="0%" stopColor="#7B5230" stopOpacity="0" />
            <stop offset="25%" stopColor="#9B7350" stopOpacity="0.35" />
            <stop offset="40%" stopColor="#A08060" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#8B6340" stopOpacity="0.4" />
            <stop offset="75%" stopColor="#7B5230" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#5C3A20" stopOpacity="0" />
          </linearGradient>

          {/* Glasses frame gradient */}
          <linearGradient id="glassesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3A3A3A" />
            <stop offset="50%" stopColor="#1A1A1A" />
            <stop offset="100%" stopColor="#2A2A2A" />
          </linearGradient>

          {/* Glasses lens subtle tint */}
          <linearGradient id="lensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.12" />
            <stop offset="50%" stopColor="#E8F0FF" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
          </linearGradient>

          {/* Eye iris gradient */}
          <radialGradient id="irisGrad" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#6B4423" />
            <stop offset="40%" stopColor="#4A2E15" />
            <stop offset="100%" stopColor="#2A1A0A" />
          </radialGradient>

          {/* White shirt gradient */}
          <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FAFAFA" />
            <stop offset="50%" stopColor="#F0F0F0" />
            <stop offset="100%" stopColor="#E5E5E5" />
          </linearGradient>

          {/* Tie gradient — burgundy/maroon */}
          <linearGradient id="tieGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8B1A2B" />
            <stop offset="30%" stopColor="#7A1525" />
            <stop offset="60%" stopColor="#6B1020" />
            <stop offset="100%" stopColor="#5A0A18" />
          </linearGradient>

          {/* Tie knot gradient */}
          <radialGradient id="tieKnotGrad" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#A02040" />
            <stop offset="100%" stopColor="#6B1020" />
          </radialGradient>

          {/* Blazer gradient — dark charcoal */}
          <linearGradient id="blazerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2D3748" />
            <stop offset="40%" stopColor="#1F2937" />
            <stop offset="100%" stopColor="#1A202C" />
          </linearGradient>

          {/* Blazer lapel gradient */}
          <linearGradient id="lapelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="100%" stopColor="#1F2937" />
          </linearGradient>

          {/* Nose shadow */}
          <radialGradient id="noseShadow" cx="50%" cy="60%" r="50%">
            <stop offset="0%" stopColor="#D4925A" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#D4925A" stopOpacity="0" />
          </radialGradient>

          {/* Cheek blush */}
          <radialGradient id="cheekBlush" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF9A9A" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FF9A9A" stopOpacity="0" />
          </radialGradient>

          {/* Mouth interior gradient */}
          <radialGradient id="mouthInterior" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#8B1A1A" />
            <stop offset="60%" stopColor="#5A0F0F" />
            <stop offset="100%" stopColor="#3A0808" />
          </radialGradient>

          {/* Lip gradient */}
          <linearGradient id="lipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#CC5555" />
            <stop offset="100%" stopColor="#AA3A3A" />
          </linearGradient>

          {/* Shadow filters */}
          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
            <feOffset dx="2" dy="4" result="offsetBlur" />
            <feFlood floodColor="#000000" floodOpacity="0.25" result="color" />
            <feComposite in="color" in2="offsetBlur" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
            <feOffset dx="1" dy="2" result="offsetBlur" />
            <feFlood floodColor="#000000" floodOpacity="0.15" result="color" />
            <feComposite in="color" in2="offsetBlur" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="innerGlow" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
            <feFlood floodColor="#FFFFFF" floodOpacity="0.3" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Neck shadow */}
          <linearGradient id="neckGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8A870" />
            <stop offset="100%" stopColor="#D49060" />
          </linearGradient>

          {/* Collar shadow */}
          <linearGradient id="collarShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E0E0E0" stopOpacity="0" />
            <stop offset="100%" stopColor="#C0C0C0" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* ===== MAIN CHARACTER GROUP with head tilt ===== */}
        <g transform={`rotate(${headTilt}, 100, 80)`} filter="url(#dropShadow)">

          {/* ===== BLAZER / JACKET SHOULDERS ===== */}
          <path
            d="M30,170 Q30,150 55,142 L75,138 Q100,136 100,136 Q100,136 125,138 L145,142 Q170,150 170,170 L170,220 L30,220 Z"
            fill="url(#blazerGrad)"
          />
          {/* Blazer lapels */}
          <path
            d="M75,138 L85,155 L90,142 Q95,138 100,136"
            fill="url(#lapelGrad)"
            stroke="#1A202C"
            strokeWidth="0.5"
          />
          <path
            d="M125,138 L115,155 L110,142 Q105,138 100,136"
            fill="url(#lapelGrad)"
            stroke="#1A202C"
            strokeWidth="0.5"
          />
          {/* Lapel stitch lines */}
          <path d="M82,148 L87,158" stroke="#4A5568" strokeWidth="0.4" opacity="0.5" />
          <path d="M118,148 L113,158" stroke="#4A5568" strokeWidth="0.4" opacity="0.5" />

          {/* ===== WHITE SHIRT (visible under blazer) ===== */}
          <path
            d="M85,138 L90,142 Q95,138 100,136 Q105,138 110,142 L115,138 L112,160 L100,170 L88,160 Z"
            fill="url(#shirtGrad)"
          />
          {/* Shirt collar - left */}
          <path
            d="M80,138 L90,142 L88,158 L78,150 Z"
            fill="#F5F5F5"
            stroke="#E0E0E0"
            strokeWidth="0.5"
          />
          {/* Shirt collar - right */}
          <path
            d="M120,138 L110,142 L112,158 L122,150 Z"
            fill="#F5F5F5"
            stroke="#E0E0E0"
            strokeWidth="0.5"
          />
          {/* Collar fold lines */}
          <path d="M82,142 L89,148" stroke="#D0D0D0" strokeWidth="0.5" opacity="0.6" />
          <path d="M118,142 L111,148" stroke="#D0D0D0" strokeWidth="0.5" opacity="0.6" />

          {/* ===== TIE ===== */}
          {/* Tie knot */}
          <path
            d="M96,148 L100,144 L104,148 L102,152 L98,152 Z"
            fill="url(#tieKnotGrad)"
          />
          {/* Tie body */}
          <path
            d="M96,152 L98,152 L97,195 L100,200 L103,195 L102,152 L104,152 Z"
            fill="url(#tieGrad)"
          />
          {/* Tie stripe detail */}
          <path d="M97,165 L103,163" stroke="#9A2540" strokeWidth="0.8" opacity="0.4" />
          <path d="M97,178 L103,176" stroke="#9A2540" strokeWidth="0.8" opacity="0.3" />
          {/* Tie center line */}
          <line x1="100" y1="152" x2="100" y2="198" stroke="#5A0A18" strokeWidth="0.5" opacity="0.3" />

          {/* ===== NECK ===== */}
          <path
            d="M88,124 Q88,130 86,136 L114,136 Q112,130 112,124 Z"
            fill="url(#neckGrad)"
          />
          {/* Neck shadow under chin */}
          <ellipse cx="100" cy="136" rx="14" ry="3" fill="#C08050" opacity="0.25" />

          {/* ===== HEAD ===== */}
          <g transform={`translate(0, ${config.leftBrowY * 0.15})`}>
            {/* Head shape - slightly wider at cheeks for 3D cartoon look */}
            <ellipse cx="100" cy="76" rx="44" ry="48" fill="url(#skinGrad)" />

            {/* Forehead highlight */}
            <ellipse cx="95" cy="55" rx="28" ry="18" fill="url(#skinHighlight)" />

            {/* Jaw / chin definition */}
            <path
              d="M62,82 Q65,108 80,118 Q90,124 100,124 Q110,124 120,118 Q135,108 138,82"
              fill="none"
              stroke="#D4925A"
              strokeWidth="0.5"
              opacity="0.3"
            />

            {/* Subtle smile lines (nasolabial folds) for realism */}
            <path
              d="M72,90 Q74,98 78,106"
              fill="none"
              stroke="#D49660"
              strokeWidth="0.6"
              opacity="0.25"
              strokeLinecap="round"
            />
            <path
              d="M128,90 Q126,98 122,106"
              fill="none"
              stroke="#D49660"
              strokeWidth="0.6"
              opacity="0.25"
              strokeLinecap="round"
            />
            {/* Subtle forehead wrinkle lines */}
            <path d="M78,56 Q88,54 98,56" fill="none" stroke="#D49660" strokeWidth="0.4" opacity="0.15" strokeLinecap="round" />
            <path d="M82,60 Q92,58 102,60" fill="none" stroke="#D49660" strokeWidth="0.3" opacity="0.12" strokeLinecap="round" />
            {/* Subtle under-eye lines */}
            <path d="M73,86 Q82,88 91,86" fill="none" stroke="#D49660" strokeWidth="0.4" opacity="0.15" strokeLinecap="round" />
            <path d="M109,86 Q118,88 127,86" fill="none" stroke="#D49660" strokeWidth="0.4" opacity="0.15" strokeLinecap="round" />

            {/* ===== EARS ===== */}
            {/* Left ear */}
            <ellipse cx="56" cy="80" rx="8" ry="12" fill="url(#earGrad)" />
            <ellipse cx="57" cy="80" rx="5" ry="9" fill="#D4925A" opacity="0.3" />
            <path d="M57,74 Q55,80 58,86" fill="none" stroke="#C08050" strokeWidth="0.7" opacity="0.4" />

            {/* Right ear */}
            <ellipse cx="144" cy="80" rx="8" ry="12" fill="url(#earGrad)" />
            <ellipse cx="143" cy="80" rx="5" ry="9" fill="#D4925A" opacity="0.3" />
            <path d="M143,74 Q145,80 142,86" fill="none" stroke="#C08050" strokeWidth="0.7" opacity="0.4" />

            {/* ===== HAIR ===== */}
            {/* Main hair volume */}
            <path
              d="M56,68 Q52,48 60,32 Q70,18 100,14 Q130,18 140,32 Q148,48 144,68
                 Q144,55 138,44 Q130,34 120,30 Q110,27 100,26 Q90,27 80,30
                 Q70,34 62,44 Q56,55 56,68 Z"
              fill="url(#hairGrad)"
            />
            {/* Hair shine overlay */}
            <path
              d="M65,50 Q70,28 100,20 Q110,22 120,30 Q125,34 128,42
                 Q120,32 110,28 Q100,26 88,28 Q78,32 70,42 Z"
              fill="url(#hairShine)"
            />
            {/* Hair volume details - side swept */}
            <path
              d="M56,65 Q54,50 60,36 Q55,48 54,62 Z"
              fill="#2C1810"
              opacity="0.6"
            />
            <path
              d="M144,65 Q146,50 140,36 Q145,48 146,62 Z"
              fill="#2C1810"
              opacity="0.6"
            />
            {/* Hair strands / texture */}
            <path d="M72,28 Q80,22 88,24" fill="none" stroke="#5C3A20" strokeWidth="1" opacity="0.4" />
            <path d="M85,22 Q95,16 108,20" fill="none" stroke="#5C3A20" strokeWidth="0.8" opacity="0.3" />
            <path d="M110,22 Q118,20 125,28" fill="none" stroke="#5C3A20" strokeWidth="0.8" opacity="0.3" />
            {/* Hair part line */}
            <path d="M90,18 Q92,24 88,32" fill="none" stroke="#2C1810" strokeWidth="0.8" opacity="0.5" />
            {/* Subtle hair shadow on forehead */}
            <path
              d="M62,60 Q70,50 80,46 Q90,44 100,44 Q110,44 120,46 Q130,50 138,60
                 Q135,54 125,48 Q115,44 100,42 Q85,44 75,48 Q65,54 62,60 Z"
              fill="#2C1810"
              opacity="0.15"
            />

            {/* ===== GLASSES ===== */}
            <g filter="url(#softShadow)">
              {/* Left lens frame */}
              <rect
                x="68" y="68" width="28" height="22" rx="4" ry="4"
                fill="url(#lensGrad)"
                stroke="url(#glassesGrad)"
                strokeWidth="2.5"
              />
              {/* Right lens frame */}
              <rect
                x="104" y="68" width="28" height="22" rx="4" ry="4"
                fill="url(#lensGrad)"
                stroke="url(#glassesGrad)"
                strokeWidth="2.5"
              />
              {/* Bridge */}
              <path
                d="M96,76 Q100,73 104,76"
                fill="none"
                stroke="url(#glassesGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Left temple arm */}
              <line x1="68" y1="74" x2="58" y2="72" stroke="#2A2A2A" strokeWidth="2" strokeLinecap="round" />
              {/* Right temple arm */}
              <line x1="132" y1="74" x2="142" y2="72" stroke="#2A2A2A" strokeWidth="2" strokeLinecap="round" />
              {/* Lens glare/reflection */}
              <path
                d="M73,71 L78,71 L73,76 Z"
                fill="white"
                opacity="0.15"
              />
              <path
                d="M109,71 L114,71 L109,76 Z"
                fill="white"
                opacity="0.12"
              />
            </g>

            {/* ===== EYEBROWS ===== */}
            {/* Left eyebrow */}
            <line
              x1="70" y1={64 + config.leftBrowY}
              x2="94" y2={64 + config.leftBrowY + config.leftBrowAngle * 0.3}
              stroke="#3D2212"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* Right eyebrow */}
            <line
              x1="106" y1={64 + config.rightBrowY + config.rightBrowAngle * 0.3}
              x2="130" y2={64 + config.rightBrowY}
              stroke="#3D2212"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* ===== EYES ===== */}
            {blink ? (
              /* Blink — closed eyes as curved lines */
              <>
                {/* Left eye blink */}
                <path
                  d="M72,79 Q82,83 92,79"
                  fill="none"
                  stroke="#2A1A0A"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Right eye blink */}
                <path
                  d="M108,79 Q118,83 128,79"
                  fill="none"
                  stroke="#2A1A0A"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </>
            ) : (
              <>
                {/* LEFT EYE */}
                <g>
                  {/* Sclera (white of eye) */}
                  <ellipse
                    cx="82" cy="79"
                    rx={8 * config.eyeScaleX}
                    ry={6 * config.eyeScaleY}
                    fill="white"
                    stroke="#E0D0C0"
                    strokeWidth="0.3"
                  />
                  {/* Iris */}
                  <ellipse
                    cx={82 + config.irisX}
                    cy={79 + config.irisY}
                    rx={4.5 * Math.min(config.eyeScaleX, config.eyeScaleY)}
                    ry={5 * Math.min(config.eyeScaleX, config.eyeScaleY)}
                    fill="url(#irisGrad)"
                  />
                  {/* Pupil */}
                  <ellipse
                    cx={82 + config.irisX}
                    cy={79 + config.irisY}
                    rx={2}
                    ry={2.5}
                    fill="#0A0A0A"
                  />
                  {/* Highlight dot - main */}
                  <circle
                    cx={84 + config.irisX * 0.5}
                    cy={76 + config.irisY * 0.5}
                    r={1.8}
                    fill="white"
                    opacity="0.9"
                  />
                  {/* Highlight dot - secondary */}
                  <circle
                    cx={80 + config.irisX * 0.3}
                    cy={81 + config.irisY * 0.3}
                    r={0.8}
                    fill="white"
                    opacity="0.5"
                  />
                  {/* Upper eyelid shadow */}
                  <ellipse
                    cx="82"
                    cy={74}
                    rx={8 * config.eyeScaleX}
                    ry={3}
                    fill="#C08050"
                    opacity="0.12"
                  />
                  {/* Happy squint - upper eyelid droop */}
                  {config.eyeSquint > 0 && (
                    <ellipse
                      cx="82"
                      cy={75 - config.eyeSquint * 1.5}
                      rx={8 * config.eyeScaleX + 1}
                      ry={config.eyeSquint * 4}
                      fill="url(#skinGrad)"
                    />
                  )}
                </g>

                {/* RIGHT EYE */}
                <g>
                  {/* Sclera (white of eye) */}
                  <ellipse
                    cx="118" cy="79"
                    rx={8 * config.eyeScaleX}
                    ry={6 * config.eyeScaleY}
                    fill="white"
                    stroke="#E0D0C0"
                    strokeWidth="0.3"
                  />
                  {/* Iris */}
                  <ellipse
                    cx={118 + config.irisX}
                    cy={79 + config.irisY}
                    rx={4.5 * Math.min(config.eyeScaleX, config.eyeScaleY)}
                    ry={5 * Math.min(config.eyeScaleX, config.eyeScaleY)}
                    fill="url(#irisGrad)"
                  />
                  {/* Pupil */}
                  <ellipse
                    cx={118 + config.irisX}
                    cy={79 + config.irisY}
                    rx={2}
                    ry={2.5}
                    fill="#0A0A0A"
                  />
                  {/* Highlight dot - main */}
                  <circle
                    cx={120 + config.irisX * 0.5}
                    cy={76 + config.irisY * 0.5}
                    r={1.8}
                    fill="white"
                    opacity="0.9"
                  />
                  {/* Highlight dot - secondary */}
                  <circle
                    cx={116 + config.irisX * 0.3}
                    cy={81 + config.irisY * 0.3}
                    r={0.8}
                    fill="white"
                    opacity="0.5"
                  />
                  {/* Upper eyelid shadow */}
                  <ellipse
                    cx="118"
                    cy={74}
                    rx={8 * config.eyeScaleX}
                    ry={3}
                    fill="#C08050"
                    opacity="0.12"
                  />
                  {/* Happy squint - upper eyelid droop */}
                  {config.eyeSquint > 0 && (
                    <ellipse
                      cx="118"
                      cy={75 - config.eyeSquint * 1.5}
                      rx={8 * config.eyeScaleX + 1}
                      ry={config.eyeSquint * 4}
                      fill="url(#skinGrad)"
                    />
                  )}
                </g>
              </>
            )}

            {/* ===== NOSE ===== */}
            {/* Nose bridge highlight */}
            <path
              d="M99,72 Q99,86 97,92"
              fill="none"
              stroke="#FFE0C0"
              strokeWidth="1.5"
              opacity="0.4"
              strokeLinecap="round"
            />
            {/* Nose shape */}
            <path
              d="M95,92 Q96,88 100,88 Q104,88 105,92 Q104,96 100,97 Q96,96 95,92 Z"
              fill="#F0B888"
              opacity="0.5"
            />
            {/* Nostrils */}
            <ellipse cx="97" cy="95" rx="2" ry="1.2" fill="#C08050" opacity="0.4" />
            <ellipse cx="103" cy="95" rx="2" ry="1.2" fill="#C08050" opacity="0.4" />
            {/* Nose tip highlight */}
            <ellipse cx="100" cy="90" rx="2.5" ry="1.5" fill="#FFE8D0" opacity="0.35" />
            {/* Nose shadow */}
            <ellipse cx="100" cy="98" rx="6" ry="2" fill="url(#noseShadow)" />

            {/* ===== CHEEKS (blush) ===== */}
            {config.cheekOpacity > 0 && (
              <>
                <circle cx="68" cy="92" r="9" fill="url(#cheekBlush)" opacity={config.cheekOpacity} />
                <circle cx="132" cy="92" r="9" fill="url(#cheekBlush)" opacity={config.cheekOpacity} />
              </>
            )}

            {/* ===== MOUTH ===== */}
            <g transform={`translate(0, ${config.mouthOffsetY})`}>
              {!speaking ? (
                /* Closed mouth - smile */
                <>
                  {/* Upper lip */}
                  <path
                    d={`M${100 - config.smileWidth},104 Q${100 - config.smileWidth / 2},${103} 100,102 Q${100 + config.smileWidth / 2},${103} ${100 + config.smileWidth},104`}
                    fill="url(#lipGrad)"
                    opacity="0.85"
                  />
                  {/* Smile line */}
                  <path
                    d={`M${100 - config.smileWidth},104 Q100,${104 + config.smileCurve} ${100 + config.smileWidth},104`}
                    fill="none"
                    stroke="#CC4444"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  {/* Lower lip hint */}
                  <path
                    d={`M${100 - config.smileWidth + 3},105 Q100,${105 + config.smileCurve * 0.6} ${100 + config.smileWidth - 3},105`}
                    fill="none"
                    stroke="#BB5555"
                    strokeWidth="0.8"
                    opacity="0.4"
                    strokeLinecap="round"
                  />
                </>
              ) : (
                /* Open mouth - speaking */
                <g>
                  {/* Mouth opening */}
                  <ellipse
                    cx="100"
                    cy="106"
                    rx={mouthShape?.rx ?? 6}
                    ry={mouthShape?.ry ?? 8}
                    fill="url(#mouthInterior)"
                    stroke="#AA3A3A"
                    strokeWidth="1.5"
                  />
                  {/* Upper lip */}
                  <path
                    d={`M${100 - (mouthShape?.rx ?? 6) - 2},104 Q100,101 ${100 + (mouthShape?.rx ?? 6) + 2},104`}
                    fill="url(#lipGrad)"
                    opacity="0.85"
                  />
                  {/* Lower lip */}
                  <path
                    d={`M${100 - (mouthShape?.rx ?? 6) - 1},${106 + (mouthShape?.ry ?? 8)} Q100,${108 + (mouthShape?.ry ?? 8)} ${100 + (mouthShape?.rx ?? 6) + 1},${106 + (mouthShape?.ry ?? 8)}`}
                    fill="url(#lipGrad)"
                    opacity="0.7"
                  />
                  {/* Teeth when mouth is wide enough */}
                  {config.showTeeth && (mouthShape?.ry ?? 0) > 5 && (
                    <>
                      {/* Top teeth */}
                      <rect
                        x={100 - (mouthShape?.rx ?? 6) + 3}
                        y={103}
                        width={((mouthShape?.rx ?? 6) - 3) * 2}
                        height={4}
                        rx="1"
                        fill="white"
                        opacity="0.9"
                      />
                      {/* Tooth separator lines */}
                      <line
                        x1={100 - 2} y1={103} x2={100 - 2} y2={107}
                        stroke="#E8E8E8" strokeWidth="0.3" opacity="0.5"
                      />
                      <line
                        x1={100 + 2} y1={103} x2={100 + 2} y2={107}
                        stroke="#E8E8E8" strokeWidth="0.3" opacity="0.5"
                      />
                    </>
                  )}
                  {/* Tongue hint when mouth is very open */}
                  {(mouthShape?.ry ?? 0) > 8 && (
                    <ellipse
                      cx="100"
                      cy={110 + (mouthShape?.ry ?? 8) * 0.3}
                      rx={(mouthShape?.rx ?? 6) * 0.5}
                      ry="3"
                      fill="#D45555"
                      opacity="0.6"
                    />
                  )}
                </g>
              )}
            </g>

            {/* ===== CHIN ===== */}
            {/* Subtle chin highlight */}
            <ellipse cx="100" cy="118" rx="12" ry="3" fill="#FFE0C0" opacity="0.2" />

            {/* ===== THINKING POSE — hand on chin ===== */}
            {expression === 'thinking' && (
              <g opacity={transitionProgress}>
                {/* Hand near chin */}
                <ellipse cx="130" cy="108" rx="10" ry="8" fill="#F5C090" stroke="#D4925A" strokeWidth="0.5" />
                {/* Fingers */}
                <path d="M122,104 Q120,98 124,96" fill="none" stroke="#E8A870" strokeWidth="3" strokeLinecap="round" />
                <path d="M126,102 Q125,95 128,93" fill="none" stroke="#E8A870" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M130,102 Q130,94 132,92" fill="none" stroke="#E8A870" strokeWidth="2.5" strokeLinecap="round" />
                {/* Thumb */}
                <path d="M136,106 Q142,104 140,110" fill="none" stroke="#E8A870" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            )}
          </g>
        </g>

        {/* ===== SUBTLE LIGHTING OVERLAY ===== */}
        {/* Top-left light source */}
        <ellipse cx="80" cy="60" rx="50" ry="40" fill="white" opacity="0.04" />
      </svg>

      {/* Sound wave indicators when speaking */}
      {speaking && (
        <div className="absolute -right-1 top-1/3 flex items-center gap-0.5 z-20">
          <div className="w-0.5 rounded-full bg-emerald-500 animate-sound-wave-1" style={{ height: '10px' }} />
          <div className="w-0.5 rounded-full bg-emerald-500 animate-sound-wave-2" style={{ height: '14px' }} />
          <div className="w-0.5 rounded-full bg-emerald-500 animate-sound-wave-3" style={{ height: '10px' }} />
        </div>
      )}
    </div>
  );
}
