import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * Global lighting rig: cool key light, violet and cyan rims, plus an
 * accent light whose colour follows the current scene.
 */
export function SceneLighting({ accent }: { accent: string }) {
  const accentLight = useRef<THREE.PointLight>(null);
  const target = useMemo(() => new THREE.Color(accent), [accent]);

  useFrame((_, dt) => {
    accentLight.current?.color.lerp(target, Math.min(1, dt * 1.8));
  });

  return (
    <>
      <ambientLight intensity={0.25} color="#8fa4ff" />
      <hemisphereLight args={['#6f8cff', '#05070f', 0.55]} />
      <directionalLight position={[5, 8, 6]} intensity={1.3} color="#dfe8ff" />
      <pointLight position={[-7, 3, 4]} intensity={40} distance={30} decay={1.6} color="#8b5cf6" />
      <pointLight position={[7, -3, 3]} intensity={36} distance={30} decay={1.6} color="#22d3ee" />
      <pointLight ref={accentLight} position={[2, 2, 7]} intensity={30} distance={26} decay={1.6} color={accent} />
    </>
  );
}
