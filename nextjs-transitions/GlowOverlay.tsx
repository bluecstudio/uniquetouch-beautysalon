'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePageTransition } from './TransitionContext';

/**
 * Cream-tone radial glow that blooms from the exact click position,
 * simulating light catching the page mid-turn. Opacity is intentionally
 * very low — it reads as atmosphere, not a visible effect.
 */
export function GlowOverlay() {
  const { glowOrigin } = usePageTransition();

  return (
    <AnimatePresence>
      {glowOrigin && (
        <motion.div
          // Unique key forces remount on each new navigation origin
          key={`${glowOrigin.x}-${glowOrigin.y}`}
          aria-hidden
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.6 }}
          transition={{
            duration: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            position: 'fixed',
            // Center the glow on the click point
            left: glowOrigin.x,
            top: glowOrigin.y,
            translate: '-50% -50%',
            // 480px is large enough to feel like ambient light, not a spotlight
            width: 480,
            height: 480,
            borderRadius: '50%',
            // Cream at the core (10% opacity), fully transparent at edge
            background:
              'radial-gradient(circle at center, rgba(248,243,236,0.10) 0%, rgba(248,243,236,0.04) 45%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 9998,
            // Prevent the glow from causing layout repaints
            willChange: 'transform, opacity',
          }}
        />
      )}
    </AnimatePresence>
  );
}
