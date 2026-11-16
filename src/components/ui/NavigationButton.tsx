import type { ReactNode } from 'react';

interface NavigationButtonProps {
  label: string;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  active?: boolean;
  shortcut?: string;
  size?: 'md' | 'lg';
}

export function NavigationButton({ label, onClick, children, disabled, active, shortcut, size = 'md' }: NavigationButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={shortcut ? `${label} (${shortcut})` : label}
      title={shortcut ? `${label} — ${shortcut}` : label}
      className={[
        'group relative grid place-items-center rounded-full border transition-all duration-300',
        size === 'lg' ? 'h-14 w-14' : 'h-11 w-11',
        'border-white/15 bg-ink-900/60 text-white/80 backdrop-blur-md',
        'hover:scale-105 hover:border-[color:var(--accent)] hover:bg-white/10 hover:text-white hover:shadow-[0_0_26px_-4px_var(--accent)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]',
        'disabled:pointer-events-none disabled:opacity-30',
        active ? 'border-[color:var(--accent)] bg-white/10 text-white' : '',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
