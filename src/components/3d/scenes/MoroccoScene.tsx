import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useSceneSettings, type SceneProps } from '../sceneSettings';
import { seededRandom, smooth, useDisposable, useTweenedValue } from '../utils';
import { Glow, makeGlowPointsMaterial } from './common';

const CELL = 1.25;
const COLS = 18;
const ROWS = 13;
const OUTER = CELL * 0.43;
const INNER = OUTER * Math.cos(Math.PI / 4) / Math.cos(Math.PI / 8);

// Traditional zellige palette → digital palette
const TRADITION = ['#d9a441', '#c8643b', '#2f8f6f', '#3d5fb0'].map((c) => new THREE.Color(c));
const DIGITAL = new THREE.Color('#45e0ff');
const FRICTION = new THREE.Color('#ff9a52');

/** Builds an 8-pointed star (khatam) lattice as line segments on the XZ plane. */
function buildZellige() {
  const positions: number[] = [];
  const cellOf: number[] = []; // for each vertex: index of the traditional colour
  const rand = seededRandom(1212);
  const x0 = -((COLS - 1) * CELL) / 2;
  const z0 = -((ROWS - 1) * CELL) * 0.78;
  const push = (ax: number, az: number, bx: number, bz: number, colour: number) => {
    positions.push(ax, 0, az, bx, 0, bz);
    cellOf.push(colour, colour);
  };
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cx = x0 + c * CELL;
      const cz = z0 + r * CELL;
      const colour = Math.floor(rand() * TRADITION.length);
      // Star outline: 16 vertices alternating outer and inner radius
      for (let k = 0; k < 16; k++) {
        const a0 = (k / 16) * Math.PI * 2 + Math.PI / 8;
        const a1 = ((k + 1) / 16) * Math.PI * 2 + Math.PI / 8;
        const r0 = k % 2 === 0 ? OUTER : INNER;
        const r1 = k % 2 === 0 ? INNER : OUTER;
        push(cx + Math.cos(a0) * r0, cz + Math.sin(a0) * r0, cx + Math.cos(a1) * r1, cz + Math.sin(a1) * r1, colour);
      }
      // Inner octagon (rosette)
      for (let k = 0; k < 8; k++) {
        const a0 = (k / 8) * Math.PI * 2;
        const a1 = ((k + 1) / 8) * Math.PI * 2;
        const ri = INNER * 0.55;
        push(cx + Math.cos(a0) * ri, cz + Math.sin(a0) * ri, cx + Math.cos(a1) * ri, cz + Math.sin(a1) * ri, colour);
      }
      // Connectors to the neighbouring stars (the lattice between stars)
      const tip = OUTER * Math.cos(Math.PI / 8);
      if (c < COLS - 1) push(cx + tip, cz, cx + CELL - tip, cz, colour);
      if (r < ROWS - 1) push(cx, cz + tip, cx, cz + CELL - tip, colour);
      if (c < COLS - 1 && r < ROWS - 1) {
        const d = OUTER * 0.72;
        push(cx + d, cz + d, cx + CELL - d, cz + CELL - d, colour);
      }
    }
  }
  return { positions: new Float32Array(positions), cellOf, x0, z0 };
}

const PULSES = 90;

/**
 * Scene 11 — "Zellige numérique": a Moroccan geometric pattern (tradition)
 * is progressively rewritten into a digital network by a moving wave.
 * In the second step, the transformation front reveals its frictions.
 */
export function MoroccoScene({ step }: SceneProps) {
  const { reducedMotion } = useSceneSettings();
  const zellige = useMemo(buildZellige, []);
  const wave = useTweenedValue(step >= 1 ? 0.86 : 0.58, { from: 0, duration: step >= 1 ? 2.4 : 3.4, ease: 'power2.inOut' });
  const friction = useTweenedValue(step >= 1 ? 1 : 0, { duration: 1.2 });
  const emblem = useRef<THREE.Group>(null);
  const lastWave = useRef(-1);

  const geo = useDisposable(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(zellige.positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(zellige.positions.length), 3));
    return g;
  });
  const mat = useDisposable(
    () => new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }),
  );

  const pulseData = useMemo(() => {
    const rand = seededRandom(9);
    return Array.from({ length: PULSES }, () => ({
      row: Math.floor(rand() * ROWS),
      t: rand(),
      speed: 0.05 + rand() * 0.08,
      vertical: rand() > 0.6,
      col: Math.floor(rand() * COLS),
    }));
  }, []);
  const pulseGeo = useDisposable(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PULSES * 3), 3));
    return g;
  });
  const pulseMat = useDisposable(() => makeGlowPointsMaterial(0.42, 0.95, '#aef4ff', false));

  const emblemGeo = useDisposable(() => {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= 16; k++) {
      const a = (k / 16) * Math.PI * 2 + Math.PI / 8;
      const r = k % 2 === 0 ? 1 : Math.cos(Math.PI / 4) / Math.cos(Math.PI / 8);
      pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  });
  const emblemFill = useDisposable(() => {
    const shape = new THREE.Shape();
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2 + Math.PI / 8;
      const r = k % 2 === 0 ? 1 : Math.cos(Math.PI / 4) / Math.cos(Math.PI / 8);
      if (k === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    return new THREE.ShapeGeometry(shape);
  });
  const [emblemLineA, emblemLineB, emblemFillMat] = useDisposable(() => [
    new THREE.LineBasicMaterial({ color: '#ffcf7a', transparent: true, blending: THREE.AdditiveBlending }),
    new THREE.LineBasicMaterial({ color: '#45e0ff', transparent: true, blending: THREE.AdditiveBlending }),
    new THREE.MeshBasicMaterial({ color: '#1b3a7a', transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }),
  ]);

  const outerLine = useMemo(() => new THREE.Line(emblemGeo, emblemLineA), [emblemGeo, emblemLineA]);
  const innerLine = useMemo(() => {
    const line = new THREE.Line(emblemGeo, emblemLineB);
    line.scale.setScalar(0.78);
    return line;
  }, [emblemGeo, emblemLineB]);

  const tmp = useMemo(() => new THREE.Color(), []);
  const width = (COLS - 1) * CELL;

  useFrame((state, dt) => {
    const speed = reducedMotion ? 0.3 : 1;
    const t = state.clock.elapsedTime * speed;
    const w = wave.value;
    const fr = friction.value;
    const front = zellige.x0 - 1 + w * (width + 6); // wave front position on X (diagonal)

    // Recolour only while the wave or the friction glow is moving
    const shimmer = fr > 0.01;
    if (Math.abs(w - lastWave.current) > 1e-4 || shimmer) {
      lastWave.current = w;
      const pos = zellige.positions;
      const col = geo.attributes.color.array as Float32Array;
      for (let v = 0; v < pos.length / 3; v++) {
        const x = pos[v * 3] + pos[v * 3 + 2] * 0.35;
        const k = smooth((front - x) / 1.6); // 0 = tradition, 1 = digital
        tmp.copy(TRADITION[zellige.cellOf[v]]).multiplyScalar(0.55).lerp(DIGITAL, k);
        const band = Math.max(0, 1 - Math.abs(front - x) / 1.2);
        if (band > 0) {
          tmp.lerp(fr > 0.01 ? FRICTION : DIGITAL, band * (0.6 + fr * 0.3 * (0.6 + 0.4 * Math.sin(t * 6 + v))));
          tmp.multiplyScalar(1 + band * 0.8);
        }
        // Keep the pattern discreet behind the text column (left side of the stage)
        tmp.multiplyScalar(0.14 + 0.86 * smooth((pos[v * 3] - 0.6) / 3.6));
        col[v * 3] = tmp.r;
        col[v * 3 + 1] = tmp.g;
        col[v * 3 + 2] = tmp.b;
      }
      geo.attributes.color.needsUpdate = true;
    }

    // Data pulses run only inside the digitised area
    const pp = pulseGeo.attributes.position.array as Float32Array;
    pulseData.forEach((p, i) => {
      p.t = (p.t + dt * p.speed * speed * (1 - fr * 0.5)) % 1;
      let x: number;
      let z: number;
      if (p.vertical) {
        x = zellige.x0 + p.col * CELL;
        z = zellige.z0 + p.t * (ROWS - 1) * CELL;
      } else {
        x = zellige.x0 + p.t * width;
        z = zellige.z0 + p.row * CELL;
      }
      const inside = x + z * 0.35 < front - 0.8;
      pp.set([x, inside ? 0.04 : -50, z], i * 3);
    });
    pulseGeo.attributes.position.needsUpdate = true;

    if (emblem.current) {
      emblem.current.rotation.z += dt * 0.12 * speed;
      emblem.current.position.y = 0.3 + Math.sin(t * 0.8) * 0.12;
      const [lineA, lineB] = emblem.current.children.slice(1) as THREE.Line[];
      lineA.rotation.z = Math.sin(t * 0.4) * 0.05;
      lineB.rotation.z = Math.PI / 8 + w * Math.PI / 8;
    }
  });

  return (
    <group>
      <group position={[0, -2.4, 0]}>
        <lineSegments geometry={geo} material={mat} frustumCulled={false} />
        <points geometry={pulseGeo} material={pulseMat} frustumCulled={false} />
      </group>

      {/* Floating emblem: the khatam star, half tradition, half digital */}
      <group ref={emblem} position={[4.6, 0.3, -0.5]} scale={1.05}>
        <mesh geometry={emblemFill} material={emblemFillMat} />
        <primitive object={outerLine} />
        <primitive object={innerLine} />
        <Glow color="#ffb86b" size={4.4} opacity={0.3} />
        <Glow color="#45e0ff" size={2.2} opacity={0.35} />
      </group>
    </group>
  );
}
