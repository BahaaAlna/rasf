/*
  About's live parts. Markup and styles live in About.astro.

  Two things fill as the page scrolls: the manifesto, word by word (`--p`),
  and the process line, step by step (`--t`). Each is handed a single
  number from 0 to 1 and does the rest in CSS.
*/

/*
  Set up on every page load, not once: the ClientRouter swaps the whole
  document, and the previous page's listeners are dropped just
  before it does.
*/
export function initAbout() {
  const stop = new AbortController();
  document.addEventListener('astro:before-swap', () => stop.abort(), { once: true, signal: stop.signal });

  // The manifesto starts inking as its top passes 85% of the screen and
  // is done when its bottom reaches the middle.
  fillOnScroll('[data-manifesto]', '--p', 0.85, 0.5, stop.signal);
  // The process line draws a little later and quicker: it is shorter.
  fillOnScroll('[data-process]', '--t', 0.8, 0.6, stop.signal);
}

/**
 * Hands `prop` the share of the element scrolled past, from 0 when its
 * top crosses `start` (a fraction of the screen's height, from the top) to
 * 1 when its bottom crosses `end`. With motion reduced it is left alone,
 * and the stylesheet's resting value — finished — stands.
 */
function fillOnScroll(selector: string, prop: string, start: number, end: number, signal: AbortSignal) {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;
  if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return;

  let frame = 0;
  const update = () => {
    frame = 0;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const share = (vh * start - rect.top) / (vh * (start - end) + rect.height);
    el.style.setProperty(prop, Math.min(Math.max(share, 0), 1).toFixed(3));
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  window.addEventListener('scroll', schedule, { passive: true, signal });
  window.addEventListener('resize', schedule, { signal });
  update();
}
