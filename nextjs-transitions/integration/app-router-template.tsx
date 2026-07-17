/**
 * app/template.tsx  (App Router)
 *
 * Unlike layout.tsx, template.tsx creates a NEW instance on every navigation.
 * This is what makes AnimatePresence-style enter animations work in App Router:
 * the PageEnter component remounts fresh each time, triggering its initial →
 * animate transition automatically.
 *
 * Exit animations on template.tsx don't fire reliably — that's handled by
 * ExitWrapper in layout.tsx instead.
 */

import type { ReactNode } from 'react';
import { PageEnter } from '@/components/transitions';

export default function Template({ children }: { children: ReactNode }) {
  return <PageEnter>{children}</PageEnter>;
}
