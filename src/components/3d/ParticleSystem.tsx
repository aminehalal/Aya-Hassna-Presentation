import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from '../../animations/gsapPresets';
import { useSceneSettings } from './sceneSettings';
import { getGlowTexture, seededRandom, useDisposable } from './utils';

const BOUNDS = { x: 34, y: 20, zNear: 14, zFar: -46 };

/**
 * Persistent atmospheric dust shared by every scene.
 * On each slide change it performs a short "warp" along the depth axis
 * and its tint glides toward the new scene's accent colour.
 */
export function ParticleSystem({ accent, index, direction }: { accent: string; index: number; direction: 1 | -1 }) {
  const { quality, reducedMotion } = useSceneSettings();
  const count = quality === 'high' ? 1800 : 900;
  const points = useRef<THREE.Points>(null);
  const warp = useRef({ value: 0 });
  const tint = useMemo(() => new THREE.Color(accent), [accent]);

  const geometry = useDisposable(() => {
    const rand = seededRandom(7);
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const base = new THREE.Color();
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rand() - 0.5) * BOUNDS.x * 2;
      positions[i * 3 + 1] = (rand() - 0.5) * BOUNDS.y * 2;
      positions[i * 3 + 2] = BOUNDS.zFar + rand() * (BOUNDS.zNear - BOUNDS.zFar);
      speeds[i] = 0.25 + rand() * 0.75;
      base.setHSL(0.6 + rand() * 0.12, 0.6, 0.65 + rand() * 0.25);
      colors.set([base.r, base.g, base.b], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.userData.speeds = speeds;
    return geo;
  }, [count]);

  const material = useDisposable(
    () =>
      new THREE.PointsMaterial({
        size: 0.16,
        map: getGlowTexture(),
        vertexColors: true,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        color: new THREE.Color(accent),
      }),
    [],
  );

  // Warp pulse on every slide change
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reducedMotion) return;
    const tl = gsap.timeline();
    tl.to(warp.current, { value: direction * 1, duration: 0.45, ease: 'power2.in' }).to(warp.current, {
      value: 0,
      duration: 0.9,
      ease: 'power3.out',
    });
    return () => {
      tl.kill();
    };
  }, [index, direction, reducedMotion]);

  useFrame((_, dt) => {
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const speeds = geometry.userData.speeds as Float32Array;
    const drift = reducedMotion ? 0.05 : 0.22;
    const zSpeed = drift + warp.current.value * 38;
    const span = BOUNDS.zNear - BOUNDS.zFar;
    for (let i = 0; i < count; i++) {
      const iz = i * 3 + 2;
      arr[iz] += zSpeed * speeds[i] * dt;
      arr[i * 3 + 1] += Math.sin(arr[iz] * 0.15 + i) * 0.002 * (reducedMotion ? 0 : 1);
      if (arr[iz] > BOUNDS.zNear) arr[iz] -= span;
      else if (arr[iz] < BOUNDS.zFar) arr[iz] += span;
    }
    pos.needsUpdate = true;
    material.color.lerp(tint, Math.min(1, dt * 1.5));
    material.size = 0.16 + Math.abs(warp.current.value) * 0.1;
  });

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />;
}

/** Large, very soft colour clouds far behind every scene — a cheap volumetric feel. */
export function Nebula({ accent }: { accent: string }) {
  const group = useRef<THREE.Group>(null);
  const accentSprite = useRef<THREE.SpriteMaterial>(null);
  const target = useMemo(() => new THREE.Color(accent), [accent]);
  const { reducedMotion } = useSceneSettings();

  useFrame((state, dt) => {
    if (group.current && !reducedMotion) group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.02) * 0.15;
    accentSprite.current?.color.lerp(target, Math.min(1, dt * 1.2));
  });

  const map = getGlowTexture();
  return (
    <group ref={group} position={[0, 0, -34]}>
      <sprite position={[9, 4, 0]} scale={[46, 34, 1]}>
        <spriteMaterial ref={accentSprite} map={map} color={accent} transparent opacity={0.16} depthWrite={false} fog={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite position={[-14, -6, -4]} scale={[50, 36, 1]}>
        <spriteMaterial map={map} color="#3b2a9a" transparent opacity={0.22} depthWrite={false} fog={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite position={[-4, 10, -6]} scale={[40, 26, 1]}>
        <spriteMaterial map={map} color="#123a8a" transparent opacity={0.2} depthWrite={false} fog={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}
