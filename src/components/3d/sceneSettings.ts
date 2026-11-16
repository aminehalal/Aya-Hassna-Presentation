import { createContext, useContext } from 'react';

export interface SceneSettings {
  reducedMotion: boolean;
  /** 'high' on capable GPUs, 'low' after the performance monitor detects drops */
  quality: 'high' | 'low';
}

export const SceneSettingsContext = createContext<SceneSettings>({ reducedMotion: false, quality: 'high' });

export const useSceneSettings = () => useContext(SceneSettingsContext);

/** Common props received by every 3D scene */
export interface SceneProps {
  step: number;
}
