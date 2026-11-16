import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { focusStore } from '../../../lib/focusStore';
import { useSceneSettings, type SceneProps } from '../sceneSettings';
import { useDisposable, useTweenedValue } from '../utils';
import { Glow, makeLineMaterial, setPointer } from './common';
import { CHEST, People, type PeopleHandle } from './symbols';

const ORB_COLORS = ['#4f8cff', '#a98bff', '#ffb86b', '#3fe0c5'];
const ORBIT = 2.05;
const PEOPLE = 16;
const FLOOR_Y = -2.55;
const PEOPLE_COLORS = ['#4f8cff', '#a98bff', '#ffb86b', '#3fe0c5'];

/**
 * Scene 09 — "Les cinq disciplines": the people of a learning organisation
 * stand in a circle beneath four
 * discipline orbs; the fifth — systems thinking — sits at the centre and,
 * once lit, connects every other discipline into one system (Senge).
 */
export function LearningOrgScene({ step }: SceneProps) {
  const { reducedMotion } = useSceneSettings();
  const network = useRef<THREE.Group>(null);
  const people = useRef<PeopleHandle>(null);
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

  // The learning organisation itself: people in a circle beneath the disciplines,
  // linked to their neighbours (team learning) and, with systems thinking, to the centre.
  const seats = useMemo(
    () =>
      Array.from({ length: PEOPLE }, (_, i) => {
        const a = (i / PEOPLE) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(a) * 3.0, FLOOR_Y, Math.sin(a) * 1.5);
      }),
    [],
  );
  const netLinkGeo = useDisposable(() => {
    const pts: number[] = [];
    seats.forEach((p, i) => {
      const q = seats[(i + 1) % PEOPLE];
      pts.push(p.x, p.y + CHEST, p.z, q.x, q.y + CHEST, q.z);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  });
  const riseGeo = useDisposable(() => {
    const pts: number[] = [];
    seats.forEach((p) => pts.push(p.x, p.y + CHEST + 0.1, p.z, 0, 0, 0));
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  });

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
  const [riseMat, netLinkMat, beamMat] = useDisposable(() => [
    makeLineMaterial('#9ff0ff', 0),
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

  useLayoutEffect(() => {
    seats.forEach((p, i) => {
      people.current?.set(i, p.x, p.y, p.z, 0.95, Math.atan2(-p.x, -p.z));
      people.current?.color(i, PEOPLE_COLORS[i % PEOPLE_COLORS.length]);
    });
    people.current?.commit();
  }, [seats]);

  useFrame((state, dt) => {
    const speed = reducedMotion ? 0.3 : 1;
    const t = state.clock.elapsedTime * speed;
    const d = disciplines.value;
    const s = systems.value;
    const focused = focusStore.get();

    if (network.current) network.current.rotation.y = Math.sin(t * 0.15) * 0.25;
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
    netLinkMat.opacity = 0.25 + d * 0.25;
    riseMat.opacity = s * 0.3;
    if (people.current) people.current.material.emissiveIntensity = 0.3 + d * 0.2 + s * 0.2;

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
        <mesh position={[0, FLOOR_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.5, 1]}>
          <ringGeometry args={[2.9, 2.95, 96]} />
          <meshBasicMaterial color="#45e0ff" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
        <People ref={people} count={PEOPLE} />
        <lineSegments geometry={netLinkGeo} material={netLinkMat} />
        <lineSegments geometry={riseGeo} material={riseMat} />
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
