/**
 * pages/_app.tsx  (Pages Router)
 *
 * With Pages Router, AnimatePresence handles the exit cleanly because the old
 * page component stays mounted until its exit animation completes.
 *
 * Changes vs App Router:
 *  - Import useRouter from 'next/router' (not 'next/navigation')
 *  - AnimatePresence wraps the per-page PageEnter, keyed by pathname
 *  - ExitWrapper still provides the global dim/scale/blur exit
 *  - onExitComplete scrolls to top before the enter begins
 *
 * In TransitionLink.tsx, swap the import line to:
 *   import { useRouter } from 'next/router';
 */

import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { AnimatePresence } from 'framer-motion';
import { TransitionProvider } from '@/components/transitions';
import { GlowOverlay } from '@/components/transitions';
import { ExitWrapper } from '@/components/transitions';
import { PageEnter } from '@/components/transitions';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <TransitionProvider>
      <GlowOverlay />

      {/* Nav (outside ExitWrapper) */}

      <ExitWrapper>
        <AnimatePresence
          mode="wait"
          initial={false}
          onExitComplete={() => window.scrollTo({ top: 0, behavior: 'instant' })}
        >
          {/* Key change triggers unmount → exit → mount → enter */}
          <PageEnter key={router.pathname}>
            <Component {...pageProps} />
          </PageEnter>
        </AnimatePresence>
      </ExitWrapper>

      {/* Footer */}
    </TransitionProvider>
  );
}
