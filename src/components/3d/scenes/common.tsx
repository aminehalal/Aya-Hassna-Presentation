import { forwardRef } from 'react';
import * as THREE from 'three';
import { getGlowTexture } from '../utils';

interface GlowProps {
  color?: THREE.ColorRepresentation;
  size?: number | [number, number];
  opacity?: number;
  position?: [number, number, number];
}

/** Additive glow sprite — the building block of the "light" in every scene. */
export const Glow = forwardRef<THREE.Sprite, GlowProps>(function Glow(
  { color = '#ffffff', size = 1, opacity = 1, position = [0, 0, 0] },
  ref,
) {
  const scale: [number, number, number] = Array.isArray(size) ? [size[0], size[1], 1] : [size, size, 1];
  return (
    <sprite ref={ref} position={position} scale={scale}>
      <spriteMaterial
        map={getGlowTexture()}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  );
});

/** Creates a glowing points material (caller owns disposal through useDisposable). */
export function makeGlowPointsMaterial(size: number, opacity = 1, color: THREE.ColorRepresentation = '#ffffff', vertexColors = true) {
  return new THREE.PointsMaterial({
    size,
    map: getGlowTexture(),
    color,
    vertexColors,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
}

/** Additive line material for luminous connections. */
export function makeLineMaterial(color: THREE.ColorRepresentation, opacity = 1, vertexColors = false) {
  return new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    vertexColors,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

/** Sets the pointer cursor while hovering interactive 3D objects. */
export function setPointer(active: boolean) {
  document.body.style.cursor = active ? 'pointer' : '';
}
