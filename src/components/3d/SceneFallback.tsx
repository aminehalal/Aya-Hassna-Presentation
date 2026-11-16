import { Component, type ReactNode } from 'react';

/**
 * Lightweight CSS atmosphere used while the 3D bundle loads, when WebGL is
 * unavailable, or if the 3D renderer fails. The presentation stays fully usable.
 */
export function SceneFallback({ accent }: { accent: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-ink-950" aria-hidden>
      <div
        className="absolute inset-0 transition-[background] duration-1000"
        style={{
          background: `radial-gradient(ellipse 55% 60% at 70% 45%, ${accent}38 0%, transparent 65%),
                       radial-gradient(ellipse 50% 50% at 15% 85%, #3b2a8a30 0%, transparent 70%),
                       linear-gradient(180deg, #060914 0%, #03050b 100%)`,
        }}
      />
      <div className="fallback-stars absolute inset-0 opacity-70" />
    </div>
  );
}

interface BoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

export class SceneErrorBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('[3D] Scène désactivée, passage au mode léger :', error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
