"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** True only on the client after hydration (for localStorage-backed UI). */
export function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}
