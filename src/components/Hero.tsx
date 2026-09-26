import { useEffect, useState } from 'react';
import styles from './Hero.module.css';

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

  return (
    <section className={styles.hero}>
      <h1 className={styles.line}>
        {/* Read once, in full, by assistive tech. */}
        <span className="u-visually-hidden">
          {`${lead} ${words.join(listSeparator)}.`}
        </span>
        {/* The animated version, hidden from the accessibility tree so the
            rotating word is not announced over and over. */}
        <span aria-hidden="true">
          {lead}{' '}
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

      <p className={styles.support} data-reveal style={{ "--reveal-delay": "0.15s" } as React.CSSProperties}>
        {support}
      </p>

      <div className={styles.actions} data-reveal style={{ "--reveal-delay": "0.25s" } as React.CSSProperties}>
        <a className={`${styles.action} ${styles.actionPrimary}`} href="#work">
          {actions.viewWork}
          <svg className={styles.arrow} width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M2 7h10M8 3l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </a>
        <a className={`${styles.action} ${styles.actionGhost}`} href="#contact">
          {actions.contact}
        </a>
      </div>
    </section>
  );
}
