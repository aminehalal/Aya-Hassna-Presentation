import { ArrowRight } from 'lucide-react';
import { innovationContent as c } from '../content/presentation';
import { AnimatedText } from '../components/ui/AnimatedText';
import { SourceLine } from '../components/ui/Items';
import { Reveal, StepSwap } from '../components/ui/Reveal';
import { Label, SlideFrame } from '../components/ui/SlideFrame';
import type { SlideProps } from './types';

/** Scene 06 — definition, creativity vs innovation, four forms. */
export function Slide06Innovation({ step }: SlideProps) {
  return (
    <SlideFrame kicker="06 — L'innovation">
      <div className="w-[900px]">
        <AnimatedText
          text={c.title}
          className="font-display text-[86px] font-semibold leading-[1.02] tracking-[-0.03em] text-white text-glow"
          delay={0.3}
        />

        <StepSwap swapKey={step} className="mt-12">
          {step === 0 && (
            <div>
              <Label>{c.definition.label}</Label>
              <p className="mt-4 text-[36px] leading-[1.38] text-white text-shadow-soft">{c.definition.text}</p>
              <SourceLine className="mt-7">{c.definition.source}</SourceLine>
            </div>
          )}

          {step === 1 && (
            <div>
              <Label>{c.creativity.label}</Label>
              <div className="mt-8 flex items-stretch gap-6">
                {c.creativity.items.map((item, i) => (
                  <div key={item.label} className="flex items-center gap-6">
                    {i > 0 && <ArrowRight size={40} className="flex-none text-[color:var(--accent)]" />}
                    <div className={`rounded-3xl p-7 ${i === 1 ? 'glass' : 'border border-white/10'}`}>
                      <div className={`font-display text-[38px] font-semibold ${i === 1 ? 'gradient-text' : 'text-white'}`}>
                        {item.label}
                      </div>
                      <p className="mt-2 text-[27px] leading-snug text-mist">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Reveal delay={0.5}>
                <p className="mt-9 border-l-2 border-[color:var(--accent)] pl-6 text-[28px] italic leading-[1.45] text-mist">
                  {c.creativity.note}
                </p>
              </Reveal>
            </div>
          )}

          {step === 2 && (
            <div>
              <Label>{c.types.label}</Label>
              <div className="mt-7 grid grid-cols-2 gap-x-12 gap-y-9">
                {c.types.items.map((item, i) => (
                  <Reveal key={item.label} delay={0.15 * i}>
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-[24px] tabular-nums text-[color:var(--accent)]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-display text-[36px] font-semibold text-white">{item.label}</span>
                    </div>
                    <p className="mt-1 text-[26px] leading-snug text-mist">{item.text}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </StepSwap>
      </div>
    </SlideFrame>
  );
}
