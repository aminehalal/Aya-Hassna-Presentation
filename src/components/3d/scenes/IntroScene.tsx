import { MeshDistortMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useSceneSettings, type SceneProps } from '../sceneSettings';
import { seededRandom, smooth, useDisposable, useTweenedValue } from '../utils';
import { Glow, makeGlowPointsMaterial, makeLineMaterial } from './common';
import { CHEST, People, type PeopleHandle } from './symbols';

const PEOPLE = 14;
const FLOOR_Y = -1.65;
const CIRCLE_R = 3.1;
const PEOPLE_COLORS = ['#7fd4ff', '#a98bff', '#45e0ff', '#ffb86b', '#6f8cff', '#3fe0c5'];

/** Octagonal pavilion (a nod to Moroccan architecture) with an 8-point star on top. */
function buildPavilion() {
  const pts: number[] = [];
  const R = 1.85;
  const bottom = -1.45;
  const top = 1.35;
  const oct = (k: number, y: number, r = R) => {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
    return [Math.cos(a) * r, y, Math.sin(a) * r];
  };
  for (let k = 0; k < 8; k++) {
    pts.push(...oct(k, bottom), ...oct(k + 1, bottom));
    pts.push(...oct(k, top), ...oct(k + 1, top));
    pts.push(...oct(k, bottom), ...oct(k, top));
  }
  // Khatam (8-point star) crowning the pavilion: two overlapping squares
  for (const offset of [0, Math.PI / 4]) {
    for (let k = 0; k < 4; k++) {
      const a0 = (k / 4) * Math.PI * 2 + offset;
      const a1 = ((k + 1) / 4) * Math.PI * 2 + offset;
      pts.push(Math.cos(a0) * 1.3, top + 0.02, Math.sin(a0) * 1.3, Math.cos(a1) * 1.3, top + 0.02, Math.sin(a1) * 1.3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

/**
 * Scene 01 — "Le noyau et ses acteurs": a mysterious glowing core (the
 * organisation's shared purpose) inside an octagonal pavilion. When the
 * presentation begins, the people of the organisation rise around it and
 * connect to it: an organisation is first of all its members.
 */
export function IntroScene({ step }: SceneProps) {
  const { reducedMotion, quality } = useSceneSettings();
  const root = useRef<THREE.Group>(null);
  const pavilion = useRef<THREE.LineSegments>(null);
  const community = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Points>(null);
  const people = useRef<PeopleHandle>(null);
  const coreGlow = useRef<THREE.Sprite>(null);

  const emerge = useTweenedValue(1, { from: 0, duration: 3.2, ease: 'power2.out' });
  const gather = useTweenedValue(step >= 1 ? 1 : 0, { duration: 1.8, ease: 'power2.out' });

  const pavilionGeo = useDisposable(buildPavilion);
  const linkGeo = useDisposable(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PEOPLE * 6), 3));
    return g;
  });
  const floorGeo = useDisposable(() => new THREE.RingGeometry(CIRCLE_R - 0.02, CIRCLE_R + 0.02, 128));

  const haloGeo = useDisposable(() => {
    const count = quality === 'high' ? 1200 : 600;
    const rand = seededRandom(11);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const r = 4.2 + Math.pow(rand(), 0.7) * 6;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.6;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      c.set(rand() > 0.5 ? '#8fd8ff' : '#a98bff').multiplyScalar(0.6 + rand() * 0.6);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [quality]);

  const [haloMat, pavilionMat, linkMat] = useDisposable(() => [
    makeGlowPointsMaterial(0.09, 0.9),
    makeLineMaterial('#8fc8ff', 0.45),
    makeLineMaterial('#9fe3ff', 0),
  ]);

  const seats = useMemo(
    () =>
      Array.from({ length: PEOPLE }, (_, i) => {
        const a = (i / PEOPLE) * Math.PI * 2;
        return { x: Math.cos(a) * CIRCLE_R, z: Math.sin(a) * CIRCLE_R, face: -a - Math.PI / 2 };
      }),
    [],
  );

  useLayoutEffect(() => {
    seats.forEach((_, i) => people.current?.color(i, PEOPLE_COLORS[i % PEOPLE_COLORS.length]));
    people.current?.commit();
  }, [seats]);

  useFrame((state, dt) => {
    const speed = reducedMotion ? 0.25 : 1;
    const t = state.clock.elapsedTime;
    const e = emerge.value;
    const g = gather.value;

    if (root.current) root.current.scale.setScalar(0.6 + 0.4 * e);
    if (pavilion.current) {
      pavilion.current.rotation.y += dt * 0.08 * speed;
      pavilion.current.scale.setScalar(1 + g * 0.06);
    }
    if (community.current) community.current.rotation.y += dt * 0.05 * speed;
    if (halo.current) halo.current.rotation.y += dt * 0.025 * speed;
    if (coreGlow.current) (coreGlow.current.material as THREE.SpriteMaterial).opacity = (0.5 + Math.sin(t * 1.2) * 0.12) * e;

    // People rise one after another around the core, then breathe gently
    const lp = linkGeo.attributes.position.array as Float32Array;
    seats.forEach((s, i) => {
      const k = smooth(g * 1.6 - (i / PEOPLE) * 0.6);
      const y = FLOOR_Y - (1 - k) * 0.6 + Math.sin(t * 1.4 + i) * 0.02 * k;
      people.current?.set(i, s.x, y, s.z, 0.95 * k, s.face);
      lp.set([s.x, y + CHEST, s.z, 0, 0, 0], i * 6);
    });
    people.current?.commit();
    linkGeo.attributes.position.needsUpdate = true;
    linkMat.opacity = g * 0.32;
    pavilionMat.opacity = 0.45 * e;
    haloMat.opacity = 0.85 * e;
  });

  return (
    <group ref={root}>
      <Glow ref={coreGlow} color="#6d7dff" size={8} opacity={0.5} />
      <Glow color="#d6e4ff" size={2.4} opacity={0.75} />
      <mesh>
        <icosahedronGeometry args={[1.0, 24]} />
        <MeshDistortMaterial
          color="#4d5cff"
          emissive="#3a1fd1"
          emissiveIntensity={1.15}
          roughness={0.18}
          metalness={0.35}
          distort={0.32}
          speed={reducedMotion ? 0.4 : 1.4}
        />
      </mesh>

      <lineSegments ref={pavilion} geometry={pavilionGeo} material={pavilionMat} />

      <group rotation={[0.26, 0, 0]}>
        <group ref={community}>
          <mesh geometry={floorGeo} position={[0, FLOOR_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <meshBasicMaterial color="#7fb4ff" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <People ref={people} count={PEOPLE} />
          <lineSegments geometry={linkGeo} material={linkMat} frustumCulled={false} />
        </group>
      </group>

      <points ref={halo} geometry={haloGeo} material={haloMat} />
    </group>
  );
}
