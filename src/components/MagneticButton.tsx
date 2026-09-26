import { useRef, type ReactNode } from 'react';
import styles from './Hero.module.css';

interface Props {
  href: string;
  className: string;
  children: ReactNode;
  /** Pixels of pull at the edge of the button. */
  strength?: number;
}

/**
 * The button drifts toward the cursor and springs back on leave — the
 * reference site's effect, without GSAP.
 *
 * The label moves further than the button, which is what sells it: the
 * two travelling at the same rate just looks like the whole thing slid.
 */
export default function MagneticButton({ href, className, children, strength = 22 }: Props) {
  const wrap = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  const canPull = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover)').matches &&
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

  const onMove = (event: React.PointerEvent<HTMLSpanElement>) => {
    if (!canPull() || !wrap.current) return;
    const rect = wrap.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * strength;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * strength;
    wrap.current.style.transform = `translate(${x}px, ${y}px)`;
    if (label.current) label.current.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
  };

  const reset = () => {
    if (wrap.current) wrap.current.style.transform = '';
    if (label.current) label.current.style.transform = '';
  };

  return (
    <span
      ref={wrap}
      className={styles.magnet}
      onPointerMove={onMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      <a className={className} href={href} onBlur={reset}>
        <span ref={label} className={styles.magnetLabel}>
          {children}
        </span>
      </a>
    </span>
  );
}
