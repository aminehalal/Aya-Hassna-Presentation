import { moroccoContent as c } from '../content/presentation';
import { AnimatedText } from '../components/ui/AnimatedText';
import { Reveal, StepSwap } from '../components/ui/Reveal';
import { Label, SlideFrame } from '../components/ui/SlideFrame';
import type { LabeledText } from '../content/types';
import type { SlideProps } from './types';

function Rows({ items, color }: { items: LabeledText[]; color: string }) {
  return (
    <div className="mt-6 space-y-5">
      {items.map((item, i) => (
        <Reveal key={item.label} delay={0.1 * i} className="grid grid-cols-[300px_1fr] items-baseline gap-6">
          <div className="font-display text-[29px] font-semibold leading-tight" style={{ color }}>
            {item.label}
          </div>
          <p className="text-[26px] leading-snug text-mist">{item.text}</p>
        </Reveal>
      ))}
    </div>
  );
}

/** Scene 11 — the Moroccan context: visible evolutions, then challenges. */
export function Slide11Morocco({ step }: SlideProps) {
  return (
    <SlideFrame kicker="11 — Application au contexte marocain">
      <div className="w-[920px]">
        <AnimatedText
          text={c.title}
          className="font-display text-[84px] font-semibold leading-[1.02] tracking-[-0.03em] text-white text-glow"
          delay={0.3}
        />

        <StepSwap swapKey={step} className="mt-10">
          {step === 0 ? (
            <div>
              <Label className="!text-[#9ff0ff]">{c.examplesLabel}</Label>
              <Rows items={c.examples} color="#ffffff" />
            </div>
          ) : (
            <div>
              <Label>{c.challengesLabel}</Label>
              <Rows items={c.challenges} color="#ffd2a1" />
              <Reveal delay={0.7}>
                <p className="mt-8 border-l-2 border-[color:var(--accent)] pl-6 text-[28px] font-medium leading-[1.4] text-white">
                  {c.takeaway}
                </p>
              </Reveal>
            </div>
          )}
        </StepSwap>
      </div>
    </SlideFrame>
  );
}
