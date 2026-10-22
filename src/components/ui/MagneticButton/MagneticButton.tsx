import type { ReactNode } from 'react';
import styles from './MagneticButton.module.css';

interface Props {
  href: string;
  className: string;
  children: ReactNode;
}

/**
 * A button that floats toward the cursor as if weightless and drifts back
 * on leave. The motion itself is shared by every button on the site — see
 * `lib/motion/weightless.ts`; this only marks the parts it moves.
 *
 * The wrapper carries the float so the button keeps its own hover
 * styling, and the label travels further than the button, which is what
 * sells it: the two moving together just looks like the whole thing slid.
 */
export default function MagneticButton({ href, className, children }: Props) {
  return (
    <span className={styles.magnet} data-weightless>
      <a className={className} href={href}>
        <span className={styles.magnetLabel} data-weightless-label>
          {children}
        </span>
      </a>
    </span>
  );
}
