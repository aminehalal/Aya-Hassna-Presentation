import { ChevronLeft, ChevronRight, CircleHelp, LayoutGrid, Moon, MonitorUp, NotebookPen, Sun, Volume2, VolumeX } from 'lucide-react';
import { NavigationButton } from '../ui/NavigationButton';
import { FullscreenControl } from './FullscreenControl';
import { SlideCounter } from './ProgressIndicator';
import { usePresentation } from './PresentationContext';

interface SlideNavigationProps {
  idle: boolean;
  overviewOpen: boolean;
  notesOpen: boolean;
  helpOpen: boolean;
  isFullscreen: boolean;
  fullscreenSupported: boolean;
  onToggleOverview: () => void;
  onToggleNotes: () => void;
  onToggleHelp: () => void;
  onToggleFullscreen: () => void;
  onOpenPresenter: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

/** On-screen controls. They fade out when the pointer is idle so the audience sees only the slide. */
export function SlideNavigation(props: SlideNavigationProps) {
  const { next, prev, index, step, total } = usePresentation();
  const atStart = index === 0 && step === 0;
  const atEnd = index === total - 1;
  const hidden = props.idle && !props.overviewOpen && !props.notesOpen;

  return (
    <>
      {/* Tools — top right */}
      <div
        className={`pointer-events-auto absolute right-6 top-6 z-30 flex items-center gap-2 transition-all duration-700 ${
          hidden ? 'pointer-events-none -translate-y-2 opacity-0' : 'opacity-100'
        }`}
      >
        <NavigationButton label="Vue d'ensemble" shortcut="O" onClick={props.onToggleOverview} active={props.overviewOpen}>
          <LayoutGrid size={19} />
        </NavigationButton>
        <NavigationButton label="Notes de présentation" shortcut="N" onClick={props.onToggleNotes} active={props.notesOpen}>
          <NotebookPen size={19} />
        </NavigationButton>
        <NavigationButton label="Vue présentateur (fenêtre séparée)" shortcut="P" onClick={props.onOpenPresenter}>
          <MonitorUp size={19} />
        </NavigationButton>
        <NavigationButton
          label={props.soundEnabled ? 'Couper le son' : 'Activer le son'}
          shortcut="M"
          onClick={props.onToggleSound}
          active={props.soundEnabled}
        >
          {props.soundEnabled ? <Volume2 size={19} /> : <VolumeX size={19} />}
        </NavigationButton>
        <NavigationButton
          label={props.theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          shortcut="T"
          onClick={props.onToggleTheme}
        >
          {props.theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </NavigationButton>
        <FullscreenControl
          isFullscreen={props.isFullscreen}
          onToggle={props.onToggleFullscreen}
          supported={props.fullscreenSupported}
        />
        <NavigationButton label="Raccourcis clavier" shortcut="H" onClick={props.onToggleHelp} active={props.helpOpen}>
          <CircleHelp size={19} />
        </NavigationButton>
      </div>

      {/* Counter + previous / next — bottom right */}
      <div className="pointer-events-auto absolute bottom-8 right-7 z-30 flex items-center gap-4">
        <div className={`transition-opacity duration-700 ${props.idle ? 'opacity-55' : 'opacity-100'}`}>
          <SlideCounter />
        </div>
        <div className={`flex gap-2 transition-all duration-700 ${hidden ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
          <NavigationButton label="Précédent" shortcut="←" onClick={prev} disabled={atStart} size="lg">
            <ChevronLeft size={24} />
          </NavigationButton>
          <NavigationButton label="Suivant" shortcut="→ / Espace" onClick={next} disabled={atEnd} size="lg">
            <ChevronRight size={24} />
          </NavigationButton>
        </div>
      </div>
    </>
  );
}
