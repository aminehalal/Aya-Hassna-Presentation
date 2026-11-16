import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import { slides, totalSlides } from '../../content/presentation';
import type { SlideMeta } from '../../content/types';

export interface NavState {
  index: number;
  step: number;
  /** +1 when moving forward, -1 backward — drives transition direction */
  direction: 1 | -1;
}

type NavAction =
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'goto'; index: number; step?: number };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const lastStep = (index: number) => Math.max(0, slides[index].steps - 1);

function navReducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case 'next': {
      if (state.step < lastStep(state.index)) return { ...state, step: state.step + 1, direction: 1 };
      if (state.index < totalSlides - 1) return { index: state.index + 1, step: 0, direction: 1 };
      return state;
    }
    case 'prev': {
      if (state.step > 0) return { ...state, step: state.step - 1, direction: -1 };
      // Going back lands on the previous slide fully revealed.
      if (state.index > 0) return { index: state.index - 1, step: lastStep(state.index - 1), direction: -1 };
      return state;
    }
    case 'goto': {
      const index = clamp(action.index, 0, totalSlides - 1);
      const step = clamp(action.step ?? 0, 0, lastStep(index));
      if (index === state.index && step === state.step) return state;
      return { index, step, direction: index >= state.index ? 1 : -1 };
    }
  }
}

function readHash(): NavState {
  const match = window.location.hash.match(/^#\/(\d+)(?:\/(\d+))?/);
  if (!match) return { index: 0, step: 0, direction: 1 };
  const index = clamp(Number(match[1]) - 1, 0, totalSlides - 1);
  const step = clamp(Number(match[2] ?? 1) - 1, 0, lastStep(index));
  return { index, step, direction: 1 };
}

interface PresentationContextValue extends NavState {
  slide: SlideMeta;
  total: number;
  next: () => void;
  prev: () => void;
  goTo: (index: number, step?: number) => void;
}

const PresentationContext = createContext<PresentationContextValue | null>(null);

/** Minimal delay between two *slide* changes: protects against double clicks of USB remotes. */
const SLIDE_CHANGE_GUARD_MS = 380;

export function PresentationProvider({ children, syncHash = true }: { children: ReactNode; syncHash?: boolean }) {
  const [state, dispatch] = useReducer(navReducer, undefined, readHash);
  const stateRef = useRef(state);
  stateRef.current = state;
  const lastSlideChange = useRef(0);

  const guarded = useCallback((action: NavAction) => {
    const s = stateRef.current;
    const changesSlide =
      (action.type === 'next' && s.step >= lastStep(s.index)) ||
      (action.type === 'prev' && s.step === 0) ||
      (action.type === 'goto' && action.index !== s.index);
    if (changesSlide) {
      const now = performance.now();
      if (now - lastSlideChange.current < SLIDE_CHANGE_GUARD_MS) return;
      lastSlideChange.current = now;
    }
    dispatch(action);
  }, []);

  const next = useCallback(() => guarded({ type: 'next' }), [guarded]);
  const prev = useCallback(() => guarded({ type: 'prev' }), [guarded]);
  const goTo = useCallback((index: number, step?: number) => guarded({ type: 'goto', index, step }), [guarded]);

  // Allow direct links (#/5/2) and manual URL edits.
  useEffect(() => {
    if (!syncHash) return;
    const onHash = () => {
      const target = readHash();
      dispatch({ type: 'goto', index: target.index, step: target.step });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [syncHash]);

  // Keep the URL in sync so a refresh keeps the current position.
  useEffect(() => {
    if (!syncHash) return;
    const hash = `#/${state.index + 1}/${state.step + 1}`;
    if (window.location.hash !== hash) window.history.replaceState(null, '', hash);
  }, [state.index, state.step, syncHash]);

  const value = useMemo<PresentationContextValue>(
    () => ({ ...state, slide: slides[state.index], total: totalSlides, next, prev, goTo }),
    [state, next, prev, goTo],
  );

  return <PresentationContext.Provider value={value}>{children}</PresentationContext.Provider>;
}

export function usePresentation() {
  const ctx = useContext(PresentationContext);
  if (!ctx) throw new Error('usePresentation must be used inside <PresentationProvider>');
  return ctx;
}
