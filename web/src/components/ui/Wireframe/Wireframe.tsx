import styles from './Wireframe.module.css';

export interface Cell {
  /** Grid columns this block spans. */
  span: number;
  /** Block height in rem. Leave out with `rowSpan` to stretch over the rows. */
  height?: number;
  /** Grid rows this block spans — a sidebar beside several rows. */
  rowSpan?: number;
  /** Fill applied after the outline is drawn. Leave out for an empty slot. */
  fill?: string;
  accent?: boolean;
  /** A circle `height` across, centred in its columns — a swatch, an avatar. */
  round?: boolean;
  /** Sits on the bottom of its row instead of the top — a chart's bars. */
  end?: boolean;
  /** Dropped on phones, where it is too thin to read as anything. */
  wideOnly?: boolean;
}

/** Fills used across the plans, light to dark. */
export const FILL = {
  faint: 'color-mix(in srgb, var(--ink) 4%, transparent)',
  soft: 'color-mix(in srgb, var(--ink) 5%, transparent)',
  mid: 'color-mix(in srgb, var(--ink) 7%, transparent)',
  strong: 'color-mix(in srgb, var(--ink) 14%, transparent)',
  ink: 'var(--ink)',
  accent: 'var(--accent)',
} as const;

interface Props {
  cells: Cell[];
  /** Columns in the grid. */
  columns?: number;
  /** Widest the plan is drawn, in rem. */
  maxWidth?: number;
  /**
   * Wait to draw until the plan scrolls into view, rather than on load —
   * for plans further down the page. Uses the shared [data-reveal] observer.
   */
  reveal?: boolean;
  /** Seconds before the first block is drawn. */
  delay?: number;
}

/**
 * A layout drawn as a wireframe: blocks outlined first, filled second.
 * Decorative. Static React — no client directive, so it ships no JS.
 */
export default function Wireframe({ cells, columns = 6, maxWidth = 32, reveal = false, delay = 0.35 }: Props) {
  return (
    <div
      className={styles.motif}
      aria-hidden="true"
      data-reveal={reveal ? '' : undefined}
      style={{ '--cols': columns, '--max': `${maxWidth}rem` } as React.CSSProperties}
    >
      {cells.map((cell, i) => (
        <span
          key={i}
          className={[
            styles.cell,
            cell.fill ? '' : styles.ghost,
            cell.accent ? styles.accent : '',
            cell.round ? styles.round : '',
            cell.end ? styles.end : '',
            cell.wideOnly ? styles.wideOnly : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={
            {
              gridColumn: `span ${cell.span}`,
              gridRow: cell.rowSpan ? `span ${cell.rowSpan}` : undefined,
              // Published as a variable so the stylesheet can round each
              // block against its own height rather than a fixed radius.
              '--cell-h': cell.height ? `calc(${cell.height}rem * var(--motif-scale, 1))` : undefined,
              height: cell.height ? 'var(--cell-h)' : undefined,
              '--delay': `${delay + i * 0.07}s`,
              '--index': i,
              '--cell-fill': cell.fill,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
