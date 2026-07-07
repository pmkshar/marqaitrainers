'use client';

import { useEffect, useRef, useMemo, useState } from 'react';

// ============================================================
// Animated3DTutorAvatar — Photorealistic 3D human tutor avatar
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

  // Expression transition animation
  useEffect(() => {
    if (prevExpression.current !== expression) {
      prevExpression.current = expression;
      const start = performance.now();
      const duration = 300;
      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        setTransitionProgress(progress === 0 ? 0 : 1 - Math.pow(1 - progress, 3));
        if (progress < 1) {
          transitionRafRef.current = requestAnimationFrame(animate);
        }
      };
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
      return null;
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
          {/* ===== SKIN GRADIENTS — Subsurface scattering simulation ===== */}
          {/* Base skin with warm undertone and SSS */}
          <radialGradient id="skinGrad" cx="48%" cy="38%" r="52%" fx="45%" fy="35%">
            <stop offset="0%" stopColor="#FDE0C2" />
            <stop offset="15%" stopColor="#F8D0A8" />
            <stop offset="30%" stopColor="#F2BE90" />
            <stop offset="50%" stopColor="#EBAB78" />
            <stop offset="70%" stopColor="#D99868" />
            <stop offset="85%" stopColor="#C88858" />
            <stop offset="100%" stopColor="#B87848" />
          </radialGradient>

          {/* SSS warm subsurface layer — simulates light scattering through skin */}
          <radialGradient id="skinSSS" cx="50%" cy="42%" r="55%">
            <stop offset="0%" stopColor="#FFE0C8" stopOpacity="0.5" />
            <stop offset="30%" stopColor="#FFD0B0" stopOpacity="0.3" />
            <stop offset="60%" stopColor="#FFBFA0" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FFB090" stopOpacity="0" />
          </radialGradient>

          {/* Forehead highlight — specular */}
          <radialGradient id="foreheadSpecular" cx="45%" cy="28%" r="30%">
            <stop offset="0%" stopColor="#FFF5E8" stopOpacity="0.6" />
            <stop offset="40%" stopColor="#FFE8D0" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FFE0C0" stopOpacity="0" />
          </radialGradient>

          {/* Nose specular highlight */}
          <radialGradient id="noseSpecular" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#FFF8F0" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#FFE8D0" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFD8B8" stopOpacity="0" />
          </radialGradient>

          {/* Cheekbone specular highlight */}
          <radialGradient id="cheekboneSpecular" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF0E0" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFE0C8" stopOpacity="0" />
          </radialGradient>

          {/* Ear skin gradient — redder (SSS through thin skin) */}
          <radialGradient id="earGrad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#F8C898" />
            <stop offset="40%" stopColor="#EEB888" />
            <stop offset="100%" stopColor="#D49868" />
          </radialGradient>

          {/* Ear SSS — pinkish glow through ear cartilage */}
          <radialGradient id="earSSS" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFB8A0" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFA890" stopOpacity="0" />
          </radialGradient>

          {/* Fresnel edge glow — slightly redder at skin edges */}
          <radialGradient id="fresnelGlow" cx="50%" cy="45%" r="50%">
            <stop offset="70%" stopColor="#FFC8A0" stopOpacity="0" />
            <stop offset="85%" stopColor="#FFB898" stopOpacity="0.15" />
            <stop offset="95%" stopColor="#FFA888" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FF9880" stopOpacity="0.45" />
          </radialGradient>

          {/* Jaw shadow — cooler tone for depth */}
          <linearGradient id="jawShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C09070" stopOpacity="0" />
            <stop offset="50%" stopColor="#B88868" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#A87858" stopOpacity="0.35" />
          </linearGradient>

          {/* ===== HAIR GRADIENTS ===== */}
          {/* Base hair — rich dark brown */}
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#4A3020" />
            <stop offset="15%" stopColor="#3D2212" />
            <stop offset="30%" stopColor="#5C3A28" />
            <stop offset="50%" stopColor="#4A2E1C" />
            <stop offset="75%" stopColor="#3A2015" />
            <stop offset="100%" stopColor="#2C1810" />
          </linearGradient>

          {/* Hair highlight — realistic sheen */}
          <linearGradient id="hairShine" x1="30%" y1="0%" x2="70%" y2="40%">
            <stop offset="0%" stopColor="#7B5230" stopOpacity="0" />
            <stop offset="20%" stopColor="#9B7350" stopOpacity="0.3" />
            <stop offset="35%" stopColor="#B89070" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#A08060" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#8B6340" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#5C3A20" stopOpacity="0" />
          </linearGradient>

          {/* Hair depth layer for strand clusters */}
          <linearGradient id="hairDepth" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A1508" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#3D2212" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2A1508" stopOpacity="0.5" />
          </linearGradient>

          {/* ===== EYE GRADIENTS ===== */}
          {/* Iris — radial gradient with fibrous texture feel */}
          <radialGradient id="irisGrad" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#8B6830" />
            <stop offset="20%" stopColor="#7A5525" />
            <stop offset="45%" stopColor="#5A3A18" />
            <stop offset="70%" stopColor="#3D2510" />
            <stop offset="90%" stopColor="#2A1A0A" />
            <stop offset="100%" stopColor="#1A1008" />
          </radialGradient>

          {/* Iris fibrous ring — darker outer edge */}
          <radialGradient id="irisRing" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="#000000" stopOpacity="0" />
            <stop offset="90%" stopColor="#1A1008" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0A0804" stopOpacity="0.7" />
          </radialGradient>

          {/* Pupil depth gradient */}
          <radialGradient id="pupilGrad" cx="45%" cy="42%" r="55%">
            <stop offset="0%" stopColor="#080808" />
            <stop offset="70%" stopColor="#050505" />
            <stop offset="100%" stopColor="#020202" />
          </radialGradient>

          {/* Sclera gradient — subtle warm tint (not pure white) */}
          <radialGradient id="scleraGrad" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#FAFAF8" />
            <stop offset="60%" stopColor="#F2F0EC" />
            <stop offset="100%" stopColor="#E8E4E0" />
          </radialGradient>

          {/* Caruncle (inner eye corner) */}
          <radialGradient id="caruncleGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E8A8A0" />
            <stop offset="100%" stopColor="#D0908A" stopOpacity="0.5" />
          </radialGradient>

          {/* Eye bag shadow */}
          <linearGradient id="eyeBagGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D09878" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#D09878" stopOpacity="0" />
          </linearGradient>

          {/* ===== NOSE GRADIENTS ===== */}
          {/* Nose bridge highlight */}
          <linearGradient id="noseBridgeHL" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF0D8" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#FFE8D0" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFE0C0" stopOpacity="0.1" />
          </linearGradient>

          {/* Nostril shadow */}
          <radialGradient id="nostrilShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8B6040" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8B6040" stopOpacity="0" />
          </radialGradient>

          {/* Nose tip specular */}
          <radialGradient id="noseTipSpec" cx="45%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#FFFAF0" stopOpacity="0.65" />
            <stop offset="40%" stopColor="#FFF0E0" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFE8D0" stopOpacity="0" />
          </radialGradient>

          {/* ===== LIP GRADIENTS ===== */}
          {/* Upper lip — slightly darker */}
          <linearGradient id="upperLipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C45050" />
            <stop offset="50%" stopColor="#B84545" />
            <stop offset="100%" stopColor="#A83A3A" />
          </linearGradient>

          {/* Lower lip — slightly lighter, plumper */}
          <linearGradient id="lowerLipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D05858" />
            <stop offset="40%" stopColor="#C85050" />
            <stop offset="100%" stopColor="#B84040" />
          </linearGradient>

          {/* Lip specular highlight */}
          <radialGradient id="lipSpecular" cx="50%" cy="30%" r="40%">
            <stop offset="0%" stopColor="#FF9090" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#D06060" stopOpacity="0" />
          </radialGradient>

          {/* Mouth interior gradient */}
          <radialGradient id="mouthInterior" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#8B1A1A" />
            <stop offset="60%" stopColor="#5A0F0F" />
            <stop offset="100%" stopColor="#3A0808" />
          </radialGradient>

          {/* Cheek blush */}
          <radialGradient id="cheekBlush" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF9A9A" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#FF9A9A" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FF9A9A" stopOpacity="0" />
          </radialGradient>

          {/* ===== CLOTHING GRADIENTS ===== */}
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

          {/* Blazer gradient — dark charcoal with depth */}
          <linearGradient id="blazerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2D3748" />
            <stop offset="40%" stopColor="#1F2937" />
            <stop offset="100%" stopColor="#1A202C" />
          </linearGradient>

          {/* Blazer highlight for 3D fold */}
          <linearGradient id="blazerHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3A4A5C" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#2A3848" stopOpacity="0" />
            <stop offset="100%" stopColor="#3A4A5C" stopOpacity="0.3" />
          </linearGradient>

          {/* Blazer lapel gradient */}
          <linearGradient id="lapelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="100%" stopColor="#1F2937" />
          </linearGradient>

          {/* Pocket square gradient */}
          <linearGradient id="pocketSquareGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#F0F0F0" />
            <stop offset="100%" stopColor="#E8E8E8" />
          </linearGradient>

          {/* Neck gradient */}
          <linearGradient id="neckGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8A870" />
            <stop offset="100%" stopColor="#D49060" />
          </linearGradient>

          {/* Chin ambient occlusion */}
          <radialGradient id="chinAO" cx="50%" cy="0%" r="80%">
            <stop offset="0%" stopColor="#A07850" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#A07850" stopOpacity="0" />
          </radialGradient>

          {/* ===== FILTERS ===== */}
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

          {/* Ambient occlusion blur filter */}
          <filter id="aoBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>

          {/* Subtle skin texture filter */}
          <filter id="skinTexture" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
            <feBlend in="SourceGraphic" in2="grayNoise" mode="soft-light" result="textured" />
            <feComposite in="textured" in2="SourceAlpha" operator="in" />
          </filter>

          {/* Eyelash filter for slight softness */}
          <filter id="lashBlur" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="0.3" />
          </filter>

          {/* Clip paths for head shape */}
          <clipPath id="headClip">
            <path d="M56,76 C56,48 68,28 100,26 C132,28 144,48 144,76 C144,90 140,108 132,116 C124,122 112,126 100,126 C88,126 76,122 68,116 C60,108 56,90 56,76 Z" />
          </clipPath>
        </defs>

        {/* ===== MAIN CHARACTER GROUP with head tilt ===== */}
        <g transform={`rotate(${headTilt}, 100, 80)`} filter="url(#dropShadow)">

          {/* ===== BLAZER / JACKET ===== */}
          <path
            d="M30,170 Q30,150 55,142 L75,138 Q100,136 100,136 Q100,136 125,138 L145,142 Q170,150 170,170 L170,220 L30,220 Z"
            fill="url(#blazerGrad)"
          />
          {/* Blazer 3D fold highlight */}
          <path
            d="M30,170 Q30,150 55,142 L75,138 Q100,136 100,136 Q100,136 125,138 L145,142 Q170,150 170,170 L170,220 L30,220 Z"
            fill="url(#blazerHighlight)"
          />

          {/* Shoulder seams — left */}
          <path
            d="M45,148 Q55,142 70,138"
            fill="none"
            stroke="#4A5568"
            strokeWidth="0.8"
            opacity="0.5"
            strokeDasharray="2,1"
          />
          {/* Shoulder seams — right */}
          <path
            d="M155,148 Q145,142 130,138"
            fill="none"
            stroke="#4A5568"
            strokeWidth="0.8"
            opacity="0.5"
            strokeDasharray="2,1"
          />

          {/* Blazer lapels — left */}
          <path
            d="M75,138 L84,158 L90,142 Q95,138 100,136"
            fill="url(#lapelGrad)"
            stroke="#1A202C"
            strokeWidth="0.5"
          />
          {/* Blazer lapels — right */}
          <path
            d="M125,138 L116,158 L110,142 Q105,138 100,136"
            fill="url(#lapelGrad)"
            stroke="#1A202C"
            strokeWidth="0.5"
          />
          {/* Lapel stitch lines */}
          <path d="M80,150 L86,162" stroke="#4A5568" strokeWidth="0.4" opacity="0.5" />
          <path d="M120,150 L114,162" stroke="#4A5568" strokeWidth="0.4" opacity="0.5" />

          {/* Pocket square */}
          <g transform="translate(128, 155)">
            <path d="M0,4 L5,-2 L8,3 L12,-4 L10,6 Z" fill="url(#pocketSquareGrad)" stroke="#D0D0D0" strokeWidth="0.3" />
            <path d="M5,-2 L7,0" fill="none" stroke="#E0E0E0" strokeWidth="0.3" />
            <path d="M8,3 L10,1" fill="none" stroke="#E8E8E8" strokeWidth="0.3" />
          </g>

          {/* Button — left side */}
          <circle cx="88" cy="172" r="2.5" fill="#1A202C" stroke="#2D3748" strokeWidth="0.5" />
          <circle cx="88" cy="172" r="1.2" fill="#2D3748" />
          {/* Button hole lines — right side */}
          <line x1="110" y1="168" x2="110" y2="172" stroke="#4A5568" strokeWidth="0.6" opacity="0.4" />
          <line x1="110" y1="178" x2="110" y2="182" stroke="#4A5568" strokeWidth="0.6" opacity="0.4" />

          {/* ===== WHITE SHIRT ===== */}
          <path
            d="M84,138 L90,142 Q95,138 100,136 Q105,138 110,142 L116,138 L112,162 L100,172 L88,162 Z"
            fill="url(#shirtGrad)"
          />
          {/* Shirt collar — left with proper fold */}
          <path
            d="M78,138 L90,142 L88,160 L76,152 Z"
            fill="#F5F5F5"
            stroke="#E0E0E0"
            strokeWidth="0.5"
          />
          {/* Shirt collar — right with proper fold */}
          <path
            d="M122,138 L110,142 L112,160 L124,152 Z"
            fill="#F5F5F5"
            stroke="#E0E0E0"
            strokeWidth="0.5"
          />
          {/* Collar fold lines */}
          <path d="M80,144 L88,150" stroke="#D0D0D0" strokeWidth="0.5" opacity="0.6" />
          <path d="M120,144 L112,150" stroke="#D0D0D0" strokeWidth="0.5" opacity="0.6" />
          {/* Collar inner fold shadow */}
          <path d="M82,146 L86,152" stroke="#C0C0C0" strokeWidth="0.4" opacity="0.4" />
          <path d="M118,146 L114,152" stroke="#C0C0C0" strokeWidth="0.4" opacity="0.4" />

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
          {/* Neck shadow under chin — deep ambient occlusion */}
          <ellipse cx="100" cy="136" rx="16" ry="4" fill="#A07050" opacity="0.3" />
          {/* Neck side shadows */}
          <path d="M88,126 Q88,132 87,136" fill="none" stroke="#B08060" strokeWidth="1.5" opacity="0.2" />
          <path d="M112,126 Q112,132 113,136" fill="none" stroke="#B08060" strokeWidth="1.5" opacity="0.2" />
          {/* Sternocleidomastoid shadow */}
          <path d="M92,126 Q95,132 94,136" fill="none" stroke="#C09070" strokeWidth="0.5" opacity="0.15" />
          <path d="M108,126 Q105,132 106,136" fill="none" stroke="#C09070" strokeWidth="0.5" opacity="0.15" />

          {/* ===== HEAD ===== */}
          <g transform={`translate(0, ${config.leftBrowY * 0.15})`}>
            {/* Anatomically correct head shape — slightly oval, wider at temples, narrower chin */}
            <path
              d="M56,76 C56,48 68,28 100,26 C132,28 144,48 144,76 C144,90 140,108 132,116 C124,122 112,126 100,126 C88,126 76,122 68,116 C60,108 56,90 56,76 Z"
              fill="url(#skinGrad)"
            />

            {/* SSS warm subsurface layer */}
            <path
              d="M56,76 C56,48 68,28 100,26 C132,28 144,48 144,76 C144,90 140,108 132,116 C124,122 112,126 100,126 C88,126 76,122 68,116 C60,108 56,90 56,76 Z"
              fill="url(#skinSSS)"
            />

            {/* Fresnel edge glow — slightly redder at skin silhouette edges */}
            <path
              d="M56,76 C56,48 68,28 100,26 C132,28 144,48 144,76 C144,90 140,108 132,116 C124,122 112,126 100,126 C88,126 76,122 68,116 C60,108 56,90 56,76 Z"
              fill="url(#fresnelGlow)"
            />

            {/* Forehead specular highlight */}
            <ellipse cx="92" cy="52" rx="26" ry="16" fill="url(#foreheadSpecular)" />

            {/* Jaw shadow — cooler tone for depth receding */}
            <path
              d="M62,100 Q68,114 80,120 Q90,126 100,126 Q110,126 120,120 Q132,114 138,100
                 L136,100 Q130,112 120,118 Q110,124 100,124 Q90,124 80,118 Q70,112 64,100 Z"
              fill="url(#jawShadow)"
            />

            {/* Ambient occlusion — temple creases */}
            <ellipse cx="64" cy="68" rx="6" ry="10" fill="#A07850" opacity="0.12" filter="url(#aoBlur)" />
            <ellipse cx="136" cy="68" rx="6" ry="10" fill="#A07850" opacity="0.12" filter="url(#aoBlur)" />

            {/* Subtle nasolabial folds for realism */}
            <path
              d="M72,92 Q74,100 78,110"
              fill="none"
              stroke="#C0906A"
              strokeWidth="0.7"
              opacity="0.25"
              strokeLinecap="round"
            />
            <path
              d="M128,92 Q126,100 122,110"
              fill="none"
              stroke="#C0906A"
              strokeWidth="0.7"
              opacity="0.25"
              strokeLinecap="round"
            />

            {/* Subtle forehead wrinkle lines */}
            <path d="M78,54 Q88,52 98,54" fill="none" stroke="#D49660" strokeWidth="0.4" opacity="0.15" strokeLinecap="round" />
            <path d="M82,58 Q92,56 102,58" fill="none" stroke="#D49660" strokeWidth="0.3" opacity="0.12" strokeLinecap="round" />

            {/* ===== EARS ===== */}
            {/* Left ear */}
            <ellipse cx="56" cy="80" rx="8" ry="13" fill="url(#earGrad)" />
            {/* Ear SSS glow */}
            <ellipse cx="56" cy="80" rx="7" ry="11" fill="url(#earSSS)" />
            {/* Ear inner fold */}
            <ellipse cx="57" cy="80" rx="5" ry="9" fill="#D4925A" opacity="0.25" />
            <path d="M57,73 Q55,80 58,87" fill="none" stroke="#B87850" strokeWidth="0.8" opacity="0.4" />
            <path d="M59,76 Q58,80 60,84" fill="none" stroke="#C0885A" strokeWidth="0.5" opacity="0.3" />
            {/* Ear ambient occlusion shadow */}
            <ellipse cx="58" cy="80" rx="3" ry="8" fill="#A07850" opacity="0.1" />

            {/* Right ear */}
            <ellipse cx="144" cy="80" rx="8" ry="13" fill="url(#earGrad)" />
            <ellipse cx="144" cy="80" rx="7" ry="11" fill="url(#earSSS)" />
            <ellipse cx="143" cy="80" rx="5" ry="9" fill="#D4925A" opacity="0.25" />
            <path d="M143,73 Q145,80 142,87" fill="none" stroke="#B87850" strokeWidth="0.8" opacity="0.4" />
            <path d="M141,76 Q142,80 140,84" fill="none" stroke="#C0885A" strokeWidth="0.5" opacity="0.3" />
            <ellipse cx="142" cy="80" rx="3" ry="8" fill="#A07850" opacity="0.1" />

            {/* ===== HAIR ===== */}
            {/* Main hair volume — realistic shape with natural part */}
            <path
              d="M54,70 Q50,46 60,30 Q72,16 100,12 Q128,16 140,30 Q150,46 146,70
                 Q146,54 140,42 Q132,32 122,28 Q112,24 100,24 Q88,24 78,28
                 Q68,32 60,42 Q54,54 54,70 Z"
              fill="url(#hairGrad)"
            />

            {/* Hair shine overlay — natural sheen */}
            <path
              d="M64,48 Q70,24 100,16 Q112,18 122,28 Q128,34 132,44
                 Q122,30 110,26 Q100,24 86,26 Q76,30 68,42 Z"
              fill="url(#hairShine)"
            />

            {/* Hair depth layer — adds volume */}
            <path
              d="M58,62 Q56,48 62,34 Q58,50 56,66 Z"
              fill="url(#hairDepth)"
            />
            <path
              d="M142,62 Q144,48 138,34 Q142,50 144,66 Z"
              fill="url(#hairDepth)"
            />

            {/* Individual strand clusters — visible texture */}
            <path d="M68,28 Q76,20 86,22" fill="none" stroke="#5C3A20" strokeWidth="1.2" opacity="0.45" />
            <path d="M78,24 Q88,16 100,18" fill="none" stroke="#6B4830" strokeWidth="1" opacity="0.35" />
            <path d="M92,18 Q102,14 114,18" fill="none" stroke="#5C3A20" strokeWidth="1" opacity="0.35" />
            <path d="M108,20 Q118,18 128,28" fill="none" stroke="#6B4830" strokeWidth="1" opacity="0.3" />
            <path d="M64,38 Q70,28 80,26" fill="none" stroke="#4A2E18" strokeWidth="0.8" opacity="0.3" />
            <path d="M120,26 Q128,30 134,40" fill="none" stroke="#4A2E18" strokeWidth="0.8" opacity="0.3" />

            {/* Natural part line */}
            <path d="M88,16 Q90,22 86,32 Q84,38 85,44" fill="none" stroke="#1E1008" strokeWidth="1" opacity="0.6" />
            {/* Part shadow */}
            <path d="M86,18 Q88,26 84,36" fill="none" stroke="#0A0804" strokeWidth="0.6" opacity="0.3" />

            {/* Strand clusters near temples */}
            <path d="M56,60 Q54,52 58,44" fill="none" stroke="#3A2215" strokeWidth="1.5" opacity="0.5" />
            <path d="M58,58 Q56,50 60,42" fill="none" stroke="#4A3020" strokeWidth="1" opacity="0.4" />
            <path d="M144,60 Q146,52 142,44" fill="none" stroke="#3A2215" strokeWidth="1.5" opacity="0.5" />
            <path d="M142,58 Q144,50 140,42" fill="none" stroke="#4A3020" strokeWidth="1" opacity="0.4" />

            {/* Stray hairs at temples */}
            <path d="M55,64 Q52,58 54,50" fill="none" stroke="#4A2E18" strokeWidth="0.7" opacity="0.35" />
            <path d="M53,62 Q50,56 52,48" fill="none" stroke="#3D2212" strokeWidth="0.5" opacity="0.25" />
            <path d="M145,64 Q148,58 146,50" fill="none" stroke="#4A2E18" strokeWidth="0.7" opacity="0.35" />
            <path d="M147,62 Q150,56 148,48" fill="none" stroke="#3D2212" strokeWidth="0.5" opacity="0.25" />

            {/* Hair shadow on forehead */}
            <path
              d="M60,60 Q68,50 78,46 Q88,44 100,44 Q112,44 122,46 Q132,50 140,60
                 Q136,52 126,46 Q116,42 100,40 Q84,42 74,46 Q64,52 60,60 Z"
              fill="#1A1008"
              opacity="0.18"
            />

            {/* ===== EYEBROWS ===== */}
            {/* Left eyebrow — thicker with realistic shape */}
            <path
              d={`M70,${63 + config.leftBrowY} Q76,${60 + config.leftBrowY + config.leftBrowAngle * 0.2} 84,${62 + config.leftBrowY + config.leftBrowAngle * 0.35} Q90,${63 + config.leftBrowY + config.leftBrowAngle * 0.4} 94,${64 + config.leftBrowY + config.leftBrowAngle * 0.3}`}
              fill="none"
              stroke="#3D2212"
              strokeWidth="3.2"
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* Left eyebrow hair texture */}
            <path
              d={`M72,${63 + config.leftBrowY} Q78,${61 + config.leftBrowY + config.leftBrowAngle * 0.2} 86,${62 + config.leftBrowY + config.leftBrowAngle * 0.3}`}
              fill="none"
              stroke="#5C3A28"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.3"
            />

            {/* Right eyebrow */}
            <path
              d={`M106,${64 + config.rightBrowY + config.rightBrowAngle * 0.3} Q110,${63 + config.rightBrowY + config.rightBrowAngle * 0.4} 116,${62 + config.rightBrowY + config.rightBrowAngle * 0.35} Q124,${60 + config.rightBrowY + config.rightBrowAngle * 0.2} 130,${63 + config.rightBrowY}`}
              fill="none"
              stroke="#3D2212"
              strokeWidth="3.2"
              strokeLinecap="round"
              opacity="0.85"
            />
            <path
              d={`M108,${63 + config.rightBrowY + config.rightBrowAngle * 0.3} Q114,${61 + config.rightBrowY + config.rightBrowAngle * 0.3} 122,${62 + config.rightBrowY + config.rightBrowAngle * 0.2}`}
              fill="none"
              stroke="#5C3A28"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.3"
            />

            {/* ===== EYES ===== */}
            {blink ? (
              /* Blink — closed eyes as curved lines with lash suggestion */
              <>
                {/* Left eye blink line */}
                <path
                  d="M71,79 Q82,84 93,79"
                  fill="none"
                  stroke="#2A1A0A"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                {/* Blink lash hints */}
                <path d="M73,79 L72,77" stroke="#2A1A0A" strokeWidth="0.6" strokeLinecap="round" opacity="0.5" />
                <path d="M78,81 L77,79" stroke="#2A1A0A" strokeWidth="0.5" strokeLinecap="round" opacity="0.4" />
                <path d="M85,82 L85,80" stroke="#2A1A0A" strokeWidth="0.5" strokeLinecap="round" opacity="0.4" />
                <path d="M91,79 L92,77" stroke="#2A1A0A" strokeWidth="0.6" strokeLinecap="round" opacity="0.5" />

                {/* Right eye blink line */}
                <path
                  d="M107,79 Q118,84 129,79"
                  fill="none"
                  stroke="#2A1A0A"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path d="M109,79 L108,77" stroke="#2A1A0A" strokeWidth="0.6" strokeLinecap="round" opacity="0.5" />
                <path d="M115,81 L115,79" stroke="#2A1A0A" strokeWidth="0.5" strokeLinecap="round" opacity="0.4" />
                <path d="M122,82 L122,80" stroke="#2A1A0A" strokeWidth="0.5" strokeLinecap="round" opacity="0.4" />
                <path d="M128,79 L129,77" stroke="#2A1A0A" strokeWidth="0.6" strokeLinecap="round" opacity="0.5" />
              </>
            ) : (
              <>
                {/* LEFT EYE */}
                <g>
                  {/* Eye socket shadow — ambient occlusion around eye */}
                  <ellipse cx="82" cy="80" rx={12 * config.eyeScaleX} ry={9 * config.eyeScaleY} fill="#B88868" opacity="0.15" filter="url(#aoBlur)" />

                  {/* Sclera (white of eye) — warm tinted */}
                  <path
                    d={`M71,79 Q71,${73 - 2 * config.eyeScaleY} 82,${72 - 2 * config.eyeScaleY} Q93,${73 - 2 * config.eyeScaleY} 93,79 Q93,${85 + 2 * config.eyeScaleY} 82,${85 + 2 * config.eyeScaleY * 0.7} Q71,${85 + 2 * config.eyeScaleY} 71,79 Z`}
                    fill="url(#scleraGrad)"
                    stroke="#D0C0B0"
                    strokeWidth="0.3"
                  />

                  {/* Upper eyelid — more curved, realistic shape */}
                  <path
                    d={`M70,79 Q71,${72 - 3 * config.eyeScaleY} 82,${71 - 3 * config.eyeScaleY} Q93,${72 - 3 * config.eyeScaleY} 94,79`}
                    fill="none"
                    stroke="#8B6040"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />

                  {/* Lower eyelid — flatter, more subtle */}
                  <path
                    d={`M72,79 Q82,${86 + 2 * config.eyeScaleY * 0.5} 92,79`}
                    fill="none"
                    stroke="#A08060"
                    strokeWidth="0.7"
                    opacity="0.5"
                  />

                  {/* Eyelashes — upper lid, subtle */}
                  <g filter="url(#lashBlur)">
                    <path d={`M71,${77 - 2 * config.eyeScaleY} Q70,${74 - 2 * config.eyeScaleY} 71,${73 - 2 * config.eyeScaleY}`} fill="none" stroke="#2A1A0A" strokeWidth="0.7" opacity="0.6" />
                    <path d={`M74,${75 - 2 * config.eyeScaleY} Q73,${72 - 2 * config.eyeScaleY} 74,${71 - 2 * config.eyeScaleY}`} fill="none" stroke="#2A1A0A" strokeWidth="0.8" opacity="0.65" />
                    <path d={`M78,${73 - 3 * config.eyeScaleY} Q78,${70 - 3 * config.eyeScaleY} 79,${70 - 3 * config.eyeScaleY}`} fill="none" stroke="#2A1A0A" strokeWidth="0.9" opacity="0.7" />
                    <path d={`M82,${72 - 3 * config.eyeScaleY} Q82,${69 - 3 * config.eyeScaleY} 83,${69 - 3 * config.eyeScaleY}`} fill="none" stroke="#2A1A0A" strokeWidth="0.9" opacity="0.7" />
                    <path d={`M86,${73 - 3 * config.eyeScaleY} Q87,${70 - 3 * config.eyeScaleY} 87,${70 - 3 * config.eyeScaleY}`} fill="none" stroke="#2A1A0A" strokeWidth="0.9" opacity="0.65" />
                    <path d={`M90,${75 - 2 * config.eyeScaleY} Q91,${72 - 2 * config.eyeScaleY} 91,${72 - 2 * config.eyeScaleY}`} fill="none" stroke="#2A1A0A" strokeWidth="0.8" opacity="0.6" />
                    <path d={`M93,${77 - 2 * config.eyeScaleY} Q94,${74 - 2 * config.eyeScaleY} 94,${74 - 2 * config.eyeScaleY}`} fill="none" stroke="#2A1A0A" strokeWidth="0.7" opacity="0.55" />
                  </g>

                  {/* Caruncle (inner eye corner) */}
                  <ellipse cx="72" cy="79" rx="1.5" ry="2" fill="url(#caruncleGrad)" opacity="0.6" />

                  {/* Iris — with radial gradient and fibrous texture */}
                  <ellipse
                    cx={82 + config.irisX}
                    cy={79 + config.irisY}
                    rx={4.8 * Math.min(config.eyeScaleX, config.eyeScaleY)}
                    ry={5.2 * Math.min(config.eyeScaleX, config.eyeScaleY)}
                    fill="url(#irisGrad)"
                  />
                  {/* Iris fibrous ring — darker outer edge */}
                  <ellipse
                    cx={82 + config.irisX}
                    cy={79 + config.irisY}
                    rx={4.8 * Math.min(config.eyeScaleX, config.eyeScaleY)}
                    ry={5.2 * Math.min(config.eyeScaleX, config.eyeScaleY)}
                    fill="url(#irisRing)"
                  />
                  {/* Iris fibrous texture lines */}
                  <g opacity="0.15">
                    <line x1={82 + config.irisX} y1={73.5 + config.irisY} x2={82 + config.irisX} y2={84.5 + config.irisY} stroke="#6B4828" strokeWidth="0.3" />
                    <line x1={76.5 + config.irisX} y1={79 + config.irisY} x2={87.5 + config.irisX} y2={79 + config.irisY} stroke="#6B4828" strokeWidth="0.3" />
                    <line x1={78 + config.irisX} y1={75 + config.irisY} x2={86 + config.irisX} y2={83 + config.irisY} stroke="#6B4828" strokeWidth="0.2" />
                    <line x1={86 + config.irisX} y1={75 + config.irisY} x2={78 + config.irisX} y2={83 + config.irisY} stroke="#6B4828" strokeWidth="0.2" />
                  </g>

                  {/* Pupil — with depth */}
                  <ellipse
                    cx={82 + config.irisX}
                    cy={79 + config.irisY}
                    rx={2}
                    ry={2.5}
                    fill="url(#pupilGrad)"
                  />

                  {/* Highlight dot — main (specular) */}
                  <circle
                    cx={84 + config.irisX * 0.5}
                    cy={76 + config.irisY * 0.5}
                    r={1.8}
                    fill="white"
                    opacity="0.92"
                  />
                  {/* Highlight dot — secondary (diffuse) */}
                  <circle
                    cx={80 + config.irisX * 0.3}
                    cy={81 + config.irisY * 0.3}
                    r={0.7}
                    fill="white"
                    opacity="0.5"
                  />

                  {/* Upper eyelid shadow on eye */}
                  <path
                    d={`M71,79 Q71,${73 - 2 * config.eyeScaleY} 82,${72 - 2 * config.eyeScaleY} Q93,${73 - 2 * config.eyeScaleY} 93,79
                       Q93,${74 - config.eyeScaleY} 82,${73 - config.eyeScaleY} Q71,${74 - config.eyeScaleY} 71,79 Z`}
                    fill="#8B6040"
                    opacity="0.12"
                  />

                  {/* Eye bag under eye */}
                  <path
                    d={`M72,${83 + config.eyeScaleY} Q82,${87 + config.eyeScaleY} 92,${83 + config.eyeScaleY}`}
                    fill="none"
                    stroke="url(#eyeBagGrad)"
                    strokeWidth="2"
                    opacity="0.35"
                  />

                  {/* Happy squint — upper eyelid droop */}
                  {config.eyeSquint > 0 && (
                    <ellipse
                      cx="82"
                      cy={74 - config.eyeSquint * 1.5}
                      rx={9 * config.eyeScaleX + 1}
                      ry={config.eyeSquint * 4.5}
                      fill="url(#skinGrad)"
                    />
                  )}
                </g>

                {/* RIGHT EYE */}
                <g>
                  {/* Eye socket shadow */}
                  <ellipse cx="118" cy="80" rx={12 * config.eyeScaleX} ry={9 * config.eyeScaleY} fill="#B88868" opacity="0.15" filter="url(#aoBlur)" />

                  {/* Sclera */}
                  <path
                    d={`M107,79 Q107,${73 - 2 * config.eyeScaleY} 118,${72 - 2 * config.eyeScaleY} Q129,${73 - 2 * config.eyeScaleY} 129,79 Q129,${85 + 2 * config.eyeScaleY} 118,${85 + 2 * config.eyeScaleY * 0.7} Q107,${85 + 2 * config.eyeScaleY} 107,79 Z`}
                    fill="url(#scleraGrad)"
                    stroke="#D0C0B0"
                    strokeWidth="0.3"
                  />

                  {/* Upper eyelid */}
                  <path
                    d={`M106,79 Q107,${72 - 3 * config.eyeScaleY} 118,${71 - 3 * config.eyeScaleY} Q129,${72 - 3 * config.eyeScaleY} 130,79`}
                    fill="none"
                    stroke="#8B6040"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />

                  {/* Lower eyelid */}
                  <path
                    d={`M108,79 Q118,${86 + 2 * config.eyeScaleY * 0.5} 128,79`}
                    fill="none"
                    stroke="#A08060"
                    strokeWidth="0.7"
                    opacity="0.5"
                  />

                  {/* Eyelashes — upper lid */}
                  <g filter="url(#lashBlur)">
                    <path d={`M107,${77 - 2 * config.eyeScaleY} Q106,${74 - 2 * config.eyeScaleY} 107,${73 - 2 * config.eyeScaleY}`} fill="none" stroke="#2A1A0A" strokeWidth="0.7" opacity="0.6" />
                    <path d={`M110,${75 - 2 * config.eyeScaleY} Q109,${72 - 2 * config.eyeScaleY} 110,${71 - 2 * config.eyeScaleY}`} fill="none" stroke="#2A1A0A" strokeWidth="0.8" opacity="0.65" />
                    <path d={`M114,${73 - 3 * config.eyeScaleY} Q114,${70 - 3 * config.eyeScaleY} 115,${70 - 3 * config.eyeScaleY}`} fill="none" stroke="#2A1A0A" strokeWidth="0.9" opacity="0.7" />
                    <path d={`M118,${72 - 3 * config.eyeScaleY} Q118,${69 - 3 * config.eyeScaleY} 119,${69 - 3 * config.eyeScaleY}`} fill="none" stroke="#2A1A0A" strokeWidth="0.9" opacity="0.7" />
                    <path d={`M122,${73 - 3 * config.eyeScaleY} Q123,${70 - 3 * config.eyeScaleY} 123,${70 - 3 * config.eyeScaleY}`} fill="none" stroke="#2A1A0A" strokeWidth="0.9" opacity="0.65" />
                    <path d={`M126,${75 - 2 * config.eyeScaleY} Q127,${72 - 2 * config.eyeScaleY} 127,${72 - 2 * config.eyeScaleY}`} fill="none" stroke="#2A1A0A" strokeWidth="0.8" opacity="0.6" />
                    <path d={`M129,${77 - 2 * config.eyeScaleY} Q130,${74 - 2 * config.eyeScaleY} 130,${74 - 2 * config.eyeScaleY}`} fill="none" stroke="#2A1A0A" strokeWidth="0.7" opacity="0.55" />
                  </g>

                  {/* Caruncle (inner eye corner) */}
                  <ellipse cx="128" cy="79" rx="1.5" ry="2" fill="url(#caruncleGrad)" opacity="0.6" />

                  {/* Iris */}
                  <ellipse
                    cx={118 + config.irisX}
                    cy={79 + config.irisY}
                    rx={4.8 * Math.min(config.eyeScaleX, config.eyeScaleY)}
                    ry={5.2 * Math.min(config.eyeScaleX, config.eyeScaleY)}
                    fill="url(#irisGrad)"
                  />
                  {/* Iris fibrous ring */}
                  <ellipse
                    cx={118 + config.irisX}
                    cy={79 + config.irisY}
                    rx={4.8 * Math.min(config.eyeScaleX, config.eyeScaleY)}
                    ry={5.2 * Math.min(config.eyeScaleX, config.eyeScaleY)}
                    fill="url(#irisRing)"
                  />
                  {/* Iris fibrous texture lines */}
                  <g opacity="0.15">
                    <line x1={118 + config.irisX} y1={73.5 + config.irisY} x2={118 + config.irisX} y2={84.5 + config.irisY} stroke="#6B4828" strokeWidth="0.3" />
                    <line x1={112.5 + config.irisX} y1={79 + config.irisY} x2={123.5 + config.irisX} y2={79 + config.irisY} stroke="#6B4828" strokeWidth="0.3" />
                    <line x1={114 + config.irisX} y1={75 + config.irisY} x2={122 + config.irisX} y2={83 + config.irisY} stroke="#6B4828" strokeWidth="0.2" />
                    <line x1={122 + config.irisX} y1={75 + config.irisY} x2={114 + config.irisX} y2={83 + config.irisY} stroke="#6B4828" strokeWidth="0.2" />
                  </g>

                  {/* Pupil */}
                  <ellipse
                    cx={118 + config.irisX}
                    cy={79 + config.irisY}
                    rx={2}
                    ry={2.5}
                    fill="url(#pupilGrad)"
                  />

                  {/* Highlight dot — main */}
                  <circle
                    cx={120 + config.irisX * 0.5}
                    cy={76 + config.irisY * 0.5}
                    r={1.8}
                    fill="white"
                    opacity="0.92"
                  />
                  {/* Highlight dot — secondary */}
                  <circle
                    cx={116 + config.irisX * 0.3}
                    cy={81 + config.irisY * 0.3}
                    r={0.7}
                    fill="white"
                    opacity="0.5"
                  />

                  {/* Upper eyelid shadow on eye */}
                  <path
                    d={`M107,79 Q107,${73 - 2 * config.eyeScaleY} 118,${72 - 2 * config.eyeScaleY} Q129,${73 - 2 * config.eyeScaleY} 129,79
                       Q129,${74 - config.eyeScaleY} 118,${73 - config.eyeScaleY} Q107,${74 - config.eyeScaleY} 107,79 Z`}
                    fill="#8B6040"
                    opacity="0.12"
                  />

                  {/* Eye bag under eye */}
                  <path
                    d={`M108,${83 + config.eyeScaleY} Q118,${87 + config.eyeScaleY} 128,${83 + config.eyeScaleY}`}
                    fill="none"
                    stroke="url(#eyeBagGrad)"
                    strokeWidth="2"
                    opacity="0.35"
                  />

                  {/* Happy squint */}
                  {config.eyeSquint > 0 && (
                    <ellipse
                      cx="118"
                      cy={74 - config.eyeSquint * 1.5}
                      rx={9 * config.eyeScaleX + 1}
                      ry={config.eyeSquint * 4.5}
                      fill="url(#skinGrad)"
                    />
                  )}
                </g>
              </>
            )}

            {/* ===== NOSE ===== */}
            {/* Nose bridge highlight — long specular */}
            <path
              d="M99,70 Q99,78 98,88"
              fill="none"
              stroke="url(#noseBridgeHL)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Nose bridge side shadow — left */}
            <path
              d="M96,72 Q95,80 94,88"
              fill="none"
              stroke="#C09070"
              strokeWidth="0.8"
              opacity="0.3"
              strokeLinecap="round"
            />
            {/* Nose bridge side shadow — right */}
            <path
              d="M104,72 Q105,80 106,88"
              fill="none"
              stroke="#C09070"
              strokeWidth="0.8"
              opacity="0.25"
              strokeLinecap="round"
            />

            {/* Nose tip shape with soft highlight */}
            <path
              d="M95,94 Q96,88 100,88 Q104,88 105,94 Q104,98 100,99 Q96,98 95,94 Z"
              fill="#F0B888"
              opacity="0.45"
            />
            {/* Nose tip specular highlight */}
            <ellipse cx="100" cy="90" rx="3" ry="2" fill="url(#noseTipSpec)" />

            {/* Nostrils — shadow-based */}
            <ellipse cx="96" cy="96" rx="2.5" ry="1.5" fill="url(#nostrilShadow)" />
            <ellipse cx="104" cy="96" rx="2.5" ry="1.5" fill="url(#nostrilShadow)" />
            {/* Nostril openings */}
            <ellipse cx="96" cy="96.5" rx="1.5" ry="0.8" fill="#8B6040" opacity="0.5" />
            <ellipse cx="104" cy="96.5" rx="1.5" ry="0.8" fill="#8B6040" opacity="0.5" />

            {/* Nose shadow underneath */}
            <ellipse cx="100" cy="100" rx="7" ry="2.5" fill="#C09070" opacity="0.2" />

            {/* ===== CHEEKBONE SPECULAR HIGHLIGHTS ===== */}
            <ellipse cx="70" cy="86" rx="8" ry="5" fill="url(#cheekboneSpecular)" />
            <ellipse cx="130" cy="86" rx="8" ry="5" fill="url(#cheekboneSpecular)" />

            {/* ===== CHEEKS (blush) ===== */}
            {config.cheekOpacity > 0 && (
              <>
                <ellipse cx="70" cy="94" rx="10" ry="8" fill="url(#cheekBlush)" opacity={config.cheekOpacity} />
                <ellipse cx="130" cy="94" rx="10" ry="8" fill="url(#cheekBlush)" opacity={config.cheekOpacity} />
              </>
            )}

            {/* ===== MOUTH ===== */}
            <g transform={`translate(0, ${config.mouthOffsetY})`}>
              {!speaking ? (
                /* Closed mouth — realistic lips with cupid's bow */
                <>
                  {/* Upper lip — thinner, with cupid's bow */}
                  <path
                    d={`M${100 - config.smileWidth},105
                       Q${100 - config.smileWidth * 0.5},${102} ${100 - 3},${101}
                       Q${100},${100} ${100 + 3},${101}
                       Q${100 + config.smileWidth * 0.5},${102} ${100 + config.smileWidth},105`}
                    fill="url(#upperLipGrad)"
                    opacity="0.9"
                  />
                  {/* Cupid's bow highlight */}
                  <path
                    d={`M${100 - 4},${101} Q${100},${99.5} ${100 + 4},${101}`}
                    fill="none"
                    stroke="#E07070"
                    strokeWidth="0.5"
                    opacity="0.4"
                  />
                  {/* Lip line */}
                  <path
                    d={`M${100 - config.smileWidth},105 Q100,${105 + config.smileCurve} ${100 + config.smileWidth},105`}
                    fill="none"
                    stroke="#A83838"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    opacity="0.7"
                  />
                  {/* Lower lip — fuller, plumper */}
                  <path
                    d={`M${100 - config.smileWidth + 2},105 Q100,${105 + config.smileCurve + 3} ${100 + config.smileWidth - 2},105`}
                    fill="url(#lowerLipGrad)"
                    opacity="0.8"
                  />
                  {/* Lower lip specular */}
                  <ellipse cx="100" cy={105 + config.smileCurve * 0.5} rx={config.smileWidth * 0.4} ry="1.5" fill="url(#lipSpecular)" />
                  {/* Lip corner shadows */}
                  <ellipse cx={100 - config.smileWidth - 1} cy="105" rx="2" ry="1.5" fill="#8B4040" opacity="0.25" />
                  <ellipse cx={100 + config.smileWidth + 1} cy="105" rx="2" ry="1.5" fill="#8B4040" opacity="0.25" />
                </>
              ) : (
                /* Open mouth — speaking */
                <g>
                  {/* Mouth opening */}
                  <ellipse
                    cx="100"
                    cy="106"
                    rx={mouthShape?.rx ?? 6}
                    ry={mouthShape?.ry ?? 8}
                    fill="url(#mouthInterior)"
                  />

                  {/* Upper lip — with cupid's bow */}
                  <path
                    d={`M${100 - (mouthShape?.rx ?? 6) - 3},104
                       Q${100 - (mouthShape?.rx ?? 6) * 0.4},${100.5} ${100 - 3},${100}
                       Q${100},${99} ${100 + 3},${100}
                       Q${100 + (mouthShape?.rx ?? 6) * 0.4},${100.5} ${100 + (mouthShape?.rx ?? 6) + 3},104`}
                    fill="url(#upperLipGrad)"
                    opacity="0.9"
                  />

                  {/* Lower lip — fuller */}
                  <path
                    d={`M${100 - (mouthShape?.rx ?? 6) - 1},${106 + (mouthShape?.ry ?? 8)}
                       Q100,${108 + (mouthShape?.ry ?? 8) + 2}
                       ${100 + (mouthShape?.rx ?? 6) + 1},${106 + (mouthShape?.ry ?? 8)}`}
                    fill="url(#lowerLipGrad)"
                    opacity="0.8"
                  />
                  {/* Lower lip specular */}
                  <ellipse
                    cx="100"
                    cy={106 + (mouthShape?.ry ?? 8) * 0.5}
                    rx={(mouthShape?.rx ?? 6) * 0.4}
                    ry="1.5"
                    fill="url(#lipSpecular)"
                  />

                  {/* Lip corner shadows */}
                  <ellipse cx={100 - (mouthShape?.rx ?? 6) - 2} cy="105" rx="2" ry="1.5" fill="#8B4040" opacity="0.2" />
                  <ellipse cx={100 + (mouthShape?.rx ?? 6) + 2} cy="105" rx="2" ry="1.5" fill="#8B4040" opacity="0.2" />

                  {/* Teeth when mouth is wide enough */}
                  {config.showTeeth && (mouthShape?.ry ?? 0) > 5 && (
                    <>
                      {/* Top teeth row */}
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
                        x1={100 - 3} y1={103} x2={100 - 3} y2={107}
                        stroke="#E8E8E8" strokeWidth="0.3" opacity="0.5"
                      />
                      <line
                        x1={100} y1={103} x2={100} y2={107}
                        stroke="#E8E8E8" strokeWidth="0.3" opacity="0.5"
                      />
                      <line
                        x1={100 + 3} y1={103} x2={100 + 3} y2={107}
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
            {/* Chin highlight */}
            <ellipse cx="100" cy="120" rx="12" ry="3" fill="#FFE8D0" opacity="0.18" />
            {/* Chin ambient occlusion — shadow under jaw */}
            <ellipse cx="100" cy="124" rx="14" ry="3" fill="url(#chinAO)" />

            {/* ===== AMBIENT OCCLUSION UNDER CHIN ===== */}
            <path
              d="M70,124 Q80,130 100,130 Q120,130 130,124 Q120,126 100,126 Q80,126 70,124 Z"
              fill="#A07850"
              opacity="0.2"
              filter="url(#aoBlur)"
            />

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
        {/* Top-left key light */}
        <ellipse cx="80" cy="55" rx="45" ry="35" fill="white" opacity="0.035" />
        {/* Bottom fill light */}
        <ellipse cx="115" cy="100" rx="30" ry="25" fill="white" opacity="0.015" />
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
