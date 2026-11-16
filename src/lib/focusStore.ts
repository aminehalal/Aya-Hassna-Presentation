import { useSyncExternalStore } from 'react';

/**
 * Tiny shared store linking DOM lists and 3D objects:
 * hovering a list item highlights the matching object in the scene
 * (and vice-versa). Works across the DOM and R3F renderers.
 */
type Listener = () => void;

let focused: string | null = null;
const listeners = new Set<Listener>();

export const focusStore = {
  get: () => focused,
  set(value: string | null) {
    if (value === focused) return;
    focused = value;
    listeners.forEach((l) => l());
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useFocused() {
  return useSyncExternalStore(focusStore.subscribe, focusStore.get, focusStore.get);
}

/** Props helper for DOM elements that should drive the focus store */
export function focusHandlers(key: string) {
  return {
    onPointerEnter: () => focusStore.set(key),
    onPointerLeave: () => focusStore.set(null),
  };
}
