'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';

export interface GlowOrigin {
  x: number;
  y: number;
}

interface TransitionContextValue {
  isExiting: boolean;
  glowOrigin: GlowOrigin | null;
  startExit: (origin: GlowOrigin) => void;
  onNavigated: () => void;
}

const TransitionContext = createContext<TransitionContextValue>({
  isExiting: false,
  glowOrigin: null,
  startExit: () => {},
  onNavigated: () => {},
});

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [isExiting, setIsExiting] = useState(false);
  const [glowOrigin, setGlowOrigin] = useState<GlowOrigin | null>(null);
  // Prevent overlapping transitions if user clicks rapidly
  const transitionLock = useRef(false);

  const startExit = useCallback((origin: GlowOrigin) => {
    if (transitionLock.current) return;
    transitionLock.current = true;
    setGlowOrigin(origin);
    setIsExiting(true);
  }, []);

  const onNavigated = useCallback(() => {
    setIsExiting(false);
    transitionLock.current = false;
    // Keep glow alive long enough to finish fading, then clear
    setTimeout(() => setGlowOrigin(null), 600);
  }, []);

  return (
    <TransitionContext.Provider value={{ isExiting, glowOrigin, startExit, onNavigated }}>
      {children}
    </TransitionContext.Provider>
  );
}

export const usePageTransition = () => useContext(TransitionContext);
