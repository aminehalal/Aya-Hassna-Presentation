import { speakerNotes } from '../../content/speakerNotes';
import type { SlideMeta } from '../../content/types';

interface NotesContentProps {
  slide: SlideMeta;
  step: number;
  /** Larger typography for the separate presenter window */
  large?: boolean;
}

/** Shared rendering of speaker notes (drawer + presenter window). */
export function NotesContent({ slide, step, large = false }: NotesContentProps) {
  const notes = speakerNotes[slide.id];
  const base = large ? 'text-[19px] leading-[1.6]' : 'text-[15px] leading-[1.6]';
  const heading = 'font-display text-[12px] font-semibold uppercase tracking-[0.22em]';

  return (
    <div className={`space-y-6 text-white/85 ${base}`}>
      {notes.cues && notes.cues.length > 1 && (
        <section>
          <h3 className={`${heading} mb-2 text-white/50`}>Étapes de la scène</h3>
          <ol className="space-y-1">
            {notes.cues.map((cue, i) => (
              <li
                key={cue}
                className={`flex gap-3 rounded-lg px-3 py-1.5 transition-colors ${
                  i === step ? 'bg-white/10 text-white' : i < step ? 'text-white/45' : 'text-white/70'
                }`}
              >
                <span className="font-display tabular-nums" style={{ color: i === step ? slide.accent : undefined }}>
                  {i + 1}
                </span>
                {cue}
              </li>
            ))}
          </ol>
        </section>
      )}

      <section>
        <h3 className={`${heading} mb-2`} style={{ color: slide.accent }}>
          Introduire
        </h3>
        <p>{notes.intro}</p>
      </section>

      <section>
        <h3 className={`${heading} mb-2`} style={{ color: slide.accent }}>
          À dire
        </h3>
        <ul className="space-y-2">
          {notes.say.map((line) => (
            <li key={line} className="flex gap-3">
              <span className="mt-[0.65em] h-1.5 w-1.5 flex-none rounded-full" style={{ background: slide.accent }} />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className={`${heading} mb-2`} style={{ color: slide.accent }}>
          Exemple
        </h3>
        <p>{notes.example}</p>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
        <h3 className={`${heading} mb-2 text-white/60`}>Transition</h3>
        <p className="italic text-white">« {notes.transition} »</p>
      </section>
    </div>
  );
}
