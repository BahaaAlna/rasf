import { useEffect, useRef, useState } from 'react';
import { getLenis } from '../lib/lenis';
import styles from './ScrollBar.module.css';

const MIN_THUMB = 40;

/**
 * Replaces the browser scrollbar with one that matches the site.
 *
 * The native bar is hidden by a class this component adds to <html>, so a
 * visitor without JavaScript keeps the real one rather than losing both.
 */
export default function ScrollBar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ height: 0, offset: 0 });
  const [dragging, setDragging] = useState(false);
  const [needed, setNeeded] = useState(false);

  // Hide the native bar only once this component is alive to replace it.
  useEffect(() => {
    document.documentElement.classList.add('has-custom-scrollbar');
    return () => document.documentElement.classList.remove('has-custom-scrollbar');
  }, []);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      const doc = document.documentElement;
      const viewport = doc.clientHeight;
      const total = doc.scrollHeight;
      const trackHeight = trackRef.current?.clientHeight ?? viewport;

      if (total <= viewport + 1) {
        setNeeded(false);
        return;
      }
      setNeeded(true);

      const height = Math.max(MIN_THUMB, (viewport / total) * trackHeight);
      const progress = window.scrollY / (total - viewport);
      setThumb({ height, offset: progress * (trackHeight - height) });
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    document.addEventListener('astro:after-swap', onScroll);

    // Sections revealing and fonts landing both change the page height.
    const ro = new ResizeObserver(onScroll);
    ro.observe(document.body);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('astro:after-swap', onScroll);
      ro.disconnect();
    };
  }, []);

  /** Map a pointer position on the track to a scroll position. */
  const scrollToPointer = (clientY: number, immediate: boolean) => {
    const track = trackRef.current;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;

    // Centre the thumb on the pointer.
    const usable = rect.height - thumb.height;
    if (usable <= 0) return;
    const ratio = (clientY - rect.top - thumb.height / 2) / usable;
    const target = Math.min(Math.max(ratio, 0), 1) * max;

    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target, { immediate });
    else window.scrollTo({ top: target, behavior: immediate ? 'auto' : 'smooth' });
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    setDragging(true);
    scrollToPointer(event.clientY, true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    scrollToPointer(event.clientY, true);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    (event.target as HTMLElement).releasePointerCapture?.(event.pointerId);
    setDragging(false);
  };

  if (!needed) return null;

  return (
    <div
      ref={trackRef}
      className={`${styles.track} ${dragging ? styles.isDragging : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      aria-hidden="true"
    >
      <div
        className={styles.thumb}
        style={{ height: `${thumb.height}px`, transform: `translateY(${thumb.offset}px)` }}
      />
    </div>
  );
}
