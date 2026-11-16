import { AnimatePresence, motion } from 'motion/react';
import { MonitorUp, X } from 'lucide-react';
import { EASE_OUT } from '../../animations/motion';
import { NotesContent } from './NotesContent';
import { usePresentation } from './PresentationContext';

interface PresenterNotesProps {
  open: boolean;
  onClose: () => void;
  onOpenPresenter: () => void;
}

/**
 * Optional notes drawer (key N). For a live talk with an extended display,
 * the separate presenter window (key P) keeps the notes off the projector.
 */
export function PresenterNotes({ open, onClose, onOpenPresenter }: PresenterNotesProps) {
  const { slide, index, step, total } = usePresentation();

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          className="pointer-events-auto fixed bottom-4 right-4 top-4 z-40 flex w-[min(560px,92vw)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-ink-900/90 shadow-2xl backdrop-blur-2xl"
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 40, opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          aria-label="Notes de présentation"
        >
          <header className="flex items-start justify-between gap-4 border-b border-white/10 px-6 pb-4 pt-5">
            <div>
              <div className="font-display text-[12px] uppercase tracking-[0.25em] text-white/50">
                Notes · {index + 1} / {total}
                {slide.steps > 1 && ` · étape ${step + 1}/${slide.steps}`}
              </div>
              <div className="mt-1 font-display text-[20px] font-semibold text-white">{slide.title}</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer les notes"
              className="grid h-10 w-10 flex-none place-items-center rounded-full border border-white/15 text-white/70 transition hover:text-white"
            >
              <X size={18} />
            </button>
          </header>

          <div className="scroll-thin flex-1 overflow-y-auto px-6 py-5">
            <NotesContent slide={slide} step={step} />
          </div>

          <footer className="border-t border-white/10 px-6 py-4">
            <button
              type="button"
              onClick={onOpenPresenter}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 font-display text-[14px] text-white transition hover:bg-white/10"
            >
              <MonitorUp size={17} /> Ouvrir la vue présentateur (P)
            </button>
            <p className="mt-2 text-center text-[12px] leading-snug text-white/45">
              En écran dupliqué, ce panneau est visible par le public. En écran étendu, placez la vue présentateur
              sur votre ordinateur et la présentation sur le projecteur.
            </p>
          </footer>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
