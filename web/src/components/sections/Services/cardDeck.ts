/*
  The Services deck's depth: how far down the pile each card sits, handed
  to CSS as `--depth` so a covered card can shrink and dim. Markup and
  styles live in Services.astro; this only measures.

  A card's depth is the sum of how far each later card has slid over the
  one before it — 0 while nothing covers it, 1 once the next card has
  fully landed, 2 once another has landed on that, and so on, moving
  smoothly in between.
*/

const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

/*
  Set up on every page load, not once: the ClientRouter swaps the whole
  document, and the cards measured last time are gone. The previous
  page's listeners are dropped just before the swap.
*/
export function initCardDeck() {
  const cards = [...document.querySelectorAll<HTMLElement>('#services .card')];
  const sheets = cards.map((card) => card.querySelector<HTMLElement>('.card__sheet'));
  if (cards.length < 2) return;
  // Still stacks under reduced motion; only the shrinking and dimming go.
  if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return;

  const stop = new AbortController();
  let frame = 0;

  const update = () => {
    frame = 0;
    const rects = cards.map((card) => card.getBoundingClientRect());
    // Where each card sticks, resolved to pixels by the browser.
    const rest = cards.map((card) => parseFloat(getComputedStyle(card).top));
    // How far card j has slid over card j - 1, from 0 to 1.
    const over = cards.map((_, j) => (j === 0 ? 0 : clamp(1 - (rects[j].top - rest[j]) / rects[j - 1].height)));

    let depth = 0;
    for (let i = cards.length - 1; i >= 0; i--) {
      sheets[i]?.style.setProperty('--depth', depth.toFixed(3));
      depth += over[i];
    }
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  window.addEventListener('scroll', schedule, { passive: true, signal: stop.signal });
  window.addEventListener('resize', schedule, { signal: stop.signal });
  document.addEventListener('astro:before-swap', () => stop.abort(), { once: true, signal: stop.signal });
  update();
}
