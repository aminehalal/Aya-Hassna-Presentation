import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useSceneSettings, type SceneProps } from '../sceneSettings';
import { clamp01, seededRandom, smooth, useDisposable, useTweenedValue } from '../utils';
import { Glow, makeGlowPointsMaterial, makeLineMaterial } from './common';

interface Branch {
  start: THREE.Vector3;
  end: THREE.Vector3;
  dir: THREE.Vector3;
  length: number;
  depth: number;
  parent: number;
}

const MAX_DEPTH = 6;
const UP = new THREE.Vector3(0, 1, 0);

/** Procedural knowledge tree: 1 trunk, 3 main branches, then binary splits. */
function growTree() {
  const rand = seededRandom(97);
  const branches: Branch[] = [];
  const add = (start: THREE.Vector3, dir: THREE.Vector3, length: number, depth: number, parent: number) => {
    const end = start.clone().addScaledVector(dir, length);
    const idx = branches.push({ start, end, dir, length, depth, parent }) - 1;
    if (depth >= MAX_DEPTH - 1) return;
    const children = depth === 0 ? 3 : 2;
    for (let c = 0; c < children; c++) {
      const azimuth = (c / children) * Math.PI * 2 + rand() * 1.2 + depth;
      const tilt = 0.42 + rand() * 0.3;
      const axis = new THREE.Vector3(Math.cos(azimuth), 0, Math.sin(azimuth)).cross(dir).normalize();
      const childDir = dir.clone().applyAxisAngle(axis, tilt).lerp(UP, 0.18).normalize();
      add(end.clone(), childDir, length * (0.72 + rand() * 0.1), depth + 1, idx);
    }
  };
  add(new THREE.Vector3(0, 0, 0), UP.clone(), 1.55, 0, -1);

  const leaves = branches.map((b, i) => ({ b, i })).filter(({ b }) => b.depth === MAX_DEPTH - 1);
  // Path from the root to each leaf, for knowledge flowing through the tree
  const paths = leaves.map(({ i }) => {
    const chain: THREE.Vector3[] = [];
    let k = i;
    while (k >= 0) {
      chain.unshift(branches[k].end);
      k = branches[k].parent;
    }
    chain.unshift(branches[0].start);
    return chain;
  });
  const links: [number, number][] = [];
  leaves.forEach((a, i) =>
    leaves.forEach((b, j) => {
      if (j > i && a.b.end.distanceTo(b.b.end) < 1.15) links.push([i, j]);
    }),
  );
  return { branches, leaves, paths, links };
}

const FLOW = 240;
const SEEDS = 160;

/**
 * Scene 08 — "L'arbre du savoir": knowledge starts as small particles,
 * becomes a trunk (individual), branches (collective), then a connected
 * canopy (organisational). Knowledge then flows through the tree, and the
 * two learning loops of Argyris & Schön orbit around it.
 */
export function LearningScene({ step }: SceneProps) {
  const { reducedMotion } = useSceneSettings();
  const tree = useMemo(growTree, []);
  const branchMesh = useRef<THREE.InstancedMesh>(null);
  const leafMesh = useRef<THREE.InstancedMesh>(null);
  const root = useRef<THREE.Group>(null);
  const loopA = useRef<THREE.Group>(null);
  const loopB = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const quat = useMemo(() => new THREE.Quaternion(), []);

  const growthTarget = step === 0 ? 0.36 : step === 1 ? 0.7 : 1;
  const growth = useTweenedValue(growthTarget, { from: 0, duration: 2.6, ease: 'power2.inOut' });
  const canopy = useTweenedValue(step >= 2 ? 1 : 0, { duration: 1.6, delay: step >= 2 ? 0.8 : 0 });
  const flow = useTweenedValue(step >= 3 ? 1 : 0, { duration: 1.4 });
  const loops = useTweenedValue(step >= 4 ? 1 : 0, { duration: 1.8, ease: 'power3.out' });

  const branchGeo = useDisposable(() => {
    const g = new THREE.CylinderGeometry(0.62, 1, 1, 7, 1);
    g.translate(0, 0.5, 0);
    return g;
  });
  const leafGeo = useDisposable(() => new THREE.IcosahedronGeometry(0.075, 1));
  const [branchMat, leafMat] = useDisposable(() => [
    new THREE.MeshStandardMaterial({ color: '#1f5d66', emissive: '#14d6b8', emissiveIntensity: 0.38, roughness: 0.45, metalness: 0.3 }),
    new THREE.MeshBasicMaterial({ color: '#c8fff4', toneMapped: false }),
  ]);
  const leafGlowGeo = useDisposable(() => new THREE.BufferGeometry().setFromPoints(tree.leaves.map(({ b }) => b.end)));
  const [leafGlowMat, flowMat, seedMat, linkMat] = useDisposable(() => [
    makeGlowPointsMaterial(0.55, 0, '#5fffe0', false),
    makeGlowPointsMaterial(0.2, 0, '#b8fff2', false),
    makeGlowPointsMaterial(0.13, 0.9, '#7ff7ff', false),
    makeLineMaterial('#57f0d4', 0),
  ]);
  const linkGeo = useDisposable(() => {
    const pts: number[] = [];
    tree.links.forEach(([a, b]) => {
      const pa = tree.leaves[a].b.end;
      const pb = tree.leaves[b].b.end;
      pts.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  });

  const flowData = useMemo(() => {
    const rand = seededRandom(13);
    return Array.from({ length: FLOW }, () => ({ path: Math.floor(rand() * tree.paths.length), t: rand(), speed: 0.12 + rand() * 0.12 }));
  }, [tree]);
  const flowGeo = useDisposable(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(FLOW * 3), 3));
    return g;
  });
  const seedData = useMemo(() => {
    const rand = seededRandom(3);
    return Array.from({ length: SEEDS }, () => ({ a: rand() * Math.PI * 2, r: 0.6 + rand() * 2.4, t: rand(), speed: 0.12 + rand() * 0.2 }));
  }, []);
  const seedGeo = useDisposable(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SEEDS * 3), 3));
    return g;
  });

  useFrame((state, dt) => {
    const speed = reducedMotion ? 0.3 : 1;
    const t = state.clock.elapsedTime * speed;
    const g = growth.value * MAX_DEPTH;

    tree.branches.forEach((b, i) => {
      const f = smooth(clamp01(g - b.depth));
      quat.setFromUnitVectors(UP, b.dir);
      dummy.position.copy(b.start);
      dummy.quaternion.copy(quat);
      const radius = 0.11 * Math.pow(0.68, b.depth);
      dummy.scale.set(radius, Math.max(0.0001, b.length * f), radius);
      dummy.updateMatrix();
      branchMesh.current?.setMatrixAt(i, dummy.matrix);
    });
    if (branchMesh.current) branchMesh.current.instanceMatrix.needsUpdate = true;

    tree.leaves.forEach(({ b }, i) => {
      const f = smooth(clamp01(g - b.depth - 0.6) / 0.4);
      dummy.position.copy(b.end);
      dummy.quaternion.identity();
      dummy.scale.setScalar(f * (1 + Math.sin(t * 2 + i) * 0.2));
      dummy.updateMatrix();
      leafMesh.current?.setMatrixAt(i, dummy.matrix);
    });
    if (leafMesh.current) leafMesh.current.instanceMatrix.needsUpdate = true;
    leafGlowMat.opacity = smooth(clamp01(g - MAX_DEPTH + 0.6)) * 0.9;
    linkMat.opacity = canopy.value * 0.45;

    // Knowledge flowing from roots to leaves
    const fp = flowGeo.attributes.position.array as Float32Array;
    flowData.forEach((d, i) => {
      d.t = (d.t + dt * d.speed * speed) % 1;
      const path = tree.paths[d.path];
      const x = d.t * (path.length - 1);
      const k = Math.floor(x);
      const a = path[k];
      const b = path[Math.min(k + 1, path.length - 1)];
      const f = x - k;
      fp.set([a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f, a.z + (b.z - a.z) * f], i * 3);
    });
    flowGeo.attributes.position.needsUpdate = true;
    flowMat.opacity = flow.value;

    // Seeds: small particles drawn toward the base of the tree
    const sp = seedGeo.attributes.position.array as Float32Array;
    seedData.forEach((d, i) => {
      d.t = (d.t + dt * d.speed * speed) % 1;
      const r = d.r * (1 - d.t);
      const a = d.a + d.t * 2;
      sp.set([Math.cos(a) * r, -0.6 + d.t * 0.6 + Math.sin(d.t * Math.PI) * 0.4, Math.sin(a) * r], i * 3);
    });
    seedGeo.attributes.position.needsUpdate = true;
    seedMat.opacity = 0.35 + (1 - growth.value) * 0.6;

    const l = loops.value;
    if (loopA.current) {
      loopA.current.rotation.y += dt * 0.8 * speed;
      loopA.current.scale.setScalar(0.4 + 0.6 * l);
      loopA.current.visible = l > 0.01;
    }
    if (loopB.current) {
      loopB.current.rotation.y -= dt * 0.35 * speed;
      loopB.current.scale.setScalar(0.4 + 0.6 * l);
      loopB.current.visible = l > 0.01;
    }
    if (root.current) root.current.rotation.y += dt * 0.06 * speed;
  });

  return (
    <group position={[3.6, -2.9, 0]}>
      <Glow color="#14d6b8" size={[7, 2.4]} opacity={0.22} position={[0, 0, 0]} />
      <Glow color="#2f9cff" size={9} opacity={0.12} position={[0, 3.2, -1]} />
      {/* Ground rings */}
      {[1.2, 2.2, 3.2].map((r) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r, r + 0.012, 96]} />
          <meshBasicMaterial color="#3fe0c5" transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
      <points geometry={seedGeo} material={seedMat} frustumCulled={false} />

      <group ref={root}>
        <instancedMesh ref={branchMesh} args={[branchGeo, branchMat, tree.branches.length]} frustumCulled={false} />
        <instancedMesh ref={leafMesh} args={[leafGeo, leafMat, tree.leaves.length]} frustumCulled={false} />
        <points geometry={leafGlowGeo} material={leafGlowMat} />
        <lineSegments geometry={linkGeo} material={linkMat} />
        <points geometry={flowGeo} material={flowMat} frustumCulled={false} />
      </group>

      {/* Single loop (small, fast) and double loop (wide, questioning the frame) */}
      <group ref={loopA} position={[0, 2.0, 0]} rotation={[0.25, 0, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.25, 0.018, 8, 128]} />
          <meshBasicMaterial color="#7ff7ff" transparent opacity={0.75} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <Glow color="#bffcff" size={0.6} position={[1.25, 0, 0]} />
      </group>
      <group ref={loopB} position={[0, 3.3, 0]} rotation={[-0.35, 0, 0.15]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.6, 0.022, 8, 160]} />
          <meshBasicMaterial color="#ffb86b" transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <Glow color="#ffd9a8" size={0.8} position={[-2.6, 0, 0]} />
      </group>
    </group>
  );
}
