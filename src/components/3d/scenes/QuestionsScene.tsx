import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useSceneSettings } from '../sceneSettings';
import { seededRandom, useDisposable, useTweenedValue } from '../utils';
import { Glow, makeGlowPointsMaterial } from './common';

const RADIUS = 3.15;

/**
 * Scene 14 — "Le dialogue": two luminous streams circle in opposite
 * directions and intertwine — two voices meeting, a portal for questions.
 */
export function QuestionsScene() {
  const { reducedMotion, quality } = useSceneSettings();
  const perStream = quality === 'high' ? 650 : 320;
  const appear = useTweenedValue(1, { from: 0, duration: 2.4, ease: 'power3.out' });
  const group = useRef<THREE.Group>(null);

  const seeds = useMemo(() => {
    const rand = seededRandom(88);
    return Array.from({ length: perStream * 2 }, () => ({ a: rand() * Math.PI * 2, jitter: rand(), speed: 0.85 + rand() * 0.3 }));
  }, [perStream]);

  const geo = useDisposable(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(perStream * 2 * 3), 3));
    const colors = new Float32Array(perStream * 2 * 3);
    const a = new THREE.Color('#7b8cff');
    const b = new THREE.Color('#45e0ff');
    for (let i = 0; i < perStream * 2; i++) {
      const c = i < perStream ? a : b;
      colors.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [perStream]);
  const mat = useDisposable(() => makeGlowPointsMaterial(0.11, 0.9));

  useFrame((state) => {
    const speed = reducedMotion ? 0.25 : 1;
    const t = state.clock.elapsedTime * speed;
    const pos = geo.attributes.position.array as Float32Array;
    const ap = appear.value;
    for (let i = 0; i < perStream * 2; i++) {
      const s = seeds[i];
      const dir = i < perStream ? 1 : -1;
      const a = s.a + dir * t * 0.22 * s.speed;
      const wave = Math.sin(a * 3 + (dir > 0 ? 0 : Math.PI)) * 0.22;
      const r = (RADIUS + wave + (s.jitter - 0.5) * 0.12) * (0.4 + 0.6 * ap);
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.sin(a) * r;
      pos[i * 3 + 2] = Math.cos(a * 3 + (dir > 0 ? 0 : Math.PI)) * 0.35;
    }
    geo.attributes.position.needsUpdate = true;
    if (group.current) group.current.rotation.x = Math.sin(t * 0.2) * 0.12;
  });

  return (
    <group ref={group} position={[0, 0.05, 0]}>
      <Glow color="#5866ff" size={10} opacity={0.16} />
      <mesh>
        <torusGeometry args={[RADIUS, 0.006, 6, 200]} />
        <meshBasicMaterial color="#9fb0ff" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <points geometry={geo} material={mat} frustumCulled={false} />
    </group>
  );
}
