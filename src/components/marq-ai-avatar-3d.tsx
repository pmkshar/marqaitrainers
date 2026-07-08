'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ============================================================
// MarqAI Male Avatar 3D — Hyper-realistic AI tutor with glasses & coat
// ============================================================
// Renders a near-photorealistic professional male tutor ("Marq AI") bust
// using primitive shapes with advanced material settings:
//   - Subsurface-scattering skin simulation
//   - Photorealistic eye rendering with wetness & iris detail
//   - Speaking mouth animation (lip-sync)
//   - Micro-expressions: blinking, brow raises, subtle head movements
//   - Glasses with thin metal frames & anti-reflective lenses
//   - Professional suit/coat with fabric-like shading
//   - Studio-quality 3-point lighting
// ============================================================

interface AvatarHeadProps {
  speaking: boolean;
  expression: 'neutral' | 'explaining' | 'thinking' | 'happy' | 'curious';
}

interface ExpressionState {
  browY: number;
  browAngle: number;
  mouthOpen: number;
  mouthWidth: number;
  eyeOpenness: number;
  irisY: number;
  irisX: number;
  headTiltZ: number;
  headTiltY: number;
  smileCurve: number;
  cheekPuff: number;
  noseWrinkle: number;
}

const EXPRESSION_TARGETS: Record<string, ExpressionState> = {
  neutral: {
    browY: 0, browAngle: 0, mouthOpen: 0, mouthWidth: 1,
    eyeOpenness: 1, irisY: 0, irisX: 0, headTiltZ: 0, headTiltY: 0, smileCurve: 0,
    cheekPuff: 0, noseWrinkle: 0,
  },
  explaining: {
    browY: 0.02, browAngle: 3, mouthOpen: 0.06, mouthWidth: 1.08,
    eyeOpenness: 1.05, irisY: 0, irisX: 0, headTiltZ: 1.5, headTiltY: 0, smileCurve: 0.02,
    cheekPuff: 0.01, noseWrinkle: 0,
  },
  thinking: {
    browY: 0.04, browAngle: -4, mouthOpen: 0, mouthWidth: 0.92,
    eyeOpenness: 0.7, irisY: 0.05, irisX: -0.04, headTiltZ: 5, headTiltY: 3, smileCurve: -0.01,
    cheekPuff: 0, noseWrinkle: 0.02,
  },
  happy: {
    browY: 0.015, browAngle: 0, mouthOpen: 0.05, mouthWidth: 1.2,
    eyeOpenness: 0.75, irisY: 0, irisX: 0, headTiltZ: -1.5, headTiltY: 0, smileCurve: 0.1,
    cheekPuff: 0.04, noseWrinkle: 0,
  },
  curious: {
    browY: 0.05, browAngle: 6, mouthOpen: 0.02, mouthWidth: 1.02,
    eyeOpenness: 1.2, irisY: 0.03, irisX: 0.04, headTiltZ: -4, headTiltY: -2, smileCurve: 0.03,
    cheekPuff: 0, noseWrinkle: 0,
  },
};

// ────────────── Photorealistic Color Palette ──────────────
// Skin tones with subsurface scattering approximation,
// realistic eye/wetness colors, fabric-accurate suit colors

const C = {
  // Skin — warm Indian skin tone with SSS
  skin:         '#C49A6C',
  skinSSS:      '#D4A574',  // Subsurface scattering color (warmer, lighter)
  skinDark:     '#A88050',
  skinLight:    '#D4B088',
  skinShadow:   '#8B6F4E',
  skinHighlight:'#E8C9A8',

  // Hair — dark brown-black with subtle warmth
  hair:         '#1a1a2e',
  hairMid:      '#2a2a3e',
  hairLight:    '#3a3a4e',
  hairShine:    '#4a4a5e',

  // Lips
  lip:          '#B06858',
  lipDark:      '#8A4A3E',
  lipWet:       '#C87A6A',
  mouthDark:    '#2a0808',

  // Eyes — photorealistic
  eyeWhite:     '#F5F5F0',
  eyeWhiteShadow:'#E8E6E0',
  iris:         '#3D2B1F',
  irisRing:     '#5A3F2E',
  irisHighlight:'#6B4C38',
  pupil:        '#0A0A0A',
  cornea:       '#FFFFFF',
  tearDuct:     '#F0D0C0',

  // Eyebrows
  brow:         '#1a1a1a',

  // Glasses — thin metal frames, anti-reflective lenses
  glassesFrame: '#444444',
  glassesFrameShine: '#666666',
  glassesLens:  '#a8d8ea',
  glassesArm:   '#444444',

  // Suit / Coat — deep navy with fabric texture
  suit:         '#1A2332',
  suitLight:    '#2A3342',
  suitLapel:    '#222D3D',
  suitFabric1:  '#1E2840',
  suitFabric2:  '#252E44',

  // Shirt — crisp white
  shirt:        '#F5F5F5',
  shirtShadow:  '#E0E0E0',

  // Tie — deep blue with subtle stripe
  tie:          '#1A5276',
  tieStripe:    '#2471A3',
  tieKnot:      '#1E6090',

  // Highlights & accents
  highlight:    '#FFFFFF',
  specular:     '#FFFFFF',

  // Stubble
  stubble:      '#8A7A6A',

  // Ear inner
  earInner:     '#C09070',
};

function MarqAIHead({ speaking, expression }: AvatarHeadProps) {
  const headGroupRef     = useRef<THREE.Group>(null!);
  const leftEyeGroupRef  = useRef<THREE.Group>(null!);
  const rightEyeGroupRef = useRef<THREE.Group>(null!);
  const leftBrowRef      = useRef<THREE.Mesh>(null!);
  const rightBrowRef     = useRef<THREE.Mesh>(null!);
  const mouthOpenRef     = useRef<THREE.Mesh>(null!);
  const lowerLipRef      = useRef<THREE.Mesh>(null!);
  const leftIrisRef      = useRef<THREE.Mesh>(null!);
  const rightIrisRef     = useRef<THREE.Mesh>(null!);
  const upperLipRef      = useRef<THREE.Mesh>(null!);
  const leftCheekRef     = useRef<THREE.Mesh>(null!);
  const rightCheekRef    = useRef<THREE.Mesh>(null!);

  const blinkTimer    = useRef(0);
  const isBlinking    = useRef(false);
  const blinkStart    = useRef(0);
  const nextBlinkTime = useRef(2 + Math.random() * 3);
  const blinkAmount   = useRef(1);
  const speakPhase    = useRef(0);
  const current       = useRef<ExpressionState>({ ...EXPRESSION_TARGETS.neutral });

  const target = useMemo(
    () => EXPRESSION_TARGETS[expression] ?? EXPRESSION_TARGETS.neutral,
    [expression],
  );

  // ────────── Photorealistic Materials ──────────
  const mats = useMemo(() => ({
    // Skin with SSS approximation — low roughness for sheen, subtle metalness for specular
    skin:       new THREE.MeshPhysicalMaterial({
      color: C.skin, roughness: 0.45, metalness: 0.02,
      clearcoat: 0.3, clearcoatRoughness: 0.4,
      sheen: 0.5, sheenRoughness: 0.5, sheenColor: new THREE.Color(C.skinSSS),
    }),
    skinSSS:    new THREE.MeshPhysicalMaterial({
      color: C.skinSSS, roughness: 0.5, metalness: 0.01,
      transmission: 0.15, thickness: 0.5,
      clearcoat: 0.2, clearcoatRoughness: 0.5,
    }),
    skinDark:   new THREE.MeshPhysicalMaterial({
      color: C.skinDark, roughness: 0.55, metalness: 0.02,
      clearcoat: 0.2, clearcoatRoughness: 0.5,
    }),
    skinLight:  new THREE.MeshPhysicalMaterial({
      color: C.skinLight, roughness: 0.4, metalness: 0.01,
      clearcoat: 0.35, clearcoatRoughness: 0.3,
      sheen: 0.4, sheenRoughness: 0.4, sheenColor: new THREE.Color(C.skinHighlight),
    }),
    skinShadow: new THREE.MeshStandardMaterial({
      color: C.skinShadow, roughness: 0.65, metalness: 0.02,
    }),
    skinHighlight: new THREE.MeshPhysicalMaterial({
      color: C.skinHighlight, roughness: 0.35, metalness: 0.01,
      clearcoat: 0.4, clearcoatRoughness: 0.25,
      emissive: new THREE.Color(C.skinHighlight), emissiveIntensity: 0.05,
    }),

    // Hair — anisotropic sheen for realistic hair
    hair:       new THREE.MeshPhysicalMaterial({
      color: C.hair, roughness: 0.55, metalness: 0.15,
      clearcoat: 0.6, clearcoatRoughness: 0.2,
      sheen: 1.0, sheenRoughness: 0.3, sheenColor: new THREE.Color(C.hairLight),
    }),
    hairMid:    new THREE.MeshPhysicalMaterial({
      color: C.hairMid, roughness: 0.5, metalness: 0.12,
      clearcoat: 0.5, clearcoatRoughness: 0.25,
      sheen: 0.8, sheenRoughness: 0.35, sheenColor: new THREE.Color(C.hairShine),
    }),
    hairLight:  new THREE.MeshPhysicalMaterial({
      color: C.hairLight, roughness: 0.5, metalness: 0.1,
      clearcoat: 0.5, clearcoatRoughness: 0.3,
      sheen: 0.6, sheenRoughness: 0.4, sheenColor: new THREE.Color(C.hairShine),
    }),

    // Eyes — wet, reflective, realistic
    eyeWhite:   new THREE.MeshPhysicalMaterial({
      color: C.eyeWhite, roughness: 0.15, metalness: 0,
      clearcoat: 0.8, clearcoatRoughness: 0.1,
      transmission: 0.1, thickness: 0.2,
    }),
    eyeWhiteShadow: new THREE.MeshPhysicalMaterial({
      color: C.eyeWhiteShadow, roughness: 0.2, metalness: 0,
      clearcoat: 0.6, clearcoatRoughness: 0.15,
    }),
    iris:       new THREE.MeshPhysicalMaterial({
      color: C.iris, roughness: 0.3, metalness: 0.15,
      clearcoat: 0.9, clearcoatRoughness: 0.05,
      sheen: 0.3, sheenRoughness: 0.2, sheenColor: new THREE.Color(C.irisRing),
    }),
    irisRing:   new THREE.MeshPhysicalMaterial({
      color: C.irisRing, roughness: 0.35, metalness: 0.1,
      clearcoat: 0.8, clearcoatRoughness: 0.1,
    }),
    pupil:      new THREE.MeshPhysicalMaterial({
      color: C.pupil, roughness: 0.2, metalness: 0,
      clearcoat: 1.0, clearcoatRoughness: 0.05,
    }),
    cornea:     new THREE.MeshPhysicalMaterial({
      color: C.cornea, roughness: 0.05, metalness: 0,
      transmission: 0.6, thickness: 0.1, ior: 1.376,
      clearcoat: 1.0, clearcoatRoughness: 0.02,
    }),

    // Lips — glossy, subtle subsurface
    lip:        new THREE.MeshPhysicalMaterial({
      color: C.lip, roughness: 0.3, metalness: 0.02,
      clearcoat: 0.7, clearcoatRoughness: 0.15,
      sheen: 0.5, sheenRoughness: 0.3, sheenColor: new THREE.Color(C.lipWet),
      transmission: 0.1, thickness: 0.3,
    }),
    lipDark:    new THREE.MeshPhysicalMaterial({
      color: C.lipDark, roughness: 0.35, metalness: 0.02,
      clearcoat: 0.6, clearcoatRoughness: 0.2,
      sheen: 0.4, sheenRoughness: 0.35, sheenColor: new THREE.Color(C.lipWet),
    }),
    lipWet:     new THREE.MeshPhysicalMaterial({
      color: C.lipWet, roughness: 0.15, metalness: 0.02,
      clearcoat: 0.9, clearcoatRoughness: 0.05,
      transmission: 0.15, thickness: 0.2,
    }),
    mouthDark:  new THREE.MeshStandardMaterial({
      color: C.mouthDark, roughness: 0.85, metalness: 0,
    }),

    // Eyebrows
    brow:       new THREE.MeshStandardMaterial({
      color: C.brow, roughness: 0.85, metalness: 0,
    }),

    // Glasses — metallic frames, anti-reflective lenses
    glassesFrame: new THREE.MeshPhysicalMaterial({
      color: C.glassesFrame, roughness: 0.2, metalness: 0.85,
      clearcoat: 0.5, clearcoatRoughness: 0.1,
    }),
    glassesFrameShine: new THREE.MeshPhysicalMaterial({
      color: C.glassesFrameShine, roughness: 0.15, metalness: 0.9,
      clearcoat: 0.6, clearcoatRoughness: 0.08,
    }),
    glassesLens: new THREE.MeshPhysicalMaterial({
      color: C.glassesLens, roughness: 0.05, metalness: 0,
      transparent: true, opacity: 0.15,
      transmission: 0.8, thickness: 0.05, ior: 1.5,
      clearcoat: 1.0, clearcoatRoughness: 0.02,
    }),
    glassesArm: new THREE.MeshPhysicalMaterial({
      color: C.glassesArm, roughness: 0.25, metalness: 0.8,
      clearcoat: 0.4, clearcoatRoughness: 0.15,
    }),

    // Suit / Coat — fabric-like with subtle sheen
    suit:       new THREE.MeshPhysicalMaterial({
      color: C.suit, roughness: 0.75, metalness: 0.03,
      clearcoat: 0.15, clearcoatRoughness: 0.6,
      sheen: 0.4, sheenRoughness: 0.6, sheenColor: new THREE.Color(C.suitFabric1),
    }),
    suitLight:  new THREE.MeshPhysicalMaterial({
      color: C.suitLight, roughness: 0.7, metalness: 0.03,
      clearcoat: 0.15, clearcoatRoughness: 0.55,
      sheen: 0.35, sheenRoughness: 0.55, sheenColor: new THREE.Color(C.suitFabric2),
    }),
    suitLapel:  new THREE.MeshPhysicalMaterial({
      color: C.suitLapel, roughness: 0.65, metalness: 0.04,
      clearcoat: 0.2, clearcoatRoughness: 0.5,
      sheen: 0.5, sheenRoughness: 0.5, sheenColor: new THREE.Color(C.suitFabric1),
    }),

    // Shirt — crisp cotton
    shirt:      new THREE.MeshPhysicalMaterial({
      color: C.shirt, roughness: 0.5, metalness: 0,
      clearcoat: 0.1, clearcoatRoughness: 0.7,
      sheen: 0.2, sheenRoughness: 0.6, sheenColor: new THREE.Color('#FFFFFF'),
    }),
    shirtShadow: new THREE.MeshStandardMaterial({
      color: C.shirtShadow, roughness: 0.55, metalness: 0,
    }),

    // Tie — silk-like
    tie:        new THREE.MeshPhysicalMaterial({
      color: C.tie, roughness: 0.35, metalness: 0.08,
      clearcoat: 0.5, clearcoatRoughness: 0.15,
      sheen: 0.7, sheenRoughness: 0.25, sheenColor: new THREE.Color(C.tieKnot),
    }),
    tieStripe:  new THREE.MeshPhysicalMaterial({
      color: C.tieStripe, roughness: 0.3, metalness: 0.08,
      clearcoat: 0.5, clearcoatRoughness: 0.12,
      sheen: 0.6, sheenRoughness: 0.2, sheenColor: new THREE.Color(C.tieKnot),
    }),
    tieKnot:    new THREE.MeshPhysicalMaterial({
      color: C.tieKnot, roughness: 0.3, metalness: 0.1,
      clearcoat: 0.6, clearcoatRoughness: 0.1,
      sheen: 0.8, sheenRoughness: 0.15, sheenColor: new THREE.Color('#2E80B0'),
    }),

    // Highlights
    highlight:  new THREE.MeshPhysicalMaterial({
      color: C.highlight, roughness: 0.1, metalness: 0,
      emissive: new THREE.Color(C.highlight), emissiveIntensity: 0.6,
      clearcoat: 1.0, clearcoatRoughness: 0.02,
    }),

    // Stubble
    stubble:    new THREE.MeshStandardMaterial({
      color: C.stubble, roughness: 0.9, metalness: 0,
      transparent: true, opacity: 0.15,
    }),

    // Ear inner
    earInner:   new THREE.MeshPhysicalMaterial({
      color: C.earInner, roughness: 0.5, metalness: 0.02,
      clearcoat: 0.2, clearcoatRoughness: 0.5,
      sheen: 0.3, sheenRoughness: 0.4, sheenColor: new THREE.Color(C.skinSSS),
    }),
  }), []);

  useEffect(() => () => { Object.values(mats).forEach(m => m.dispose()); }, [mats]);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.1);

    // Blinking
    blinkTimer.current += dt;
    if (!isBlinking.current && blinkTimer.current >= nextBlinkTime.current) {
      isBlinking.current = true;
      blinkStart.current = elapsed;
    }
    if (isBlinking.current && elapsed - blinkStart.current > 0.15) {
      isBlinking.current = false;
      blinkTimer.current = 0;
      nextBlinkTime.current = 2 + Math.random() * 4;
    }
    const blinkTarget = isBlinking.current ? 0 : 1;
    blinkAmount.current = THREE.MathUtils.lerp(blinkAmount.current, blinkTarget, dt * 25);

    // Smooth expression interpolation
    const spd = 5 * dt;
    const c = current.current;
    c.browY       = THREE.MathUtils.lerp(c.browY,       target.browY,       spd);
    c.browAngle   = THREE.MathUtils.lerp(c.browAngle,   target.browAngle,   spd);
    c.mouthOpen   = THREE.MathUtils.lerp(c.mouthOpen,   target.mouthOpen,   spd);
    c.mouthWidth  = THREE.MathUtils.lerp(c.mouthWidth,  target.mouthWidth,  spd);
    c.eyeOpenness = THREE.MathUtils.lerp(c.eyeOpenness, target.eyeOpenness, spd);
    c.irisY       = THREE.MathUtils.lerp(c.irisY,       target.irisY,       spd);
    c.irisX       = THREE.MathUtils.lerp(c.irisX,       target.irisX,       spd);
    c.headTiltZ   = THREE.MathUtils.lerp(c.headTiltZ,   target.headTiltZ,   spd);
    c.headTiltY   = THREE.MathUtils.lerp(c.headTiltY,   target.headTiltY,   spd);
    c.smileCurve  = THREE.MathUtils.lerp(c.smileCurve,  target.smileCurve,  spd);
    c.cheekPuff   = THREE.MathUtils.lerp(c.cheekPuff,   target.cheekPuff,   spd);
    c.noseWrinkle = THREE.MathUtils.lerp(c.noseWrinkle, target.noseWrinkle, spd);

    // Speaking animation — natural mouth movement
    let mouthOpenAmt = c.mouthOpen;
    if (speaking) {
      speakPhase.current += dt * 10;
      const a = speakPhase.current;
      mouthOpenAmt = Math.max(
        mouthOpenAmt,
        0.05
        + 0.09 * Math.abs(Math.sin(a * 1.0))
        + 0.05 * Math.abs(Math.sin(a * 2.3 + 0.5))
        + 0.03 * Math.abs(Math.sin(a * 3.7 + 1.2))
        + 0.02 * Math.sin(a * 5.7),
      );
    } else {
      speakPhase.current *= 0.93;
    }

    // Head movement — subtle idle animation
    if (headGroupRef.current) {
      headGroupRef.current.rotation.z = THREE.MathUtils.degToRad(c.headTiltZ)
        + Math.sin(elapsed * 0.5) * 0.008;
      headGroupRef.current.rotation.y = THREE.MathUtils.degToRad(c.headTiltY)
        + Math.sin(elapsed * 0.3) * 0.005;
      // Subtle breathing
      const breath = 1 + Math.sin(elapsed * 1.5) * 0.003;
      headGroupRef.current.scale.setScalar(breath);
    }

    // Eye animation
    const eyeSY = Math.max(0.02, c.eyeOpenness * blinkAmount.current);
    if (leftEyeGroupRef.current)  leftEyeGroupRef.current.scale.y  = eyeSY;
    if (rightEyeGroupRef.current) rightEyeGroupRef.current.scale.y = eyeSY;

    // Iris tracking
    if (leftIrisRef.current) {
      leftIrisRef.current.position.x = c.irisX;
      leftIrisRef.current.position.y = c.irisY;
    }
    if (rightIrisRef.current) {
      rightIrisRef.current.position.x = c.irisX;
      rightIrisRef.current.position.y = c.irisY;
    }

    // Brow animation
    if (leftBrowRef.current) {
      leftBrowRef.current.position.y  = 0.18 + c.browY;
      leftBrowRef.current.rotation.z  = THREE.MathUtils.degToRad(c.browAngle);
    }
    if (rightBrowRef.current) {
      rightBrowRef.current.position.y  = 0.18 + c.browY;
      rightBrowRef.current.rotation.z  = -THREE.MathUtils.degToRad(c.browAngle);
    }

    // Mouth animation
    if (mouthOpenRef.current) {
      mouthOpenRef.current.scale.y = Math.max(0.04, mouthOpenAmt * 8);
      mouthOpenRef.current.scale.x = c.mouthWidth;
      mouthOpenRef.current.position.y = -0.175 + c.smileCurve * 0.3;
    }
    if (lowerLipRef.current) {
      lowerLipRef.current.position.y = -0.2 - mouthOpenAmt * 0.6 + c.smileCurve * 0.15;
    }
    if (upperLipRef.current) {
      upperLipRef.current.position.y = -0.155 + c.smileCurve * 0.2;
    }

    // Cheek puff for smiling
    if (leftCheekRef.current) {
      leftCheekRef.current.scale.x = 1 + c.cheekPuff * 2;
      leftCheekRef.current.scale.y = 1 + c.cheekPuff * 1.5;
    }
    if (rightCheekRef.current) {
      rightCheekRef.current.scale.x = 1 + c.cheekPuff * 2;
      rightCheekRef.current.scale.y = 1 + c.cheekPuff * 1.5;
    }
  });

  return (
    <group ref={headGroupRef}>
      {/* ── HEAD ── */}
      {/* Main skull — slightly elongated for natural proportions */}
      <mesh material={mats.skin} scale={[0.92, 1.02, 0.88]}>
        <sphereGeometry args={[0.5, 32, 32]} />
      </mesh>

      {/* Forehead — SSS layer for subsurface glow */}
      <mesh material={mats.skinSSS} position={[0, 0.1, 0.15]} scale={[0.85, 0.6, 0.75]}>
        <sphereGeometry args={[0.35, 20, 20]} />
      </mesh>

      {/* Jaw / chin — angular male shape */}
      <mesh material={mats.skin} position={[0, -0.35, 0.18]} scale={[1.1, 0.55, 0.7]}>
        <sphereGeometry args={[0.14, 16, 16]} />
      </mesh>

      {/* Chin dimple */}
      <mesh material={mats.skinShadow} position={[0, -0.45, 0.28]} scale={[0.3, 0.2, 0.2]}>
        <sphereGeometry args={[0.03, 8, 8]} />
      </mesh>

      {/* Cheekbone highlights — left */}
      <mesh ref={leftCheekRef} material={mats.skinLight} position={[-0.2, -0.05, 0.34]} scale={[0.55, 0.4, 0.3]}>
        <sphereGeometry args={[0.1, 10, 10]} />
      </mesh>
      {/* Cheekbone highlights — right */}
      <mesh ref={rightCheekRef} material={mats.skinLight} position={[0.2, -0.05, 0.34]} scale={[0.55, 0.4, 0.3]}>
        <sphereGeometry args={[0.1, 10, 10]} />
      </mesh>

      {/* Temple hollows — add depth */}
      <mesh material={mats.skinShadow} position={[-0.38, 0.05, -0.05]} scale={[0.35, 0.55, 0.45]}>
        <sphereGeometry args={[0.08, 8, 8]} />
      </mesh>
      <mesh material={mats.skinShadow} position={[0.38, 0.05, -0.05]} scale={[0.35, 0.55, 0.45]}>
        <sphereGeometry args={[0.08, 8, 8]} />
      </mesh>

      {/* Nose shadow / sides */}
      <mesh material={mats.skinShadow} position={[-0.06, -0.06, 0.38]} scale={[0.25, 0.5, 0.35]}>
        <sphereGeometry args={[0.04, 8, 8]} />
      </mesh>
      <mesh material={mats.skinShadow} position={[0.06, -0.06, 0.38]} scale={[0.25, 0.5, 0.35]}>
        <sphereGeometry args={[0.04, 8, 8]} />
      </mesh>

      {/* ── HAIR — Short, styled, professional with volume ── */}
      {/* Main hair cap */}
      <mesh material={mats.hair} position={[0, 0.12, -0.06]} scale={[0.96, 0.75, 0.94]}>
        <sphereGeometry args={[0.52, 32, 32]} />
      </mesh>
      {/* Top hair volume - styled up */}
      <mesh material={mats.hairMid} position={[0, 0.25, 0.05]} scale={[0.85, 0.35, 0.7]}>
        <sphereGeometry args={[0.35, 16, 16]} />
      </mesh>
      {/* Side hair - left */}
      <mesh material={mats.hair} position={[-0.4, 0.06, -0.02]} scale={[0.5, 0.9, 0.6]}>
        <sphereGeometry args={[0.12, 10, 10]} />
      </mesh>
      {/* Side hair - right */}
      <mesh material={mats.hair} position={[0.4, 0.06, -0.02]} scale={[0.5, 0.9, 0.6]}>
        <sphereGeometry args={[0.12, 10, 10]} />
      </mesh>
      {/* Front hairline / fringe */}
      <mesh material={mats.hairMid} position={[0, 0.22, 0.28]} scale={[1.2, 0.18, 0.4]}>
        <sphereGeometry args={[0.22, 14, 14]} />
      </mesh>
      {/* Slight quiff at front */}
      <mesh material={mats.hairLight} position={[0, 0.3, 0.18]} scale={[0.6, 0.25, 0.45]}>
        <sphereGeometry args={[0.12, 8, 8]} />
      </mesh>
      {/* Hair part on left */}
      <mesh material={mats.hair} position={[-0.08, 0.28, 0.08]} scale={[0.05, 0.2, 0.4]}>
        <sphereGeometry args={[0.1, 6, 6]} />
      </mesh>
      {/* Back hair */}
      <mesh material={mats.hair} position={[0, 0.04, -0.42]} scale={[0.85, 0.7, 0.55]}>
        <sphereGeometry args={[0.2, 12, 12]} />
      </mesh>

      {/* ── EARS ── */}
      <mesh material={mats.skin} position={[-0.47, 0.02, 0]} scale={[0.5, 0.8, 0.65]}>
        <sphereGeometry args={[0.08, 10, 10]} />
      </mesh>
      <mesh material={mats.earInner} position={[-0.48, 0.02, 0.02]} scale={[0.3, 0.55, 0.4]}>
        <sphereGeometry args={[0.05, 8, 8]} />
      </mesh>
      <mesh material={mats.skin} position={[0.47, 0.02, 0]} scale={[0.5, 0.8, 0.65]}>
        <sphereGeometry args={[0.08, 10, 10]} />
      </mesh>
      <mesh material={mats.earInner} position={[0.48, 0.02, 0.02]} scale={[0.3, 0.55, 0.4]}>
        <sphereGeometry args={[0.05, 8, 8]} />
      </mesh>

      {/* ── EYES — Photorealistic with wetness and iris detail ── */}
      {/* Left eye group */}
      <group ref={leftEyeGroupRef} position={[-0.14, 0.06, 0.4]}>
        {/* Eyeball */}
        <mesh material={mats.eyeWhite}>
          <sphereGeometry args={[0.065, 16, 16]} />
        </mesh>
        {/* Eye shadow / upper eyelid shadow */}
        <mesh material={mats.eyeWhiteShadow} position={[0, 0.045, 0.02]} scale={[1.1, 0.25, 0.5]}>
          <sphereGeometry args={[0.06, 10, 10]} />
        </mesh>
        {/* Iris outer ring */}
        <mesh position={[0, 0, 0.035]} scale={[1.15, 1.15, 0.3]}>
          <sphereGeometry args={[0.035, 14, 14]} />
          <meshPhysicalMaterial color={C.irisRing} roughness={0.35} metalness={0.1} clearcoat={0.8} />
        </mesh>
        {/* Iris main */}
        <mesh ref={leftIrisRef} material={mats.iris} position={[0, 0, 0.038]}>
          <sphereGeometry args={[0.032, 14, 14]} />
        </mesh>
        {/* Iris detail ring */}
        <mesh position={[0, 0, 0.04]} scale={[0.85, 0.85, 0.2]}>
          <sphereGeometry args={[0.028, 12, 12]} />
          <meshPhysicalMaterial color={C.irisHighlight} roughness={0.4} metalness={0.05} clearcoat={0.7} />
        </mesh>
        {/* Pupil */}
        <mesh material={mats.pupil} position={[0, 0, 0.052]}>
          <sphereGeometry args={[0.018, 10, 10]} />
        </mesh>
        {/* Cornea — transparent dome over the eye for wetness */}
        <mesh material={mats.cornea} scale={[1.05, 0.95, 0.6]}>
          <sphereGeometry args={[0.068, 16, 16]} />
        </mesh>
        {/* Specular highlight */}
        <mesh material={mats.highlight} position={[0.02, 0.02, 0.065]}>
          <sphereGeometry args={[0.008, 6, 6]} />
        </mesh>
        {/* Secondary smaller highlight */}
        <mesh position={[-0.012, -0.008, 0.062]} scale={[0.5, 0.5, 0.5]}>
          <sphereGeometry args={[0.006, 6, 6]} />
          <meshPhysicalMaterial color="#FFFFFF" roughness={0.1} emissive="#FFFFFF" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* Right eye group */}
      <group ref={rightEyeGroupRef} position={[0.14, 0.06, 0.4]}>
        <mesh material={mats.eyeWhite}>
          <sphereGeometry args={[0.065, 16, 16]} />
        </mesh>
        <mesh material={mats.eyeWhiteShadow} position={[0, 0.045, 0.02]} scale={[1.1, 0.25, 0.5]}>
          <sphereGeometry args={[0.06, 10, 10]} />
        </mesh>
        <mesh position={[0, 0, 0.035]} scale={[1.15, 1.15, 0.3]}>
          <sphereGeometry args={[0.035, 14, 14]} />
          <meshPhysicalMaterial color={C.irisRing} roughness={0.35} metalness={0.1} clearcoat={0.8} />
        </mesh>
        <mesh ref={rightIrisRef} material={mats.iris} position={[0, 0, 0.038]}>
          <sphereGeometry args={[0.032, 14, 14]} />
        </mesh>
        <mesh position={[0, 0, 0.04]} scale={[0.85, 0.85, 0.2]}>
          <sphereGeometry args={[0.028, 12, 12]} />
          <meshPhysicalMaterial color={C.irisHighlight} roughness={0.4} metalness={0.05} clearcoat={0.7} />
        </mesh>
        <mesh material={mats.pupil} position={[0, 0, 0.052]}>
          <sphereGeometry args={[0.018, 10, 10]} />
        </mesh>
        <mesh material={mats.cornea} scale={[1.05, 0.95, 0.6]}>
          <sphereGeometry args={[0.068, 16, 16]} />
        </mesh>
        <mesh material={mats.highlight} position={[-0.02, 0.02, 0.065]}>
          <sphereGeometry args={[0.008, 6, 6]} />
        </mesh>
        <mesh position={[0.012, -0.008, 0.062]} scale={[0.5, 0.5, 0.5]}>
          <sphereGeometry args={[0.006, 6, 6]} />
          <meshPhysicalMaterial color="#FFFFFF" roughness={0.1} emissive="#FFFFFF" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* ── GLASSES — Thin metal frames, anti-reflective lenses ── */}
      {/* Left lens frame */}
      <mesh material={mats.glassesFrame} position={[-0.14, 0.06, 0.458]} scale={[1.25, 0.9, 0.15]}>
        <torusGeometry args={[0.075, 0.005, 8, 24]} />
      </mesh>
      {/* Left lens — anti-reflective coating */}
      <mesh material={mats.glassesLens} position={[-0.14, 0.06, 0.458]} scale={[1.2, 0.85, 0.1]}>
        <circleGeometry args={[0.072, 20]} />
      </mesh>
      {/* Right lens frame */}
      <mesh material={mats.glassesFrame} position={[0.14, 0.06, 0.458]} scale={[1.25, 0.9, 0.15]}>
        <torusGeometry args={[0.075, 0.005, 8, 24]} />
      </mesh>
      {/* Right lens */}
      <mesh material={mats.glassesLens} position={[0.14, 0.06, 0.458]} scale={[1.2, 0.85, 0.1]}>
        <circleGeometry args={[0.072, 20]} />
      </mesh>
      {/* Bridge — thin metal */}
      <mesh material={mats.glassesFrameShine} position={[0, 0.06, 0.462]} scale={[0.6, 0.35, 0.12]}>
        <torusGeometry args={[0.04, 0.004, 6, 12, Math.PI]} />
      </mesh>
      {/* Left arm */}
      <mesh material={mats.glassesArm} position={[-0.28, 0.06, 0.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.003, 0.003, 0.22, 6]} />
      </mesh>
      {/* Right arm */}
      <mesh material={mats.glassesArm} position={[0.28, 0.06, 0.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.003, 0.003, 0.22, 6]} />
      </mesh>
      {/* Temple tip - left */}
      <mesh material={mats.glassesFrame} position={[-0.39, 0.06, 0.2]} scale={[0.3, 0.3, 0.4]}>
        <sphereGeometry args={[0.008, 6, 6]} />
      </mesh>
      {/* Temple tip - right */}
      <mesh material={mats.glassesFrame} position={[0.39, 0.06, 0.2]} scale={[0.3, 0.3, 0.4]}>
        <sphereGeometry args={[0.008, 6, 6]} />
      </mesh>

      {/* ── EYEBROWS ── */}
      <mesh ref={leftBrowRef} material={mats.brow} position={[-0.14, 0.2, 0.44]}>
        <boxGeometry args={[0.11, 0.02, 0.03]} />
      </mesh>
      <mesh ref={rightBrowRef} material={mats.brow} position={[0.14, 0.2, 0.44]}>
        <boxGeometry args={[0.11, 0.02, 0.03]} />
      </mesh>

      {/* ── NOSE — More refined shape ── */}
      {/* Nose bridge */}
      <mesh material={mats.skin} position={[0, 0.04, 0.43]} scale={[0.35, 0.85, 0.45]}>
        <sphereGeometry args={[0.04, 8, 8]} />
      </mesh>
      {/* Nose tip */}
      <mesh material={mats.skinLight} position={[0, -0.03, 0.45]} scale={[0.7, 0.65, 0.55]}>
        <sphereGeometry args={[0.04, 10, 10]} />
      </mesh>
      {/* Nostrils */}
      <mesh material={mats.skinDark} position={[-0.018, -0.05, 0.44]} scale={[0.4, 0.3, 0.35]}>
        <sphereGeometry args={[0.02, 6, 6]} />
      </mesh>
      <mesh material={mats.skinDark} position={[0.018, -0.05, 0.44]} scale={[0.4, 0.3, 0.35]}>
        <sphereGeometry args={[0.02, 6, 6]} />
      </mesh>

      {/* ── MOUTH — Glossy, realistic lips ── */}
      <mesh ref={upperLipRef} material={mats.lip} position={[0, -0.155, 0.41]} scale={[1.5, 0.38, 0.55]}>
        <sphereGeometry args={[0.06, 14, 14]} />
      </mesh>
      <mesh ref={lowerLipRef} material={mats.lipDark} position={[0, -0.2, 0.41]} scale={[1.3, 0.45, 0.55]}>
        <sphereGeometry args={[0.06, 14, 14]} />
      </mesh>
      {/* Lip wetness highlight */}
      <mesh material={mats.lipWet} position={[0, -0.175, 0.42]} scale={[1.0, 0.15, 0.25]}>
        <sphereGeometry args={[0.05, 10, 10]} />
      </mesh>
      <mesh ref={mouthOpenRef} material={mats.mouthDark} position={[0, -0.175, 0.42]} scale={[1.15, 0.04, 0.45]}>
        <sphereGeometry args={[0.05, 10, 10]} />
      </mesh>

      {/* ── STUBBLE (subtle chin/jaw shadow) ── */}
      <mesh material={mats.stubble} position={[0, -0.28, 0.2]} scale={[1.1, 0.35, 0.5]}>
        <sphereGeometry args={[0.15, 10, 10]} />
      </mesh>
      {/* Upper lip stubble */}
      <mesh material={mats.stubble} position={[0, -0.12, 0.38]} scale={[0.8, 0.15, 0.3]}>
        <sphereGeometry args={[0.08, 8, 8]} />
      </mesh>

      {/* ── NECK ── */}
      <mesh material={mats.skin} position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.13, 0.15, 0.15, 16]} />
      </mesh>
      {/* Neck shadow */}
      <mesh material={mats.skinShadow} position={[0, -0.48, -0.05]} scale={[0.8, 0.4, 0.5]}>
        <sphereGeometry args={[0.1, 8, 8]} />
      </mesh>

      {/* ── COLLAR / SHIRT ── */}
      <mesh material={mats.shirt} position={[-0.08, -0.52, 0.1]} rotation={[0.3, 0, -0.2]} scale={[0.7, 0.9, 0.3]}>
        <boxGeometry args={[0.12, 0.1, 0.02]} />
      </mesh>
      <mesh material={mats.shirt} position={[0.08, -0.52, 0.1]} rotation={[0.3, 0, 0.2]} scale={[0.7, 0.9, 0.3]}>
        <boxGeometry args={[0.12, 0.1, 0.02]} />
      </mesh>

      {/* ── TIE — Silk-like ── */}
      <mesh material={mats.tie} position={[0, -0.56, 0.14]} scale={[0.35, 1.2, 0.2]}>
        <boxGeometry args={[0.06, 0.18, 0.015]} />
      </mesh>
      <mesh material={mats.tieKnot} position={[0, -0.48, 0.14]} scale={[0.5, 0.5, 0.25]}>
        <sphereGeometry args={[0.025, 8, 8]} />
      </mesh>
      <mesh material={mats.tieStripe} position={[0, -0.6, 0.145]} scale={[0.3, 0.25, 0.22]}>
        <boxGeometry args={[0.05, 0.02, 0.01]} />
      </mesh>

      {/* ── SHOULDERS / SUIT COAT ── */}
      <mesh material={mats.suit} position={[0, -0.68, 0]} scale={[1.35, 0.4, 0.8]}>
        <sphereGeometry args={[0.5, 20, 20]} />
      </mesh>
      {/* Left lapel */}
      <mesh material={mats.suitLapel} position={[-0.1, -0.55, 0.18]} rotation={[0, 0, 0.15]} scale={[0.55, 0.8, 0.2]}>
        <boxGeometry args={[0.08, 0.18, 0.01]} />
      </mesh>
      {/* Right lapel */}
      <mesh material={mats.suitLapel} position={[0.1, -0.55, 0.18]} rotation={[0, 0, -0.15]} scale={[0.55, 0.8, 0.2]}>
        <boxGeometry args={[0.08, 0.18, 0.01]} />
      </mesh>
      {/* Shirt V visible between lapels */}
      <mesh material={mats.shirtShadow} position={[0, -0.52, 0.16]} scale={[0.5, 0.35, 0.3]}>
        <sphereGeometry args={[0.08, 10, 10]} />
      </mesh>
      {/* Left shoulder pad */}
      <mesh material={mats.suit} position={[-0.38, -0.58, 0.02]} scale={[0.7, 0.5, 0.65]}>
        <sphereGeometry args={[0.2, 12, 12]} />
      </mesh>
      {/* Right shoulder pad */}
      <mesh material={mats.suit} position={[0.38, -0.58, 0.02]} scale={[0.7, 0.5, 0.65]}>
        <sphereGeometry args={[0.2, 12, 12]} />
      </mesh>
      {/* Suit buttons */}
      <mesh material={mats.glassesFrame} position={[-0.03, -0.62, 0.32]}>
        <sphereGeometry args={[0.012, 8, 8]} />
      </mesh>
      <mesh material={mats.glassesFrame} position={[-0.03, -0.7, 0.3]}>
        <sphereGeometry args={[0.012, 8, 8]} />
      </mesh>
      {/* Pocket square */}
      <mesh material={mats.shirt} position={[0.12, -0.55, 0.3]} scale={[0.4, 0.3, 0.15]}>
        <boxGeometry args={[0.05, 0.03, 0.005]} />
      </mesh>
      {/* Lapel buttonhole stitch */}
      <mesh position={[-0.15, -0.5, 0.28]} scale={[0.2, 0.2, 0.2]}>
        <sphereGeometry args={[0.005, 6, 6]} />
        <meshStandardMaterial color="#888" roughness={0.6} />
      </mesh>
    </group>
  );
}

// ────────────── Main 3D Component (default export) ──────────────

export default function MarqAIAvatar3D({
  speaking,
  expression = 'neutral',
  size = 120,
}: {
  speaking: boolean;
  expression?: 'neutral' | 'explaining' | 'thinking' | 'happy' | 'curious';
  size?: number;
}) {
  return (
    <div style={{ width: size, height: size, overflow: 'hidden' }}>
      <Canvas
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0.05, 1.6], fov: 38 }}
        frameloop="always"
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Professional studio lighting — 3-point setup */}
        {/* Key light — warm, from above-right */}
        <directionalLight position={[2, 3, 4]} intensity={1.0} color="#FFF5E8" />
        {/* Fill light — cool, from left */}
        <directionalLight position={[-2, 1, 3]} intensity={0.4} color="#E0E8FF" />
        {/* Rim/hair light — from behind */}
        <pointLight position={[0, 2, -2]} intensity={0.5} color="#C0D0FF" />
        {/* Ambient fill */}
        <ambientLight intensity={0.35} color="#F5F0EB" />
        {/* Catch light for eyes */}
        <pointLight position={[1.5, 1.5, 3]} intensity={0.3} color="#FFFFFF" />
        {/* Subtle under-chin fill */}
        <pointLight position={[0, -0.5, 2]} intensity={0.1} color="#FFE0C0" />

        <MarqAIHead speaking={speaking} expression={expression} />
      </Canvas>
    </div>
  );
}
