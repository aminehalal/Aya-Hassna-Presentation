import { useEffect, useRef, useSyncExternalStore } from 'react';
import { slides } from '../content/presentation';
import { sound } from '../lib/sound';

/** Current on/off state of the sound design (shared between windows). */
export function useSoundEnabled() {
  return useSyncExternalStore(
    (cb) => sound.subscribe(cb),
    () => sound.enabled,
    () => sound.enabled,
  );
}

/**
 * Plays the sounds when the position changes: a warp + chord bloom between
 * slides, and a cue timed to the 3D animation for each step inside a slide.
 *
 * Only the focused window plays, so the audience window and the presenter
 * window never sound twice — and the focused one is the one that received
 * the user gesture browsers require for audio.
 */
export function useTransitionSound(index: number, step: number, direction: 1 | -1) {
  const previous = useRef<{ index: number; step: number } | null>(null);

  useEffect(() => {
    const unlock = () => sound.unlock();
    window.addEventListener('keydown', unlock, { capture: true });
    window.addEventListener('pointerdown', unlock, { capture: true });
    return () => {
      window.removeEventListener('keydown', unlock, { capture: true });
      window.removeEventListener('pointerdown', unlock, { capture: true });
    };
  }, []);

  useEffect(() => {
    const prev = previous.current;
    previous.current = { index, step };
    if (!prev || !document.hasFocus()) return;
    if (prev.index !== index) {
      sound.transition(direction, index);
    } else if (step > prev.step) {
      const cue = slides[index].soundCues?.[step];
      if (cue) sound.morph(index, step, cue);
      else sound.reveal(index, step);
    } else if (step < prev.step) {
      sound.tick();
    }
  }, [index, step, direction]);
}
