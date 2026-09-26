import { useEffect, useState } from 'react';
import styles from './Hero.module.css';
import WireframeMotif from './WireframeMotif';
import MagneticButton from './MagneticButton';

export interface HeroProps {
  /** Static part of the sentence, before the cycling word. */
  lead: string;
  /** Candidate final words, shown in order. */
  words: string[];
  /** Seconds each word is held. */
  interval: number;
  /** Supporting line beneath the sentence. */
  support: string;
  actions: { viewWork: string; contact: string };
  /** Separator used when the words are read out as a list. */
  listSeparator?: string;
}

/**
 * The sentence never moves; only its final word does. Every candidate word
 * shares one grid cell, so the line's width is fixed by the longest word
 * and swapping causes no layout shift.
 */
export default function Hero({
  lead,
  words,
  interval,
  support,
  actions,
  listSeparator = ', ',
}: HeroProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length < 2) return;

    // Auto-changing content is exactly what this preference guards against,
    // so settle on the first word and stop.
    const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)');
    if (!motionOk.matches) return;

    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % words.length),
      interval * 1000,
    );
    return () => window.clearInterval(id);
  }, [words.length, interval]);

  const stateFor = (i: number) => {
    if (i === index) return styles.isCurrent;
    // The word just retired leaves upward; everything else waits below.
    const prev = (index - 1 + words.length) % words.length;
    return i === prev ? styles.isPrev : styles.isNext;
  };

  const leadWords = lead.split(' ').filter(Boolean);

  return (
    <section className={styles.hero}>
      <div className={styles.message}>
      <h1 className={styles.line}>
        {/* Read once, in full, by assistive tech. */}
        <span className="u-visually-hidden">
          {`${lead} ${words.join(listSeparator)}.`}
        </span>
        {/* The animated version, hidden from the accessibility tree so the
            rotating word is not announced over and over. */}
        <span aria-hidden="true">
          {leadWords.map((word, i) => (
            <span key={`${word}-${i}`} className={styles.leadWord}>
              <span
                className={styles.leadWordInner}
                style={{ '--delay': `${i * 0.05}s` } as React.CSSProperties}
              >
                {word}
              </span>
            </span>
          ))}
          <span className={styles.cycler}>
            {words.map((word, i) => (
              <span key={word} className={`${styles.word} ${stateFor(i)}`}>
                {word}
                <span className={styles.dot}>.</span>
              </span>
            ))}
          </span>
        </span>
      </h1>

      <p className={`${styles.support} ${styles.fadeUp}`} style={{ '--delay': '0.5s' } as React.CSSProperties}>
        {support}
      </p>

      <div className={`${styles.actions} ${styles.fadeUp}`} style={{ '--delay': '0.65s' } as React.CSSProperties}>
          <MagneticButton href="#work" className={`${styles.action} ${styles.actionPrimary}`}>
            {actions.viewWork}
            <svg className={styles.arrow} width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M2 7h10M8 3l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </MagneticButton>
          <MagneticButton href="#contact" className={`${styles.action} ${styles.actionGhost}`}>
            {actions.contact}
          </MagneticButton>
        </div>
      </div>

      <div className={styles.motif}>
        <WireframeMotif />
      </div>
    </section>
  );
}
