import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useSceneSettings, type SceneProps } from '../sceneSettings';
import { seededRandom, smooth, useDisposable, useTweenedValue } from '../utils';
import { Glow } from './common';
import { makeBulbGlassMaterial, useBulbGeometries } from './symbols';

const N = 76;
const MAX_LINKS = 360;
const PALETTE = ['#45e0ff', '#a98bff', '#4f8cff', '#ffb86b', '#ff7ab6'].map((c) => new THREE.Color(c));
const LIT = new THREE.Color('#ffd27a');
const BULB_SCALE = 0.42;

/** Points evenly spaced along the outline of a large light-bulb (glass, neck and screw base). */
function bulbOutline(count: number) {
  const path: THREE.Vector2[] = [];
  const cy = 0.75;
  const R = 1.75;
  const a0 = THREE.MathUtils.degToRad(-58);
  const a1 = THREE.MathUtils.degToRad(238);
  for (let i = 0; i <= 60; i++) {
    const a = a0 + ((a1 - a0) * i) / 60;
    path.push(new THREE.Vector2(Math.cos(a) * R, cy + Math.sin(a) * R));
  }
  // One continuous outline: right neck → glass (over the top) → left neck → screw base
  const full = [
    new THREE.Vector2(0.6, -1.25),
    ...path,
    new THREE.Vector2(-0.6, -1.25),
    new THREE.Vector2(0.6, -1.25),
    new THREE.Vector2(0.6, -1.55),
    new THREE.Vector2(-0.6, -1.55),
    new THREE.Vector2(-0.55, -1.85),
    new THREE.Vector2(0.55, -1.85),
    new THREE.Vector2(0.25, -2.1),
    new THREE.Vector2(-0.25, -2.1),
  ];
  // Filament inside the glass (the idea that lights up)
  const filament = [new THREE.Vector2(-0.4, -0.55), new THREE.Vector2(-0.25, 0.6), new THREE.Vector2(0, 0.25), new THREE.Vector2(0.25, 0.6), new THREE.Vector2(0.4, -0.55)];

  const sample = (pts: THREE.Vector2[], n: number) => {
    const lengths = pts.slice(1).map((p, i) => p.distanceTo(pts[i]));
    const total = lengths.reduce((a, b) => a + b, 0);
    const out: THREE.Vector2[] = [];
    for (let k = 0; k < n; k++) {
      let d = (k / n) * total;
      let s = 0;
      while (s < lengths.length - 1 && d > lengths[s]) d -= lengths[s++];
      out.push(pts[s].clone().lerp(pts[s + 1], Math.min(1, d / lengths[s])));
    }
    return out;
  };
  const filamentCount = 12;
  return [...sample(full, count - filamentCount), ...sample(filament, filamentCount)];
}

/**
 * Scene 06 — "Des idées à l'innovation": scattered light-bulbs (ideas,
 * creativity) flicker in many colours; they start to connect; then they
 * line up to draw a single large light-bulb that switches on — ideas
 * combined and implemented become an innovation.
 */
export function InnovationScene({ step }: SceneProps) {
  const { reducedMotion } = useSceneSettings();
  const glass = useRef<THREE.InstancedMesh>(null);
  const base = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const bigGlow = useRef<THREE.Sprite>(null);
  const connect = useTweenedValue(step >= 1 ? 1 : 0, { duration: 1.6 });
  const structure = useTweenedValue(step >= 2 ? 1 : 0, { duration: 2.6, ease: 'power3.inOut' });
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const [glassGeo, baseGeo] = useBulbGeometries();
  const glassMat = useDisposable(() => makeBulbGlassMaterial(), []);
  const baseMat = useDisposable(() => new THREE.MeshStandardMaterial({ color: '#9aa4c4', metalness: 0.8, roughness: 0.35 }), []);

  const data = useMemo(() => {
    const rand = seededRandom(61);
    const outline = bulbOutline(N);
    return Array.from({ length: N }, (_, i) => ({
      scatter: new THREE.Vector3((rand() - 0.5) * 7.5, (rand() - 0.5) * 5, (rand() - 0.5) * 3.5),
      target: new THREE.Vector3(outline[i].x, outline[i].y, 0),
      phase: rand() * Math.PI * 2,
      spin: (rand() - 0.5) * 1.2,
      color: PALETTE[Math.floor(rand() * PALETTE.length)].clone(),
      pos: new THREE.Vector3(),
    }));
  }, []);

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
  const colours = useMemo(() => data.map(() => new THREE.Color()), [data]);

  useFrame((state) => {
    const speed = reducedMotion ? 0.3 : 1;
    const t = state.clock.elapsedTime * speed;
    const s = smooth(structure.value);
    const c = connect.value;

    data.forEach((d, i) => {
      const wander = 1 - s;
      d.pos.copy(d.scatter).lerp(d.target, smooth(structure.value * 1.25 - (i / N) * 0.25));
      d.pos.x += Math.sin(t * 0.4 + d.phase) * 0.3 * wander;
      d.pos.y += Math.cos(t * 0.33 + d.phase * 1.7) * 0.25 * wander;
      d.pos.z += Math.sin(t * 0.27 + d.phase * 0.6) * 0.25 * wander;
      // Ideas flicker on and off while scattered, then stay lit
      const flicker = 0.55 + 0.45 * Math.max(0, Math.sin(t * 2.2 + d.phase)) * wander + s * 0.45;
      colours[i].copy(d.color).lerp(LIT, s).multiplyScalar(flicker);

      dummy.position.set(d.pos.x, d.pos.y - 0.13, d.pos.z);
      dummy.rotation.set(Math.sin(t * 0.5 + d.phase) * 0.4 * wander, t * d.spin * wander, Math.cos(t * 0.4 + d.phase) * 0.4 * wander);
      dummy.scale.setScalar(BULB_SCALE * (1 - s * 0.3));
      dummy.updateMatrix();
      glass.current?.setMatrixAt(i, dummy.matrix);
      base.current?.setMatrixAt(i, dummy.matrix);
      glass.current?.setColorAt(i, colours[i]);
    });
    [glass.current, base.current].forEach((m) => {
      if (!m) return;
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    });

    // Ideas that meet start to combine
    const lp = lineGeo.attributes.position.array as Float32Array;
    const lc = lineGeo.attributes.color.array as Float32Array;
    const threshold = THREE.MathUtils.lerp(1.5, 0.42, s);
    let n = 0;
    if (c > 0.01) {
      for (let i = 0; i < N && n < MAX_LINKS; i++) {
        for (let j = i + 1; j < N && n < MAX_LINKS; j++) {
          const a = data[i].pos;
          const b = data[j].pos;
          const dist = a.distanceTo(b);
          if (dist < threshold) {
            const k = (1 - dist / threshold) * c * (0.6 + s * 0.8);
            lp.set([a.x, a.y, a.z, b.x, b.y, b.z], n * 6);
            tmp.copy(colours[i]).multiplyScalar(k);
            lc.set([tmp.r, tmp.g, tmp.b], n * 6);
            tmp.copy(colours[j]).multiplyScalar(k);
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

    // The big bulb switches on once the structure is formed
    if (bigGlow.current) (bigGlow.current.material as THREE.SpriteMaterial).opacity = smooth(structure.value * 1.6 - 0.6) * 0.75;
    if (group.current) {
      // Slow drift while scattered; the finished bulb faces the audience with a gentle sway
      const drift = Math.atan2(Math.sin(t * 0.05), Math.cos(t * 0.05));
      group.current.rotation.y = drift * (1 - s) + Math.sin(t * 0.3) * 0.2 * s;
    }
  });

  return (
    <group position={[3.6, 0.15, 0]}>
      <Glow color="#7c5cff" size={8} opacity={0.18} />
      <Glow ref={bigGlow} color="#ffcf6b" size={6.5} opacity={0} position={[0, 0.7, -0.3]} />
      <group ref={group}>
        <instancedMesh ref={glass} args={[glassGeo, glassMat, N]} frustumCulled={false} />
        <instancedMesh ref={base} args={[baseGeo, baseMat, N]} frustumCulled={false} />
        <lineSegments geometry={lineGeo} material={lineMat} frustumCulled={false} />
      </group>
    </group>
  );
}
