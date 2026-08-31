"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    desktop?: {
      isDesktop: boolean;
    };
  }
}

/**
 * True when running inside the Electron shell, which exposes this flag from its
 * preload script. Resolved in an effect rather than during render so the server
 * and the first client render agree.
 *
 * Used to hide online-only affordances such as Google sign-in, since the
 * desktop build ships without OAuth credentials.
 */
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(Boolean(window.desktop?.isDesktop));
  }, []);

  return isDesktop;
}
