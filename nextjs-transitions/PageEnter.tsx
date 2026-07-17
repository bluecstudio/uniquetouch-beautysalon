'use client';

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Per-page enter animation. Place this in app/template.tsx (App Router)
 * so it remounts on every navigation, or key it by pathname in _app.tsx
 * (Pages Router) inside AnimatePresence.
 *
 * The combined effect with ExitWrapper:
 *   ExitWrapper:  blur 2px → 0px  (450ms, concurrent)
 *   PageEnter:    blur 4px → 0px  (450ms, concurrent)
 * Both clear simultaneously — the page "sharpens into focus."
 *
 * If the stacked blur feels too heavy on your specific content, reduce
 * the initial blur here to 2px.
 */
export function PageEnter({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{
        duration: 0.45,
        ease: EASE,
        // Stagger opacity slightly ahead of y so content doesn't feel heavy
        opacity: { duration: 0.35 },
      }}
      style={{
        willChange: 'transform, opacity, filter',
      }}
    >
      {children}
    </motion.div>
  );
}
