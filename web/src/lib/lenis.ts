import type Lenis from 'lenis';

/*
  Shared handle on the single Lenis instance.

  The scrollbar has to drive the same scroller the wheel does — setting
  scrollTop directly fights Lenis and stutters — so both islands reach the
  instance through here rather than through `window`.
*/

let instance: Lenis | null = null;
const listeners = new Set<(lenis: Lenis | null) => void>();

export function setLenis(next: Lenis | null) {
  instance = next;
  listeners.forEach((fn) => fn(next));
}

export function getLenis() {
  return instance;
}

/** Fires immediately with the current value, then on every change. */
export function onLenis(fn: (lenis: Lenis | null) => void) {
  listeners.add(fn);
  fn(instance);
  return () => listeners.delete(fn);
}
