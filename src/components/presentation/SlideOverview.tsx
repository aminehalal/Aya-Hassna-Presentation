import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { slides } from '../../content/presentation';
import { EASE_OUT } from '../../animations/motion';
import { usePresentation } from './PresentationContext';

interface SlideOverviewProps {
  open: boolean;
  selected: number;
  onSelect: (index: number) => void;
  onHover: (index: number) => void;
  onClose: () => void;
}

export const OVERVIEW_COLUMNS = 5;

/** Grid of every slide, for jumping anywhere during the talk or the Q&A. */
export function SlideOverview({ open, selected, onSelect, onHover, onClose }: SlideOverviewProps) {
  const { index } = usePresentation();
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = gridRef.current?.querySelector<HTMLElement>(`[data-index="${selected}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [open, selected]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="pointer-events-auto fixed inset-0 z-40 flex flex-col bg-ink-950/80 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          role="dialog"
          aria-modal="true"
          aria-label="Vue d'ensemble des diapositives"
        >
          <div className="flex items-end justify-between px-[4vw] pb-6 pt-[5vh]">
            <div>
              <div className="font-display text-sm uppercase tracking-[0.3em] text-white/50">Vue d'ensemble</div>
              <div className="mt-2 font-display text-[clamp(28px,3vw,48px)] font-semibold text-white">
                {slides.length} scènes
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/55">
              <span className="hidden md:inline">
                <span className="kbd">←</span> <span className="kbd">→</span> <span className="kbd">↑</span>{' '}
                <span className="kbd">↓</span> naviguer · <span className="kbd">Entrée</span> ouvrir ·{' '}
                <span className="kbd">Échap</span> fermer
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer la vue d'ensemble"
                className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white/80 transition hover:border-white/40 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div ref={gridRef} className="scroll-thin flex-1 overflow-y-auto px-[4vw] pb-[6vh]">
            <div className="grid gap-[1.4vw]" style={{ gridTemplateColumns: `repeat(${OVERVIEW_COLUMNS}, minmax(0, 1fr))` }}>
              {slides.map((s, i) => {
                const isCurrent = i === index;
                const isSelected = i === selected;
                return (
                  <motion.button
                    key={s.id}
                    type="button"
                    data-index={i}
                    onClick={() => onSelect(i)}
                    onPointerEnter={() => onHover(i)}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.03 * i, ease: EASE_OUT }}
                    className={`group relative aspect-video overflow-hidden rounded-2xl border text-left transition-all duration-300 ${
                      isSelected ? 'scale-[1.03] border-white/60' : 'border-white/10 hover:border-white/30'
                    }`}
                    style={{
                      background: `radial-gradient(ellipse 80% 90% at 85% 30%, ${s.accent}55 0%, transparent 60%), linear-gradient(160deg, #0d1430 0%, #05070f 100%)`,
                      boxShadow: isSelected ? `0 0 40px -8px ${s.accent}` : undefined,
                    }}
                  >
                    <div className="absolute inset-0 flex flex-col justify-between p-[1.1vw]">
                      <div className="flex items-start justify-between">
                        <span className="font-display text-[clamp(22px,2.4vw,44px)] font-semibold leading-none text-white/90">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {isCurrent && (
                          <span
                            className="rounded-full px-2 py-[2px] font-display text-[clamp(9px,0.7vw,12px)] uppercase tracking-widest text-ink-950"
                            style={{ background: s.accent }}
                          >
                            En cours
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-display text-[clamp(11px,1vw,17px)] font-semibold leading-tight text-white">
                          {s.title}
                        </div>
                        <div className="mt-1 line-clamp-2 text-[clamp(9px,0.75vw,13px)] leading-snug text-white/55">
                          {s.overview}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
