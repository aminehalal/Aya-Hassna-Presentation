import type { ReactNode } from 'react';
import { focusHandlers, useFocused } from '../../lib/focusStore';
import { Reveal } from './Reveal';

interface IndexedItemProps {
  index: number;
  label: string;
  text?: string;
  show?: boolean;
  /** Visually emphasised (current step) */
  active?: boolean;
  /** Dimmed (already discussed / not current) */
  dimmed?: boolean;
  delay?: number;
  /** Links the item with a 3D object through the focus store */
  focusKey?: string;
  color?: string;
  size?: 'lg' | 'md';
}

/**
 * Numbered item used across slides: big index, strong label, short text.
 * Hovering it highlights the matching 3D object when `focusKey` is given.
 */
export function IndexedItem({
  index,
  label,
  text,
  show = true,
  active = false,
  dimmed = false,
  delay = 0,
  focusKey,
  color,
  size = 'md',
}: IndexedItemProps) {
  const focused = useFocused();
  const isFocused = focusKey !== undefined && focused === focusKey;
  const accent = color ?? 'var(--accent)';
  const emphasised = active || isFocused;

  return (
    <Reveal
      show={show}
      delay={delay}
      className={`group relative flex gap-6 transition-opacity duration-500 ${dimmed && !isFocused ? 'opacity-45' : 'opacity-100'} ${
        focusKey ? 'cursor-default' : ''
      }`}
      {...(focusKey ? focusHandlers(focusKey) : {})}
    >
      <span
        className="mt-[6px] w-[52px] flex-none font-display text-[26px] font-medium tabular-nums transition-colors duration-500"
        style={{ color: emphasised ? accent : 'rgba(201,214,242,0.55)' }}
      >
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="relative min-w-0 flex-1">
        <span
          aria-hidden
          className="absolute -left-[16px] top-[10px] h-[calc(100%-14px)] w-[3px] rounded-full transition-all duration-500"
          style={{ background: accent, opacity: emphasised ? 1 : 0, boxShadow: emphasised ? `0 0 14px ${accent}` : 'none' }}
        />
        <div
          className={`font-display font-semibold leading-tight text-white ${size === 'lg' ? 'text-[40px]' : 'text-[33px]'}`}
          style={{ color: emphasised ? '#ffffff' : undefined }}
        >
          {label}
        </div>
        {text && <p className={`mt-1 leading-snug text-mist ${size === 'lg' ? 'text-[29px]' : 'text-[27px]'}`}>{text}</p>}
      </div>
    </Reveal>
  );
}

/** Rounded tag for short keywords */
export function Chip({ children, delay = 0, show = true }: { children: ReactNode; delay?: number; show?: boolean }) {
  return (
    <Reveal
      as="span"
      show={show}
      delay={delay}
      className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.05] px-6 py-2.5 font-display text-[26px] text-white backdrop-blur-sm"
    >
      <span className="mr-3 h-2 w-2 rounded-full" style={{ background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }} />
      {children}
    </Reveal>
  );
}

/** Quotation / source line */
export function SourceLine({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`font-display text-[24px] tracking-wide text-mute ${className}`}>{children}</div>;
}
