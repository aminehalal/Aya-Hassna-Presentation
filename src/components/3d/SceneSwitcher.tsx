import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SCENE_ENTER_DURATION, SCENE_EXIT_DURATION, gsap } from '../../animations/gsapPresets';
import { slides } from '../../content/presentation';
import { sceneComponents } from './scenes';
import { useSceneSettings } from './sceneSettings';

interface Layer {
  key: number;
  index: number;
  mode: 'enter' | 'exit';
  direction: 1 | -1;
  /** Step frozen when the layer starts leaving */
  frozenStep?: number;
}



/**
 * Keeps only the active scene mounted (plus the outgoing one during the
 * ~1s depth transition). Unmounted scenes release their GPU resources.
 *
 * Forward: the old scene rushes past the camera while the new one emerges
 * from the fog. Backward: the movement is reversed.
 */
export function SceneSwitcher({ index, step, direction }: { index: number; step: number; direction: 1 | -1 }) {
  const nextKey = useRef(1);
  const [layers, setLayers] = useState<Layer[]>(() => [{ key: 0, index, mode: 'enter', direction }]);

  useEffect(() => {
    setLayers((prev) => {
      const current = prev.find((l) => l.mode === 'enter');
      if (current && current.index === index) return prev;
      const leaving: Layer[] = current
        ? [{ ...current, mode: 'exit', direction, frozenStep: leavingStep(current.index, direction) }]
        : [];
      // Older exiting layers are dropped immediately to keep at most two scenes alive.
      return [...leaving, { key: nextKey.current++, index, mode: 'enter', direction }];
    });
  }, [index, direction]);

  const remove = (key: number) => setLayers((prev) => prev.filter((l) => l.key !== key));

  return (
    <>
      {layers.map((layer) => (
        <SceneLayer
          key={layer.key}
          layer={layer}
          step={layer.mode === 'exit' ? (layer.frozenStep ?? 0) : step}
          onExited={() => remove(layer.key)}
        />
      ))}
    </>
  );
}

/** When moving forward the leaving scene was fully revealed; backward it was at step 0. */
function leavingStep(index: number, direction: 1 | -1) {
  return direction > 0 ? slides[index].steps - 1 : 0;
}

function SceneLayer({ layer, step, onExited }: { layer: Layer; step: number; onExited: () => void }) {
  const group = useRef<THREE.Group>(null);
  const { reducedMotion } = useSceneSettings();
  const Scene = sceneComponents[slides[layer.index].id];
  const onExitedRef = useRef(onExited);
  onExitedRef.current = onExited;

  useLayoutEffect(() => {
    const g = group.current;
    if (!g) return;
    const dir = layer.direction;
    const tweens: gsap.core.Tween[] = [];

    if (layer.mode === 'enter') {
      if (reducedMotion) {
        g.position.set(0, 0, -6);
        tweens.push(gsap.to(g.position, { z: 0, duration: 0.6, ease: 'power2.out' }));
      } else {
        g.position.set(0, dir > 0 ? -0.6 : 0.4, dir > 0 ? -26 : 7);
        g.rotation.set(0, dir * 0.28, dir * -0.05);
        tweens.push(
          gsap.to(g.position, { x: 0, y: 0, z: 0, duration: SCENE_ENTER_DURATION, ease: 'power3.out', delay: 0.12 }),
          gsap.to(g.rotation, { x: 0, y: 0, z: 0, duration: SCENE_ENTER_DURATION + 0.2, ease: 'power3.out', delay: 0.12 }),
        );
      }
    } else if (reducedMotion) {
      tweens.push(gsap.to(g.position, { z: -40, duration: 0.25, ease: 'power1.in', onComplete: () => onExitedRef.current() }));
    } else {
      tweens.push(
        gsap.to(g.position, {
          z: dir > 0 ? 13 : -30,
          y: dir > 0 ? 0.6 : -0.4,
          duration: SCENE_EXIT_DURATION,
          ease: 'power2.in',
          onComplete: () => onExitedRef.current(),
        }),
        gsap.to(g.rotation, { y: dir * -0.3, duration: SCENE_EXIT_DURATION, ease: 'power2.in' }),
      );
    }
    return () => tweens.forEach((t) => t.kill());
  }, [layer.mode, layer.direction, reducedMotion]);

  return (
    <group ref={group}>
      <Scene step={step} />
    </group>
  );
}
