import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useSceneSettings, type SceneProps } from '../sceneSettings';
import { fibonacciSphere, seededRandom, smooth, useDisposable, useTweenedValue } from '../utils';
import { Glow, makeGlowPointsMaterial, makeLineMaterial } from './common';

const GRID = 4; // 4×4×4 blocks per world
const COUNT = GRID * GRID * GRID;
const WORLD_Y = -1.3;
const LEFT_X = -4.4;
const RIGHT_X = 4.4;

/** Formations the dynamic organisation keeps cycling through. */
function buildFormations() {
  const rand = seededRandom(23);
  const sphere = fibonacciSphere(COUNT, 1.45);
  const helix = Array.from({ length: COUNT }, (_, i) => {
    const t = i / COUNT;
    const a = t * Math.PI * 6;
    return new THREE.Vector3(Math.cos(a) * 1.2, (t - 0.5) * 2.6, Math.sin(a) * 1.2);
  });
  const cloud = Array.from(
    { length: COUNT },
    () => new THREE.Vector3((rand() - 0.5) * 3.4, (rand() - 0.5) * 2.4, (rand() - 0.5) * 2.4),
  );
  const torus = Array.from({ length: COUNT }, (_, i) => {
    const u = (i / COUNT) * Math.PI * 2;
    const v = (i * 7.3) % (Math.PI * 2);
    return new THREE.Vector3((1.2 + 0.45 * Math.cos(v)) * Math.cos(u), 0.45 * Math.sin(v) * 1.4, (1.2 + 0.45 * Math.cos(v)) * Math.sin(u));
  });
  return [sphere, cloud, helix, torus];
}

/**
 * Scene 02 — "Deux mondes": on the left, a perfectly ordered but frozen
 * block; on the right, the same elements constantly reorganising.
 */
export function QuestionScene({ step }: SceneProps) {
  const { reducedMotion } = useSceneSettings();
  const rigid = useRef<THREE.InstancedMesh>(null);
  const fluid = useRef<THREE.InstancedMesh>(null);
  const fluidGroup = useRef<THREE.Group>(null);
  const reveal = useTweenedValue(step >= 1 ? 1 : 0, { duration: 1.6 });
  const formations = useMemo(buildFormations, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const current = useMemo(() => formations[0].map((v) => v.clone()), [formations]);

  const [boxGeo, gemGeo] = useDisposable(() => [new THREE.BoxGeometry(0.42, 0.42, 0.42), new THREE.IcosahedronGeometry(0.2, 0)]);
  const [rigidMat, fluidMat] = useDisposable(() => [
    new THREE.MeshStandardMaterial({ color: '#56627f', metalness: 0.65, roughness: 0.42 }),
    new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#2a7cff', emissiveIntensity: 0.55, metalness: 0.2, roughness: 0.3 }),
  ]);
  const cageGeo = useDisposable(() => {
    const box = new THREE.BoxGeometry(2.3, 2.3, 2.3);
    const edges = new THREE.EdgesGeometry(box);
    box.dispose();
    return edges;
  });
  const [cageMat, linkMat, sparkMat] = useDisposable(() => [
    makeLineMaterial('#7b8db8', 0.35),
    makeLineMaterial('#5fe1ff', 0.45),
    makeGlowPointsMaterial(0.32, 0.9, '#9fe9ff', false),
  ]);
  const linkGeo = useDisposable(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((COUNT - 1) * 2 * 3 + 32 * 2 * 3), 3));
    return geo;
  });
  const sparkGeo = useDisposable(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3));
    return geo;
  });

  // Rigid block: computed once, never moves again — that is the point.
  useLayoutEffect(() => {
    const mesh = rigid.current;
    if (!mesh) return;
    let i = 0;
    const off = ((GRID - 1) * 0.55) / 2;
    for (let x = 0; x < GRID; x++)
      for (let y = 0; y < GRID; y++)
        for (let z = 0; z < GRID; z++) {
          dummy.position.set(x * 0.55 - off, y * 0.55 - off, z * 0.55 - off);
          dummy.rotation.set(0, 0, 0);
          dummy.scale.setScalar(1);
          dummy.updateMatrix();
          mesh.setMatrixAt(i++, dummy.matrix);
        }
    mesh.instanceMatrix.needsUpdate = true;
  }, [dummy]);

  // Colour palette of the living organisation
  useLayoutEffect(() => {
    const mesh = fluid.current;
    if (!mesh) return;
    const palette = ['#45e0ff', '#9b7bff', '#4f8cff', '#ffb86b'].map((c) => new THREE.Color(c));
    for (let i = 0; i < COUNT; i++) mesh.setColorAt(i, palette[i % palette.length]);
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  useFrame((state, dt) => {
    const mesh = fluid.current;
    if (!mesh) return;
    const speed = reducedMotion ? 0.3 : 1;
    const t = state.clock.elapsedTime * speed;
    const period = 4.2;
    const phase = t / period;
    const from = formations[Math.floor(phase) % formations.length];
    const to = formations[(Math.floor(phase) + 1) % formations.length];
    const k = smooth((phase % 1) * 1.6 - 0.3);
    const linkPos = linkGeo.attributes.position.array as Float32Array;
    const sparkPos = sparkGeo.attributes.position.array as Float32Array;

    for (let i = 0; i < COUNT; i++) {
      const target = current[i].copy(from[i]).lerp(to[i], k);
      target.y += Math.sin(t * 1.3 + i) * 0.05;
      dummy.position.copy(target);
      dummy.rotation.set(t * 0.6 + i, t * 0.4 + i * 0.5, 0);
      dummy.scale.setScalar(0.85 + Math.sin(t * 2 + i) * 0.15 + reveal.value * 0.15);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      sparkPos.set([target.x, target.y, target.z], i * 3);
    }
    mesh.instanceMatrix.needsUpdate = true;

    // Chain links + a few long-range links: the organisation as a connected whole
    let p = 0;
    for (let i = 0; i < COUNT - 1; i++) {
      const a = current[i];
      const b = current[i + 1];
      linkPos.set([a.x, a.y, a.z, b.x, b.y, b.z], p);
      p += 6;
    }
    for (let i = 0; i < 32; i++) {
      const a = current[i];
      const b = current[(i * 7 + 13) % COUNT];
      linkPos.set([a.x, a.y, a.z, b.x, b.y, b.z], p);
      p += 6;
    }
    linkGeo.attributes.position.needsUpdate = true;
    sparkGeo.attributes.position.needsUpdate = true;
    linkGeo.computeBoundingSphere();

    linkMat.opacity = 0.32 + reveal.value * 0.35;
    fluidMat.emissiveIntensity = 0.5 + reveal.value * 0.5;
    const dim = reveal.value * 0.12;
    rigidMat.color.setRGB(0.36 - dim, 0.4 - dim, 0.52 - dim);
    if (fluidGroup.current) fluidGroup.current.rotation.y += dt * 0.12 * speed;
  });

  return (
    <group>
      {/* Frozen organisation */}
      <group position={[LEFT_X, WORLD_Y, 0]} rotation={[0.18, 0.62, 0]}>
        <instancedMesh ref={rigid} args={[boxGeo, rigidMat, COUNT]} />
        <lineSegments geometry={cageGeo} material={cageMat} />
      </group>

      {/* Divide */}
      <Glow color="#7aa2ff" size={[0.22, 9]} opacity={0.4} position={[0, WORLD_Y + 0.6, -1]} />
      <Glow color="#ffffff" size={[0.05, 7]} opacity={0.5} position={[0, WORLD_Y + 0.6, -1]} />

      {/* Living organisation */}
      <group position={[RIGHT_X, WORLD_Y, 0]}>
        <Glow color="#3f7bff" size={6} opacity={0.28} />
        <group ref={fluidGroup}>
          <instancedMesh ref={fluid} args={[gemGeo, fluidMat, COUNT]} />
          <lineSegments geometry={linkGeo} material={linkMat} frustumCulled={false} />
          <points geometry={sparkGeo} material={sparkMat} frustumCulled={false} />
        </group>
      </group>
    </group>
  );
}
