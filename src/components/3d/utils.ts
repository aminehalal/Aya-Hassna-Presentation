import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from '../../animations/gsapPresets';
import { useSceneSettings } from './sceneSettings';

/* ------------------------------------------------------------------ */
/*  Shared glow texture (generated once, never re-uploaded)            */
/* ------------------------------------------------------------------ */

let glowTexture: THREE.CanvasTexture | null = null;

/** Soft radial sprite used for every glowing particle — no image assets needed. */
export function getGlowTexture() {
  if (glowTexture) return glowTexture;
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.18, 'rgba(255,255,255,0.85)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.22)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  glowTexture = new THREE.CanvasTexture(canvas);
  glowTexture.colorSpace = THREE.SRGBColorSpace;
  return glowTexture;
}

/* ------------------------------------------------------------------ */
/*  Resource lifetime                                                  */
/* ------------------------------------------------------------------ */

type Disposable = { dispose: () => void };

/**
 * useMemo for GPU resources created imperatively (geometries, materials):
 * they are disposed when the scene unmounts, preventing GPU memory leaks.
 */
export function useDisposable<T extends Disposable | Disposable[]>(factory: () => T, deps: unknown[] = []): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(factory, deps);
  useEffect(
    () => () => {
      if (Array.isArray(value)) value.forEach((v) => v.dispose());
      else value.dispose();
    },
    [value],
  );
  return value;
}

/* ------------------------------------------------------------------ */
/*  GSAP-driven animated values                                        */
/* ------------------------------------------------------------------ */

interface TweenOptions {
  duration?: number;
  ease?: string;
  delay?: number;
  /** Initial value on mount (defaults to the target, i.e. no entrance tween) */
  from?: number;
}

/**
 * Returns a mutable `{ value }` object tweened by GSAP whenever `target` changes.
 * Read `.value` inside useFrame — no React re-render per frame.
 */
export function useTweenedValue(target: number, { duration = 1.4, ease = 'power3.inOut', delay = 0, from }: TweenOptions = {}) {
  const { reducedMotion } = useSceneSettings();
  const ref = useRef<{ value: number } | null>(null);
  if (ref.current === null) ref.current = { value: from ?? target };
  const obj = ref.current;
  useEffect(() => {
    const tween = gsap.to(obj, {
      value: target,
      duration: reducedMotion ? Math.min(duration, 0.6) : duration,
      ease,
      delay: reducedMotion ? 0 : delay,
    });
    return () => {
      tween.kill();
    };
  }, [target, duration, ease, delay, reducedMotion, obj]);
  return obj;
}

/* ------------------------------------------------------------------ */
/*  Math helpers                                                       */
/* ------------------------------------------------------------------ */

/** Deterministic pseudo-random generator: scenes look identical at every rehearsal. */
export function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (v: number) => {
  const x = clamp01(v);
  return x * x * (3 - 2 * x);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Exponential damping, frame-rate independent */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  THREE.MathUtils.damp(current, target, lambda, dt);

/** Fibonacci sphere distribution */
export function fibonacciSphere(count: number, radius: number) {
  const points: THREE.Vector3[] = [];
  const offset = 2 / count;
  const increment = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = i * offset - 1 + offset / 2;
    const r = Math.sqrt(1 - y * y);
    const phi = i * increment;
    points.push(new THREE.Vector3(Math.cos(phi) * r * radius, y * radius, Math.sin(phi) * r * radius));
  }
  return points;
}
