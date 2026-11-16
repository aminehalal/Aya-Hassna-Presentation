import { useCallback, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';
const STORAGE_KEY = 'est-presentation-theme';

function readTheme(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

/**
 * Dark (default) or light presentation theme.
 *
 * Light mode is rendered as a colour-preserving inversion of the whole stage
 * (see `html[data-theme='light']` in styles/index.css): every scene, scrim and
 * accent keeps its hue and its contrast, so all 14 scenes work in both modes
 * without a second set of colours. The logo and the black screen are
 * counter-inverted to keep their true colours.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* not persisted in private mode */
    }
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);
  return { theme, toggle };
}
