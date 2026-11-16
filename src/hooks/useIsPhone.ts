import { useEffect, useState } from 'react';

/**
 * True on phones: a touch-first device whose smallest screen side is under
 * 768 px (tablets and laptops are excluded). Re-evaluated on rotation.
 */
function detectPhone() {
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const shortSide = Math.min(window.screen.width, window.screen.height);
  return coarse && shortSide < 768;
}

export function useIsPhone() {
  const [isPhone, setIsPhone] = useState(detectPhone);
  useEffect(() => {
    const update = () => setIsPhone(detectPhone());
    window.addEventListener('orientationchange', update);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('orientationchange', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return isPhone;
}
