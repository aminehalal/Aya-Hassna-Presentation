import { presentationInfo, questionsContent as c } from '../content/presentation';
import { AnimatedText } from '../components/ui/AnimatedText';
import { InstitutionLogo } from '../components/ui/InstitutionLogo';
import { Reveal } from '../components/ui/Reveal';
import type { SlideProps } from './types';

/** Scene 14 — Q&A screen with the presentation credits. */
export function Slide14Questions(_props: SlideProps) {
  const [first, second] = presentationInfo.presenters;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 40% 42% at 50% 50%, rgba(3,5,11,0.7) 0%, rgba(3,5,11,0) 100%)' }}
      />
      <div className="relative flex flex-col items-center">
        <Reveal className="mb-6 font-display text-[24px] uppercase tracking-[0.4em] text-mist/80">Échanges</Reveal>
        <AnimatedText
          as="h2"
          text={c.title}
          className="font-display text-[108px] font-semibold leading-none tracking-[-0.035em]"
          wordClassName="gradient-text"
          delay={0.3}
          stagger={0.1}
        />
        <Reveal delay={0.9} className="mt-6 text-[32px] text-mist">
          {c.lead}
        </Reveal>

        <Reveal delay={1.3} className="mt-14 flex flex-col items-center">
          <div className="mb-5 h-[1px] w-48 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="font-display text-[22px] uppercase tracking-[0.3em] text-mute">{c.creditsLabel}</div>
          <div className="mt-4 flex items-center gap-7 font-display text-[44px] font-medium text-white">
            <span>{first}</span>
            <span className="h-10 w-[1.5px] rotate-[18deg] bg-[color:var(--accent)]" />
            <span>{second}</span>
          </div>
          <div className="mt-5 text-[24px] text-mute">
            {presentationInfo.module} · Filière {presentationInfo.field}
          </div>
          <div className="mt-1 text-[24px] text-mute">{presentationInfo.academicYear}</div>
          <InstitutionLogo height={130} className="mt-7" />
        </Reveal>
      </div>
    </div>
  );
}
