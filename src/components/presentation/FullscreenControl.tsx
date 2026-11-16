import { Maximize, Minimize } from 'lucide-react';
import { NavigationButton } from '../ui/NavigationButton';

interface FullscreenControlProps {
  isFullscreen: boolean;
  onToggle: () => void;
  supported: boolean;
}

export function FullscreenControl({ isFullscreen, onToggle, supported }: FullscreenControlProps) {
  if (!supported) return null;
  return (
    <NavigationButton
      label={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
      shortcut="F"
      onClick={onToggle}
      active={isFullscreen}
    >
      {isFullscreen ? <Minimize size={19} /> : <Maximize size={19} />}
    </NavigationButton>
  );
}
