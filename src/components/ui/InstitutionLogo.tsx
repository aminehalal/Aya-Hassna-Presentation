import { useState } from 'react';
import { presentationInfo } from '../../content/presentation';

interface InstitutionLogoProps {
  /** Logo height in stage pixels */
  height?: number;
  className?: string;
}

/**
 * Official EST Salé logo — transparent PNG, no background.
 * A faint light halo keeps the blue legible on dark scenes and projectors.
 * Renders nothing if the file is missing.
 */
export function InstitutionLogo({ height = 64, className = '' }: InstitutionLogoProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      src={presentationInfo.logo}
      alt={presentationInfo.institution}
      style={{ height }}
      className={`logo-img w-auto select-none object-contain ${className}`}
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
