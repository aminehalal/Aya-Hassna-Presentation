import { MeshDistortMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useSceneSettings, type SceneProps } from '../sceneSettings';
import { seededRandom, useDisposable, useTweenedValue } from '../utils';
import { Glow, makeGlowPointsMaterial, makeLineMaterial } from './common';

const RINGS = [
  { radius: 3.0, tilt: [1.2, 0.2, 0], speed: 0.35, color: '#7fe3ff' },
  { radius: 3.45, tilt: [0.4, 1.1, 0.3], speed: -0.25, color: '#a48bff' },
  { radius: 3.9, tilt: [-0.7, 0.5, 0.9], speed: 0.18, color: '#6f8cff' },
] as const;

/**
 * Scene 01 — "Le noyau": a mysterious living core (the organisation)
 * wrapped in geometric shells and orbits, emerging from the darkness.
 */
export function IntroScene({ step }: SceneProps) {
  const { reducedMotion, quality } = useSceneSettings();
  const root = useRef<THREE.Group>(null);
  const shellA = useRef<THREE.Group>(null);
  const shellB = useRef<THREE.LineSegments>(null);
  const halo = useRef<THREE.Points>(null);
  const ringRefs = useRef<(THREE.Group | null)[]>([]);
  const coreGlow = useRef<THREE.Sprite>(null);

  const emerge = useTweenedValue(1, { from: 0, duration: 3.2, ease: 'power2.out' });
  const open = useTweenedValue(step >= 1 ? 1 : 0, { duration: 1.8 });

  const [icoEdges, dodecaEdges] = useDisposable(() => {
    const ico = new THREE.IcosahedronGeometry(1.9, 1);
    const dodeca = new THREE.DodecahedronGeometry(2.6, 0);
    const edges = [new THREE.EdgesGeometry(ico, 1), new THREE.EdgesGeometry(dodeca, 1)];
    ico.dispose();
    dodeca.dispose();
    return edges;
  });

  const vertexGeo = useDisposable(() => {
    // Unique vertices of the shell: small lights on the structure's nodes
    const ico = new THREE.IcosahedronGeometry(1.9, 1);
    const pos = ico.getAttribute('position');
    const seen = new Map<string, THREE.Vector3>();
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i);
      seen.set(`${v.x.toFixed(3)}|${v.y.toFixed(3)}|${v.z.toFixed(3)}`, v);
    }
    ico.dispose();
    return new THREE.BufferGeometry().setFromPoints([...seen.values()]);
  });

  const haloGeo = useDisposable(() => {
    const count = quality === 'high' ? 1400 : 700;
    const rand = seededRandom(11);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.pow(rand(), 0.7) * 6;
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

  const [haloMat, vertexMat, shellAMat, shellBMat] = useDisposable(() => [
    makeGlowPointsMaterial(0.09, 0.9),
    makeGlowPointsMaterial(0.28, 0.95, '#bff3ff', false),
    makeLineMaterial('#7fe3ff', 0.5),
    makeLineMaterial('#9b7bff', 0.28),
  ]);

  useFrame((state, dt) => {
    const speed = reducedMotion ? 0.25 : 1;
    const t = state.clock.elapsedTime;
    const e = emerge.value;
    const o = open.value;
    if (root.current) root.current.scale.setScalar(0.55 + 0.45 * e + o * 0.06);
    if (shellA.current) {
      shellA.current.rotation.y += dt * 0.14 * speed;
      shellA.current.rotation.x += dt * 0.05 * speed;
      shellA.current.scale.setScalar(1 + o * 0.12 + Math.sin(t * 0.8) * 0.015);
    }
    if (shellB.current) {
      shellB.current.rotation.y -= dt * 0.08 * speed;
      shellB.current.rotation.z += dt * 0.04 * speed;
      shellB.current.scale.setScalar(1 + o * 0.2);
    }
    if (halo.current) halo.current.rotation.y += dt * 0.025 * speed;
    ringRefs.current.forEach((g, i) => {
      if (g) g.rotation.z += dt * RINGS[i].speed * speed;
    });
    if (coreGlow.current) {
      (coreGlow.current.material as THREE.SpriteMaterial).opacity = (0.5 + Math.sin(t * 1.2) * 0.12) * e;
    }
    shellAMat.opacity = 0.5 * e;
    shellBMat.opacity = 0.18 + 0.2 * o;
    haloMat.opacity = 0.85 * e;
  });

  return (
    <group ref={root}>
      <Glow ref={coreGlow} color="#6d7dff" size={8} opacity={0.5} />
      <Glow color="#d6e4ff" size={2.4} opacity={0.75} />

      <mesh>
        <icosahedronGeometry args={[1.05, 24]} />
        <MeshDistortMaterial
          color="#4d5cff"
          emissive="#3a1fd1"
          emissiveIntensity={1.15}
          roughness={0.18}
          metalness={0.35}
          distort={0.38}
          speed={reducedMotion ? 0.4 : 1.6}
        />
      </mesh>

      <group ref={shellA}>
        <lineSegments geometry={icoEdges} material={shellAMat} />
        <points geometry={vertexGeo} material={vertexMat} />
      </group>
      <lineSegments ref={shellB} geometry={dodecaEdges} material={shellBMat} />

      {RINGS.map((ring, i) => (
        <group key={ring.radius} rotation={ring.tilt as unknown as THREE.Euler}>
          <mesh>
            <torusGeometry args={[ring.radius, 0.008, 6, 160]} />
            <meshBasicMaterial color={ring.color} transparent opacity={0.45} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          <group ref={(el) => void (ringRefs.current[i] = el)}>
            <Glow color={ring.color} size={0.55} position={[ring.radius, 0, 0]} />
            <mesh position={[ring.radius, 0, 0]}>
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        </group>
      ))}

      <points ref={halo} geometry={haloGeo} material={haloMat} />
    </group>
  );
}
