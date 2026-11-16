import { AnimatePresence, motion } from 'motion/react';
import { EASE_OUT } from '../animations/motion';
import { presentationInfo } from '../content/presentation';
import { AnimatedText } from '../components/ui/AnimatedText';
import { InstitutionLogo } from '../components/ui/InstitutionLogo';
import type { SlideProps } from './types';

/** Scene 01 — cinematic opening: the core alone, then the title reveal. */
export function Slide01Intro({ step }: SlideProps) {
  const [first, second] = presentationInfo.presenters;
  return (
    <div className="absolute inset-0">
      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div
            key="teaser"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1.6, delay: 1.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
            {/* The institution opens the presentation, above the core */}
            <div className="absolute inset-x-0 top-[60px] flex justify-center">
              <InstitutionLogo height={170} />
            </div>
            <div className="absolute inset-x-0 bottom-[120px] flex flex-col items-center gap-6 text-center">
            <div className="font-display text-[26px] uppercase tracking-[0.42em] text-mist/80">
              {presentationInfo.module}
            </div>
            <div className="h-[1px] w-40 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            <div className="font-display text-[24px] tracking-[0.2em] text-mute">
              Filière {presentationInfo.field} · {presentationInfo.academicYear}
            </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="title"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: 'linear-gradient(90deg, rgba(3,5,11,0.82) 0%, rgba(3,5,11,0.45) 42%, rgba(3,5,11,0) 64%)' }}
            />
            <div className="relative flex h-full flex-col justify-between px-[120px] pb-[120px] pt-[70px]">
              <motion.div
                className="flex items-center gap-8 font-display text-[23px] uppercase tracking-[0.3em] text-mist/90"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: EASE_OUT }}
              >
                <InstitutionLogo height={118} />
                <span className="h-16 w-[1.5px] bg-white/20" />
                {presentationInfo.module}
              </motion.div>

              <div className="max-w-[1000px]">
                <AnimatedText
                  as="h1"
                  text="Le changement, l'innovation et l'apprentissage"
                  className="font-display text-[100px] font-semibold leading-[0.98] tracking-[-0.035em] text-white text-glow"
                  delay={0.7}
                  stagger={0.09}
                />
                <AnimatedText
                  as="div"
                  text="dans les organisations"
                  className="mt-4 font-display text-[54px] font-medium tracking-[-0.02em]"
                  wordClassName="gradient-text"
                  delay={1.25}
                  stagger={0.07}
                />
                <motion.p
                  className="mt-9 max-w-[800px] text-[31px] leading-[1.4] text-mist text-shadow-soft"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 1.7, ease: EASE_OUT }}
                >
                  {presentationInfo.subtitle}
                </motion.p>
              </div>

              <motion.div
                className="flex items-end gap-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, delay: 2.1, ease: EASE_OUT }}
              >
                <div>
                  <div className="mb-3 font-display text-[22px] uppercase tracking-[0.3em] text-mute">Présenté par</div>
                  <div className="flex items-center gap-6 font-display text-[40px] font-medium tracking-[-0.01em] text-white">
                    <span>{first}</span>
                    <span className="h-9 w-[1.5px] rotate-[18deg] bg-[color:var(--accent)]" />
                    <span>{second}</span>
                  </div>
                </div>
                <div className="mb-1 border-l border-white/15 pl-8 text-[24px] leading-[1.5] text-mute">
                  <div className="text-mist">Filière {presentationInfo.field}</div>
                  <div>{presentationInfo.academicYear}</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
