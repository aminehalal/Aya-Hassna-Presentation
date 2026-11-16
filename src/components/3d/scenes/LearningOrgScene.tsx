import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { focusStore } from '../../../lib/focusStore';
import { useSceneSettings, type SceneProps } from '../sceneSettings';
import { fibonacciSphere, seededRandom, useDisposable, useTweenedValue } from '../utils';
import { Glow, makeGlowPointsMaterial, makeLineMaterial, setPointer } from './common';

const ORB_COLORS = ['#4f8cff', '#a98bff', '#ffb86b', '#3fe0c5'];
const ORBIT = 2.05;
const NETWORK_NODES = 120;

/**
 * Scene 09 — "Les cinq disciplines": a knowledge network surrounds four
 * discipline orbs; the fifth — systems thinking — sits at the centre and,
 * once lit, connects every other discipline into one system (Senge).
 */
export function LearningOrgScene({ step }: SceneProps) {
  const { reducedMotion } = useSceneSettings();
  const network = useRef<THREE.Group>(null);
  const formation = useRef<THREE.Group>(null);
  const orbRefs = useRef<(THREE.Group | null)[]>([]);
  const centre = useRef<THREE.Group>(null);
  const beams = useRef<THREE.LineSegments>(null);
  const pulseGroup = useRef<THREE.Group>(null);
  const disciplines = useTweenedValue(step >= 1 ? 1 : 0, { duration: 1.4 });
  const systems = useTweenedValue(step >= 2 ? 1 : 0, { duration: 1.6 });
  const highlight = useRef([0, 0, 0, 0, 0]);

  const orbPositions = useMemo(
    () =>
      ORB_COLORS.map((_, i) => {
        const a = (i / ORB_COLORS.length) * Math.PI * 2 + Math.PI / 4;
        return new THREE.Vector3(Math.cos(a) * ORBIT, Math.sin(a) * ORBIT * 0.78, Math.sin(a + 0.6) * 0.6);
      }),
    [],
  );

  const { netGeo, netLinkGeo } = useMemo(() => {
    const rand = seededRandom(19);
    const pts = fibonacciSphere(NETWORK_NODES, 3.3).map((p) => p.multiplyScalar(0.85 + rand() * 0.3));
    const links: number[] = [];
    pts.forEach((p, i) => {
      pts
        .map((q, j) => ({ j, d: p.distanceTo(q) }))
        .filter(({ j }) => j > i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2)
        .forEach(({ j }) => links.push(p.x, p.y, p.z, pts[j].x, pts[j].y, pts[j].z));
    });
    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute('position', new THREE.Float32BufferAttribute(links, 3));
    return { netGeo: new THREE.BufferGeometry().setFromPoints(pts), netLinkGeo: linkGeo };
  }, []);
  useDisposable(() => [netGeo, netLinkGeo], [netGeo, netLinkGeo]);

  const beamGeo = useDisposable(() => {
    const pts: number[] = [];
    orbPositions.forEach((p) => pts.push(0, 0, 0, p.x, p.y, p.z));
    orbPositions.forEach((p, i) => {
      const q = orbPositions[(i + 1) % orbPositions.length];
      pts.push(p.x, p.y, p.z, q.x, q.y, q.z);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  });
  const [netMat, netLinkMat, beamMat] = useDisposable(() => [
    makeGlowPointsMaterial(0.2, 0.75, '#7fe3ff', false),
    makeLineMaterial('#4a8dff', 0.16),
    makeLineMaterial('#bff3ff', 0),
  ]);
  const orbGeo = useDisposable(() => new THREE.SphereGeometry(0.3, 32, 32));
  const orbMats = useDisposable(() =>
    ORB_COLORS.map((c) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.2, roughness: 0.25, metalness: 0.2 })),
  );
  const centreGeo = useDisposable(() => {
    const ico = new THREE.IcosahedronGeometry(0.85, 1);
    const edges = new THREE.EdgesGeometry(ico);
    ico.dispose();
    return edges;
  });
  const [centreMat, centreLineMat] = useDisposable(() => [
    new THREE.MeshStandardMaterial({ color: '#e8fbff', emissive: '#45e0ff', emissiveIntensity: 0.2, roughness: 0.2 }),
    makeLineMaterial('#9ff0ff', 0.2),
  ]);

  useFrame((state, dt) => {
    const speed = reducedMotion ? 0.3 : 1;
    const t = state.clock.elapsedTime * speed;
    const d = disciplines.value;
    const s = systems.value;
    const focused = focusStore.get();

    if (network.current) {
      network.current.rotation.y += dt * 0.04 * speed;
      network.current.rotation.x = Math.sin(t * 0.1) * 0.1;
    }
    if (formation.current) formation.current.rotation.z = Math.sin(t * 0.2) * 0.08 + s * t * 0.05;

    orbRefs.current.forEach((g, i) => {
      if (!g) return;
      highlight.current[i] = THREE.MathUtils.damp(highlight.current[i], focused === `discipline-${i}` ? 1 : 0, 8, dt);
      const h = highlight.current[i];
      g.scale.setScalar(0.55 + 0.45 * d + h * 0.45 + Math.sin(t * 1.5 + i) * 0.03);
      orbMats[i].emissiveIntensity = 0.15 + d * 1.1 + h * 1.2;
    });
    highlight.current[4] = THREE.MathUtils.damp(highlight.current[4], focused === 'discipline-4' ? 1 : 0, 8, dt);
    const hc = highlight.current[4];
    if (centre.current) {
      centre.current.rotation.y += dt * (0.2 + s * 0.4) * speed;
      centre.current.scale.setScalar(0.65 + 0.35 * s + hc * 0.25);
    }
    centreMat.emissiveIntensity = 0.15 + s * 1.4 + hc;
    centreLineMat.opacity = 0.2 + s * 0.6;
    beamMat.opacity = s * 0.7;
    netLinkMat.opacity = 0.12 + s * 0.12;

    if (pulseGroup.current) {
      pulseGroup.current.visible = s > 0.02;
      pulseGroup.current.children.forEach((p, i) => {
        const target = orbPositions[i % orbPositions.length];
        const k = (t * 0.5 + i * 0.27) % 1;
        const outward = i < orbPositions.length;
        p.position.copy(target).multiplyScalar(outward ? k : 1 - k);
        (p as THREE.Sprite).material.opacity = Math.sin(k * Math.PI) * s;
      });
    }
  });

  const hoverHandlers = (key: string) => ({
    onPointerOver: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      focusStore.set(key);
      setPointer(true);
    },
    onPointerOut: () => {
      if (focusStore.get() === key) focusStore.set(null);
      setPointer(false);
    },
  });

  return (
    <group position={[3.6, 0.1, 0]}>
      <group ref={network}>
        <points geometry={netGeo} material={netMat} />
        <lineSegments geometry={netLinkGeo} material={netLinkMat} />
      </group>

      <group ref={formation}>
        <Glow color="#45e0ff" size={4} opacity={0.3} />
        <group ref={centre} {...hoverHandlers('discipline-4')}>
          <mesh material={centreMat}>
            <sphereGeometry args={[0.42, 32, 32]} />
          </mesh>
          <lineSegments geometry={centreGeo} material={centreLineMat} />
        </group>

        <lineSegments ref={beams} geometry={beamGeo} material={beamMat} />

        {orbPositions.map((p, i) => (
          <group key={i} position={p} ref={(el) => void (orbRefs.current[i] = el)} {...hoverHandlers(`discipline-${i}`)}>
            <mesh geometry={orbGeo} material={orbMats[i]} />
            <Glow color={ORB_COLORS[i]} size={1.8} opacity={0.55} />
            <mesh rotation={[Math.PI / 2.4, 0, i]}>
              <torusGeometry args={[0.52, 0.008, 6, 64]} />
              <meshBasicMaterial color={ORB_COLORS[i]} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
          </group>
        ))}

        <group ref={pulseGroup}>
          {Array.from({ length: 8 }, (_, i) => (
            <Glow key={i} color="#e6fdff" size={0.35} opacity={0} />
          ))}
        </group>
      </group>
    </group>
  );
}
