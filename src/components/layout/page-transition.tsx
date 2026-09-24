"use client";

import { usePathname } from "next/navigation";
import { ViewTransition } from "react";

/**
 * Soft cross-page transition (View Transitions API via React <ViewTransition>).
 * Keyed by pathname only, so filter/sort changes within a listing do not animate.
 * Browsers without support simply swap pages instantly.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <ViewTransition key={pathname} enter="page-enter" exit="page-exit" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
