import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CAMERA_DURATION, gsap } from '../../animations/gsapPresets';
import { slides } from '../../content/presentation';
import type { CameraPose } from '../../content/types';
import { useSceneSettings } from './sceneSettings';
import { damp } from './utils';

const BASE_FOV = 40;
const STAGE_ASPECT = 16 / 9;
const DEFAULT_POSE: CameraPose = { position: [0, 0, 11], target: [0, 0, 0] };

/**
 * Cinematic camera: GSAP choreographs the pose for each slide/step,
 * while a subtle breathing drift and pointer parallax add life.
 * The FOV is widened on narrow screens so the 3D composition always
 * matches the 16:9 text stage.
 */
export function CameraController({ index, step }: { index: number; step: number }) {
  const { reducedMotion } = useSceneSettings();
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const basePos = useRef(new THREE.Vector3(0, 0, 22));
  const baseTarget = useRef(new THREE.Vector3(0, 0, 0));
  const parallax = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const poses = slides[index].camera;
    const pose = poses?.[Math.min(step, poses.length - 1)] ?? DEFAULT_POSE;
    const duration = reducedMotion ? 0.6 : CAMERA_DURATION;
    const ease = 'power3.inOut';
    const [px, py, pz] = pose.position;
    const [tx, ty, tz] = pose.target;
    const t1 = gsap.to(basePos.current, { x: px, y: py, z: pz, duration, ease });
    const t2 = gsap.to(baseTarget.current, { x: tx, y: ty, z: tz, duration, ease });
    return () => {
      t1.kill();
      t2.kill();
    };
  }, [index, step, reducedMotion]);

  useFrame((state, dt) => {
    const aspect = state.size.width / Math.max(1, state.size.height);
    const fov =
      aspect < STAGE_ASPECT
        ? THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(BASE_FOV / 2)) * (STAGE_ASPECT / aspect)))
        : BASE_FOV;
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    const t = state.clock.elapsedTime;
    const motion = reducedMotion ? 0 : 1;
    parallax.current.x = damp(parallax.current.x, state.pointer.x * 0.32 * motion, 1.6, dt);
    parallax.current.y = damp(parallax.current.y, state.pointer.y * 0.2 * motion, 1.6, dt);

    camera.position.set(
      basePos.current.x + parallax.current.x + Math.sin(t * 0.13) * 0.12 * motion,
      basePos.current.y + parallax.current.y + Math.cos(t * 0.11) * 0.08 * motion,
      basePos.current.z,
    );
    camera.lookAt(baseTarget.current);
  });

  return null;
}
