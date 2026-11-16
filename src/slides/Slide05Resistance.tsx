import { resistanceContent as c } from '../content/presentation';
import { AnimatedText } from '../components/ui/AnimatedText';
import { SourceLine } from '../components/ui/Items';
import { Reveal, StepSwap } from '../components/ui/Reveal';
import { Label, SlideFrame } from '../components/ui/SlideFrame';
import { focusHandlers, useFocused } from '../lib/focusStore';
import type { SlideProps } from './types';

// Horizontal centres of the five barriers in stage pixels (barriers at x = -4…4 world units)
const COLUMN_X = [420, 690, 960, 1230, 1500];

/** Scene 05 — the causes of resistance aligned above their barriers, then the levers. */
export function Slide05Resistance({ step }: SlideProps) {
  const focused = useFocused();
  return (
    <SlideFrame kicker="05 — La résistance au changement" scrim="top">
      <AnimatedText
        text={c.title}
        className="font-display text-[84px] font-semibold leading-[1.02] tracking-[-0.03em] text-white text-glow"
        delay={0.3}
      />

      <StepSwap swapKey={step >= 1 ? 'levers' : 'lead'} className="mt-6 h-[150px]">
        {step === 0 ? (
          <div className="max-w-[1300px]">
            <p className="text-[32px] leading-[1.4] text-white text-shadow-soft">{c.lead}</p>
            <SourceLine className="mt-2">— {c.leadSource}</SourceLine>
          </div>
        ) : (
          <div className="flex items-start gap-16">
            <Label className="mt-2">{c.leversLabel}</Label>
            {c.levers.map((lever) => (
              <div key={lever.label}>
                <div className="font-display text-[38px] font-semibold text-[#9ff0ff]">{lever.label}</div>
                <div className="text-[27px] text-mist">{lever.text}</div>
              </div>
            ))}
          </div>
        )}
      </StepSwap>

      {c.causes.map((cause, i) => {
        const isFocused = focused === `cause-${i}`;
        return (
          <Reveal
            key={cause.label}
            delay={0.6 + i * 0.12}
            className="absolute top-[505px] w-[258px] text-center"
            style={{ left: COLUMN_X[i] - 129 }}
            {...focusHandlers(`cause-${i}`)}
          >
            <div className="transition-opacity duration-700" style={{ opacity: step >= 1 && !isFocused ? 0.5 : 1 }}>
            <div
              className="mx-auto mb-3 h-[3px] w-12 rounded-full transition-all duration-500"
              style={{ background: isFocused ? '#ffd0a0' : '#ff7a6b', boxShadow: isFocused ? '0 0 16px #ff9a6b' : 'none' }}
            />
            <div
              className="font-display text-[29px] font-semibold leading-[1.12] transition-colors"
              style={{ color: isFocused ? '#ffd9b8' : '#ffffff', textDecoration: step >= 1 ? 'line-through rgba(159,240,255,0.6)' : 'none' }}
            >
              {cause.label}
            </div>
            <div className="mt-2 text-[24px] leading-snug text-mist">{cause.text}</div>
            </div>
          </Reveal>
        );
      })}
    </SlideFrame>
  );
}
