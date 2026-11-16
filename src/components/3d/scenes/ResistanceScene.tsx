import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { focusStore, useFocused } from '../../../lib/focusStore';
import { useSceneSettings, type SceneProps } from '../sceneSettings';
import { seededRandom, useDisposable, useTweenedValue } from '../utils';
import { Glow, makeGlowPointsMaterial, setPointer } from './common';

/**
 * The flow is turned by FLOW_ANGLE so the barriers are seen in perspective.
 * Their local positions are solved so that, seen from the camera (z = 11),
 * they line up with five evenly spaced text columns (projected x = -4…4).
 */
const FLOW_ANGLE = 0.3;
const CAMERA_Z = 11;
const solveX = (d: number) => (CAMERA_Z * d) / (CAMERA_Z * Math.cos(FLOW_ANGLE) + d * Math.sin(FLOW_ANGLE));
export const BARRIER_X = [-4, -2, 0, 2, 4].map(solveX);
const FLOW_Y = -2.5;
const HALF_H = 1.05;
const X_START = -9;
const X_END = 9;

const COLD = new THREE.Color('#45e0ff');
const WARM = new THREE.Color('#ffe2a8');

/**
 * Scene 05 — "Le flux et les barrières": a stream of transformation hits
 * five barriers (the causes of resistance). When communication, training
 * and participation arrive, the barriers open like doors and the flow passes.
 * Barriers are interactive: hovering one highlights the matching cause.
 */
export function ResistanceScene({ step }: SceneProps) {
  const { reducedMotion, quality } = useSceneSettings();
  const count = quality === 'high' ? 900 : 450;
  const focused = useFocused();
  const opens = [0, 1, 2, 3, 4].map((i) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useTweenedValue(step >= 1 ? 1 : 0, { duration: 1.4, delay: step >= 1 ? 0.5 + i * 0.22 : 0, ease: 'power3.inOut' }),
  );
  const sweep = useTweenedValue(step >= 1 ? 1 : 0, { duration: 2.6, ease: 'power1.inOut' });
  const doorRefs = useRef<(THREE.Group | null)[]>([]);
  const sweepRing = useRef<THREE.Mesh>(null);
  const highlight = useRef(BARRIER_X.map(() => 0));

  const particles = useMemo(() => {
    const rand = seededRandom(41);
    return Array.from({ length: count }, () => ({
      x: X_START + rand() * (X_END - X_START) * 0.45,
      vx: 1 + rand(),
      y: (rand() - 0.5) * 2 * HALF_H * 0.95,
      z: (rand() - 0.5) * 1.6,
      base: 1.6 + rand() * 1.2,
    }));
  }, [count]);

  const geo = useDisposable(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    return g;
  }, [count]);
  const mat = useDisposable(() => makeGlowPointsMaterial(0.24, 1));
  const doorGeo = useDisposable(() => new THREE.BoxGeometry(0.14, HALF_H, 1.9));
  const doorMats = useDisposable(() =>
    BARRIER_X.map(
      () =>
        new THREE.MeshStandardMaterial({
          color: '#ff7a6b',
          emissive: '#ff3b2a',
          emissiveIntensity: 0.45,
          transparent: true,
          opacity: 0.62,
          roughness: 0.3,
          metalness: 0.2,
        }),
    ),
  );
  const tmpColor = useMemo(() => new THREE.Color(), []);

  useFrame((state, dt) => {
    const speed = reducedMotion ? 0.35 : 1;
    const step = Math.min(dt, 1 / 30) * speed;
    const pos = geo.attributes.position.array as Float32Array;
    const col = geo.attributes.color.array as Float32Array;
    const openValues = opens.map((o) => o.value);

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      const prevX = p.x;
      p.vx += (p.base - p.vx) * Math.min(1, step * 2.2);
      p.x += p.vx * step;
      // Collision with a closed barrier: the gap opens from the centre of each door.
      for (let b = 0; b < BARRIER_X.length; b++) {
        const wall = BARRIER_X[b] - 0.1;
        if (prevX <= wall && p.x > wall) {
          const gap = openValues[b] * HALF_H * 1.05;
          if (Math.abs(p.y) > gap) {
            p.x = wall - Math.random() * 0.08;
            p.vx = -Math.random() * 1.6;
            p.y += (Math.random() - 0.5) * 0.12;
            p.y = THREE.MathUtils.clamp(p.y, -HALF_H, HALF_H);
          }
          break;
        }
      }
      if (p.x > X_END) {
        p.x = X_START;
        p.y = (Math.random() - 0.5) * 2 * HALF_H * 0.95;
      }
      pos[i * 3] = p.x;
      pos[i * 3 + 1] = p.y + Math.sin(state.clock.elapsedTime * 2 + i) * 0.02;
      pos[i * 3 + 2] = p.z;
      const k = THREE.MathUtils.clamp((p.x - X_START) / (X_END - X_START), 0, 1);
      tmpColor.copy(COLD).lerp(WARM, k * k);
      col[i * 3] = tmpColor.r;
      col[i * 3 + 1] = tmpColor.g;
      col[i * 3 + 2] = tmpColor.b;
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;

    BARRIER_X.forEach((_, b) => {
      const door = doorRefs.current[b];
      const o = openValues[b];
      const isFocused = focusStore.get() === `cause-${b}`;
      highlight.current[b] = THREE.MathUtils.damp(highlight.current[b], isFocused ? 1 : 0, 8, dt);
      const h = highlight.current[b];
      if (door) {
        // Doors retract toward their outer edges, opening a gap from the centre.
        const [top, bottom] = door.children as THREE.Mesh[];
        const remain = Math.max(0.02, 1 - o);
        top.scale.y = remain;
        bottom.scale.y = remain;
        top.position.y = HALF_H - (HALF_H / 2) * remain;
        bottom.position.y = -HALF_H + (HALF_H / 2) * remain;
        door.scale.x = 1 + h * 0.8;
      }
      const m = doorMats[b];
      m.opacity = 0.62 * (1 - o * 0.65) + h * 0.3;
      m.emissiveIntensity = 0.45 + h * 1.4;
      m.emissive.setRGB(1, 0.23 + o * 0.5, 0.16 + o * 0.6);
    });

    if (sweepRing.current) {
      const s = sweep.value;
      sweepRing.current.position.x = X_START + 1 + s * (X_END - X_START - 2);
      (sweepRing.current.material as THREE.MeshBasicMaterial).opacity = Math.sin(Math.PI * s) * 0.9;
    }
  });

  return (
    <group position={[0, FLOW_Y, 0]} rotation={[0, -FLOW_ANGLE, 0]}>
      <Glow color="#2f6dff" size={[20, 4]} opacity={0.16} position={[0, 0, -1.5]} />
      <points geometry={geo} material={mat} frustumCulled={false} />
      {BARRIER_X.map((x, b) => (
        <group
          key={x}
          position={[x, 0, 0]}
          ref={(el) => void (doorRefs.current[b] = el)}
          onPointerOver={(e) => {
            e.stopPropagation();
            focusStore.set(`cause-${b}`);
            setPointer(true);
          }}
          onPointerOut={() => {
            if (focusStore.get() === `cause-${b}`) focusStore.set(null);
            setPointer(false);
          }}
        >
          <mesh geometry={doorGeo} material={doorMats[b]} />
          <mesh geometry={doorGeo} material={doorMats[b]} />
        </group>
      ))}
      {BARRIER_X.map((x, b) => (
        <Glow key={`g${x}`} color={focused === `cause-${b}` ? '#ffd0a0' : '#ff6a4a'} size={[1.2, 3.4]} opacity={0.28} position={[x - 0.2, 0, -0.2]} />
      ))}
      <mesh ref={sweepRing} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[1.45, 0.03, 8, 96]} />
        <meshBasicMaterial color="#9ff0ff" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}
