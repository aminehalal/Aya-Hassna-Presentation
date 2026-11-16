import { PerformanceMonitor } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useMemo, useState } from 'react';
import * as THREE from 'three';
import { slides } from '../../content/presentation';
import { CameraController } from './CameraController';
import { Nebula, ParticleSystem } from './ParticleSystem';
import { SceneLighting } from './SceneLighting';
import { SceneSettingsContext, type SceneSettings } from './sceneSettings';
import { SceneSwitcher } from './SceneSwitcher';

interface SceneCanvasProps {
  index: number;
  step: number;
  direction: 1 | -1;
  reducedMotion: boolean;
}

const BACKGROUND = '#03050b';

/**
 * Single persistent WebGL canvas for the whole presentation.
 * Adaptive quality: the device pixel ratio and particle budgets drop
 * automatically if the frame rate degrades (e.g. on a classroom laptop).
 */
export default function SceneCanvas({ index, step, direction, reducedMotion }: SceneCanvasProps) {
  const [quality, setQuality] = useState<SceneSettings['quality']>('high');
  const [dpr, setDpr] = useState(() => Math.min(1.75, window.devicePixelRatio || 1));
  const settings = useMemo(() => ({ reducedMotion, quality }), [reducedMotion, quality]);
  const accent = slides[index].accent;
  const eventSource = useMemo(() => document.getElementById('root') ?? undefined, []);

  return (
    <Canvas
      dpr={dpr}
      eventSource={eventSource}
      eventPrefix="client"
      camera={{ fov: 40, near: 0.1, far: 140, position: [0, 0, 22] }}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: false, stencil: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <SceneSettingsContext.Provider value={settings}>
        <color attach="background" args={[BACKGROUND]} />
        <fog attach="fog" args={[BACKGROUND, 14, 40]} />
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => {
            setDpr(1);
            setQuality('low');
          }}
          onIncline={() => setDpr((d) => Math.min(1.5, Math.max(d, 1.25)))}
          onFallback={() => {
            setDpr(1);
            setQuality('low');
          }}
        />
        <CameraController index={index} step={step} />
        <SceneLighting accent={accent} />
        <Nebula accent={accent} />
        <ParticleSystem accent={accent} index={index} direction={direction} />
        <SceneSwitcher index={index} step={step} direction={direction} />
      </SceneSettingsContext.Provider>
    </Canvas>
  );
}
