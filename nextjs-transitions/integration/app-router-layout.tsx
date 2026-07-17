/**
 * app/layout.tsx  (App Router)
 *
 * TransitionProvider + GlowOverlay live here so they persist across routes.
 * ExitWrapper wraps only the scrollable content — NOT the fixed nav —
 * so the navbar stays locked while the page dims and recedes behind it.
 */

import type { ReactNode } from 'react';
import { TransitionProvider } from '@/components/transitions';
import { GlowOverlay } from '@/components/transitions';
import { ExitWrapper } from '@/components/transitions';

// Your existing nav/footer imports
// import { Nav } from '@/components/Nav';
// import { Footer } from '@/components/Footer';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TransitionProvider>
          {/* Glow sits above everything, pointer-events: none */}
          <GlowOverlay />

          {/* Nav stays outside ExitWrapper — fixed UI should not scale/dim */}
          {/* <Nav /> */}

          {/* ExitWrapper animates the content area on exit */}
          <ExitWrapper>
            {/* children = template.tsx output = PageEnter + page content */}
            {children}
          </ExitWrapper>

          {/* <Footer /> */}
        </TransitionProvider>
      </body>
    </html>
  );
}
