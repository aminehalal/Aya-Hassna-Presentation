import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useDisposable } from '../utils';
import { Glow } from './common';

/* ------------------------------------------------------------------ */
/*  Visual vocabulary shared by the scenes, tied to the topic:          */
/*  people (actors, teams), a light-bulb (idea / innovation) and a      */
/*  small tree (learning). The same symbols return from scene to scene. */
/* ------------------------------------------------------------------ */

/** Material whose emissive glow is tinted by each instance's colour. */
function makeInstanceGlowMaterial(emissiveIntensity: number, roughness = 0.45) {
  const mat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    emissive: '#ffffff',
    emissiveIntensity,
    roughness,
    metalness: 0.15,
    transparent: true,
  });
  mat.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
      #if defined( USE_INSTANCING_COLOR )
        totalEmissiveRadiance *= vColor.rgb;
      #endif`,
    );
  };
  return mat;
}

/* ------------------------------ People ------------------------------ */

export interface PeopleHandle {
  /** Places person i (feet at x, y, z), uniform scale s, facing angle rotY */
  set(i: number, x: number, y: number, z: number, s?: number, rotY?: number): void;
  color(i: number, c: THREE.ColorRepresentation): void;
  commit(): void;
  material: THREE.MeshStandardMaterial;
}

/** Stylised standing silhouette: rounded torso + head. Height ≈ 0.55 at scale 1. */
function usePersonGeometries() {
  return useDisposable(() => {
    const profile = [
      [0.0, 0.0],
      [0.13, 0.0],
      [0.155, 0.04],
      [0.16, 0.2],
      [0.135, 0.28],
      [0.07, 0.315],
      [0.0, 0.318],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    const body = new THREE.LatheGeometry(profile, 20);
    const head = new THREE.SphereGeometry(0.098, 18, 14);
    head.translate(0, 0.435, 0);
    return [body, head];
  });
}

interface PeopleProps {
  count: number;
  emissiveIntensity?: number;
}

/** Many people in two instanced draw calls (body + head). */
export const People = forwardRef<PeopleHandle, PeopleProps>(function People({ count, emissiveIntensity = 0.38 }, ref) {
  const [bodyGeo, headGeo] = usePersonGeometries();
  const material = useDisposable(() => makeInstanceGlowMaterial(emissiveIntensity), []);
  const body = useRef<THREE.InstancedMesh>(null);
  const head = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tmp = useMemo(() => new THREE.Color(), []);

  useImperativeHandle(
    ref,
    () => ({
      material,
      set(i, x, y, z, s = 1, rotY = 0) {
        dummy.position.set(x, y, z);
        dummy.rotation.set(0, rotY, 0);
        dummy.scale.setScalar(Math.max(0.0001, s));
        dummy.updateMatrix();
        body.current?.setMatrixAt(i, dummy.matrix);
        head.current?.setMatrixAt(i, dummy.matrix);
      },
      color(i, c) {
        tmp.set(c);
        body.current?.setColorAt(i, tmp);
        head.current?.setColorAt(i, tmp);
      },
      commit() {
        [body.current, head.current].forEach((m) => {
          if (!m) return;
          m.instanceMatrix.needsUpdate = true;
          if (m.instanceColor) m.instanceColor.needsUpdate = true;
        });
      },
    }),
    [material, dummy, tmp],
  );

  return (
    <>
      <instancedMesh ref={body} args={[bodyGeo, material, count]} frustumCulled={false} />
      <instancedMesh ref={head} args={[headGeo, material, count]} frustumCulled={false} />
    </>
  );
});

/** Height of a person's chest above its feet, at scale 1 (for drawing links). */
export const CHEST = 0.24;

/* ------------------------------ Light-bulb ------------------------------ */

/** Bulb silhouette (glass + neck), used by single bulbs and instanced bulbs. Height ≈ 0.62. */
export function useBulbGeometries() {
  return useDisposable(() => {
    const glassProfile: THREE.Vector2[] = [];
    // Neck up into a sphere-like glass
    glassProfile.push(new THREE.Vector2(0.085, 0.16));
    for (let i = 0; i <= 16; i++) {
      const a = -Math.PI * 0.32 + (i / 16) * Math.PI * 0.82;
      glassProfile.push(new THREE.Vector2(Math.cos(a) * 0.2, 0.36 + Math.sin(a) * 0.2));
    }
    glassProfile.push(new THREE.Vector2(0, 0.585));
    const glass = new THREE.LatheGeometry(glassProfile, 22);
    const base = new THREE.CylinderGeometry(0.085, 0.07, 0.16, 14, 3);
    base.translate(0, 0.08, 0);
    return [glass, base];
  });
}

/** A single glowing light-bulb (idea). */
export function Bulb({ color = '#ffd27a', glow = 1, scale = 1, position = [0, 0, 0] as [number, number, number] }) {
  const [glass, base] = useBulbGeometries();
  return (
    <group position={position} scale={scale}>
      <mesh geometry={glass}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9 * glow} roughness={0.1} transparent opacity={0.9} />
      </mesh>
      <mesh geometry={base}>
        <meshStandardMaterial color="#9aa4c4" metalness={0.8} roughness={0.35} />
      </mesh>
      <Glow color={color} size={1.5} opacity={0.4 * glow} position={[0, 0.38, 0]} />
    </group>
  );
}

/* ------------------------------ Mini tree ------------------------------ */

/** Small stylised knowledge tree (learning), echoing the scene-08 tree. */
export function MiniTree({ color = '#3fe0c5', scale = 1, position = [0, 0, 0] as [number, number, number] }) {
  const { branches, leaves } = useMemo(() => {
    const up = new THREE.Vector3(0, 1, 0);
    const list: { pos: THREE.Vector3; quat: THREE.Quaternion; len: number; r: number }[] = [];
    const tips: THREE.Vector3[] = [];
    const grow = (start: THREE.Vector3, dir: THREE.Vector3, len: number, depth: number) => {
      list.push({ pos: start.clone(), quat: new THREE.Quaternion().setFromUnitVectors(up, dir), len, r: 0.085 * Math.pow(0.7, depth) });
      const end = start.clone().addScaledVector(dir, len);
      if (depth === 3) {
        tips.push(end);
        return;
      }
      // Two branches splaying to opposite sides, in a plane that turns at each level
      const axis = new THREE.Vector3(Math.cos(depth * 1.3), 0, Math.sin(depth * 1.3));
      [-1, 1].forEach((side) => {
        grow(end, dir.clone().applyAxisAngle(axis, 0.6 * side).normalize(), len * 0.74, depth + 1);
      });
    };
    grow(new THREE.Vector3(0, 0, 0), up.clone(), 0.42, 0);
    return { branches: list, leaves: tips };
  }, []);
  const branchGeo = useDisposable(() => {
    const g = new THREE.CylinderGeometry(0.7, 1, 1, 6);
    g.translate(0, 0.5, 0);
    return g;
  });
  return (
    <group position={position} scale={scale}>
      {branches.map((b, i) => (
        <mesh key={i} geometry={branchGeo} position={b.pos} quaternion={b.quat} scale={[b.r, b.len, b.r]}>
          <meshStandardMaterial color="#1f5d66" emissive={color} emissiveIntensity={0.5} />
        </mesh>
      ))}
      {leaves.map((p, i) => (
        <mesh key={`l${i}`} position={p}>
          <icosahedronGeometry args={[0.085, 1]} />
          <meshBasicMaterial color="#d4fff6" toneMapped={false} />
        </mesh>
      ))}
      <Glow color={color} size={1.8} opacity={0.4} position={[0, 0.7, 0]} />
    </group>
  );
}

/** Instanced-friendly glow material helper for bulbs (tinted by instance colour). */
export function makeBulbGlassMaterial() {
  const mat = makeInstanceGlowMaterial(0.8, 0.1);
  mat.opacity = 0.95;
  return mat;
}
