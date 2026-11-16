import { learningOrgContent as c } from '../content/presentation';
import { AnimatedText } from '../components/ui/AnimatedText';
import { GlassPanel } from '../components/ui/GlassPanel';
import { Chip, IndexedItem, SourceLine } from '../components/ui/Items';
import { Reveal, StepSwap } from '../components/ui/Reveal';
import { Label, SlideFrame } from '../components/ui/SlideFrame';
import type { SlideProps } from './types';

const DISCIPLINE_COLORS = ['#4f8cff', '#a98bff', '#ffb86b', '#3fe0c5', '#e8fbff'];

/** Scene 09 — Senge's learning organisation and its five disciplines. */
export function Slide09LearningOrganization({ step }: SlideProps) {
  return (
    <SlideFrame kicker="09 — L'organisation apprenante">
      <div className="w-[880px]">
        <AnimatedText
          text={c.title}
          className="font-display text-[80px] font-semibold leading-[1.03] tracking-[-0.03em] text-white text-glow"
          delay={0.3}
        />

        <StepSwap swapKey={step === 0 ? 'definition' : 'disciplines'} className="mt-10">
          {step === 0 ? (
            <div>
              <GlassPanel accent className="px-10 py-8">
                <p className="text-[34px] leading-[1.4] text-white">{c.definition}</p>
                <SourceLine className="mt-3">— {c.definitionSource}</SourceLine>
              </GlassPanel>
              <div className="mt-9 flex flex-wrap gap-4">
                {c.traits.map((trait, i) => (
                  <Chip key={trait} delay={0.5 + i * 0.1}>
                    {trait}
                  </Chip>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <Label>{c.disciplinesLabel}</Label>
              <div className="mt-5 space-y-4">
                {c.disciplines.map((d, i) => (
                  <IndexedItem
                    key={d.label}
                    index={i}
                    label={d.label}
                    text={d.text}
                    delay={0.1 * i}
                    focusKey={`discipline-${i}`}
                    color={DISCIPLINE_COLORS[i]}
                    active={step >= 2 && i === 4}
                    dimmed={step >= 2 && i !== 4}
                  />
                ))}
              </div>
              <Reveal show={step >= 2}>
                <p className="mt-7 border-l-2 border-[color:var(--accent)] pl-6 text-[27px] italic leading-[1.45] text-mist">
                  {c.systemsNote}
                </p>
              </Reveal>
            </div>
          )}
        </StepSwap>
      </div>
    </SlideFrame>
  );
}
