import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useSceneSettings, type SceneProps } from '../sceneSettings';
import { seededRandom, smooth, useDisposable, useTweenedValue } from '../utils';
import { Glow, makeLineMaterial } from './common';
import { CHEST, People, type PeopleHandle } from './symbols';

const N = 25;
const WORLD_Y = -2.1;
const LEFT_X = -4.4;
const RIGHT_X = 4.4;
const TEAM_COLORS = ['#45e0ff', '#a98bff', '#ffb86b'];

/** Floor positions (x, z) the evolving organisation keeps moving between. */
function buildFormations() {
  const rand = seededRandom(23);
  const circle = Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2;
    return new THREE.Vector2(Math.cos(a) * 1.5, Math.sin(a) * 1.05);
  });
  const teamCentres = [new THREE.Vector2(-1.05, -0.45), new THREE.Vector2(1.05, -0.45), new THREE.Vector2(0, 0.75)];
  const teams = Array.from({ length: N }, (_, i) => {
    const team = i % 3;
    const k = Math.floor(i / 3);
    const a = (k / 9) * Math.PI * 2;
    return teamCentres[team].clone().add(new THREE.Vector2(Math.cos(a) * 0.5, Math.sin(a) * 0.36));
  });
  const project = Array.from({ length: N }, (_, i) => {
    // Two parallel project lines facing each other
    const row = i % 2;
    const k = Math.floor(i / 2);
    return new THREE.Vector2(-1.65 + k * 0.28, row === 0 ? -0.45 : 0.45);
  });
  const open = Array.from({ length: N }, () => new THREE.Vector2((rand() - 0.5) * 3.2, (rand() - 0.5) * 2.1));
  return [circle, teams, project, open];
}

/**
 * Scene 02 — "Deux organisations": on the left, people frozen in a strict
 * grid, all identical and still; on the right, the same people keep
 * regrouping — meeting circle, teams, project lines — linked to one another.
 */
export function QuestionScene({ step }: SceneProps) {
  const { reducedMotion } = useSceneSettings();
  const rigid = useRef<PeopleHandle>(null);
  const fluid = useRef<PeopleHandle>(null);
  const reveal = useTweenedValue(step >= 1 ? 1 : 0, { duration: 1.6 });
  const formations = useMemo(buildFormations, []);
  const current = useMemo(() => Array.from({ length: N }, () => new THREE.Vector2()), []);
  const team = useMemo(() => Array.from({ length: N }, (_, i) => i % 3), []);

  const cageGeo = useDisposable(() => {
    const box = new THREE.BoxGeometry(3.1, 1.1, 3.1);
    box.translate(0, 0.55, 0);
    const edges = new THREE.EdgesGeometry(box);
    box.dispose();
    return edges;
  });
  const gridGeo = useDisposable(() => {
    const pts: number[] = [];
    for (let k = -2; k <= 2; k++) {
      pts.push(-1.4, 0.005, k * 0.62, 1.4, 0.005, k * 0.62, k * 0.62, 0.005, -1.4, k * 0.62, 0.005, 1.4);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  });
  const [cageMat, gridMat, linkMat] = useDisposable(() => [
    makeLineMaterial('#7b8db8', 0.32),
    makeLineMaterial('#7b8db8', 0.22),
    makeLineMaterial('#5fe1ff', 0.4),
  ]);
  const linkGeo = useDisposable(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * N * 6), 3));
    return geo;
  });
  const floorGeo = useDisposable(() => new THREE.CircleGeometry(2.1, 64));

  // Frozen organisation: identical grey people in a strict grid — set once, never moves.
  useLayoutEffect(() => {
    for (let i = 0; i < N; i++) {
      const x = (i % 5) - 2;
      const z = Math.floor(i / 5) - 2;
      rigid.current?.set(i, x * 0.62, 0, z * 0.62, 0.95, 0);
      rigid.current?.color(i, '#6c7894');
    }
    rigid.current?.commit();
    for (let i = 0; i < N; i++) fluid.current?.color(i, TEAM_COLORS[team[i]]);
    fluid.current?.commit();
  }, [team]);

  useFrame((state) => {
    const speed = reducedMotion ? 0.3 : 1;
    const t = state.clock.elapsedTime * speed;
    const period = 4.4;
    const phase = t / period;
    const from = formations[Math.floor(phase) % formations.length];
    const to = formations[(Math.floor(phase) + 1) % formations.length];
    const k = smooth((phase % 1) * 1.7 - 0.35);
    const r = reveal.value;

    for (let i = 0; i < N; i++) {
      const p = current[i].copy(from[i]).lerp(to[i], k);
      const walking = Math.sin(k * Math.PI);
      const bob = Math.abs(Math.sin(t * 7 + i)) * 0.04 * walking;
      const facing = Math.atan2(to[i].x - from[i].x, to[i].y - from[i].y);
      fluid.current?.set(i, p.x, bob, p.y, 0.95 + r * 0.08, facing * walking);
    }
    fluid.current?.commit();

    // Links between people who work close to each other
    const lp = linkGeo.attributes.position.array as Float32Array;
    let n = 0;
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        if (current[i].distanceTo(current[j]) < 0.62) {
          lp.set([current[i].x, CHEST, current[i].y, current[j].x, CHEST, current[j].y], n * 6);
          n++;
        }
      }
    }
    linkGeo.setDrawRange(0, n * 2);
    linkGeo.attributes.position.needsUpdate = true;
    linkGeo.computeBoundingSphere();
    linkMat.opacity = 0.35 + r * 0.35;
    if (fluid.current) fluid.current.material.emissiveIntensity = 0.38 + r * 0.35;
    if (rigid.current) rigid.current.material.emissiveIntensity = 0.18 - r * 0.08;
  });

  return (
    <group>
      {/* Frozen organisation */}
      <group position={[LEFT_X, WORLD_Y, 0]} rotation={[0.42, 0.5, 0]}>
        <People ref={rigid} count={N} emissiveIntensity={0.18} />
        <lineSegments geometry={cageGeo} material={cageMat} />
        <lineSegments geometry={gridGeo} material={gridMat} />
      </group>

      {/* Divide */}
      <Glow color="#7aa2ff" size={[0.22, 9]} opacity={0.4} position={[0, WORLD_Y + 1.2, -1]} />
      <Glow color="#ffffff" size={[0.05, 7]} opacity={0.5} position={[0, WORLD_Y + 1.2, -1]} />

      {/* Evolving organisation */}
      <group position={[RIGHT_X, WORLD_Y, 0]} rotation={[0.42, 0, 0]}>
        <Glow color="#3f7bff" size={6} opacity={0.26} position={[0, 0.4, 0]} />
        <mesh geometry={floorGeo} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <meshBasicMaterial color="#1b3f8a" transparent opacity={0.28} depthWrite={false} />
        </mesh>
        <People ref={fluid} count={N} />
        <lineSegments geometry={linkGeo} material={linkMat} frustumCulled={false} />
      </group>
    </group>
  );
}
