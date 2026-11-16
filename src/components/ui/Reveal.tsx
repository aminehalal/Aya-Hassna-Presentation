import { AnimatePresence, motion } from 'motion/react';
import type { CSSProperties, ReactNode } from 'react';
import { revealTransition, revealVariants } from '../../animations/motion';

interface RevealProps {
  children: ReactNode;
  show?: boolean;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  as?: 'div' | 'li' | 'p' | 'span';
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}

/** Progressive reveal that keeps its layout space (no jumping content). */
export function Reveal({ children, show = true, delay = 0, className, style, as = 'div', ...rest }: RevealProps) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      style={style}
      initial="hidden"
      animate={show ? 'visible' : 'hidden'}
      variants={revealVariants}
      transition={{ ...revealTransition, delay: show ? delay : 0 }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

interface StepSwapProps {
  /** Changing this key swaps the content with an exit/enter animation */
  swapKey: string | number;
  children: ReactNode;
  className?: string;
}

/** Swaps blocks of content in place, for slides whose steps replace each other. */
export function StepSwap({ swapKey, children, className }: StepSwapProps) {
  return (
    <div className={`relative ${className ?? ''}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={swapKey}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={revealVariants}
          transition={revealTransition}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
