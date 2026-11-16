import { MeshDistortMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useSceneSettings, type SceneProps } from '../sceneSettings';
import { fibonacciSphere, seededRandom, smooth, useDisposable, useTweenedValue } from '../utils';
import { Glow, makeGlowPointsMaterial, makeLineMaterial } from './common';
import { Bulb, CHEST, MiniTree, People, type PeopleHandle } from './symbols';

const CONCEPT_COLORS = ['#4f8cff', '#a98bff', '#3fe0c5']; // change, innovation, learning

interface Tier {
  radius: number;
  y: number;
  count: number;
}

// Amphitheatre: the organisation gathered around its core
const TIERS: Tier[] = [
  { radius: 1.45, y: -1.25, count: 6 },
  { radius: 2.2, y: -0.95, count: 12 },
  { radius: 2.95, y: -0.65, count: 18 },
];
const LEVEL_Y = -0.95;
const SHELL = 1100;

/** Small gyroscope = change (echo of scene 10). */
function Gyroscope({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.children[0].rotation.x += dt * 1.1;
    ref.current.children[1].rotation.y += dt * 0.8;
  });
  return (
    <group ref={ref} position={position}>
      <mesh>
        <torusGeometry args={[0.26, 0.022, 8, 48]} />
        <meshStandardMaterial color="#cfe0ff" emissive="#4f8cff" emissiveIntensity={1.2} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.19, 0.022, 8, 48]} />
        <meshStandardMaterial color="#cfe0ff" emissive="#2f6bff" emissiveIntensity={1.1} />
      </mesh>
      <Glow color="#4f8cff" size={1.2} opacity={0.45} />
    </group>
  );
}

/**
 * Scene 12 — "L'harmonie": everything converges. The members of the
 * organisation gather in an amphitheatre around the shared core; the three
 * symbols of the talk (gyroscope = change, light-bulb = innovation,
 * tree = learning) stand among them. For the final words, the tiers come
 * level and every person connects to the others.
 */
export function ConclusionScene({ step }: SceneProps) {
  const { reducedMotion, quality } = useSceneSettings();
  const root = useRef<THREE.Group>(null);
  const amphitheatre = useRef<THREE.Group>(null);
  const tierRefs = useRef<(THREE.Group | null)[]>([]);
  const peopleRefs = useRef<(PeopleHandle | null)[]>([]);
  const shell = useRef<THREE.Points>(null);
  const converge = useTweenedValue(1, { from: 0, duration: 3.6, ease: 'power3.inOut' });
  const centred = useTweenedValue(step >= 1 ? 1 : 0, { duration: 1.8 });
  const harmony = useTweenedValue(step >= 2 ? 1 : 0, { duration: 2.4, ease: 'power2.inOut' });
  const count = quality === 'high' ? SHELL : 600;

  // Particles from every previous scene converge into a soft sphere of light
  const shellData = useMemo(() => {
    const rand = seededRandom(404);
    const targets = fibonacciSphere(count, 3.6);
    const starts = targets.map(() => new THREE.Vector3((rand() - 0.5) * 30, (rand() - 0.5) * 18, -rand() * 20 + 4));
    return { targets, starts };
  }, [count]);
  const shellGeo = useDisposable(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    const colors = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      c.set(CONCEPT_COLORS[i % 3]).lerp(new THREE.Color('#ffffff'), 0.25);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [count]);
  const shellMat = useDisposable(() => makeGlowPointsMaterial(0.09, 0.7));

  // Seats: the inner tier keeps three places for the symbols of the talk
  const seats = useMemo(
    () =>
      TIERS.map((tier, ti) =>
        Array.from({ length: tier.count }, (_, k) => {
          const a = (k / tier.count) * Math.PI * 2 + ti * 0.2;
          return { x: Math.cos(a) * tier.radius, z: Math.sin(a) * tier.radius, face: Math.atan2(-Math.cos(a), -Math.sin(a)) };
        }).filter((_, k) => !(ti === 0 && k % 2 === 0)),
      ),
    [],
  );
  const symbolSeats = useMemo(
    () => [0, 2, 4].map((k) => {
      const a = (k / TIERS[0].count) * Math.PI * 2;
      return [Math.cos(a) * TIERS[0].radius, 0, Math.sin(a) * TIERS[0].radius] as [number, number, number];
    }),
    [],
  );

  // Links: neighbours on each tier, and spokes between tiers (harmony)
  const linkGeo = useDisposable(() => {
    const total = seats.reduce((n, tier) => n + tier.length, 0);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(total * 2 * 6), 3));
    return g;
  });
  const linkMat = useDisposable(() => makeLineMaterial('#bcd2ff', 0));
  const ringGeos = useDisposable(() => TIERS.map((t) => new THREE.RingGeometry(t.radius - 0.03, t.radius + 0.03, 128)));

  useLayoutEffect(() => {
    seats.forEach((tier, ti) => {
      tier.forEach((s, k) => {
        peopleRefs.current[ti]?.set(k, s.x, 0, s.z, 0.8, s.face);
        peopleRefs.current[ti]?.color(k, CONCEPT_COLORS[(k + ti) % 3]);
      });
      peopleRefs.current[ti]?.commit();
    });
  }, [seats]);

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
    shellMat.opacity = 0.5 - h * 0.2;
    if (shell.current) shell.current.rotation.y += dt * 0.05 * speed;

    // Tiers rise into place as the scene converges, then come level in harmony
    const lp = linkGeo.attributes.position.array as Float32Array;
    let n = 0;
    TIERS.forEach((tier, ti) => {
      const g = tierRefs.current[ti];
      const rise = smooth(cv * 1.4 - ti * 0.15);
      const y = THREE.MathUtils.lerp(tier.y, LEVEL_Y, h) - (1 - rise) * 1.5;
      if (g) {
        g.position.y = y;
        g.scale.setScalar(0.5 + 0.5 * rise);
      }
      const handle = peopleRefs.current[ti];
      if (handle) handle.material.emissiveIntensity = 0.35 + h * 0.45;
      const tier0 = seats[ti];
      const scale = 0.5 + 0.5 * rise;
      tier0.forEach((s, k) => {
        const next = tier0[(k + 1) % tier0.length];
        lp.set([s.x * scale, y + CHEST * 0.8, s.z * scale, next.x * scale, y + CHEST * 0.8, next.z * scale], n * 6);
        n++;
        if (ti < TIERS.length - 1) {
          const outer = seats[ti + 1][Math.round((k / tier0.length) * seats[ti + 1].length) % seats[ti + 1].length];
          const yo = THREE.MathUtils.lerp(TIERS[ti + 1].y, LEVEL_Y, h);
          lp.set([s.x * scale, y + CHEST * 0.8, s.z * scale, outer.x, yo + CHEST * 0.8, outer.z], n * 6);
          n++;
        }
      });
    });
    linkGeo.setDrawRange(0, n * 2);
    linkGeo.attributes.position.needsUpdate = true;
    linkGeo.computeBoundingSphere();
    linkMat.opacity = 0.12 + h * 0.5;

    if (amphitheatre.current) amphitheatre.current.rotation.y += dt * (0.04 + h * 0.04) * speed;
    if (root.current) {
      root.current.position.set(3.4 * (1 - c), 0.4 * c + 0.6 * h, -2.2 * c * (1 - h * 0.6));
      root.current.scale.setScalar(1 - 0.18 * h);
      root.current.rotation.y = Math.sin(t * 0.12) * 0.2 * (1 - h);
    }
  });

  return (
    <group ref={root} position={[3.4, 0, 0]}>
      <Glow color="#5f7bff" size={10} opacity={0.2} />
      <Glow color="#e6eeff" size={2.2} opacity={0.75} position={[0, 0.25, 0]} />
      <mesh position={[0, 0.25, 0]}>
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

      <group rotation={[0.38, 0, 0]}>
        <group ref={amphitheatre}>
          {TIERS.map((tier, ti) => (
            <group key={tier.radius} ref={(el) => void (tierRefs.current[ti] = el)} position={[0, tier.y, 0]}>
              <mesh geometry={ringGeos[ti]} rotation={[-Math.PI / 2, 0, 0]}>
                <meshBasicMaterial
                  color={CONCEPT_COLORS[ti]}
                  transparent
                  opacity={0.45}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                  side={THREE.DoubleSide}
                />
              </mesh>
              <People ref={(el) => void (peopleRefs.current[ti] = el)} count={seats[ti].length} />
              {ti === 0 && (
                <>
                  <group position={[symbolSeats[0][0], 0.5, symbolSeats[0][2]]} scale={1.5}>
                    <Gyroscope position={[0, 0, 0]} />
                  </group>
                  <Bulb scale={1.05} glow={0.5} position={symbolSeats[1]} />
                  <MiniTree scale={0.95} position={symbolSeats[2]} />
                </>
              )}
            </group>
          ))}
          <lineSegments geometry={linkGeo} material={linkMat} frustumCulled={false} />
        </group>
      </group>

      <points ref={shell} geometry={shellGeo} material={shellMat} frustumCulled={false} />
    </group>
  );
}
