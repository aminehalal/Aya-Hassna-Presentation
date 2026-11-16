import { bibliography } from '../content/bibliography';
import { AnimatedText } from '../components/ui/AnimatedText';
import { Reveal } from '../components/ui/Reveal';
import { SlideFrame } from '../components/ui/SlideFrame';
import type { SlideProps } from './types';

/** Scene 13 — verifiable references, two readable columns. */
export function Slide13Bibliography(_props: SlideProps) {
  return (
    <SlideFrame kicker="Références" scrim="center">
      <AnimatedText
        text="Bibliographie"
        className="font-display text-[80px] font-semibold leading-none tracking-[-0.03em] text-white text-glow"
        delay={0.2}
      />
      <div className="mt-11 grid grid-cols-2 gap-x-20 gap-y-6">
        {bibliography.map((ref, i) => (
          <Reveal key={ref.title} delay={0.35 + i * 0.06} className="border-l border-white/15 pl-5">
            <div className="text-[24px] leading-[1.35] text-white">
              <span className="font-semibold">{ref.authors}</span>{' '}
              <span className="text-[color:var(--accent)]">({ref.year})</span>.{' '}
              <span className="italic">{ref.title}</span>.
            </div>
            <div className="text-[24px] leading-[1.35] text-mute">{ref.details}</div>
          </Reveal>
        ))}
      </div>
    </SlideFrame>
  );
}
