import { ArrowRight } from 'lucide-react';
import { changeContent as c } from '../content/presentation';
import { AnimatedText } from '../components/ui/AnimatedText';
import { StepSwap } from '../components/ui/Reveal';
import { Label, SlideFrame } from '../components/ui/SlideFrame';
import type { SlideProps } from './types';

/** Scene 03 — definition, causes, planned vs unplanned change, Lewin. */
export function Slide03Change({ step }: SlideProps) {
  return (
    <SlideFrame kicker="03 — Le changement organisationnel">
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
              <p className="mt-4 text-[35px] leading-[1.38] text-white text-shadow-soft">{c.definition.text}</p>
              <p className="mt-8 border-l-2 border-[color:var(--accent)] pl-6 text-[28px] italic leading-[1.45] text-mist">
                {c.definition.sociology}
              </p>
            </div>
          )}

          {step === 1 && (
            <div>
              <Label>{c.factors.label}</Label>
              <div className="mt-7 grid grid-cols-2 gap-12">
                {[c.factors.external, c.factors.internal].map((group, g) => (
                  <div key={group.label}>
                    <div className="mb-4 font-display text-[34px] font-semibold text-white">
                      {group.label}
                    </div>
                    <ul className="space-y-3">
                      {group.items.map((item) => (
                        <li key={item} className="flex items-start gap-4 text-[28px] leading-snug text-mist">
                          <span
                            className="mt-[14px] h-2 w-2 flex-none rounded-full"
                            style={{ background: g === 0 ? '#ffb86b' : 'var(--accent)' }}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <Label>{c.planned.label}</Label>
              <div className="mt-6 space-y-6">
                {c.planned.items.map((item) => (
                  <div key={item.label}>
                    <div className="font-display text-[34px] font-semibold text-white">{item.label}</div>
                    <p className="mt-1 text-[27px] leading-snug text-mist">{item.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-10">
                <div className="mb-4 font-display text-[24px] uppercase tracking-[0.18em] text-mute">{c.planned.lewinLabel}</div>
                <div className="flex items-center gap-4">
                  {c.planned.lewin.map((phase, i) => (
                    <div key={phase} className="flex items-center gap-4">
                      {i > 0 && <ArrowRight className="text-[color:var(--accent)]" size={30} />}
                      <span className="glass rounded-2xl px-6 py-3 font-display text-[27px] text-white">{phase}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </StepSwap>
      </div>
    </SlideFrame>
  );
}
