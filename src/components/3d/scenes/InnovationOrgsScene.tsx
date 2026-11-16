import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { focusStore } from '../../../lib/focusStore';
import { useSceneSettings, type SceneProps } from '../sceneSettings';
import { seededRandom, smooth, useDisposable, useTweenedValue } from '../utils';
import { Glow, makeLineMaterial, setPointer } from './common';

const PLATFORMS = 5;
const RADIUS = 2.9;
const COLORS = ['#45e0ff', '#8f7bff', '#4f8cff', '#ffb86b', '#3fe0c5'];

/**
 * Scene 07 — "L'organisation-système": an innovation core irrigates five
 * platforms (the benefits). Energy pulses travel along the links; in the
 * second step, diffusion waves spread outward (Rogers). Platforms react
 * to hovering, in sync with the list on screen.
 */
export function InnovationOrgsScene({ step }: SceneProps) {
  const { reducedMotion } = useSceneSettings();
  const platformRefs = useRef<(THREE.Group | null)[]>([]);
  const bands = useRef<THREE.Group>(null);
  const pulses = useRef<THREE.Group>(null);
  const waves = useRef<THREE.Group>(null);
  const city = useRef<THREE.InstancedMesh>(null);
  const rise = useTweenedValue(1, { from: 0, duration: 2, delay: 0.2, ease: 'power3.out' });
  const diffusion = useTweenedValue(step >= 1 ? 1 : 0, { duration: 1.4 });
  const highlight = useRef(Array.from({ length: PLATFORMS }, () => 0));
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const anchors = useMemo(
    () =>
      Array.from({ length: PLATFORMS }, (_, i) => {
        const a = (i / PLATFORMS) * Math.PI * 2 - Math.PI / 2;
        return new THREE.Vector3(Math.cos(a) * RADIUS, 0, Math.sin(a) * RADIUS);
      }),
    [],
  );

  const curves = useMemo(() => {
    const core = anchors.map(
      (p) => new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 1.2, 0), new THREE.Vector3(p.x * 0.5, 2.0, p.z * 0.5), p.clone().setY(0.15)),
    );
    const ring = anchors.map((p, i) => {
      const q = anchors[(i + 1) % PLATFORMS];
      const mid = p.clone().add(q).multiplyScalar(0.5).multiplyScalar(1.25).setY(0.5);
      return new THREE.QuadraticBezierCurve3(p.clone().setY(0.15), mid, q.clone().setY(0.15));
    });
    return { core, ring };
  }, [anchors]);

  const linkGeos = useDisposable(() =>
    [...curves.core, ...curves.ring].map((c) => new THREE.BufferGeometry().setFromPoints(c.getPoints(40))),
  );
  const [coreLinkMat, ringLinkMat] = useDisposable(() => [makeLineMaterial('#9fb8ff', 0.55), makeLineMaterial('#6f7fd8', 0.35)]);

  const [hexGeo, towerGeo, bandGeo, buildingGeo] = useDisposable(() => [
    new THREE.CylinderGeometry(0.95, 0.95, 0.12, 6),
    new THREE.CylinderGeometry(0.42, 0.62, 2.4, 6),
    new THREE.TorusGeometry(0.62, 0.025, 6, 6),
    (() => {
      const g = new THREE.BoxGeometry(1, 1, 1);
      g.translate(0, 0.5, 0);
      return g;
    })(),
  ]);
  const hexEdgeGeo = useDisposable(() => new THREE.EdgesGeometry(hexGeo));
  const platformMats = useDisposable(() =>
    COLORS.map(
      (c) =>
        new THREE.MeshStandardMaterial({ color: '#1a2448', emissive: c, emissiveIntensity: 0.25, metalness: 0.6, roughness: 0.35 }),
    ),
  );
  const edgeMats = useDisposable(() => COLORS.map((c) => makeLineMaterial(c, 0.9)));
  const [towerMat, buildingMat] = useDisposable(() => [
    new THREE.MeshStandardMaterial({ color: '#1b2350', emissive: '#5a4dff', emissiveIntensity: 0.35, metalness: 0.7, roughness: 0.3 }),
    new THREE.MeshStandardMaterial({ color: '#2a3970', emissive: '#3f6bff', emissiveIntensity: 0.3, metalness: 0.5, roughness: 0.4 }),
  ]);

  // Small "buildings" on every platform (one instanced mesh for the whole city)
  const buildings = useMemo(() => {
    const rand = seededRandom(77);
    const list: { platform: number; x: number; z: number; h: number; w: number }[] = [];
    for (let p = 0; p < PLATFORMS; p++) {
      for (let k = 0; k < 7; k++) {
        const a = rand() * Math.PI * 2;
        const r = 0.15 + rand() * 0.55;
        list.push({ platform: p, x: Math.cos(a) * r, z: Math.sin(a) * r, h: 0.15 + rand() * 0.55, w: 0.1 + rand() * 0.12 });
      }
    }
    return list;
  }, []);

  useLayoutEffect(() => {
    const c = new THREE.Color();
    buildings.forEach((b, i) => city.current?.setColorAt(i, c.set(COLORS[b.platform]).lerp(new THREE.Color('#ffffff'), 0.5)));
    if (city.current?.instanceColor) city.current.instanceColor.needsUpdate = true;
  }, [buildings]);

  useFrame((state, dt) => {
    const speed = reducedMotion ? 0.3 : 1;
    const t = state.clock.elapsedTime * speed;
    const r = rise.value;
    const focused = focusStore.get();

    platformRefs.current.forEach((g, i) => {
      if (!g) return;
      highlight.current[i] = THREE.MathUtils.damp(highlight.current[i], focused === `benefit-${i}` ? 1 : 0, 7, dt);
      const h = highlight.current[i];
      const local = smooth(r * 1.4 - i * 0.08);
      g.position.set(anchors[i].x, -1.6 * (1 - local) + h * 0.35 + Math.sin(t * 0.8 + i) * 0.05, anchors[i].z);
      g.scale.setScalar(0.6 + 0.4 * local + h * 0.12);
      platformMats[i].emissiveIntensity = 0.25 + h * 0.9;
      edgeMats[i].opacity = 0.6 + h * 0.4;
    });

    buildings.forEach((b, i) => {
      const g = platformRefs.current[b.platform];
      if (!g) return;
      const h = highlight.current[b.platform];
      dummy.position.set(g.position.x + b.x * g.scale.x, g.position.y + 0.06, g.position.z + b.z * g.scale.x);
      dummy.scale.set(b.w, b.h * (0.3 + 0.7 * smooth(r)) * (1 + h * 0.6 + Math.sin(t * 2 + i) * 0.05), b.w);
      dummy.updateMatrix();
      city.current?.setMatrixAt(i, dummy.matrix);
    });
    if (city.current) city.current.instanceMatrix.needsUpdate = true;

    if (bands.current) {
      bands.current.children.forEach((band, i) => {
        const k = (t * 0.35 + i / 3) % 1;
        band.position.y = -1.0 + k * 2.4;
        band.scale.setScalar(1 - k * 0.3);
        ((band as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = Math.sin(k * Math.PI) * 0.9;
      });
    }

    if (pulses.current) {
      pulses.current.children.forEach((pulse, i) => {
        const isCore = i < PLATFORMS * 2;
        const curve = isCore ? curves.core[i % PLATFORMS] : curves.ring[i % PLATFORMS];
        const k = (t * (isCore ? 0.38 : 0.22) + (isCore ? Math.floor(i / PLATFORMS) * 0.5 : 0) + i * 0.13) % 1;
        curve.getPoint(k, pulse.position);
        pulse.scale.setScalar(0.42 * Math.sin(k * Math.PI) + 0.08);
      });
    }

    if (waves.current) {
      const d = diffusion.value;
      waves.current.children.forEach((w, i) => {
        const k = (t * 0.28 + i / 3) % 1;
        w.scale.setScalar(0.8 + k * 6.5);
        ((w as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.45 * d;
      });
    }
  });

  return (
    <group position={[3.8, -0.4, 0]} scale={0.92}>
      <Glow color="#5a4dff" size={9} opacity={0.2} position={[0, 0.5, 0]} />
      {/* Innovation core */}
      <mesh geometry={towerGeo} material={towerMat} position={[0, 0.0, 0]} />
      <Glow color="#c7b8ff" size={2.6} opacity={0.85} position={[0, 1.35, 0]} />
      <group ref={bands}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} geometry={bandGeo} rotation={[Math.PI / 2, 0, 0]}>
            <meshBasicMaterial color="#b6a8ff" transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        ))}
      </group>

      {/* Platforms = benefits */}
      {anchors.map((_, i) => (
        <group
          key={i}
          ref={(el) => void (platformRefs.current[i] = el)}
          onPointerOver={(e) => {
            e.stopPropagation();
            focusStore.set(`benefit-${i}`);
            setPointer(true);
          }}
          onPointerOut={() => {
            if (focusStore.get() === `benefit-${i}`) focusStore.set(null);
            setPointer(false);
          }}
        >
          <mesh geometry={hexGeo} material={platformMats[i]} />
          <lineSegments geometry={hexEdgeGeo} material={edgeMats[i]} />
          <Glow color={COLORS[i]} size={2.2} opacity={0.35} position={[0, 0.2, 0]} />
        </group>
      ))}
      <instancedMesh ref={city} args={[buildingGeo, buildingMat, buildings.length]} frustumCulled={false} />

      {/* Links and travelling energy */}
      {linkGeos.map((g, i) => (
        <lineSegments key={i} geometry={g} material={i < PLATFORMS ? coreLinkMat : ringLinkMat} />
      ))}
      <group ref={pulses}>
        {Array.from({ length: PLATFORMS * 3 }, (_, i) => (
          <Glow key={i} color={i < PLATFORMS * 2 ? '#d9d2ff' : '#7fe3ff'} size={0.4} opacity={0.95} />
        ))}
      </group>

      {/* Diffusion waves */}
      <group ref={waves} position={[0, 0.02, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.5, 0.012, 6, 128]} />
            <meshBasicMaterial color="#9fe9ff" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
