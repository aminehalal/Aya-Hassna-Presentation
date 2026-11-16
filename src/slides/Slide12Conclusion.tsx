import { AnimatePresence, motion } from 'motion/react';
import { conclusionContent as c, presentationInfo } from '../content/presentation';
import { AnimatedText } from '../components/ui/AnimatedText';
import { Reveal } from '../components/ui/Reveal';
import { Kicker } from '../components/ui/SlideFrame';
import type { SlideProps } from './types';

const COLORS = ['#4f8cff', '#a98bff', '#3fe0c5'];

/** Scene 12 — key sentence and synthesis, final question, then thanks. */
export function Slide12Conclusion({ step }: SlideProps) {
  return (
    <div className="absolute inset-0">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        animate={{
          background:
            step === 0
              ? 'linear-gradient(90deg, rgba(3,5,11,0.9) 0%, rgba(3,5,11,0.6) 40%, rgba(3,5,11,0) 64%)'
              : 'linear-gradient(0deg, rgba(3,5,11,0.95) 0%, rgba(3,5,11,0.65) 34%, rgba(3,5,11,0) 62%)',
        }}
        transition={{ duration: 1.2 }}
      />

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="summary"
            className="relative h-full px-[120px] pt-[92px]"
            exit={{ opacity: 0, filter: 'blur(8px)', transition: { duration: 0.45 } }}
          >
            <Kicker text="12 — Conclusion" />
            <AnimatedText
              text={c.title}
              className="w-[900px] font-display text-[72px] font-semibold leading-[1.06] tracking-[-0.03em]"
              wordClassName="gradient-text"
              delay={0.3}
              stagger={0.07}
            />
            <div className="mt-14 w-[860px] space-y-8">
              {c.summary.map((item, i) => (
                <Reveal key={item.label} delay={1 + i * 0.2} className="flex items-baseline gap-5">
                  <span className="h-3 w-3 flex-none translate-y-[-4px] rounded-full" style={{ background: COLORS[i], boxShadow: `0 0 16px ${COLORS[i]}` }} />
                  <span className="font-display text-[40px] font-semibold text-white">{item.label}</span>
                  <span className="text-[31px] text-mist">— {item.text}</span>
                </Reveal>
              ))}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="question"
            className="absolute inset-x-0 bottom-[150px] flex flex-col items-center px-[160px] text-center"
            exit={{ opacity: 0, filter: 'blur(8px)', transition: { duration: 0.45 } }}
          >
            <Reveal className="mb-6 font-display text-[24px] uppercase tracking-[0.3em] text-mute">Question finale</Reveal>
            <AnimatedText
              text={c.finalQuestion}
              className="max-w-[1500px] font-display text-[60px] font-semibold leading-[1.12] tracking-[-0.02em] text-white text-glow"
              delay={0.2}
              stagger={0.05}
            />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="thanks" className="absolute inset-x-0 bottom-[140px] flex flex-col items-center text-center">
            <AnimatedText
              text={c.thanks}
              as="h2"
              className="font-display text-[104px] font-semibold leading-[1.02] tracking-[-0.035em]"
              wordClassName="gradient-text"
              delay={0.3}
              stagger={0.09}
            />
            <Reveal delay={1.2} className="mt-8 font-display text-[32px] tracking-wide text-mist">
              {presentationInfo.presenters.join('  ·  ')}
            </Reveal>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
