import { ChevronLeft, ChevronRight, RotateCcw, Timer } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { slides } from '../../content/presentation';
import { speakerNotes } from '../../content/speakerNotes';
import { createSyncChannel, type SyncMessage } from '../../lib/sync';
import { NotesContent } from './NotesContent';

function formatDuration(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Presenter window (opened with "P"): notes, next item, timer.
 * It mirrors and drives the audience window through a BroadcastChannel.
 */
export function PresenterView() {
  const [state, setState] = useState({ index: 0, step: 0 });
  const [connected, setConnected] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const channelRef = useRef<ReturnType<typeof createSyncChannel> | null>(null);

  useEffect(() => {
    const channel = createSyncChannel((msg: SyncMessage) => {
      if (msg.type === 'state') {
        setState({ index: msg.index, step: msg.step });
        setConnected(true);
      }
    });
    channelRef.current = channel;
    channel.post({ type: 'hello' });
    if (!document.title.startsWith('Vue présentateur')) document.title = `Vue présentateur — ${document.title}`;
    return () => channel.close();
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const send = useCallback((command: 'next' | 'prev') => {
    channelRef.current?.post({ type: 'command', command });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        send('next');
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        send('prev');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [send]);

  const slide = slides[state.index];
  const cues = speakerNotes[slide.id].cues;
  const hasNextStep = state.step < slide.steps - 1;
  const nextSlide = slides[state.index + 1];
  const upNext = hasNextStep
    ? `Étape ${state.step + 2} : ${cues?.[state.step + 1] ?? 'révélation suivante'}`
    : nextSlide
      ? `${state.index + 2}. ${nextSlide.title}`
      : 'Fin de la présentation';

  return (
    <div
      className="flex h-full flex-col overflow-hidden bg-ink-950 text-white"
      style={{ ['--accent' as string]: slide.accent }}
    >
      <header className="flex items-center justify-between border-b border-white/10 px-8 py-4">
        <div className="flex items-center gap-3">
          <span className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-amber-400 pulse-soft'}`} />
          <span className="font-display text-[14px] uppercase tracking-[0.25em] text-white/60">
            {connected ? 'Vue présentateur — synchronisée' : 'En attente de la fenêtre de présentation…'}
          </span>
        </div>
        <div className="flex items-center gap-6 font-display tabular-nums">
          <span className="flex items-center gap-2 text-[22px]">
            <Timer size={20} className="text-white/50" /> {formatDuration(now - startedAt)}
          </span>
          <button
            type="button"
            onClick={() => setStartedAt(Date.now())}
            className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-[13px] text-white/70 hover:text-white"
          >
            <RotateCcw size={14} /> Réinitialiser
          </button>
          <span className="text-[22px] text-white/60">
            {new Date(now).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[1fr_400px]">
        <main className="scroll-thin min-h-0 overflow-y-auto px-10 py-8">
          <div className="font-display text-[14px] uppercase tracking-[0.25em]" style={{ color: slide.accent }}>
            Diapositive {state.index + 1} / {slides.length}
            {slide.steps > 1 && ` · étape ${state.step + 1} / ${slide.steps}`}
          </div>
          <h1 className="mb-8 mt-2 font-display text-[40px] font-semibold leading-tight">{slide.title}</h1>
          <NotesContent slide={slide} step={state.step} large />
        </main>

        <aside className="flex flex-col gap-6 border-l border-white/10 bg-white/[0.02] p-8">
          <div>
            <div className="font-display text-[12px] uppercase tracking-[0.25em] text-white/45">À suivre</div>
            <div className="mt-2 font-display text-[22px] leading-snug text-white/90">{upNext}</div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => send('prev')}
              className="flex h-20 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] font-display text-[18px] hover:bg-white/10"
            >
              <ChevronLeft /> Précédent
            </button>
            <button
              type="button"
              onClick={() => send('next')}
              className="flex h-20 items-center justify-center gap-2 rounded-2xl font-display text-[18px] font-semibold text-ink-950 hover:brightness-110"
              style={{ background: slide.accent }}
            >
              Suivant <ChevronRight />
            </button>
          </div>
          <p className="text-[13px] leading-relaxed text-white/45">
            Les flèches et la barre d'espace de cette fenêtre pilotent la présentation. Placez la fenêtre de présentation
            sur le projecteur (écran étendu) et passez-la en plein écran avec F.
          </p>
        </aside>
      </div>
    </div>
  );
}
