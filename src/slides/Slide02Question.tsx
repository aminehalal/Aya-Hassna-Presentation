import { questionContent as c } from '../content/presentation';
import { AnimatedText } from '../components/ui/AnimatedText';
import { Reveal } from '../components/ui/Reveal';
import { Kicker } from '../components/ui/SlideFrame';
import type { SlideProps } from './types';

/** Scene 02 — the opening question between two worlds. */
export function Slide02Question({ step }: SlideProps) {
  return (
    <div className="absolute inset-0">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(3,5,11,0.88) 0%, rgba(3,5,11,0.5) 40%, rgba(3,5,11,0) 58%, rgba(3,5,11,0.65) 100%)' }}
      />
      <div className="relative flex h-full flex-col items-center px-[140px] pt-[92px] text-center">
        <Kicker text="02 — Question introductive" />
        <AnimatedText
          as="h2"
          text={c.question}
          className="max-w-[1560px] font-display text-[66px] font-semibold leading-[1.08] tracking-[-0.025em] text-white text-glow"
          delay={0.35}
          stagger={0.05}
        />

        <Reveal show={step >= 1} className="mt-8 flex flex-col items-center gap-3">
          <p className="text-[29px] text-mist">{c.hypothesisLead}</p>
          <div className="flex items-center gap-8 font-display text-[52px] font-semibold tracking-[-0.02em]">
            {c.hypothesis.map((word, i) => (
              <span key={word} className="flex items-center gap-8">
                {i > 0 && <span className="h-2.5 w-2.5 rounded-full bg-white/40" />}
                <span className="gradient-text">{word}</span>
              </span>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Labels under each world */}
      {[
        { side: c.rigid, x: 438, tone: 'text-mute' },
        { side: c.dynamic, x: 1482, tone: 'text-[color:var(--accent)]' },
      ].map(({ side, x, tone }, i) => (
        <Reveal
          key={side.label}
          delay={1.1 + i * 0.25}
          className="absolute top-[838px] w-[660px] -translate-x-1/2 text-center"
          style={{ left: x }}
        >
          <div className={`font-display text-[36px] font-semibold leading-tight ${tone}`}>{side.label}</div>
          <div className="mt-1 text-[25px] leading-snug text-mist/85">{side.text}</div>
        </Reveal>
      ))}
    </div>
  );
}
