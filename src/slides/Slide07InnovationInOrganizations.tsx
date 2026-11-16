import { innovationOrgsContent as c } from '../content/presentation';
import { AnimatedText } from '../components/ui/AnimatedText';
import { GlassPanel } from '../components/ui/GlassPanel';
import { IndexedItem, SourceLine } from '../components/ui/Items';
import { Reveal, StepSwap } from '../components/ui/Reveal';
import { Label, SlideFrame } from '../components/ui/SlideFrame';
import type { SlideProps } from './types';

const PLATFORM_COLORS = ['#45e0ff', '#8f7bff', '#4f8cff', '#ffb86b', '#3fe0c5'];

/** Scene 07 — five benefits (linked to the platforms), then concrete examples. */
export function Slide07InnovationInOrganizations({ step }: SlideProps) {
  return (
    <SlideFrame kicker="07 — L'innovation en action">
      <div className="w-[880px]">
        <AnimatedText
          text={c.title}
          className="font-display text-[68px] font-semibold leading-[1.05] tracking-[-0.03em] text-white text-glow"
          delay={0.3}
        />

        <StepSwap swapKey={step >= 1 ? 'examples' : 'benefits'} className="mt-10">
          {step === 0 ? (
            <div className="space-y-6">
              {c.benefits.map((b, i) => (
                <IndexedItem
                  key={b.label}
                  index={i}
                  label={b.label}
                  text={b.text}
                  delay={0.5 + i * 0.12}
                  focusKey={`benefit-${i}`}
                  color={PLATFORM_COLORS[i]}
                />
              ))}
            </div>
          ) : (
            <div>
              <Label>{c.examplesLabel}</Label>
              <div className="mt-6 space-y-6">
                {c.examples.map((ex, i) => (
                  <Reveal key={ex.label} delay={0.12 * i}>
                    <div className="font-display text-[34px] font-semibold text-white">{ex.label}</div>
                    <p className="mt-1 text-[27px] leading-snug text-mist">{ex.text}</p>
                  </Reveal>
                ))}
              </div>
              <Reveal delay={0.5}>
                <GlassPanel accent className="mt-9 px-9 py-6">
                  <p className="text-[29px] leading-[1.4] text-white">{c.rogers}</p>
                  <SourceLine className="mt-2">— {c.rogersSource}</SourceLine>
                </GlassPanel>
              </Reveal>
            </div>
          )}
        </StepSwap>
      </div>
    </SlideFrame>
  );
}
