import { AnimatePresence, motion } from 'motion/react';

const shortcuts: [string[], string][] = [
  [['→', 'Espace', 'Page ↓'], 'Étape ou diapositive suivante'],
  [['←', 'Page ↑'], 'Étape ou diapositive précédente'],
  [['Début', 'Fin'], 'Première / dernière diapositive'],
  [['O', 'Échap'], "Vue d'ensemble"],
  [['N'], 'Notes de présentation'],
  [['P'], 'Vue présentateur (fenêtre séparée)'],
  [['F'], 'Plein écran'],
  [['M'], 'Activer / couper le son'],
  [['T'], 'Mode clair / sombre'],
  [['B'], 'Écran noir (pause)'],
  [['H', '?'], 'Afficher / masquer cette aide'],
];

export function ShortcutsHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="pointer-events-auto fixed inset-0 z-50 grid place-items-center bg-ink-950/70 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Raccourcis clavier"
        >
          <motion.div
            className="glass w-[min(620px,92vw)] rounded-3xl p-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-display text-[13px] uppercase tracking-[0.3em] text-white/50">Contrôles</div>
            <div className="mb-6 mt-1 font-display text-[28px] font-semibold text-white">Raccourcis clavier</div>
            <ul className="space-y-3">
              {shortcuts.map(([keys, label]) => (
                <li key={label} className="flex items-center justify-between gap-6 text-[16px] text-white/80">
                  <span>{label}</span>
                  <span className="flex flex-none gap-1.5">
                    {keys.map((k) => (
                      <span key={k} className="kbd text-white">
                        {k}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[13px] leading-relaxed text-white/45">
              Les télécommandes de présentation (Page ↑ / Page ↓) sont prises en charge. Ajoutez <code>?3d=off</code> à
              l'adresse pour forcer le mode léger sans 3D.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
