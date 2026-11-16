import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useSceneSettings, type SceneProps } from '../sceneSettings';
import { seededRandom, smooth, useDisposable, useTweenedValue } from '../utils';
import { Glow, makeGlowPointsMaterial } from './common';

const N = 96;
const MAX_LINKS = 420;
const PALETTE = ['#45e0ff', '#a98bff', '#4f8cff', '#ffb86b', '#ff7ab6'].map((c) => new THREE.Color(c));

/** Points along a (2,3) torus knot — the "new structure" that ideas organise into. */
function knotPoint(u: number, target: THREE.Vector3) {
  const p = 2;
  const q = 3;
  const r = Math.cos(q * u) + 2.2;
  return target.set(r * Math.cos(p * u) * 0.78, r * Math.sin(p * u) * 0.78, -Math.sin(q * u) * 0.78);
}

/**
 * Scene 06 — "Constellation d'idées": scattered, many-coloured ideas
 * (creativity) start linking to one another, then converge into a single
 * coherent structure (innovation = ideas implemented and adopted).
 */
export function InnovationScene({ step }: SceneProps) {
  const { reducedMotion } = useSceneSettings();
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const connect = useTweenedValue(step >= 1 ? 1 : 0, { duration: 1.6 });
  const structure = useTweenedValue(step >= 2 ? 1 : 0, { duration: 2.6, ease: 'power3.inOut' });
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const data = useMemo(() => {
    const rand = seededRandom(61);
    return Array.from({ length: N }, (_, i) => ({
      scatter: new THREE.Vector3((rand() - 0.5) * 8, (rand() - 0.5) * 5.2, (rand() - 0.5) * 4),
      knot: knotPoint((i / N) * Math.PI * 2, new THREE.Vector3()),
      phase: rand() * Math.PI * 2,
      color: PALETTE[Math.floor(rand() * PALETTE.length)].clone(),
      knotColor: new THREE.Color('#4f8cff').lerp(new THREE.Color('#c3a8ff'), Math.sin((i / N) * Math.PI * 2) * 0.5 + 0.5),
      pos: new THREE.Vector3(),
    }));
  }, []);

  const nodeGeo = useDisposable(() => new THREE.IcosahedronGeometry(0.09, 1));
  const nodeMat = useDisposable(() => new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }));
  const glowGeo = useDisposable(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    return g;
  });
  const glowMat = useDisposable(() => makeGlowPointsMaterial(0.62, 0.85));
  const lineGeo = useDisposable(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_LINKS * 6), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(MAX_LINKS * 6), 3));
    return g;
  });
  const lineMat = useDisposable(
    () => new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  const tmp = useMemo(() => new THREE.Color(), []);

  useLayoutEffect(() => {
    data.forEach((d, i) => mesh.current?.setColorAt(i, d.color));
    if (mesh.current?.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [data]);

  useFrame((state, dt) => {
    const speed = reducedMotion ? 0.3 : 1;
    const t = state.clock.elapsedTime * speed;
    const s = smooth(structure.value);
    const c = connect.value;
    const gp = glowGeo.attributes.position.array as Float32Array;
    const gc = glowGeo.attributes.color.array as Float32Array;

    data.forEach((d, i) => {
      const wander = 1 - s;
      d.pos.copy(d.scatter).lerp(d.knot, s);
      d.pos.x += Math.sin(t * 0.4 + d.phase) * 0.35 * wander;
      d.pos.y += Math.cos(t * 0.33 + d.phase * 1.7) * 0.3 * wander;
      d.pos.z += Math.sin(t * 0.27 + d.phase * 0.6) * 0.3 * wander;
      const twinkle = 0.75 + Math.sin(t * 3 + d.phase) * 0.25 * wander;
      dummy.position.copy(d.pos);
      dummy.scale.setScalar(twinkle * (1 + s * 0.2));
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(i, dummy.matrix);
      tmp.copy(d.color).lerp(d.knotColor, s);
      mesh.current?.setColorAt(i, tmp);
      gp.set([d.pos.x, d.pos.y, d.pos.z], i * 3);
      gc.set([tmp.r * twinkle, tmp.g * twinkle, tmp.b * twinkle], i * 3);
    });
    if (mesh.current) {
      mesh.current.instanceMatrix.needsUpdate = true;
      if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    }
    glowGeo.attributes.position.needsUpdate = true;
    glowGeo.attributes.color.needsUpdate = true;

    // Proximity links: ideas that meet start to combine.
    const lp = lineGeo.attributes.position.array as Float32Array;
    const lc = lineGeo.attributes.color.array as Float32Array;
    const threshold = THREE.MathUtils.lerp(1.55, 0.95, s);
    let n = 0;
    if (c > 0.01) {
      for (let i = 0; i < N && n < MAX_LINKS; i++) {
        for (let j = i + 1; j < N && n < MAX_LINKS; j++) {
          const a = data[i].pos;
          const b = data[j].pos;
          const dist = a.distanceTo(b);
          if (dist < threshold) {
            const k = (1 - dist / threshold) * c * (0.6 + s * 0.6);
            lp.set([a.x, a.y, a.z, b.x, b.y, b.z], n * 6);
            tmp.copy(data[i].color).lerp(data[i].knotColor, s).multiplyScalar(k);
            lc.set([tmp.r, tmp.g, tmp.b], n * 6);
            tmp.copy(data[j].color).lerp(data[j].knotColor, s).multiplyScalar(k);
            lc.set([tmp.r, tmp.g, tmp.b], n * 6 + 3);
            n++;
          }
        }
      }
    }
    lineGeo.setDrawRange(0, n * 2);
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate = true;
    lineGeo.computeBoundingSphere();

    if (group.current) {
      group.current.rotation.y += dt * (0.04 + s * 0.16) * speed;
      group.current.rotation.x = Math.sin(t * 0.2) * 0.15 * s;
    }
  });

  return (
    <group position={[3.5, 0, 0]}>
      <Glow color="#7c5cff" size={8} opacity={0.2} />
      <group ref={group}>
        <instancedMesh ref={mesh} args={[nodeGeo, nodeMat, N]} frustumCulled={false} />
        <points geometry={glowGeo} material={glowMat} frustumCulled={false} />
        <lineSegments geometry={lineGeo} material={lineMat} frustumCulled={false} />
      </group>
    </group>
  );
}
