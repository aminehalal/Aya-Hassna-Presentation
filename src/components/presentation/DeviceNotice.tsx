import { AnimatePresence, motion } from 'motion/react';
import { Laptop } from 'lucide-react';
import { useState } from 'react';
import { EASE_OUT } from '../../animations/motion';
import { useIsPhone } from '../../hooks/useIsPhone';

const STORAGE_KEY = 'est-presentation-phone-notice';

function alreadyDismissed() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === 'dismissed';
  } catch {
    return false;
  }
}

/**
 * Shown once per visit on phones: the 3D presentation is designed for a
 * laptop (large screen, keyboard, graphics). Visitors can still continue.
 */
export function DeviceNotice() {
  const isPhone = useIsPhone();
  const [dismissed, setDismissed] = useState(alreadyDismissed);

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, 'dismissed');
    } catch {
      /* not persisted in private mode */
    }
  };

  return (
    <AnimatePresence>
      {isPhone && !dismissed && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-950/85 p-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="device-notice-title"
        >
          <motion.div
            className="glass w-full max-w-[420px] rounded-3xl p-7 text-center"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          >
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-white/15 bg-white/[0.06] text-[color:var(--accent)]">
              <Laptop size={32} />
            </div>
            <h2 id="device-notice-title" className="font-display text-[22px] font-semibold leading-tight text-white">
              Pour l'expérience complète, utilisez un ordinateur portable
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-mist">
              Cette présentation en 3D est conçue pour un grand écran et un clavier. Sur téléphone, l'affichage est réduit et
              les animations peuvent être moins fluides.
            </p>
            <p dir="rtl" lang="ar" className="mt-3 text-[15px] leading-relaxed text-mist">
              للحصول على التجربة الكاملة، يُرجى استعمال حاسوب محمول.
            </p>
            <button
              type="button"
              onClick={dismiss}
              className="mt-6 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 font-display text-[15px] text-white transition hover:bg-white/10"
            >
              Continuer sur le téléphone
            </button>
            <p className="mt-3 text-[12px] text-white/45">Conseil : tournez le téléphone à l'horizontale.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
