import styles from './WireframeMotif.module.css';

interface Cell {
  /** Grid columns this block spans, out of 6. */
  span: number;
  /** Block height in rem. */
  height: number;
  /** Fill applied after the outline is drawn. */
  fill: string;
  accent?: boolean;
}

/*
  Reads as a page layout: masthead, hero split, two lines of copy, then a
  row of three cards. One block takes the accent, tying it to the logo dot.
*/
const CELLS: Cell[] = [
  { span: 6, height: 1.1, fill: 'color-mix(in srgb, var(--ink) 4%, transparent)' },
  { span: 4, height: 3, fill: 'color-mix(in srgb, var(--ink) 7%, transparent)' },
  { span: 2, height: 3, fill: 'var(--accent)', accent: true },
  { span: 6, height: 0.45, fill: 'color-mix(in srgb, var(--ink) 4%, transparent)' },
  { span: 5, height: 0.45, fill: 'color-mix(in srgb, var(--ink) 4%, transparent)' },
  { span: 2, height: 2.4, fill: 'color-mix(in srgb, var(--ink) 5%, transparent)' },
  { span: 2, height: 2.4, fill: 'color-mix(in srgb, var(--ink) 5%, transparent)' },
  { span: 2, height: 2.4, fill: 'color-mix(in srgb, var(--ink) 5%, transparent)' },
];

/** Decorative. Static React — no client directive, so it ships no JS. */
export default function WireframeMotif() {
  return (
    <div className={styles.motif} aria-hidden="true">
      {CELLS.map((cell, i) => (
        <span
          key={i}
          className={`${styles.cell} ${cell.accent ? styles.accent : ''}`}
          style={
            {
              gridColumn: `span ${cell.span}`,
              height: `${cell.height}rem`,
              '--delay': `${0.35 + i * 0.07}s`,
              '--cell-fill': cell.fill,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
