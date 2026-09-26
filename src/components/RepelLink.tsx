import { useEffect, useRef, type ReactNode } from 'react';
import styles from './Header.module.css';

interface Props {
  href: string;
  children: ReactNode;
  /** Peak pixels of push, reached at the edge of the field. */
  strength?: number;
  /**
   * Called with this link's own box when the pointer takes it, and with
   * null when it leaves. The header uses it to send the dot over.
   */
  onActivate?: (field: HTMLElement | null) => void;
}

/**
 * A nav word that is pushed AWAY from the cursor — like poles repelling —
 * and drifts back to rest when the pointer leaves.
 *
 * The motion is a per-frame lerp toward a target rather than a CSS
 * transition. A transition restarts its curve on every pointermove, which
 * reads as rubbery lag; chasing a target frame by frame stays smooth no
 * matter how fast the pointer crosses the word. The loop is only alive
 * while there is distance left to close, so an untouched nav costs nothing.
 */
export default function RepelLink({ href, children, strength = 14, onActivate }: Props) {
  const field = useRef<HTMLSpanElement>(null);
  const word = useRef<HTMLSpanElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const at = useRef({ x: 0, y: 0 });
  const frame = useRef(0);

  const canMove = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover)').matches &&
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

  const step = () => {
    const a = at.current;
    const t = target.current;
    a.x += (t.x - a.x) * 0.14;
    a.y += (t.y - a.y) * 0.14;

    const settled = Math.abs(t.x - a.x) < 0.05 && Math.abs(t.y - a.y) < 0.05;

    if (settled && t.x === 0 && t.y === 0) {
      // Back at rest: drop the inline style so the element is clean again.
      a.x = 0;
      a.y = 0;
      if (word.current) word.current.style.transform = '';
      frame.current = 0;
      return;
    }

    if (word.current) {
      word.current.style.transform = `translate(${a.x.toFixed(2)}px, ${a.y.toFixed(2)}px)`;
    }
    frame.current = requestAnimationFrame(step);
  };

  const wake = () => {
    if (!frame.current) frame.current = requestAnimationFrame(step);
  };

  const onMove = (event: React.PointerEvent<HTMLSpanElement>) => {
    if (!canMove() || !field.current) return;
    const rect = field.current.getBoundingClientRect();
    // -0.5 at one edge, +0.5 at the other. Negated, so the word travels
    // opposite the cursor: the closer to an edge, the harder the push.
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;
    target.current = { x: -relX * strength * 2, y: -relY * strength * 2 };
    wake();
  };

  const release = () => {
    target.current = { x: 0, y: 0 };
    wake();
    onActivate?.(null);
  };

  const take = () => onActivate?.(field.current);

  useEffect(
    () => () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    },
    [],
  );

  return (
    <span
      ref={field}
      className={styles.field}
      onPointerEnter={take}
      onPointerMove={onMove}
      onPointerLeave={release}
      onPointerCancel={release}
    >
      <a className={styles.link} href={href} onFocus={take} onBlur={release}>
        <span ref={word} className={styles.linkInner}>
          {children}
        </span>
      </a>
    </span>
  );
}
