/*
  The Work list's floating picture: on a hovering pointer, each row calls
  up its project's shot, which hangs off the pointer on a soft spring.
  Markup and styles live in Work.astro; this is only the motion.
*/

/** How hard the picture is pulled toward the pointer. Lower floats more. */
const PULL = 0.03;
/** Velocity kept each frame. Closer to 1 overshoots and drifts longer. */
const DRAG = 0.88;
/** Gap between the pointer and the bottom of the picture above it. */
const GAP = 28;

/*
  Set up on every page load, not once: the ClientRouter swaps the whole
  document when moving between pages (or languages), and a module script
  only runs the first time — after a swap it would be holding the old,
  discarded rows and the new ones would do nothing on hover.
*/
export function initFloatingShot() {
  const root = document.getElementById('work');
  const shot = root?.querySelector<HTMLElement>('.shot');
  const list = root?.querySelector<HTMLElement>('.work__list ol');

  // Only for a pointer that can hover: on touch a tap is a click, and the
  // picture would flash up just as the page leaves.
  if (root && shot && list && window.matchMedia('(hover: hover)').matches) {
    const still = !window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
    const shots = [...shot.querySelectorAll<HTMLImageElement>('img')];
    const pointer = { x: 0, y: 0 };
    const at = { x: 0, y: 0, vx: 0, vy: 0 };
    let on = false;
    let frame = 0;

    /** Where it wants to be: centred over the pointer, kept on screen. */
    const aim = () => {
      const w = shot.offsetWidth;
      const h = shot.offsetHeight;
      return {
        x: Math.min(Math.max(pointer.x - w / 2, 12), window.innerWidth - w - 12),
        y: Math.min(Math.max(pointer.y - h - GAP, 12), window.innerHeight - h - 12),
      };
    };

    /*
      A soft spring that overshoots and settles, a slow bob that never
      quite stops, and a tilt into the direction it is being pulled — the
      picture hangs off the pointer rather than being stuck to it.
    */
    const step = () => {
      const target = aim();
      if (still) {
        at.x = target.x;
        at.y = target.y;
      } else {
        at.vx = (at.vx + (target.x - at.x) * PULL) * DRAG;
        at.vy = (at.vy + (target.y - at.y) * PULL) * DRAG;
        at.x += at.vx;
        at.y += at.vy;
      }
      const t = performance.now() / 1000;
      const bobX = still ? 0 : Math.sin(t * 0.9) * 4;
      const bobY = still ? 0 : Math.sin(t * 1.3 + 1) * 6;
      const tilt = still ? 0 : Math.max(-8, Math.min(8, at.vx * 0.35)) + Math.sin(t * 0.7);
      shot.style.transform =
        'translate(' + (at.x + bobX).toFixed(1) + 'px, ' + (at.y + bobY).toFixed(1) + 'px) rotate(' + tilt.toFixed(2) + 'deg)';
      frame = on ? requestAnimationFrame(step) : 0;
    };

    const show = (index: number) => {
      shots.forEach((img, i) => img.classList.toggle('is-current', i === index));
      if (on) return;
      // Opening: start where it is going, not wherever it was let go.
      on = true;
      const start = aim();
      Object.assign(at, { x: start.x, y: start.y, vx: 0, vy: 0 });
      shot.classList.add('is-on');
      if (!frame) frame = requestAnimationFrame(step);
    };

    const hide = () => {
      on = false;
      shot.classList.remove('is-on');
    };

    const track = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };

    list.querySelectorAll<HTMLElement>('[data-shot]').forEach((row) => {
      row.addEventListener('pointerenter', (event) => {
        track(event);
        show(Number(row.dataset.shot));
      });
    });
    list.addEventListener('pointermove', track, { passive: true });
    // Left as a whole, not row by row: crossing from one row to the next
    // only changes the picture.
    list.addEventListener('pointerleave', hide);
    // Leaving the page mid-hover: stop the loop rather than let it keep
    // animating a picture that is about to be thrown away.
    document.addEventListener('astro:before-swap', hide, { once: true });
  }
}
