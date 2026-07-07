'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ============================================================
// TutorAvatar3D — True 3D human avatar using React Three Fiber
// ============================================================
// Renders a stylized Indian female teacher ("Marq AI") bust using
// primitive shapes (spheres, cylinders, boxes). Supports:
//   - Speaking mouth animation (lip-sync)
//   - Blinking
//   - Expression changes (neutral, explaining, thinking, happy, curious)
//   - Smooth interpolated transitions between expressions
// ============================================================

// ────────────── Types ──────────────

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

// ────────────── Expression Targets ──────────────

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
// Warm Indian skin tones + cultural accents

const C = {
  skin:      '#D2956A',
  skinDark:  '#C08050',
  skinLight: '#E0A87C',
  hair:      '#1a1a2e',
  lip:       '#c4726a',
  lipDark:   '#a85850',
  mouthDark: '#2a0808',
  eyeWhite:  '#f5f5f0',
  iris:      '#3d2b1f',
  pupil:     '#0a0a0a',
  brow:      '#1a1a1a',
  bindhi:    '#cc0000',
  earring:   '#ffd700',
  clothing:  '#4a6fa5',
  clothTrim: '#ffd700',
  highlight: '#ffffff',
};

// ────────────── AvatarHead — 3D Head/Bust Construction ──────────────

function AvatarHead({ speaking, expression }: AvatarHeadProps) {
  // --- Refs for animated parts ---
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

  // --- Animation state ---
  const blinkTimer    = useRef(0);
  const isBlinking    = useRef(false);
  const blinkStart    = useRef(0);
  const nextBlinkTime = useRef(2 + Math.random() * 3);
  const blinkAmount   = useRef(1);          // 1=open, 0=closed
  const speakPhase    = useRef(0);
  const current       = useRef<ExpressionState>({ ...EXPRESSION_TARGETS.neutral });

  const target = useMemo(
    () => EXPRESSION_TARGETS[expression] ?? EXPRESSION_TARGETS.neutral,
    [expression],
  );

  // --- Shared materials (reuse across meshes) ---
  const mats = useMemo(() => ({
    skin:      new THREE.MeshStandardMaterial({ color: C.skin, roughness: 0.6, metalness: 0.05 }),
    skinDark:  new THREE.MeshStandardMaterial({ color: C.skinDark, roughness: 0.65, metalness: 0.05 }),
    skinLight: new THREE.MeshStandardMaterial({ color: C.skinLight, roughness: 0.55, metalness: 0.05 }),
    hair:      new THREE.MeshStandardMaterial({ color: C.hair, roughness: 0.75, metalness: 0.1 }),
    eyeWhite:  new THREE.MeshStandardMaterial({ color: C.eyeWhite, roughness: 0.3, metalness: 0 }),
    iris:      new THREE.MeshStandardMaterial({ color: C.iris, roughness: 0.4, metalness: 0.1 }),
    pupil:     new THREE.MeshStandardMaterial({ color: C.pupil, roughness: 0.3, metalness: 0 }),
    lip:       new THREE.MeshStandardMaterial({ color: C.lip, roughness: 0.5, metalness: 0.05 }),
    lipDark:   new THREE.MeshStandardMaterial({ color: C.lipDark, roughness: 0.6, metalness: 0.05 }),
    mouthDark: new THREE.MeshStandardMaterial({ color: C.mouthDark, roughness: 0.8, metalness: 0 }),
    brow:      new THREE.MeshStandardMaterial({ color: C.brow, roughness: 0.85, metalness: 0 }),
    bindhi:    new THREE.MeshStandardMaterial({
      color: C.bindhi, roughness: 0.3, metalness: 0.2,
      emissive: new THREE.Color(C.bindhi), emissiveIntensity: 0.3,
    }),
    earring:   new THREE.MeshStandardMaterial({ color: C.earring, roughness: 0.2, metalness: 0.8 }),
    clothing:  new THREE.MeshStandardMaterial({ color: C.clothing, roughness: 0.7, metalness: 0 }),
    clothTrim: new THREE.MeshStandardMaterial({ color: C.clothTrim, roughness: 0.3, metalness: 0.6 }),
    highlight: new THREE.MeshStandardMaterial({
      color: C.highlight, roughness: 0.2, metalness: 0,
      emissive: new THREE.Color(C.highlight), emissiveIntensity: 0.5,
    }),
  }), []);

  // Cleanup materials on unmount
  useEffect(() => () => { Object.values(mats).forEach(m => m.dispose()); }, [mats]);

  // ────────────── Animation Loop ──────────────

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.1);  // clamp for tab-switch safety

    // -- Blink logic (frame-based, no setTimeout) --
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

    // -- Lerp expression state toward target --
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

    // -- Speaking mouth animation --
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

    // -- Apply animations to refs --

    // Head group rotation (tilt + idle sway)
    if (headGroupRef.current) {
      headGroupRef.current.rotation.z = THREE.MathUtils.degToRad(c.headTiltZ)
        + Math.sin(elapsed * 0.5) * 0.008;
      headGroupRef.current.rotation.y = THREE.MathUtils.degToRad(c.headTiltY)
        + Math.sin(elapsed * 0.3) * 0.005;
      // Subtle breathing
      const breath = 1 + Math.sin(elapsed * 1.5) * 0.003;
      headGroupRef.current.scale.setScalar(breath);
    }

    // Eye openness (expression × blink)
    const eyeSY = Math.max(0.02, c.eyeOpenness * blinkAmount.current);
    if (leftEyeGroupRef.current)  leftEyeGroupRef.current.scale.y  = eyeSY;
    if (rightEyeGroupRef.current) rightEyeGroupRef.current.scale.y = eyeSY;

    // Iris look direction
    if (leftIrisRef.current) {
      leftIrisRef.current.position.x = c.irisX;
      leftIrisRef.current.position.y = c.irisY;
    }
    if (rightIrisRef.current) {
      rightIrisRef.current.position.x = c.irisX;
      rightIrisRef.current.position.y = c.irisY;
    }

    // Eyebrows
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
  });

  // ────────────── 3D Geometry ──────────────

  return (
    <group ref={headGroupRef}>
      {/* ── HEAD ── */}
      <mesh material={mats.skin} scale={[0.9, 1.0, 0.85]}>
        <sphereGeometry args={[0.5, 32, 32]} />
      </mesh>

      {/* Chin */}
      <mesh material={mats.skin} position={[0, -0.32, 0.22]} scale={[1.0, 0.6, 0.75]}>
        <sphereGeometry args={[0.13, 16, 16]} />
      </mesh>

      {/* Cheek highlights */}
      <mesh material={mats.skinLight} position={[-0.22, -0.08, 0.32]} scale={[0.6, 0.45, 0.35]}>
        <sphereGeometry args={[0.1, 10, 10]} />
      </mesh>
      <mesh material={mats.skinLight} position={[0.22, -0.08, 0.32]} scale={[0.6, 0.45, 0.35]}>
        <sphereGeometry args={[0.1, 10, 10]} />
      </mesh>

      {/* ── HAIR ── */}
      {/* Main hair cap (slightly larger, positioned up/back) */}
      <mesh material={mats.hair} position={[0, 0.1, -0.08]} scale={[0.94, 0.78, 0.92]}>
        <sphereGeometry args={[0.52, 32, 32]} />
      </mesh>
      {/* Hair bun at back */}
      <mesh material={mats.hair} position={[0, 0.02, -0.46]}>
        <sphereGeometry args={[0.17, 16, 16]} />
      </mesh>
      {/* Hair bun base */}
      <mesh material={mats.hair} position={[0, 0.08, -0.38]} scale={[0.7, 0.5, 0.6]}>
        <sphereGeometry args={[0.15, 12, 12]} />
      </mesh>
      {/* Left side hair */}
      <mesh material={mats.hair} position={[-0.38, 0.04, -0.08]} scale={[0.65, 1.15, 0.7]}>
        <sphereGeometry args={[0.13, 10, 10]} />
      </mesh>
      {/* Right side hair */}
      <mesh material={mats.hair} position={[0.38, 0.04, -0.08]} scale={[0.65, 1.15, 0.7]}>
        <sphereGeometry args={[0.13, 10, 10]} />
      </mesh>
      {/* Bangs */}
      <mesh material={mats.hair} position={[0, 0.22, 0.26]} scale={[1.35, 0.2, 0.5]}>
        <sphereGeometry args={[0.22, 14, 14]} />
      </mesh>
      {/* Hair part line (left side part) */}
      <mesh material={mats.hair} position={[-0.06, 0.3, 0.08]} scale={[0.06, 0.25, 0.45]}>
        <sphereGeometry args={[0.1, 6, 6]} />
      </mesh>
      {/* Hair wisps at temples */}
      <mesh material={mats.hair} position={[-0.35, -0.05, 0.15]} scale={[0.3, 0.8, 0.35]}>
        <sphereGeometry args={[0.06, 6, 6]} />
      </mesh>
      <mesh material={mats.hair} position={[0.35, -0.05, 0.15]} scale={[0.3, 0.8, 0.35]}>
        <sphereGeometry args={[0.06, 6, 6]} />
      </mesh>

      {/* ── EARS ── */}
      <mesh material={mats.skin} position={[-0.46, 0.02, 0]} scale={[0.5, 0.8, 0.7]}>
        <sphereGeometry args={[0.08, 10, 10]} />
      </mesh>
      <mesh material={mats.skin} position={[0.46, 0.02, 0]} scale={[0.5, 0.8, 0.7]}>
        <sphereGeometry args={[0.08, 10, 10]} />
      </mesh>

      {/* ── EYES ── */}
      {/* Left eye group */}
      <group ref={leftEyeGroupRef} position={[-0.14, 0.06, 0.4]}>
        {/* Eyeball */}
        <mesh material={mats.eyeWhite}>
          <sphereGeometry args={[0.065, 16, 16]} />
        </mesh>
        {/* Upper eyelid line (skin-colored arc above eye) */}
        <mesh material={mats.skinDark} position={[0, 0.045, 0.02]} scale={[1.1, 0.25, 0.5]}>
          <sphereGeometry args={[0.06, 10, 10]} />
        </mesh>
        {/* Iris */}
        <mesh ref={leftIrisRef} material={mats.iris} position={[0, 0, 0.04]}>
          <sphereGeometry args={[0.035, 14, 14]} />
        </mesh>
        {/* Pupil */}
        <mesh material={mats.pupil} position={[0, 0, 0.055]}>
          <sphereGeometry args={[0.02, 10, 10]} />
        </mesh>
        {/* Specular highlight */}
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

      {/* ── EYEBROWS ── */}
      <mesh ref={leftBrowRef} material={mats.brow} position={[-0.14, 0.18, 0.39]}>
        <boxGeometry args={[0.1, 0.018, 0.03]} />
      </mesh>
      <mesh ref={rightBrowRef} material={mats.brow} position={[0.14, 0.18, 0.39]}>
        <boxGeometry args={[0.1, 0.018, 0.03]} />
      </mesh>

      {/* ── NOSE ── */}
      {/* Nose tip */}
      <mesh material={mats.skinDark} position={[0, -0.03, 0.45]} scale={[0.7, 0.85, 0.65]}>
        <sphereGeometry args={[0.04, 10, 10]} />
      </mesh>
      {/* Nose bridge */}
      <mesh material={mats.skin} position={[0, 0.04, 0.43]} scale={[0.35, 0.85, 0.45]}>
        <sphereGeometry args={[0.04, 8, 8]} />
      </mesh>
      {/* Nostrils (subtle) */}
      <mesh material={mats.skinDark} position={[-0.018, -0.05, 0.44]} scale={[0.4, 0.3, 0.35]}>
        <sphereGeometry args={[0.02, 6, 6]} />
      </mesh>
      <mesh material={mats.skinDark} position={[0.018, -0.05, 0.44]} scale={[0.4, 0.3, 0.35]}>
        <sphereGeometry args={[0.02, 6, 6]} />
      </mesh>

      {/* ── MOUTH ── */}
      {/* Upper lip */}
      <mesh ref={upperLipRef} material={mats.lip} position={[0, -0.155, 0.41]} scale={[1.5, 0.38, 0.55]}>
        <sphereGeometry args={[0.06, 14, 14]} />
      </mesh>
      {/* Lower lip */}
      <mesh ref={lowerLipRef} material={mats.lipDark} position={[0, -0.2, 0.41]} scale={[1.3, 0.45, 0.55]}>
        <sphereGeometry args={[0.06, 14, 14]} />
      </mesh>
      {/* Mouth opening (dark interior, animates when speaking) */}
      <mesh ref={mouthOpenRef} material={mats.mouthDark} position={[0, -0.175, 0.42]} scale={[1.15, 0.04, 0.45]}>
        <sphereGeometry args={[0.05, 10, 10]} />
      </mesh>

      {/* ── BINDHI ── */}
      <mesh material={mats.bindhi} position={[0, 0.14, 0.44]}>
        <sphereGeometry args={[0.017, 8, 8]} />
      </mesh>

      {/* ── EARRINGS ── */}
      <mesh material={mats.earring} position={[-0.48, -0.06, 0.04]}>
        <sphereGeometry args={[0.022, 8, 8]} />
      </mesh>
      <mesh material={mats.earring} position={[0.48, -0.06, 0.04]}>
        <sphereGeometry args={[0.022, 8, 8]} />
      </mesh>
      {/* Earring dangles */}
      <mesh material={mats.earring} position={[-0.48, -0.1, 0.04]} scale={[0.6, 1.2, 0.6]}>
        <sphereGeometry args={[0.015, 6, 6]} />
      </mesh>
      <mesh material={mats.earring} position={[0.48, -0.1, 0.04]} scale={[0.6, 1.2, 0.6]}>
        <sphereGeometry args={[0.015, 6, 6]} />
      </mesh>

      {/* ── NECK ── */}
      <mesh material={mats.skin} position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.15, 16]} />
      </mesh>

      {/* ── NECKLACE ── */}
      <mesh material={mats.clothTrim} position={[0, -0.48, 0.1]} scale={[1.8, 0.12, 0.3]}>
        <torusGeometry args={[0.08, 0.007, 6, 20]} />
      </mesh>
      {/* Necklace pendant */}
      <mesh material={mats.earring} position={[0, -0.52, 0.15]}>
        <sphereGeometry args={[0.015, 6, 6]} />
      </mesh>

      {/* ── SHOULDERS / CLOTHING ── */}
      <mesh material={mats.clothing} position={[0, -0.65, 0]} scale={[1.2, 0.35, 0.75]}>
        <sphereGeometry args={[0.45, 20, 20]} />
      </mesh>
      {/* Clothing neckline (V-shape suggested by skin showing) */}
      <mesh material={mats.skin} position={[0, -0.52, 0.14]} scale={[0.6, 0.35, 0.35]}>
        <sphereGeometry args={[0.08, 10, 10]} />
      </mesh>
      {/* Clothing trim at neckline */}
      <mesh material={mats.clothTrim} position={[0, -0.5, 0.16]} scale={[1.1, 0.2, 0.25]}>
        <torusGeometry args={[0.1, 0.005, 6, 18, Math.PI]} />
      </mesh>
    </group>
  );
}

// ────────────── Main 3D Component (default export) ──────────────

export default function TutorAvatar3D({
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
        camera={{ position: [0, 0.1, 1.6], fov: 38 }}
        frameloop="always"
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Lighting: warm, flattering key + fill + rim */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 3, 4]} intensity={0.9} color="#ffffff" />
        <directionalLight position={[-1, 2, 2]} intensity={0.3} color="#ffe0c0" />
        <pointLight position={[-2, 0, -1]} intensity={0.2} color="#c0d0ff" />

        <AvatarHead speaking={speaking} expression={expression} />
      </Canvas>
    </div>
  );
}
