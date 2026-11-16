import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useSceneSettings, type SceneProps } from '../sceneSettings';
import { seededRandom, smooth, useDisposable, useTweenedValue } from '../utils';
import { Glow, makeGlowPointsMaterial, makeLineMaterial } from './common';
import { CHEST, People, type PeopleHandle } from './symbols';

interface OrgNode {
  /** Centre of the org-chart box */
  chart: THREE.Vector3;
  /** Feet position in the network (team) configuration */
  team: THREE.Vector3;
  parent: number;
  level: number;
}

const FLOOR_Y = -1.45;
const LEVEL_COLORS = ['#ffb86b', '#a98bff', '#45e0ff'];

/** A classic org chart (1 director → 4 managers → 12 employees) and the same people as a team network. */
function buildOrganisation() {
  const nodes: OrgNode[] = [];
  nodes.push({ chart: new THREE.Vector3(0, 2.0, 0), team: new THREE.Vector3(), parent: -1, level: 0 });
  const l1x = [-2.5, -0.84, 0.84, 2.5];
  l1x.forEach((x) => nodes.push({ chart: new THREE.Vector3(x, 0.4, 0), team: new THREE.Vector3(), parent: 0, level: 1 }));
  l1x.forEach((x, p) =>
    [-0.5, 0, 0.5].forEach((dx) =>
      nodes.push({ chart: new THREE.Vector3(x + dx, -1.2, 0), team: new THREE.Vector3(), parent: p + 1, level: 2 }),
    ),
  );
  // Network: everyone stands in two concentric circles, no top or bottom
  const rand = seededRandom(5);
  const inner = 6;
  nodes.forEach((n, i) => {
    const ring = i < inner ? 0 : 1;
    const k = ring === 0 ? i : i - inner;
    const count = ring === 0 ? inner : nodes.length - inner;
    const a = (k / count) * Math.PI * 2 + ring * 0.3;
    const r = ring === 0 ? 1.05 : 2.15;
    n.team.set(Math.cos(a) * r + (rand() - 0.5) * 0.12, FLOOR_Y, Math.sin(a) * r * 0.85);
  });
  // Lateral links (colleagues who now cooperate directly): nearest neighbours in the team
  const lateral: [number, number][] = [];
  nodes.forEach((n, i) => {
    nodes
      .map((m, j) => ({ j, d: n.team.distanceTo(m.team) }))
      .filter(({ j }) => j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
      .forEach(({ j }) => {
        if (!lateral.some(([a, b]) => (a === i && b === j) || (a === j && b === i))) lateral.push([i, j]);
      });
  });
  return { nodes, lateral };
}

const FORCE_COUNT = 260;

/**
 * Scene 03 — "Du schéma hiérarchique à l'équipe": the people of a classic
 * org chart, each in their box, are pressed by external forces; then the
 * boxes dissolve and the same people step down into a circle where everyone
 * works with everyone — a flexible, networked organisation.
 */
export function ChangeScene({ step }: SceneProps) {
  const { reducedMotion } = useSceneSettings();
  const { nodes, lateral } = useMemo(buildOrganisation, []);
  const count = nodes.length;
  const cards = useRef<THREE.InstancedMesh>(null);
  const people = useRef<PeopleHandle>(null);
  const structure = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const feet = useMemo(() => nodes.map(() => new THREE.Vector3()), [nodes]);
  const grey = useMemo(() => new THREE.Color('#8794b4'), []);
  const tint = useMemo(() => new THREE.Color(), []);
  const levelColors = useMemo(() => LEVEL_COLORS.map((c) => new THREE.Color(c)), []);
  const floorMat = useRef<THREE.MeshBasicMaterial>(null);

  const morph = useTweenedValue(step >= 2 ? 1 : 0, { duration: 2.4, ease: 'power2.inOut' });
  const forces = useTweenedValue(step === 1 ? 1 : step > 1 ? 0.35 : 0, { duration: 1.2 });

  const cardGeo = useDisposable(() => new THREE.BoxGeometry(0.5, 0.66, 0.05));
  const cardMat = useDisposable(
    () => new THREE.MeshStandardMaterial({ color: '#1d2a55', emissive: '#2a4aa8', emissiveIntensity: 0.35, metalness: 0.4, roughness: 0.4, transparent: true }),
  );
  const [treeMat, lateralMat, forceMat] = useDisposable(() => [
    makeLineMaterial('#8aa4e0', 0.6),
    makeLineMaterial('#45e0ff', 0),
    makeGlowPointsMaterial(0.16, 0, '#ffb86b', false),
  ]);
  const treeGeo = useDisposable(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array((count - 1) * 6), 3));
    return g;
  });
  const lateralGeo = useDisposable(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lateral.length * 6), 3));
    return g;
  });
  const floorGeo = useDisposable(() => new THREE.RingGeometry(2.45, 2.5, 96));

  // External forces: particles converging on the organisation from every direction
  const forceData = useMemo(() => {
    const rand = seededRandom(31);
    return Array.from({ length: FORCE_COUNT }, () => ({
      dir: new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(),
      t: rand(),
      speed: 0.18 + rand() * 0.22,
    }));
  }, []);
  const forceGeo = useDisposable(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(FORCE_COUNT * 3), 3));
    return g;
  });

  useFrame((state, dt) => {
    const speed = reducedMotion ? 0.3 : 1;
    const t = state.clock.elapsedTime * speed;
    const m = smooth(morph.value);
    const f = forces.value;
    // Each person leaves their box with a slight delay (top of the hierarchy first)
    for (let i = 0; i < count; i++) {
      const n = nodes[i];
      const k = smooth(m * 1.35 - n.level * 0.15);
      const chartFeet = n.chart.y - 0.28;
      const p = feet[i].set(
        THREE.MathUtils.lerp(n.chart.x, n.team.x, k),
        THREE.MathUtils.lerp(chartFeet, n.team.y, k) + Math.sin(k * Math.PI) * 0.35,
        THREE.MathUtils.lerp(0.06, n.team.z, k),
      );
      // Pressure: the hierarchy trembles while external forces apply
      p.x += Math.sin(t * 22 + i) * 0.012 * f * (1 - m);
      const face = k > 0.5 ? Math.atan2(-n.team.x, -n.team.z) * k : 0;
      people.current?.set(i, p.x, p.y, p.z, 0.78 + k * 0.12, face);
      tint.copy(grey).lerp(levelColors[n.level], k);
      people.current?.color(i, tint);

      dummy.position.copy(n.chart);
      dummy.scale.setScalar(Math.max(0.0001, 1 - m * 1.3));
      dummy.updateMatrix();
      cards.current?.setMatrixAt(i, dummy.matrix);
    }
    people.current?.commit();
    if (cards.current) cards.current.instanceMatrix.needsUpdate = true;
    cardMat.opacity = 1 - m;
    if (people.current) people.current.material.emissiveIntensity = 0.22 + m * 0.3;

    // Reporting lines (top-down) follow the people; colleague links appear in the team
    const tree = treeGeo.attributes.position.array as Float32Array;
    for (let i = 1; i < count; i++) {
      const a = feet[i];
      const b = feet[nodes[i].parent];
      const ya = THREE.MathUtils.lerp(a.y + 0.62, a.y + CHEST, m);
      const yb = THREE.MathUtils.lerp(b.y - 0.05, b.y + CHEST, m);
      tree.set([a.x, ya, a.z, b.x, yb, b.z], (i - 1) * 6);
    }
    treeGeo.attributes.position.needsUpdate = true;
    treeGeo.computeBoundingSphere();
    treeMat.opacity = 0.6 - m * 0.35;

    const lat = lateralGeo.attributes.position.array as Float32Array;
    lateral.forEach(([a, b], k) => {
      lat.set([feet[a].x, feet[a].y + CHEST, feet[a].z, feet[b].x, feet[b].y + CHEST, feet[b].z], k * 6);
    });
    lateralGeo.attributes.position.needsUpdate = true;
    lateralGeo.computeBoundingSphere();
    lateralMat.opacity = m * 0.6;
    if (floorMat.current) floorMat.current.opacity = m * 0.35;

    const fp = forceGeo.attributes.position.array as Float32Array;
    forceData.forEach((d, i) => {
      d.t = (d.t + dt * d.speed * speed) % 1;
      const r = 6.5 - d.t * 4;
      fp.set([d.dir.x * r * 1.3, d.dir.y * r * 0.8, d.dir.z * r * 0.6], i * 3);
    });
    forceGeo.attributes.position.needsUpdate = true;
    forceMat.opacity = f * 0.9;

    if (structure.current) structure.current.rotation.y = Math.sin(t * 0.25) * 0.25 * m;
  });

  return (
    <group position={[4.05, 0.1, 0]}>
      <Glow color="#2b5cff" size={7} opacity={0.2} />
      <group ref={structure}>
        <instancedMesh ref={cards} args={[cardGeo, cardMat, count]} frustumCulled={false} />
        <People ref={people} count={count} emissiveIntensity={0.22} />
        <lineSegments geometry={treeGeo} material={treeMat} />
        <lineSegments geometry={lateralGeo} material={lateralMat} />
        <mesh geometry={floorGeo} position={[0, FLOOR_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.85, 1]}>
          <meshBasicMaterial ref={floorMat} color="#45e0ff" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <points geometry={forceGeo} material={forceMat} frustumCulled={false} />
    </group>
  );
}
