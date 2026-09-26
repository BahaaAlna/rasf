import styles from './WireframeMotif.module.css';

interface Cell {
  /** Grid columns this block spans, out of 6. */
  span: number;
  /** Block height in rem. */
  height: number;
  /** Fill applied after the outline is drawn. */
  fill: string;
  accent?: boolean;
  /** Dropped on phones, where it is too thin to read as anything. */
  wideOnly?: boolean;
}

/*
  Reads as a page layout: masthead, hero split, two lines of copy, then a
  row of three cards. One block takes the accent, tying it to the logo dot.
*/
const CELLS: Cell[] = [
  { span: 6, height: 2.2, fill: 'color-mix(in srgb, var(--ink) 4%, transparent)' },
  { span: 4, height: 6, fill: 'color-mix(in srgb, var(--ink) 7%, transparent)' },
  { span: 2, height: 6, fill: 'var(--accent)', accent: true },
  { span: 6, height: 0.9, fill: 'color-mix(in srgb, var(--ink) 4%, transparent)', wideOnly: true },
  { span: 5, height: 0.9, fill: 'color-mix(in srgb, var(--ink) 4%, transparent)', wideOnly: true },
  { span: 2, height: 4.8, fill: 'color-mix(in srgb, var(--ink) 5%, transparent)' },
  { span: 2, height: 4.8, fill: 'color-mix(in srgb, var(--ink) 5%, transparent)' },
  { span: 2, height: 4.8, fill: 'color-mix(in srgb, var(--ink) 5%, transparent)' },
];

/** Decorative. Static React — no client directive, so it ships no JS. */
export default function WireframeMotif() {
  return (
    <div className={styles.motif} aria-hidden="true">
      {CELLS.map((cell, i) => (
        <span
          key={i}
          className={[
            styles.cell,
            cell.accent ? styles.accent : '',
            cell.wideOnly ? styles.wideOnly : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={
            {
              gridColumn: `span ${cell.span}`,
              // Published as a variable so the stylesheet can round each
              // block against its own height rather than a fixed radius.
              '--cell-h': `calc(${cell.height}rem * var(--motif-scale, 1))`,
              height: 'var(--cell-h)',
              '--delay': `${0.35 + i * 0.07}s`,
              '--index': i,
              '--cell-fill': cell.fill,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
