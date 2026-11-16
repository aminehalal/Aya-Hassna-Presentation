import { learningContent as c } from '../content/presentation';
import { AnimatedText } from '../components/ui/AnimatedText';
import { IndexedItem } from '../components/ui/Items';
import { Reveal, StepSwap } from '../components/ui/Reveal';
import { Label, SlideFrame } from '../components/ui/SlideFrame';
import type { SlideProps } from './types';

const LOOP_COLORS = ['#7ff7ff', '#ffb86b'];

/** Scene 08 — three levels of learning, its mechanisms, then single vs double loop. */
export function Slide08Learning({ step }: SlideProps) {
  const phase = step < 3 ? 'levels' : step === 3 ? 'mechanisms' : 'loops';
  return (
    <SlideFrame kicker="08 — L'apprentissage organisationnel">
      <div className="w-[880px]">
        <AnimatedText
          text={c.title}
          className="font-display text-[80px] font-semibold leading-[1.03] tracking-[-0.03em] text-white text-glow"
          delay={0.3}
        />

        <StepSwap swapKey={phase} className="mt-11">
          {phase === 'levels' && (
            <div>
              <Label>{c.levelsLabel}</Label>
              <div className="mt-7 space-y-8">
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
          )}

          {phase === 'mechanisms' && (
            <div>
              <Label>{c.mechanismsLabel}</Label>
              <div className="mt-7 space-y-8">
                {c.mechanisms.map((m, i) => (
                  <IndexedItem key={m.label} index={i} label={m.label} text={m.text} delay={0.15 * i} size="lg" />
                ))}
              </div>
            </div>
          )}

          {phase === 'loops' && (
            <div>
              <Label>{c.loopsLabel}</Label>
              <div className="mt-8 space-y-10">
                {c.loops.map((loop, i) => (
                  <Reveal key={loop.label} delay={0.2 * i} className="flex items-center gap-8">
                    <span className="relative grid h-[96px] w-[96px] flex-none place-items-center">
                      <span
                        className="absolute rounded-full border-[3px]"
                        style={{
                          width: i === 0 ? 56 : 92,
                          height: i === 0 ? 56 : 92,
                          borderColor: LOOP_COLORS[i],
                          boxShadow: `0 0 18px ${LOOP_COLORS[i]}`,
                        }}
                      />
                      {i === 1 && (
                        <span className="absolute h-[44px] w-[44px] rounded-full border-2 opacity-60" style={{ borderColor: LOOP_COLORS[0] }} />
                      )}
                    </span>
                    <div>
                      <div className="font-display text-[40px] font-semibold" style={{ color: LOOP_COLORS[i] }}>
                        {loop.label}
                      </div>
                      <p className="mt-1 text-[29px] leading-snug text-mist">{loop.text}</p>
                    </div>
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
