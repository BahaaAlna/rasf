import { useEffect, useRef } from 'react';
import styles from './Cursor.module.css';

/** How hard the bay chases the stone. Lower trails further. */
const EASE = 0.28;
/** Milliseconds between ground/target checks. Per frame is wasteful. */
const PROBE_MS = 90;
/** Below this relative luminance the ground counts as dark. */
const DARK = 0.42;
/** Bay travel under this, in pixels, counts as arrived. */
const SETTLED = 0.1;

/** Things whose own cursor is worth keeping. */
const TEXTUAL = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';
const CLICKABLE = 'a, button, [role="button"], summary, label[for]';

/**
 * sRGB relative luminance, or null when nothing is actually painted.
 *
 * Two formats turn up here. `rgb()` carries 0–255 components, while the
 * `color(srgb …)` that color-mix() resolves to carries 0–1 — reading the
 * second as the first makes every mixed surface look pure black, which
 * is how the translucent header came out reading as dark ground.
 */
function paint(colour: string): number | null {
  if (!colour || colour === 'transparent') return null;
  const nums = colour.match(/-?[\d.]+(?:e[+-]?\d+)?/gi);
  if (!nums || nums.length < 3) return null;

  const unit = colour.startsWith('color(') ? 255 : 1;
  const [r, g, b] = nums.slice(0, 3).map((n) => Number(n) * unit);
  const alpha = nums.length > 3 ? Number(nums[3]) : 1;
  // Too sheer to count as ground; whatever is behind it decides.
  if (alpha < 0.35) return null;

  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Walk up until something actually paints a background. */
function groundLuminance(el: Element | null) {
  let node: Element | null = el;
  for (let i = 0; node && i < 8; i++) {
    const own = paint(getComputedStyle(node).backgroundColor);
    if (own !== null) return own;
    // Components here routinely carry their fill on a pseudo-element —
    // the plan's accent block is one — and the element itself is then
    // transparent, so skipping this walks straight past the colour.
    const before = paint(getComputedStyle(node, '::before').backgroundColor);
    if (before !== null) return before;
    node = node.parentElement;
  }
  return 1;
}

/**
 * Rasf's pointer: a stone locked to the cursor and the bay it is laid
 * into, trailing behind.
 *
 * Mount once, in the layout. Draws nothing on touch screens or under
 * reduced motion — the overlay is hidden in the stylesheet until script
 * confirms it is running, so a pointer that never arrives cannot leave
 * a stray dot parked in the corner of the screen.
 */
export default function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const stone = useRef<HTMLSpanElement>(null);
  const bay = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
    if (!fine) return;

    const host = root.current;
    const dot = stone.current;
    const ring = bay.current;
    if (!host || !dot || !ring) return;

    document.documentElement.classList.add('has-custom-cursor');

    const to = { x: innerWidth / 2, y: innerHeight / 2 };
    const at = { ...to };
    let frame = 0;
    let probed = 0;
    let seen = false;
    /** The ground reading is out of date, so the loop may not stop. */
    let stale = true;
    /*
      What was last under the pointer. The luminance walk is up to
      sixteen getComputedStyle calls, each of which forces a style
      recalculation — far too much to repeat eleven times a second while
      the pointer sits inside the same element.
    */
    let under: Element | null = null;

    const read = () => {
      const now = document.elementFromPoint(to.x, to.y);
      if (now === under) return;
      under = now;
      // A text field keeps its own I-beam; ours would only get in the way.
      const textual = !!now?.closest(TEXTUAL);
      host.style.opacity = textual ? '0' : '1';
      document.documentElement.classList.toggle('has-custom-cursor', !textual);
      host.classList.toggle(styles.active, !!now?.closest(CLICKABLE));
      host.classList.toggle(styles.onDark, groundLuminance(now) < DARK);
    };

    /*
      Only the bay is animated here. The stone is written straight from
      the pointer event instead, because a frame loop can only ever draw
      where the pointer was when the frame began — and with the real
      cursor hidden, that one frame of arrears is the whole of the lag.
    */
    const step = (now: number) => {
      const dx = to.x - at.x;
      const dy = to.y - at.y;
      at.x += dx * EASE;
      at.y += dy * EASE;
      ring.style.transform = `translate(${at.x.toFixed(2)}px, ${at.y.toFixed(2)}px)`;

      if (stale && now - probed > PROBE_MS) {
        probed = now;
        stale = false;
        read();
      }

      // A still pointer over ground already read has nothing left to
      // draw, so the loop stands down until something wakes it.
      const arrived = Math.abs(dx) < SETTLED && Math.abs(dy) < SETTLED;
      if (arrived) {
        at.x = to.x;
        at.y = to.y;
      }
      frame = arrived && !stale ? 0 : requestAnimationFrame(step);
    };

    const wake = () => {
      stale = true;
      if (!frame) frame = requestAnimationFrame(step);
    };

    const onMove = (event: PointerEvent) => {
      to.x = event.clientX;
      to.y = event.clientY;
      dot.style.transform = `translate(${to.x}px, ${to.y}px)`;
      if (!seen) {
        // Jump the bay to the first sighting instead of flying it in
        // from the middle of the screen.
        seen = true;
        at.x = to.x;
        at.y = to.y;
        ring.style.transform = `translate(${to.x}px, ${to.y}px)`;
        host.style.opacity = '1';
      }
      wake();
    };

    // Scrolling changes the ground without moving the pointer, so the
    // reading has to be retaken even though nothing was touched.
    const onScroll = () => {
      under = null;
      wake();
    };

    const onLeave = () => {
      host.style.opacity = '0';
    };
    const onEnter = () => {
      if (seen) host.style.opacity = '1';
    };
    const onDown = () => host.classList.add(styles.down);
    const onUp = () => host.classList.remove(styles.down);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('pointerenter', onEnter);
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    frame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointerenter', onEnter);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, []);

  /*
    Two layers each. The outer span carries the position, rewritten from
    script every frame; the inner disc carries the size, animated in CSS.
    They cannot share one transform — script would trample the
    transition on it — and the size has to be a transform rather than a
    width, or every frame of every hover costs a layout pass.
  */
  return (
    <div ref={root} className={styles.root} aria-hidden="true">
      <span ref={bay} className={styles.bay}>
        <i className={styles.ring} />
      </span>
      <span ref={stone} className={styles.stone}>
        <i className={styles.dot} />
      </span>
    </div>
  );
}
