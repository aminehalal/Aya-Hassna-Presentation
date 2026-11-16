import gsap from 'gsap';

/** Durations (seconds) used by the 3D scene transitions — kept within 0.5s–1.2s. */
export const SCENE_ENTER_DURATION = 1.15;
export const SCENE_EXIT_DURATION = 0.85;
export const CAMERA_DURATION = 1.5;

gsap.defaults({ overwrite: 'auto' });
// Keep timelines in real time even if a frame is dropped (slow laptop, projector
// switch): a transition must never "hang" in front of the audience.
gsap.ticker.lagSmoothing(0);

export { gsap };
