import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Inertial scrolling, matching the weighted feel of the reference site but
 * without Locomotive Scroll's jQuery dependency or its scroll hijacking.
 *
 * Renders nothing. Mount once per page, below the fold work is unaffected.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)');
    if (!motionOk.matches) return;

    const lenis = new Lenis({
      // Long and heavily front-loaded, the same shape as the site's easing.
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Touch devices already have native momentum; doubling it feels wrong.
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    // Anchor links must go through Lenis, or they jump and desync it.
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement)?.closest?.('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href')!.slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: 0 });
      // Keep the URL and focus behaviour of a real anchor jump.
      history.pushState(null, '', `#${id}`);
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    };

    document.addEventListener('click', onClick);

    // Astro's ClientRouter swaps the document; re-measure after each swap.
    const onSwap = () => lenis.resize();
    document.addEventListener('astro:after-swap', onSwap);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('click', onClick);
      document.removeEventListener('astro:after-swap', onSwap);
      lenis.destroy();
    };
  }, []);

  return null;
}
