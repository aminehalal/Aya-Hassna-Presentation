import type { CSSProperties, ReactNode } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Thin accent line on the left edge */
  accent?: boolean;
}

/** Selective glassmorphism — used sparingly for key statements only. */
export function GlassPanel({ children, className = '', style, accent = false }: GlassPanelProps) {
  return (
    <div className={`glass relative overflow-hidden rounded-[28px] ${className}`} style={style}>
      {accent && (
        <span
          aria-hidden
          className="absolute bottom-6 left-0 top-6 w-[3px] rounded-full"
          style={{ background: 'linear-gradient(180deg, var(--accent), transparent)' }}
        />
      )}
      {children}
    </div>
  );
}
