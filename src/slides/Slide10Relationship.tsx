import { ArrowDown } from 'lucide-react';
import { relationshipContent as c } from '../content/presentation';
import { AnimatedText } from '../components/ui/AnimatedText';
import { GlassPanel } from '../components/ui/GlassPanel';
import { Reveal } from '../components/ui/Reveal';
import { SlideFrame } from '../components/ui/SlideFrame';
import type { SlideProps } from './types';

const CYCLE_COLORS = ['#4f8cff', '#a98bff', '#3fe0c5', '#9fd8ff'];

/** Scene 10 — the cycle change → innovation → learning → new change. */
export function Slide10Relationship({ step }: SlideProps) {
  return (
    <SlideFrame kicker="10 — Le lien entre les trois concepts">
      <div className="w-[860px]">
        <AnimatedText
          text={c.title}
          className="font-display text-[74px] font-semibold leading-[1.04] tracking-[-0.03em] text-white text-glow"
          delay={0.3}
        />

        <div className="mt-7">
          {c.cycle.map((item, i) => (
            <div key={item.label}>
              {i > 0 && (
                <Reveal show={step >= i} className="my-1 ml-[2px]">
                  <ArrowDown size={26} style={{ color: CYCLE_COLORS[i] }} />
                </Reveal>
              )}
              <Reveal show={step >= i} className="flex flex-col">
                <span
                  className="font-display text-[36px] font-semibold uppercase leading-tight tracking-[0.04em] transition-opacity duration-500"
                  style={{ color: CYCLE_COLORS[i], opacity: step === i || step === 4 ? 1 : 0.6, textShadow: `0 0 24px ${CYCLE_COLORS[i]}66` }}
                >
                  {item.label}
                </span>
                <span
                  className="text-[27px] leading-snug text-mist transition-opacity duration-500"
                  style={{ opacity: step === i || step === 4 ? 1 : 0.55 }}
                >
                  {item.text}
                </span>
              </Reveal>
            </div>
          ))}
        </div>

        <Reveal show={step >= 4}>
          <GlassPanel accent className="mt-6 px-9 py-5">
            <p className="text-[29px] leading-[1.4] text-white">{c.synthesis}</p>
          </GlassPanel>
        </Reveal>
      </div>
    </SlideFrame>
  );
}
