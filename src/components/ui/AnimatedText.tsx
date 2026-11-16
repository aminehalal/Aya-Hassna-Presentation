import { motion } from 'motion/react';
import type { CSSProperties } from 'react';
import { EASE_OUT } from '../../animations/motion';

interface AnimatedTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  className?: string;
  style?: CSSProperties;
  /** Seconds before the first word starts */
  delay?: number;
  /** Seconds between words */
  stagger?: number;
  /** When false, the text stays hidden (used for progressive reveals) */
  show?: boolean;
  /** Extra classes applied to each word (e.g. gradient text) */
  wordClassName?: string;
}

const NBSP = ' ';

/**
 * Cinematic title reveal: each word slides up from behind a mask.
 * Words are inline-blocks so French line-breaking stays natural.
 */
export function AnimatedText({
  text,
  as = 'h2',
  className,
  style,
  delay = 0,
  stagger = 0.055,
  show = true,
  wordClassName = '',
}: AnimatedTextProps) {
  const Tag = motion[as];
  const words = text.split(' ');
  return (
    <Tag
      className={className}
      style={style}
      initial="hidden"
      animate={show ? 'visible' : 'hidden'}
      aria-label={text}
      variants={{ visible: { transition: { staggerChildren: stagger, delayChildren: delay } }, hidden: {} }}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`} aria-hidden className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-top">
          <motion.span
            className={`inline-block ${wordClassName}`}
            variants={{
              hidden: { y: '108%', opacity: 0 },
              visible: { y: '0%', opacity: 1, transition: { duration: 0.9, ease: EASE_OUT } },
            }}
          >
            {word}
            {i < words.length - 1 ? NBSP : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
