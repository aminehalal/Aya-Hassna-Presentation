import { AnimatePresence, motion } from 'motion/react';
import { Suspense, lazy, useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { slideVariants } from '../../animations/motion';
import { slides } from '../../content/presentation';
import { useFullscreen } from '../../hooks/useFullscreen';
import { useIdle } from '../../hooks/useIdle';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useSoundEnabled, useTransitionSound } from '../../hooks/useSound';
import { useTheme } from '../../hooks/useTheme';
import { sound } from '../../lib/sound';
import { STAGE_HEIGHT, STAGE_WIDTH, useStageScale } from '../../hooks/useStageScale';
import { useWebGLSupport } from '../../hooks/useWebGLSupport';
import { createSyncChannel, openPresenterWindow } from '../../lib/sync';
import { slideComponents } from '../../slides';
import { SceneErrorBoundary, SceneFallback } from '../3d/SceneFallback';
import { usePresentation } from './PresentationContext';
import { DeviceNotice } from './DeviceNotice';
import { PresenterNotes } from './PresenterNotes';
import { ProgressIndicator } from './ProgressIndicator';
import { ShortcutsHelp } from './ShortcutsHelp';
import { OVERVIEW_COLUMNS, SlideOverview } from './SlideOverview';
import { SlideNavigation } from './SlideNavigation';

// The whole Three.js layer is code-split: text and controls are interactive immediately.
const SceneCanvas = lazy(() => import('../3d/SceneCanvas'));

export function PresentationEngine() {
  const { index, step, direction, slide, next, prev, goTo, total } = usePresentation();
  const scale = useStageScale();
  const reducedMotion = useReducedMotion();
  const webgl = useWebGLSupport();
  const idle = useIdle();
  const fullscreen = useFullscreen();
  const soundEnabled = useSoundEnabled();
  const { theme, toggle: toggleTheme } = useTheme();
  useTransitionSound(index, step, direction);

  const [overviewOpen, setOverviewOpen] = useState(false);
  const [overviewSelected, setOverviewSelected] = useState(index);
  const [notesOpen, setNotesOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [blackout, setBlackout] = useState(false);

  /* ---------------- presenter window sync ---------------- */
  const channelRef = useRef<ReturnType<typeof createSyncChannel> | null>(null);
  const navRef = useRef({ next, prev, goTo, index, step });
  navRef.current = { next, prev, goTo, index, step };

  useEffect(() => {
    const channel = createSyncChannel((msg) => {
      const nav = navRef.current;
      if (msg.type === 'hello') channel.post({ type: 'state', index: nav.index, step: nav.step });
      else if (msg.type === 'command') (msg.command === 'next' ? nav.next : nav.prev)();
      else if (msg.type === 'goto') nav.goTo(msg.index, msg.step);
    });
    channelRef.current = channel;
    return () => channel.close();
  }, []);

  useEffect(() => {
    channelRef.current?.post({ type: 'state', index, step });
  }, [index, step]);

  /* ---------------- overlays ---------------- */
  const toggleOverview = useCallback(() => {
    sound.tick();
    setOverviewOpen((open) => {
      if (!open) setOverviewSelected(navRef.current.index);
      return !open;
    });
    setHelpOpen(false);
  }, []);

  const selectFromOverview = useCallback(
    (i: number) => {
      goTo(i);
      setOverviewOpen(false);
    },
    [goTo],
  );

  /* ---------------- keyboard ---------------- */
  // After a mouse click, release focus so Space/Enter never re-trigger the last clicked button.
  useEffect(() => {
    const release = () => {
      const el = document.activeElement;
      if (el instanceof HTMLButtonElement) requestAnimationFrame(() => el.blur());
    };
    window.addEventListener('pointerup', release);
    return () => window.removeEventListener('pointerup', release);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
      const key = e.key;

      // Overview has its own grid navigation.
      if (overviewOpen) {
        const moves: Record<string, number> = {
          ArrowRight: 1,
          ArrowLeft: -1,
          ArrowDown: OVERVIEW_COLUMNS,
          ArrowUp: -OVERVIEW_COLUMNS,
        };
        if (key in moves) {
          e.preventDefault();
          setOverviewSelected((s) => Math.min(total - 1, Math.max(0, s + moves[key])));
          return;
        }
        if (key === 'Enter' || key === ' ') {
          e.preventDefault();
          selectFromOverview(overviewSelected);
          return;
        }
        if (key === 'Escape' || key === 'o' || key === 'O') {
          e.preventDefault();
          setOverviewOpen(false);
        }
        return;
      }

      if (blackout && key !== 'b' && key !== 'B' && key !== '.') {
        // Any key leaves the black screen without moving.
        setBlackout(false);
        e.preventDefault();
        return;
      }

      switch (key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
        case 'Enter':
          e.preventDefault();
          if (!e.repeat) next();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
        case 'Backspace':
          e.preventDefault();
          if (!e.repeat) prev();
          break;
        case 'Home':
          e.preventDefault();
          goTo(0);
          break;
        case 'End':
          e.preventDefault();
          goTo(total - 1);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          fullscreen.toggle();
          break;
        case 'o':
        case 'O':
          e.preventDefault();
          toggleOverview();
          break;
        case 'Escape':
          e.preventDefault();
          if (helpOpen) setHelpOpen(false);
          else if (notesOpen) setNotesOpen(false);
          else toggleOverview();
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          sound.tick();
          setNotesOpen((v) => !v);
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          sound.toggle();
          break;
        case 't':
        case 'T':
          e.preventDefault();
          sound.tick();
          toggleTheme();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          openPresenterWindow();
          break;
        case 'b':
        case 'B':
        case '.':
          e.preventDefault();
          setBlackout((v) => !v);
          break;
        case 'h':
        case 'H':
        case '?':
          e.preventDefault();
          setHelpOpen((v) => !v);
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [overviewOpen, overviewSelected, blackout, helpOpen, notesOpen, next, prev, goTo, total, fullscreen, toggleOverview, selectFromOverview, toggleTheme]);

  const SlideComponent = slideComponents[slide.id];
  const fallback = <SceneFallback accent={slide.accent} />;

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-ink-950"
      style={{ '--accent': slide.accent, cursor: idle ? 'none' : 'default' } as CSSProperties}
    >
      {/* 3D layer */}
      <div className="absolute inset-0">
        {webgl ? (
          <SceneErrorBoundary fallback={fallback}>
            <Suspense fallback={fallback}>
              <SceneCanvas index={index} step={step} direction={direction} reducedMotion={reducedMotion} />
            </Suspense>
          </SceneErrorBoundary>
        ) : (
          fallback
        )}
      </div>

      {/* 16:9 stage — every slide is authored at 1920×1080 and scaled to the screen */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 origin-center"
        style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT, transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            className="pointer-events-auto absolute inset-0"
            variants={slideVariants}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            <SlideComponent step={step} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Presenter chrome */}
      <div className="pointer-events-none absolute inset-0">
        <SlideNavigation
          idle={idle}
          overviewOpen={overviewOpen}
          notesOpen={notesOpen}
          helpOpen={helpOpen}
          isFullscreen={fullscreen.isFullscreen}
          fullscreenSupported={fullscreen.supported}
          onToggleOverview={toggleOverview}
          onToggleNotes={() => setNotesOpen((v) => !v)}
          onToggleHelp={() => setHelpOpen((v) => !v)}
          onToggleFullscreen={fullscreen.toggle}
          onOpenPresenter={openPresenterWindow}
          soundEnabled={soundEnabled}
          onToggleSound={() => sound.toggle()}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <ProgressIndicator dimmed={idle} />
      </div>

      <SlideOverview
        open={overviewOpen}
        selected={overviewSelected}
        onSelect={selectFromOverview}
        onHover={setOverviewSelected}
        onClose={() => setOverviewOpen(false)}
      />
      <PresenterNotes open={notesOpen} onClose={() => setNotesOpen(false)} onOpenPresenter={openPresenterWindow} />
      <ShortcutsHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
      <DeviceNotice />

      {/* Black screen (B) — classic presenter pause */}
      <AnimatePresence>
        {blackout && (
          <motion.div
            className="theme-keep fixed inset-0 z-[60] bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => setBlackout(false)}
          />
        )}
      </AnimatePresence>

      <div className="sr-only" aria-live="polite">
        {`Diapositive ${index + 1} sur ${total} : ${slides[index].title}`}
      </div>
    </div>
  );
}
