import type { Transition, Variants } from 'motion/react';

/** Shared easing curves — cinematic "expo out" feel. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const revealTransition: Transition = { duration: 0.8, ease: EASE_OUT };

/** Item that rises out of a soft blur. */
export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 26, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -14, filter: 'blur(6px)', transition: { duration: 0.35, ease: EASE_IN_OUT } },
};

/** Whole-slide wrapper: enters after the 3D transition has started. */
export const slideVariants: Variants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.5, delay: 0.25 } },
  exit: { opacity: 0, filter: 'blur(10px)', transition: { duration: 0.38, ease: EASE_IN_OUT } },
};
