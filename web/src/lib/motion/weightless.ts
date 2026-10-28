/*
  Weightless buttons: the same drift as the Work list's floating picture,
  scaled down to a button.

  Mark any element `data-weightless` and it is drawn toward the pointer
  on a soft spring while hovered — overshooting, bobbing gently, tilting
  into the pull — and let go it floats back to rest rather than snapping.
  A child marked `data-weightless-label` travels a little further than
  its button, which is what makes it read as floating rather than sliding.

  Motion is written to the individual `translate` and `rotate` properties,
  never `transform`, so it composes with whatever transform the element
  already has (the reveal, a mirrored arrow) instead of overwriting it.
*/

/** How hard the button is pulled toward its target. Lower floats more. */
const PULL = 0.08;
/** Velocity kept each frame. Closer to 1 overshoots and drifts longer. */
const DRAG = 0.78;
/** Pixels of pull with the pointer at the button's edge. */
const REACH = 9;
/** How much further the label travels than its button. */
const LABEL = 0.3;
/** Below this, in pixels and pixels per frame, it counts as at rest. */
const SETTLED = 0.05;

const attached = new WeakSet<HTMLElement>();

function attach(el: HTMLElement) {
  attached.add(el);
  const label = el.querySelector<HTMLElement>('[data-weightless-label]');
  const target = { x: 0, y: 0 };
  const at = { x: 0, y: 0, vx: 0, vy: 0 };
  let hovered = false;
  let frame = 0;

  const step = () => {
    at.vx = (at.vx + (target.x - at.x) * PULL) * DRAG;
    at.vy = (at.vy + (target.y - at.y) * PULL) * DRAG;
    at.x += at.vx;
    at.y += at.vy;

    const resting =
      !hovered &&
      Math.abs(at.x) < SETTLED &&
      Math.abs(at.y) < SETTLED &&
      Math.abs(at.vx) < SETTLED &&
      Math.abs(at.vy) < SETTLED;

    if (resting || !el.isConnected) {
      // Back at rest: drop the inline styles so the element is clean again.
      el.style.translate = el.style.rotate = '';
      if (label) label.style.translate = '';
      frame = 0;
      return;
    }

    // A slow bob while it is held, so it never quite comes to a stop.
    const t = performance.now() / 1000;
    const bobX = hovered ? Math.sin(t * 1.1) * 0.6 : 0;
    const bobY = hovered ? Math.sin(t * 1.6 + 1) * 0.8 : 0;
    const tilt = Math.max(-1.5, Math.min(1.5, at.vx * 0.4));

    el.style.translate = `${(at.x + bobX).toFixed(2)}px ${(at.y + bobY).toFixed(2)}px`;
    el.style.rotate = `${tilt.toFixed(2)}deg`;
    if (label) label.style.translate = `${(at.x * LABEL).toFixed(2)}px ${(at.y * LABEL).toFixed(2)}px`;
    frame = requestAnimationFrame(step);
  };

  const wake = () => {
    if (!frame) frame = requestAnimationFrame(step);
  };

  el.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    hovered = true;
    // Measured without our own offset, so the pull doesn't feed on itself.
    const rect = el.getBoundingClientRect();
    const cx = rect.left - at.x + rect.width / 2;
    const cy = rect.top - at.y + rect.height / 2;
    target.x = ((event.clientX - cx) / rect.width) * REACH * 2;
    target.y = ((event.clientY - cy) / rect.height) * REACH * 2;
    wake();
  });

  const release = () => {
    hovered = false;
    target.x = target.y = 0;
    wake();
  };
  el.addEventListener('pointerleave', release);
  el.addEventListener('pointercancel', release);
  el.addEventListener('focusout', release);
}

/**
 * Attach every `[data-weightless]` on the page that isn't already.
 * Safe to call as often as you like: run it on each page load and
 * whenever islands hydrate, because React replaces the nodes it renders.
 */
export function initWeightless() {
  const can =
    window.matchMedia('(hover: hover)').matches &&
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  if (!can) return;
  document.querySelectorAll<HTMLElement>('[data-weightless]').forEach((el) => {
    if (!attached.has(el)) attach(el);
  });
}
