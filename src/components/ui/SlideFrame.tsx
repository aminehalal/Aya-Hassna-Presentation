import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { EASE_OUT } from '../../animations/motion';

type Scrim = 'left' | 'top' | 'bottom' | 'center' | 'none';

const scrims: Record<Scrim, string> = {
  left: 'linear-gradient(90deg, rgba(3,5,11,0.9) 0%, rgba(3,5,11,0.66) 36%, rgba(3,5,11,0) 64%)',
  top: 'linear-gradient(180deg, rgba(3,5,11,0.86) 0%, rgba(3,5,11,0.48) 42%, rgba(3,5,11,0) 64%)',
  bottom: 'linear-gradient(0deg, rgba(3,5,11,0.9) 0%, rgba(3,5,11,0.5) 38%, rgba(3,5,11,0) 64%)',
  center: 'radial-gradient(ellipse 62% 58% at 50% 50%, rgba(3,5,11,0.74) 0%, rgba(3,5,11,0.3) 60%, rgba(3,5,11,0) 100%)',
  none: 'none',
};

interface SlideFrameProps {
  children: ReactNode;
  kicker?: string;
  scrim?: Scrim;
  className?: string;
}

/** Common slide canvas: readable scrim over the 3D scene + section kicker. */
export function SlideFrame({ children, kicker, scrim = 'left', className = '' }: SlideFrameProps) {
  return (
    <div className="absolute inset-0">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: scrims[scrim] }} />
      <div className={`relative h-full w-full px-[120px] pb-[110px] pt-[92px] ${className}`}>
        {kicker && <Kicker text={kicker} />}
        {children}
      </div>
    </div>
  );
}

export function Kicker({ text, delay = 0.1 }: { text: string; delay?: number }) {
  return (
    <motion.div
      className="mb-6 flex items-center gap-5 font-display text-[23px] font-medium uppercase tracking-[0.22em] text-mist/90"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay, ease: EASE_OUT }}
    >
      <span className="hairline h-[2px] w-16" />
      {text}
    </motion.div>
  );
}

/** Small uppercase label above a group of items */
export function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`font-display text-[24px] font-semibold uppercase tracking-[0.18em] text-[color:var(--accent)] ${className}`}>
      {children}
    </div>
  );
}

/** Large editorial slide title (word-by-word reveal) */
export function SlideTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`font-display text-[84px] font-semibold leading-[1.02] tracking-[-0.025em] text-white text-glow ${className}`}>{children}</div>;
}
