'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ============================================================
// MarqAI Male Avatar 3D — Dynamic male AI tutor with glasses & coat
// ============================================================
// Renders a stylized professional male tutor ("Marq AI") bust using
// primitive shapes. Features:
//   - Speaking mouth animation (lip-sync)
//   - Blinking
//   - Expression changes (neutral, explaining, thinking, happy, curious)
//   - Smooth interpolated transitions between expressions
//   - Glasses, suit/coat, professional look
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
}

const EXPRESSION_TARGETS: Record<string, ExpressionState> = {
  neutral: {
    browY: 0, browAngle: 0, mouthOpen: 0, mouthWidth: 1,
    eyeOpenness: 1, irisY: 0, irisX: 0, headTiltZ: 0, headTiltY: 0, smileCurve: 0,
  },
  explaining: {
    browY: 0.02, browAngle: 3, mouthOpen: 0.06, mouthWidth: 1.08,
    eyeOpenness: 1.05, irisY: 0, irisX: 0, headTiltZ: 1.5, headTiltY: 0, smileCurve: 0.02,
  },
  thinking: {
    browY: 0.04, browAngle: -4, mouthOpen: 0, mouthWidth: 0.92,
    eyeOpenness: 0.7, irisY: 0.05, irisX: -0.04, headTiltZ: 5, headTiltY: 3, smileCurve: -0.01,
  },
  happy: {
    browY: 0.015, browAngle: 0, mouthOpen: 0.05, mouthWidth: 1.2,
    eyeOpenness: 0.75, irisY: 0, irisX: 0, headTiltZ: -1.5, headTiltY: 0, smileCurve: 0.1,
  },
  curious: {
    browY: 0.05, browAngle: 6, mouthOpen: 0.02, mouthWidth: 1.02,
    eyeOpenness: 1.2, irisY: 0.03, irisX: 0.04, headTiltZ: -4, headTiltY: -2, smileCurve: 0.03,
  },
};

// ────────────── Color Palette ──────────────
// Professional male skin tones + suit/coat colors

const C = {
  skin:       '#C49A6C',
  skinDark:   '#A88050',
  skinLight:  '#D4AA7C',
  hair:       '#1a1a2e',
  hairLight:  '#2a2a3e',
  lip:        '#b06858',
  lipDark:    '#8a4a3e',
  mouthDark:  '#2a0808',
  eyeWhite:   '#f5f5f0',
  iris:       '#3d2b1f',
  pupil:      '#0a0a0a',
  brow:       '#1a1a1a',
  glasses:    '#333333',
  glassesLens:'#a8d8ea',
  glassesArm: '#444444',
  suit:       '#1a2332',
  suitLight:  '#2a3342',
  suitLapel:  '#222d3d',
  shirt:      '#f0f0f0',
  shirtShadow:'#e0e0e0',
  tie:        '#1a5276',
  tieStripe:  '#2471a3',
  highlight:  '#ffffff',
  stubble:    '#8a7a6a',
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

  const mats = useMemo(() => ({
    skin:       new THREE.MeshStandardMaterial({ color: C.skin, roughness: 0.6, metalness: 0.05 }),
    skinDark:   new THREE.MeshStandardMaterial({ color: C.skinDark, roughness: 0.65, metalness: 0.05 }),
    skinLight:  new THREE.MeshStandardMaterial({ color: C.skinLight, roughness: 0.55, metalness: 0.05 }),
    hair:       new THREE.MeshStandardMaterial({ color: C.hair, roughness: 0.75, metalness: 0.1 }),
    hairLight:  new THREE.MeshStandardMaterial({ color: C.hairLight, roughness: 0.7, metalness: 0.08 }),
    eyeWhite:   new THREE.MeshStandardMaterial({ color: C.eyeWhite, roughness: 0.3, metalness: 0 }),
    iris:       new THREE.MeshStandardMaterial({ color: C.iris, roughness: 0.4, metalness: 0.1 }),
    pupil:      new THREE.MeshStandardMaterial({ color: C.pupil, roughness: 0.3, metalness: 0 }),
    lip:        new THREE.MeshStandardMaterial({ color: C.lip, roughness: 0.5, metalness: 0.05 }),
    lipDark:    new THREE.MeshStandardMaterial({ color: C.lipDark, roughness: 0.6, metalness: 0.05 }),
    mouthDark:  new THREE.MeshStandardMaterial({ color: C.mouthDark, roughness: 0.8, metalness: 0 }),
    brow:       new THREE.MeshStandardMaterial({ color: C.brow, roughness: 0.85, metalness: 0 }),
    glasses:    new THREE.MeshStandardMaterial({ color: C.glasses, roughness: 0.3, metalness: 0.7 }),
    glassesLens:new THREE.MeshStandardMaterial({ color: C.glassesLens, roughness: 0.1, metalness: 0, transparent: true, opacity: 0.25 }),
    glassesArm: new THREE.MeshStandardMaterial({ color: C.glassesArm, roughness: 0.4, metalness: 0.6 }),
    suit:       new THREE.MeshStandardMaterial({ color: C.suit, roughness: 0.8, metalness: 0.02 }),
    suitLight:  new THREE.MeshStandardMaterial({ color: C.suitLight, roughness: 0.75, metalness: 0.02 }),
    suitLapel:  new THREE.MeshStandardMaterial({ color: C.suitLapel, roughness: 0.7, metalness: 0.03 }),
    shirt:      new THREE.MeshStandardMaterial({ color: C.shirt, roughness: 0.5, metalness: 0 }),
    shirtShadow:new THREE.MeshStandardMaterial({ color: C.shirtShadow, roughness: 0.55, metalness: 0 }),
    tie:        new THREE.MeshStandardMaterial({ color: C.tie, roughness: 0.5, metalness: 0.05 }),
    tieStripe:  new THREE.MeshStandardMaterial({ color: C.tieStripe, roughness: 0.5, metalness: 0.05 }),
    highlight:  new THREE.MeshStandardMaterial({
      color: C.highlight, roughness: 0.2, metalness: 0,
      emissive: new THREE.Color(C.highlight), emissiveIntensity: 0.5,
    }),
    stubble:    new THREE.MeshStandardMaterial({ color: C.stubble, roughness: 0.9, metalness: 0 }),
  }), []);

  useEffect(() => () => { Object.values(mats).forEach(m => m.dispose()); }, [mats]);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.1);

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

    let mouthOpenAmt = c.mouthOpen;
    if (speaking) {
      speakPhase.current += dt * 10;
      const a = speakPhase.current;
      mouthOpenAmt = Math.max(
        mouthOpenAmt,
        0.05
        + 0.09 * Math.abs(Math.sin(a * 1.0))
        + 0.05 * Math.abs(Math.sin(a * 2.3 + 0.5))
        + 0.02 * Math.sin(a * 5.7),
      );
    } else {
      speakPhase.current *= 0.93;
    }

    if (headGroupRef.current) {
      headGroupRef.current.rotation.z = THREE.MathUtils.degToRad(c.headTiltZ)
        + Math.sin(elapsed * 0.5) * 0.008;
      headGroupRef.current.rotation.y = THREE.MathUtils.degToRad(c.headTiltY)
        + Math.sin(elapsed * 0.3) * 0.005;
      const breath = 1 + Math.sin(elapsed * 1.5) * 0.003;
      headGroupRef.current.scale.setScalar(breath);
    }

    const eyeSY = Math.max(0.02, c.eyeOpenness * blinkAmount.current);
    if (leftEyeGroupRef.current)  leftEyeGroupRef.current.scale.y  = eyeSY;
    if (rightEyeGroupRef.current) rightEyeGroupRef.current.scale.y = eyeSY;

    if (leftIrisRef.current) {
      leftIrisRef.current.position.x = c.irisX;
      leftIrisRef.current.position.y = c.irisY;
    }
    if (rightIrisRef.current) {
      rightIrisRef.current.position.x = c.irisX;
      rightIrisRef.current.position.y = c.irisY;
    }

    if (leftBrowRef.current) {
      leftBrowRef.current.position.y  = 0.18 + c.browY;
      leftBrowRef.current.rotation.z  = THREE.MathUtils.degToRad(c.browAngle);
    }
    if (rightBrowRef.current) {
      rightBrowRef.current.position.y  = 0.18 + c.browY;
      rightBrowRef.current.rotation.z  = -THREE.MathUtils.degToRad(c.browAngle);
    }

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
  });

  return (
    <group ref={headGroupRef}>
      {/* ── HEAD ── */}
      <mesh material={mats.skin} scale={[0.92, 1.02, 0.88]}>
        <sphereGeometry args={[0.5, 32, 32]} />
      </mesh>

      {/* Jaw / chin — more angular male */}
      <mesh material={mats.skin} position={[0, -0.35, 0.18]} scale={[1.1, 0.55, 0.7]}>
        <sphereGeometry args={[0.14, 16, 16]} />
      </mesh>

      {/* Cheekbone highlights */}
      <mesh material={mats.skinLight} position={[-0.2, -0.05, 0.34]} scale={[0.55, 0.4, 0.3]}>
        <sphereGeometry args={[0.1, 10, 10]} />
      </mesh>
      <mesh material={mats.skinLight} position={[0.2, -0.05, 0.34]} scale={[0.55, 0.4, 0.3]}>
        <sphereGeometry args={[0.1, 10, 10]} />
      </mesh>

      {/* ── HAIR — Short, styled, professional ── */}
      {/* Main hair cap */}
      <mesh material={mats.hair} position={[0, 0.12, -0.06]} scale={[0.96, 0.75, 0.94]}>
        <sphereGeometry args={[0.52, 32, 32]} />
      </mesh>
      {/* Top hair volume - styled up */}
      <mesh material={mats.hair} position={[0, 0.25, 0.05]} scale={[0.85, 0.35, 0.7]}>
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
      <mesh material={mats.hair} position={[0, 0.22, 0.28]} scale={[1.2, 0.18, 0.4]}>
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
      <mesh material={mats.skin} position={[0.47, 0.02, 0]} scale={[0.5, 0.8, 0.65]}>
        <sphereGeometry args={[0.08, 10, 10]} />
      </mesh>

      {/* ── EYES ── */}
      {/* Left eye group */}
      <group ref={leftEyeGroupRef} position={[-0.14, 0.06, 0.4]}>
        <mesh material={mats.eyeWhite}>
          <sphereGeometry args={[0.065, 16, 16]} />
        </mesh>
        <mesh material={mats.skinDark} position={[0, 0.045, 0.02]} scale={[1.1, 0.25, 0.5]}>
          <sphereGeometry args={[0.06, 10, 10]} />
        </mesh>
        <mesh ref={leftIrisRef} material={mats.iris} position={[0, 0, 0.04]}>
          <sphereGeometry args={[0.035, 14, 14]} />
        </mesh>
        <mesh material={mats.pupil} position={[0, 0, 0.055]}>
          <sphereGeometry args={[0.02, 10, 10]} />
        </mesh>
        <mesh material={mats.highlight} position={[0.018, 0.018, 0.06]}>
          <sphereGeometry args={[0.009, 6, 6]} />
        </mesh>
      </group>

      {/* Right eye group */}
      <group ref={rightEyeGroupRef} position={[0.14, 0.06, 0.4]}>
        <mesh material={mats.eyeWhite}>
          <sphereGeometry args={[0.065, 16, 16]} />
        </mesh>
        <mesh material={mats.skinDark} position={[0, 0.045, 0.02]} scale={[1.1, 0.25, 0.5]}>
          <sphereGeometry args={[0.06, 10, 10]} />
        </mesh>
        <mesh ref={rightIrisRef} material={mats.iris} position={[0, 0, 0.04]}>
          <sphereGeometry args={[0.035, 14, 14]} />
        </mesh>
        <mesh material={mats.pupil} position={[0, 0, 0.055]}>
          <sphereGeometry args={[0.02, 10, 10]} />
        </mesh>
        <mesh material={mats.highlight} position={[-0.018, 0.018, 0.06]}>
          <sphereGeometry args={[0.009, 6, 6]} />
        </mesh>
      </group>

      {/* ── GLASSES ── */}
      {/* Left lens frame */}
      <mesh material={mats.glasses} position={[-0.14, 0.06, 0.455]} scale={[1.25, 0.9, 0.15]}>
        <torusGeometry args={[0.075, 0.006, 8, 24]} />
      </mesh>
      {/* Left lens */}
      <mesh material={mats.glassesLens} position={[-0.14, 0.06, 0.455]} scale={[1.2, 0.85, 0.1]}>
        <circleGeometry args={[0.072, 20]} />
      </mesh>
      {/* Right lens frame */}
      <mesh material={mats.glasses} position={[0.14, 0.06, 0.455]} scale={[1.25, 0.9, 0.15]}>
        <torusGeometry args={[0.075, 0.006, 8, 24]} />
      </mesh>
      {/* Right lens */}
      <mesh material={mats.glassesLens} position={[0.14, 0.06, 0.455]} scale={[1.2, 0.85, 0.1]}>
        <circleGeometry args={[0.072, 20]} />
      </mesh>
      {/* Bridge */}
      <mesh material={mats.glasses} position={[0, 0.06, 0.46]} scale={[0.6, 0.35, 0.12]}>
        <torusGeometry args={[0.04, 0.005, 6, 12, Math.PI]} />
      </mesh>
      {/* Left arm */}
      <mesh material={mats.glassesArm} position={[-0.28, 0.06, 0.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.004, 0.004, 0.22, 6]} />
      </mesh>
      {/* Right arm */}
      <mesh material={mats.glassesArm} position={[0.28, 0.06, 0.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.004, 0.004, 0.22, 6]} />
      </mesh>

      {/* ── EYEBROWS ── */}
      <mesh ref={leftBrowRef} material={mats.brow} position={[-0.14, 0.2, 0.44]}>
        <boxGeometry args={[0.11, 0.02, 0.03]} />
      </mesh>
      <mesh ref={rightBrowRef} material={mats.brow} position={[0.14, 0.2, 0.44]}>
        <boxGeometry args={[0.11, 0.02, 0.03]} />
      </mesh>

      {/* ── NOSE ── */}
      <mesh material={mats.skinDark} position={[0, -0.03, 0.45]} scale={[0.7, 0.85, 0.65]}>
        <sphereGeometry args={[0.04, 10, 10]} />
      </mesh>
      <mesh material={mats.skin} position={[0, 0.04, 0.43]} scale={[0.35, 0.85, 0.45]}>
        <sphereGeometry args={[0.04, 8, 8]} />
      </mesh>
      <mesh material={mats.skinDark} position={[-0.018, -0.05, 0.44]} scale={[0.4, 0.3, 0.35]}>
        <sphereGeometry args={[0.02, 6, 6]} />
      </mesh>
      <mesh material={mats.skinDark} position={[0.018, -0.05, 0.44]} scale={[0.4, 0.3, 0.35]}>
        <sphereGeometry args={[0.02, 6, 6]} />
      </mesh>

      {/* ── MOUTH ── */}
      <mesh ref={upperLipRef} material={mats.lip} position={[0, -0.155, 0.41]} scale={[1.5, 0.38, 0.55]}>
        <sphereGeometry args={[0.06, 14, 14]} />
      </mesh>
      <mesh ref={lowerLipRef} material={mats.lipDark} position={[0, -0.2, 0.41]} scale={[1.3, 0.45, 0.55]}>
        <sphereGeometry args={[0.06, 14, 14]} />
      </mesh>
      <mesh ref={mouthOpenRef} material={mats.mouthDark} position={[0, -0.175, 0.42]} scale={[1.15, 0.04, 0.45]}>
        <sphereGeometry args={[0.05, 10, 10]} />
      </mesh>

      {/* ── STUBBLE (subtle chin/jaw shadow) ── */}
      <mesh material={mats.stubble} position={[0, -0.28, 0.2]} scale={[1.1, 0.35, 0.5]}>
        <sphereGeometry args={[0.15, 10, 10]} />
      </mesh>

      {/* ── NECK ── */}
      <mesh material={mats.skin} position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.13, 0.15, 0.15, 16]} />
      </mesh>

      {/* ── COLLAR / SHIRT ── */}
      {/* Collar spread */}
      <mesh material={mats.shirt} position={[-0.08, -0.52, 0.1]} rotation={[0.3, 0, -0.2]} scale={[0.7, 0.9, 0.3]}>
        <boxGeometry args={[0.12, 0.1, 0.02]} />
      </mesh>
      <mesh material={mats.shirt} position={[0.08, -0.52, 0.1]} rotation={[0.3, 0, 0.2]} scale={[0.7, 0.9, 0.3]}>
        <boxGeometry args={[0.12, 0.1, 0.02]} />
      </mesh>

      {/* ── TIE ── */}
      <mesh material={mats.tie} position={[0, -0.56, 0.14]} scale={[0.35, 1.2, 0.2]}>
        <boxGeometry args={[0.06, 0.18, 0.015]} />
      </mesh>
      {/* Tie knot */}
      <mesh material={mats.tieStripe} position={[0, -0.48, 0.14]} scale={[0.5, 0.5, 0.25]}>
        <sphereGeometry args={[0.025, 8, 8]} />
      </mesh>
      {/* Tie stripe */}
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
      <mesh material={mats.glasses} position={[-0.03, -0.62, 0.32]}>
        <sphereGeometry args={[0.012, 8, 8]} />
      </mesh>
      <mesh material={mats.glasses} position={[-0.03, -0.7, 0.3]}>
        <sphereGeometry args={[0.012, 8, 8]} />
      </mesh>
      {/* Pocket square */}
      <mesh material={mats.shirt} position={[0.12, -0.55, 0.3]} scale={[0.4, 0.3, 0.15]}>
        <boxGeometry args={[0.05, 0.03, 0.005]} />
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
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0.05, 1.6], fov: 38 }}
        frameloop="always"
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Professional studio lighting */}
        <ambientLight intensity={0.45} />
        <directionalLight position={[2, 3, 4]} intensity={0.95} color="#ffffff" />
        <directionalLight position={[-1, 2, 2]} intensity={0.35} color="#ffe0c0" />
        <pointLight position={[-2, 0, -1]} intensity={0.2} color="#c0d0ff" />
        {/* Rim light for silhouette */}
        <pointLight position={[0, -0.3, -1]} intensity={0.15} color="#8899bb" />

        <MarqAIHead speaking={speaking} expression={expression} />
      </Canvas>
    </div>
  );
}
