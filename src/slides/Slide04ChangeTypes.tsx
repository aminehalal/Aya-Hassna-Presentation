import { changeTypesContent as c } from '../content/presentation';
import { AnimatedText } from '../components/ui/AnimatedText';
import { IndexedItem } from '../components/ui/Items';
import { StepSwap } from '../components/ui/Reveal';
import { Label, SlideFrame } from '../components/ui/SlideFrame';
import type { SlideProps } from './types';

/** Scene 04 — three levels (revealed one by one), then two rhythms of change. */
export function Slide04ChangeTypes({ step }: SlideProps) {
  const showingLevels = step < 3;
  return (
    <SlideFrame kicker="04 — Formes et niveaux">
      <div className="w-[880px]">
        <AnimatedText
          text={c.title}
          className="font-display text-[76px] font-semibold leading-[1.04] tracking-[-0.03em] text-white text-glow"
          delay={0.3}
        />

        <StepSwap swapKey={showingLevels ? 'levels' : 'nature'} className="mt-12">
          {showingLevels ? (
            <div>
              <Label>{c.levelsLabel}</Label>
              <div className="mt-7 space-y-9">
                {c.levels.map((level, i) => (
                  <IndexedItem
                    key={level.label}
                    index={i}
                    label={level.label}
                    text={level.text}
                    show={step >= i}
                    active={step === i}
                    dimmed={step !== i}
                    size="lg"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div>
              <Label>{c.natureLabel}</Label>
              <div className="mt-7 space-y-10">
                {c.nature.map((n, i) => (
                  <IndexedItem
                    key={n.label}
                    index={i}
                    label={n.label}
                    text={n.text}
                    show={step >= 3 + i}
                    active={step === 3 + i}
                    dimmed={step !== 3 + i}
                    color={i === 1 ? '#ffb86b' : undefined}
                    size="lg"
                  />
                ))}
              </div>
            </div>
          )}
        </StepSwap>
      </div>
    </SlideFrame>
  );
}
