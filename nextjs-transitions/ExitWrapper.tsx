'use client';

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { usePageTransition } from './TransitionContext';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Persists across route changes (placed in layout.tsx, not template.tsx).
 * Applies a subtle recession effect on exit — dim, compress, breathe out.
 * On entry, it gently re-expands as the new page's own animation takes over.
 *
 * Wrap ONLY the content area beneath any fixed/sticky nav to avoid
 * animating elements that should remain locked to the viewport.
 */
export function ExitWrapper({ children }: { children: ReactNode }) {
  const { isExiting } = usePageTransition();

  return (
    <motion.div
      animate={
        isExiting
          ? { opacity: 0.85, scale: 0.99, filter: 'blur(2px)' }
          : { opacity: 1,    scale: 1,    filter: 'blur(0px)' }
      }
      transition={{
        duration: isExiting ? 0.25 : 0.45,
        ease: EASE,
      }}
      style={{
        // Force GPU layer — keeps scale/filter off the main thread
        willChange: 'transform, opacity, filter',
        // Prevent sub-pixel gaps on scale
        transformOrigin: 'center top',
      }}
    >
      {children}
    </motion.div>
  );
}
