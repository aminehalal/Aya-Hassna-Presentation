import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useSceneSettings, type SceneProps } from '../sceneSettings';
import { fibonacciSphere, seededRandom, smooth, useDisposable, useTweenedValue } from '../utils';
import { Glow, makeGlowPointsMaterial, makeLineMaterial } from './common';

interface OrgNode {
  rigid: THREE.Vector3;
  network: THREE.Vector3;
  parent: number;
}

/** A classic pyramid org-chart (1 → 4 → 12) and its re-arrangement as a network. */
function buildOrganisation() {
  const nodes: OrgNode[] = [];
  nodes.push({ rigid: new THREE.Vector3(0, 2.1, 0), network: new THREE.Vector3(), parent: -1 });
  const l1x = [-2.7, -0.9, 0.9, 2.7];
  l1x.forEach((x) => nodes.push({ rigid: new THREE.Vector3(x, 0.45, 0), network: new THREE.Vector3(), parent: 0 }));
  l1x.forEach((x, p) =>
    [-0.5, 0, 0.5].forEach((dx) =>
      nodes.push({ rigid: new THREE.Vector3(x + dx, -1.35, 0), network: new THREE.Vector3(), parent: p + 1 }),
    ),
  );
  const rand = seededRandom(5);
  const sphere = fibonacciSphere(nodes.length, 2.2);
  nodes.forEach((n, i) => n.network.copy(sphere[i]).multiplyScalar(0.85 + rand() * 0.3));

  // Lateral links that only exist in the network form (nearest neighbours)
  const lateral: [number, number][] = [];
  nodes.forEach((n, i) => {
    const nearest = nodes
      .map((m, j) => ({ j, d: n.network.distanceTo(m.network) }))
      .filter(({ j }) => j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);
    nearest.forEach(({ j }) => {
      if (!lateral.some(([a, b]) => (a === i && b === j) || (a === j && b === i))) lateral.push([i, j]);
    });
  });
  return { nodes, lateral };
}

const FORCE_COUNT = 260;

/**
 * Scene 03 — "De la hiérarchie au réseau": a rigid org-chart, pressed by
 * external forces, physically transforms into a flexible network.
 */
export function ChangeScene({ step }: SceneProps) {
  const { reducedMotion } = useSceneSettings();
  const { nodes, lateral } = useMemo(buildOrganisation, []);
  const count = nodes.length;
  const boxes = useRef<THREE.InstancedMesh>(null);
  const gems = useRef<THREE.InstancedMesh>(null);
  const structure = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const positions = useMemo(() => nodes.map(() => new THREE.Vector3()), [nodes]);

  const morph = useTweenedValue(step >= 2 ? 1 : 0, { duration: 2.4, ease: 'power2.inOut' });
  const forces = useTweenedValue(step === 1 ? 1 : step > 1 ? 0.35 : 0, { duration: 1.2 });

  const [boxGeo, gemGeo] = useDisposable(() => [new THREE.BoxGeometry(0.36, 0.3, 0.3), new THREE.IcosahedronGeometry(0.2, 1)]);
  const [boxMat, gemMat] = useDisposable(() => [
    new THREE.MeshStandardMaterial({ color: '#7f8fb8', emissive: '#1d2a55', metalness: 0.5, roughness: 0.4, transparent: true }),
    new THREE.MeshStandardMaterial({ color: '#bfefff', emissive: '#19b8ff', emissiveIntensity: 0.9, roughness: 0.25, transparent: true }),
  ]);
  const [treeMat, lateralMat, glowMat, forceMat] = useDisposable(() => [
    makeLineMaterial('#8aa4e0', 0.6),
    makeLineMaterial('#45e0ff', 0),
    makeGlowPointsMaterial(0.55, 0, '#5fd8ff', false),
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
  const glowGeo = useDisposable(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    return g;
  });

  // External forces: particles converging on the structure from every direction
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

    for (let i = 0; i < count; i++) {
      const n = nodes[i];
      const p = positions[i].copy(n.rigid).lerp(n.network, m);
      // The network breathes; the hierarchy does not.
      p.x += Math.sin(t * 0.9 + i) * 0.08 * m;
      p.y += Math.cos(t * 0.7 + i * 1.3) * 0.08 * m;
      // Internal pressure: the hierarchy vibrates while forces apply
      p.x += Math.sin(t * 22 + i) * 0.012 * f * (1 - m);
    }

    const pulse = 1 + f * 0.12 * Math.max(0, Math.sin(t * 3));
    for (let i = 0; i < count; i++) {
      dummy.position.copy(positions[i]);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar((1 - m * 0.9) * pulse);
      dummy.updateMatrix();
      boxes.current?.setMatrixAt(i, dummy.matrix);
      dummy.rotation.set(t * 0.5 + i, t * 0.3, 0);
      dummy.scale.setScalar(0.2 + m * 0.8);
      dummy.updateMatrix();
      gems.current?.setMatrixAt(i, dummy.matrix);
    }
    if (boxes.current) boxes.current.instanceMatrix.needsUpdate = true;
    if (gems.current) gems.current.instanceMatrix.needsUpdate = true;
    boxMat.opacity = 1 - m;
    gemMat.opacity = m;

    const tree = treeGeo.attributes.position.array as Float32Array;
    for (let i = 1; i < count; i++) {
      const a = positions[i];
      const b = positions[nodes[i].parent];
      tree.set([a.x, a.y, a.z, b.x, b.y, b.z], (i - 1) * 6);
    }
    treeGeo.attributes.position.needsUpdate = true;
    treeGeo.computeBoundingSphere();
    treeMat.color.setRGB(0.54 - 0.27 * m, 0.64 + 0.24 * m, 0.88 + 0.12 * m);

    const lat = lateralGeo.attributes.position.array as Float32Array;
    lateral.forEach(([a, b], k) => {
      const pa = positions[a];
      const pb = positions[b];
      lat.set([pa.x, pa.y, pa.z, pb.x, pb.y, pb.z], k * 6);
    });
    lateralGeo.attributes.position.needsUpdate = true;
    lateralGeo.computeBoundingSphere();
    lateralMat.opacity = m * 0.55;

    const glow = glowGeo.attributes.position.array as Float32Array;
    positions.forEach((p, i) => glow.set([p.x, p.y, p.z], i * 3));
    glowGeo.attributes.position.needsUpdate = true;
    glowMat.opacity = m * 0.85;

    const fp = forceGeo.attributes.position.array as Float32Array;
    forceData.forEach((d, i) => {
      d.t = (d.t + dt * d.speed * speed) % 1;
      const r = 6.5 - d.t * 4;
      fp.set([d.dir.x * r * 1.3, d.dir.y * r * 0.8, d.dir.z * r * 0.6], i * 3);
    });
    forceGeo.attributes.position.needsUpdate = true;
    forceMat.opacity = f * 0.9;

    if (structure.current) structure.current.rotation.y = Math.sin(t * 0.25) * 0.35 * m;
  });

  return (
    <group position={[3.7, 0.1, 0]}>
      <Glow color="#2b5cff" size={7} opacity={0.22} />
      <group ref={structure}>
        <instancedMesh ref={boxes} args={[boxGeo, boxMat, count]} frustumCulled={false} />
        <instancedMesh ref={gems} args={[gemGeo, gemMat, count]} frustumCulled={false} />
        <lineSegments geometry={treeGeo} material={treeMat} />
        <lineSegments geometry={lateralGeo} material={lateralMat} />
        <points geometry={glowGeo} material={glowMat} frustumCulled={false} />
      </group>
      <points geometry={forceGeo} material={forceMat} frustumCulled={false} />
    </group>
  );
}
