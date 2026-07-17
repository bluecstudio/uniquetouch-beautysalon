'use client';

import {
  type AnchorHTMLAttributes,
  type MouseEvent,
  useEffect,
} from 'react';
import { useRouter } from 'next/navigation'; // App Router — swap for 'next/router' in Pages Router
import { usePageTransition } from './TransitionContext';

const EXIT_DURATION_MS = 250;

interface TransitionLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

/**
 * Drop-in replacement for Next.js <Link> on any anchor you want to animate.
 * Captures the click coordinates, triggers the exit sequence, waits for the
 * animation, then navigates. Non-left-clicks and modifier keys pass through
 * untouched so ⌘-click / middle-click still open in a new tab.
 *
 * For Pages Router: change the import to 'next/router' and use
 * useRouter().push() — the rest is identical.
 */
export function TransitionLink({
  href,
  children,
  onClick,
  ...props
}: TransitionLinkProps) {
  const router = useRouter();
  const { startExit, onNavigated } = usePageTransition();

  // Prefetch on mount so navigation is instant after the 250ms exit
  useEffect(() => {
    router.prefetch(href);
  }, [href, router]);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Let browser handle modifier-key and non-primary clicks normally
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (e.button !== 0) return;

    e.preventDefault();
    onClick?.(e);

    startExit({ x: e.clientX, y: e.clientY });

    setTimeout(() => {
      router.push(href);
      onNavigated();
    }, EXIT_DURATION_MS);
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
