import { useState } from 'react';

function detectWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    const ok = Boolean(gl);
    (gl as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext();
    return ok;
  } catch {
    return false;
  }
}

/** Detects WebGL once. `?3d=off` in the URL forces the lightweight fallback. */
export function useWebGLSupport() {
  const [supported] = useState(() => {
    const forcedOff = new URLSearchParams(window.location.search).get('3d') === 'off';
    return !forcedOff && detectWebGL();
  });
  return supported;
}
