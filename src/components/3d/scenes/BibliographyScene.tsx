import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useSceneSettings } from '../sceneSettings';
import { seededRandom, useDisposable } from '../utils';
import { Glow } from './common';

const PAGES = 34;

/**
 * Scene 13 — "La bibliothèque": quiet pages and volumes slowly orbiting in
 * the depth, kept far and dim so that the references stay perfectly legible.
 */
export function BibliographyScene() {
  const { reducedMotion } = useSceneSettings();
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const pages = useMemo(() => {
    const rand = seededRandom(2024);
    return Array.from({ length: PAGES }, (_, i) => ({
      angle: (i / PAGES) * Math.PI * 2 * 2.2,
      y: -4 + (i / PAGES) * 8,
      radius: 5.5 + rand() * 1.5,
      tilt: (rand() - 0.5) * 0.6,
      thickness: rand() > 0.6 ? 0.18 : 0.03,
    }));
  }, []);

  const geo = useDisposable(() => new THREE.BoxGeometry(0.9, 1.25, 1));
  const mat = useDisposable(
    () => new THREE.MeshStandardMaterial({ color: '#1d2756', emissive: '#2a3f8f', emissiveIntensity: 0.2, roughness: 0.6, metalness: 0.3 }),
  );

  useLayoutEffect(() => {
    const c = new THREE.Color();
    pages.forEach((_, i) => mesh.current?.setColorAt(i, c.set(i % 4 === 0 ? '#9aa8d6' : '#5d6aa8')));
    if (mesh.current?.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [pages]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    pages.forEach((p, i) => {
      dummy.position.set(Math.cos(p.angle) * p.radius, p.y + Math.sin(t * 0.3 + i) * 0.1, Math.sin(p.angle) * p.radius);
      dummy.rotation.set(p.tilt, -p.angle + Math.PI / 2, p.tilt * 0.5);
      dummy.scale.set(1, 1, p.thickness);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(i, dummy.matrix);
    });
    if (mesh.current) mesh.current.instanceMatrix.needsUpdate = true;
    if (group.current) group.current.rotation.y += dt * (reducedMotion ? 0.01 : 0.04);
  });

  return (
    <group position={[0, 0, -15]}>
      <Glow color="#3a4a9a" size={16} opacity={0.18} />
      <group ref={group}>
        <instancedMesh ref={mesh} args={[geo, mat, PAGES]} frustumCulled={false} />
      </group>
    </group>
  );
}
