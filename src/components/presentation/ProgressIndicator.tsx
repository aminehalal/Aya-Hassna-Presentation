import { slides } from '../../content/presentation';
import { usePresentation } from './PresentationContext';

/** Segmented progress bar (one segment per slide, filled by steps) + slide counter. */
export function ProgressIndicator({ dimmed }: { dimmed: boolean }) {
  const { index, step, goTo } = usePresentation();

  return (
    <div
      className={`pointer-events-auto absolute inset-x-0 bottom-0 z-30 flex h-6 items-end gap-[3px] px-[3px] pb-[3px] transition-opacity duration-700 ${
        dimmed ? 'opacity-40' : 'opacity-100'
      }`}
      role="navigation"
      aria-label="Progression de la présentation"
    >
      {slides.map((s, i) => {
        const fill = i < index ? 1 : i > index ? 0 : (step + 1) / s.steps;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => goTo(i)}
            title={`${i + 1}. ${s.title}`}
            aria-label={`Aller à la diapositive ${i + 1} : ${s.title}`}
            aria-current={i === index ? 'step' : undefined}
            className="group relative h-[4px] flex-1 overflow-hidden rounded-full bg-white/10 transition-all duration-300 hover:h-[8px] hover:bg-white/20"
          >
            <span
              className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${fill * 100}%`,
                background: i === index ? 'var(--accent)' : 'rgba(200,215,255,0.55)',
                boxShadow: i === index ? '0 0 12px var(--accent)' : 'none',
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

export function SlideCounter() {
  const { index, total, step, slide } = usePresentation();
  return (
    <div className="flex items-baseline gap-2 font-display tabular-nums text-white/85" aria-hidden>
      <span className="text-[26px] font-semibold text-white">{String(index + 1).padStart(2, '0')}</span>
      <span className="text-[18px] text-white/45">/ {String(total).padStart(2, '0')}</span>
      {slide.steps > 1 && (
        <span className="ml-2 flex items-center gap-[5px] self-center">
          {Array.from({ length: slide.steps }, (_, i) => (
            <span
              key={i}
              className="h-[6px] w-[6px] rounded-full transition-all duration-500"
              style={{
                background: i <= step ? 'var(--accent)' : 'rgba(255,255,255,0.2)',
                transform: i === step ? 'scale(1.35)' : 'scale(1)',
              }}
            />
          ))}
        </span>
      )}
    </div>
  );
}
