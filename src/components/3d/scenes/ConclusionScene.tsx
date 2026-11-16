import { MeshDistortMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useSceneSettings, type SceneProps } from '../sceneSettings';
import { fibonacciSphere, seededRandom, smooth, useDisposable, useTweenedValue } from '../utils';
import { Glow, makeGlowPointsMaterial } from './common';

interface RingDef {
  radius: number;
  color: string;
  tilt: [number, number, number];
  aligned: [number, number, number];
  speed: number;
  kind: 'cube' | 'crystal' | 'leaf';
  count: number;
}

// The three concepts as rings of an armillary sphere, each carrying the
// visual vocabulary of its earlier scenes (blocks, crystals, leaves).
const RINGS: RingDef[] = [
  { radius: 1.35, color: '#4f8cff', tilt: [1.1, 0.3, 0], aligned: [0.42, 0, 0], speed: 0.5, kind: 'cube', count: 6 },
  { radius: 1.85, color: '#a98bff', tilt: [0.3, 1.2, 0.5], aligned: [0.42, 0, Math.PI / 3], speed: -0.36, kind: 'crystal', count: 8 },
  { radius: 2.35, color: '#3fe0c5', tilt: [-0.6, 0.4, 1.1], aligned: [0.42, 0, (Math.PI * 2) / 3], speed: 0.24, kind: 'leaf', count: 12 },
];

const SHELL = 1100;

/**
 * Scene 12 — "L'harmonie": particles from every previous scene converge
 * into one armillary structure where change, innovation and learning
 * orbit a shared core. For the closing words, the rings align.
 */
export function ConclusionScene({ step }: SceneProps) {
  const { reducedMotion, quality } = useSceneSettings();
  const root = useRef<THREE.Group>(null);
  const ringRefs = useRef<(THREE.Group | null)[]>([]);
  const spinRefs = useRef<(THREE.Group | null)[]>([]);
  const shell = useRef<THREE.Points>(null);
  const converge = useTweenedValue(1, { from: 0, duration: 3.6, ease: 'power3.inOut' });
  const centred = useTweenedValue(step >= 1 ? 1 : 0, { duration: 1.8 });
  const harmony = useTweenedValue(step >= 2 ? 1 : 0, { duration: 2.4, ease: 'power2.inOut' });
  const count = quality === 'high' ? SHELL : 600;

  const shellData = useMemo(() => {
    const rand = seededRandom(404);
    const targets = fibonacciSphere(count, 3.1);
    const starts = targets.map(() => new THREE.Vector3((rand() - 0.5) * 30, (rand() - 0.5) * 18, -rand() * 20 + 4));
    return { targets, starts };
  }, [count]);
  const shellGeo = useDisposable(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    const colors = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      c.set(RINGS[i % 3].color).lerp(new THREE.Color('#ffffff'), 0.25);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [count]);
  const shellMat = useDisposable(() => makeGlowPointsMaterial(0.1, 0.85));
  const [cubeGeo, crystalGeo, leafGeo] = useDisposable(() => [
    new THREE.BoxGeometry(0.16, 0.16, 0.16),
    new THREE.OctahedronGeometry(0.13, 0),
    new THREE.IcosahedronGeometry(0.08, 1),
  ]);
  const geoFor = { cube: cubeGeo, crystal: crystalGeo, leaf: leafGeo };
  const itemMats = useDisposable(() =>
    RINGS.map((r) => new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: r.color, emissiveIntensity: 1.1, roughness: 0.25, flatShading: true })),
  );
  const ringMats = useDisposable(() =>
    RINGS.map((r) => new THREE.MeshBasicMaterial({ color: r.color, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false })),
  );
  const euler = useMemo(() => new THREE.Euler(), []);
  const qa = useMemo(() => new THREE.Quaternion(), []);
  const qb = useMemo(() => new THREE.Quaternion(), []);

  useFrame((state, dt) => {
    const speed = reducedMotion ? 0.3 : 1;
    const t = state.clock.elapsedTime * speed;
    const cv = smooth(converge.value);
    const h = smooth(harmony.value);
    const c = smooth(centred.value);

    const pos = shellGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const s = shellData.starts[i];
      const e = shellData.targets[i];
      const k = smooth(cv * 1.3 - (i % 50) / 160);
      pos[i * 3] = s.x + (e.x - s.x) * k;
      pos[i * 3 + 1] = s.y + (e.y - s.y) * k;
      pos[i * 3 + 2] = s.z + (e.z - s.z) * k;
    }
    shellGeo.attributes.position.needsUpdate = true;
    shellMat.opacity = 0.35 + 0.4 * (1 - h * 0.5);
    if (shell.current) shell.current.rotation.y += dt * 0.05 * speed;

    RINGS.forEach((ring, i) => {
      const g = ringRefs.current[i];
      if (g) {
        qa.setFromEuler(euler.set(...ring.tilt));
        qb.setFromEuler(euler.set(...ring.aligned));
        g.quaternion.slerpQuaternions(qa, qb, h);
        g.scale.setScalar(0.3 + 0.7 * smooth(cv * 1.2 - i * 0.12));
      }
      const spin = spinRefs.current[i];
      if (spin) spin.rotation.z += dt * ring.speed * speed * (1 - h * 0.5);
      itemMats[i].emissiveIntensity = 1.1 + h * 0.8;
      ringMats[i].opacity = 0.55 + h * 0.4;
    });

    if (root.current) {
      root.current.position.set(3.4 * (1 - c), 0.55 * c, -2.2 * c * (1 - h * 0.6));
      root.current.rotation.y = Math.sin(t * 0.12) * 0.25 * (1 - h);
      root.current.rotation.z += dt * 0.06 * h * speed;
    }
  });

  return (
    <group ref={root} position={[3.4, 0, 0]}>
      <Glow color="#5f7bff" size={10} opacity={0.2} />
      <Glow color="#e6eeff" size={2.2} opacity={0.8} />
      <mesh>
        <icosahedronGeometry args={[0.55, 16]} />
        <MeshDistortMaterial
          color="#8fa6ff"
          emissive="#4a3aff"
          emissiveIntensity={1.3}
          roughness={0.15}
          metalness={0.3}
          distort={0.3}
          speed={reducedMotion ? 0.4 : 1.4}
        />
      </mesh>

      {RINGS.map((ring, i) => (
        <group key={ring.radius} ref={(el) => void (ringRefs.current[i] = el)}>
          <mesh material={ringMats[i]}>
            <torusGeometry args={[ring.radius, 0.012, 8, 160]} />
          </mesh>
          <group ref={(el) => void (spinRefs.current[i] = el)}>
            {Array.from({ length: ring.count }, (_, k) => {
              const a = (k / ring.count) * Math.PI * 2;
              return (
                <mesh
                  key={k}
                  geometry={geoFor[ring.kind]}
                  material={itemMats[i]}
                  position={[Math.cos(a) * ring.radius, Math.sin(a) * ring.radius, 0]}
                  rotation={[a, a * 0.5, 0]}
                />
              );
            })}
          </group>
        </group>
      ))}

      <points ref={shell} geometry={shellGeo} material={shellMat} frustumCulled={false} />
    </group>
  );
}
