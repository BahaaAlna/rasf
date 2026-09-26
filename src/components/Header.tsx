import { useCallback, useEffect, useRef } from 'react';
import RepelLink from './RepelLink';
import { LOGO_DOT } from '../data/logoDot';
import styles from './Header.module.css';

export interface HeaderProps {
  /** The wordmark exactly as drawn, dot and all. It is never altered. */
  logo: { src: string; width: number; height: number };
  siteName: string;
  nav: { work: string; services: string; about: string; contact: string };
  /** Same page in the other language. */
  switchHref: string;
  switchLabel: string;
  /** BCP-47 tag of the language being switched TO, for `hreflang`. */
  switchLang: string;
  /** Which set of dot coordinates to use. */
  locale: 'ar' | 'en';
  /** The dot artwork — the travelling copy, not the one in the logo. */
  dot: { src: string; width: number; height: number };
}

/** Clear of the descenders, so the dot never touches the word. */
const DROP = 6;

/**
 * Hydrated for two reasons: the nav words are pushed away from the
 * cursor, and the dot after the name travels to whichever word the
 * pointer is on, standing in for an underline.
 *
 * The logotype itself is never modified. While the dot is away a mask
 * opens a hole where it belongs and a real element carries it across;
 * the moment it is home the mask is dropped and the artwork is back to
 * being exactly the file that was drawn. Before hydration the bar is a
 * plain, readable header with its dot in place — nothing here needs
 * JavaScript to look right, only to move.
 *
 * Temporary: no mobile menu yet, the nav simply hides below 48rem.
 */
export default function Header({
  logo,
  siteName,
  nav,
  switchHref,
  switchLabel,
  switchLang,
  locale,
  dot: dotArt,
}: HeaderProps) {
  const items = [
    { href: '#work', label: nav.work },
    { href: '#services', label: nav.services },
    { href: '#about', label: nav.about },
    { href: '#contact', label: nav.contact },
  ];

  const header = useRef<HTMLElement>(null);
  const mark = useRef<HTMLImageElement>(null);
  const dot = useRef<HTMLImageElement>(null);
  /** The link the dot is currently visiting, if any. */
  const visiting = useRef<HTMLElement | null>(null);
  /** Pending "it is home again, close the hole" timer. */
  const settling = useRef(0);

  const place = useCallback(() => {
    const bar = header.current;
    const img = mark.current;
    const bead = dot.current;
    if (!bar || !img || !bead || !img.complete || !img.width) return;

    const barBox = bar.getBoundingClientRect();
    const imgBox = img.getBoundingClientRect();
    const spot = LOGO_DOT[locale];

    const size = imgBox.width * spot.d;

    // Home: dead centre of the dot the logotype already carries.
    let x = imgBox.left - barBox.left + imgBox.width * spot.cx;
    let y = imgBox.top - barBox.top + imgBox.height * spot.cy;

    const host = visiting.current;
    if (host) {
      // Away: centred under the word, keeping its own size.
      const box = host.getBoundingClientRect();
      x = box.left - barBox.left + box.width / 2;
      y = box.bottom - barBox.top - DROP;
    }

    // The hole tracks the same circle, so the two can never disagree.
    img.style.setProperty('--dot-x', `${spot.cx * 100}%`);
    img.style.setProperty('--dot-y', `${spot.cy * 100}%`);
    img.style.setProperty('--dot-r', `${(size / 2).toFixed(2)}px`);

    bead.style.width = `${size}px`;
    bead.style.height = `${size}px`;
    bead.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) translate(-50%, -50%)`;
  }, [locale]);

  const visit = useCallback(
    (field: HTMLElement | null) => {
      const img = mark.current;
      const bead = dot.current;
      if (!img || !bead) return;

      window.clearTimeout(settling.current);
      visiting.current = field;

      if (field) {
        // Open the hole and light the traveller in the same frame, so
        // one circle leaves rather than one blinking out and another in.
        img.classList.add(styles.punched);
        bead.classList.add(styles.dotOut);
        place();
        return;
      }

      place();

      /*
        Close up only once it is actually home. A timer rather than
        `transitionend`, because under reduced motion there is no
        transition to end — and waiting for an event that never fires
        would leave the wordmark permanently holed.
      */
      const ms = parseFloat(getComputedStyle(bead).transitionDuration) * 1000 || 0;
      settling.current = window.setTimeout(() => {
        if (visiting.current) return;
        img.classList.remove(styles.punched);
        bead.classList.remove(styles.dotOut);
      }, ms + 40);
    },
    [place],
  );

  useEffect(() => {
    place();

    // The logo is an optimised image; it may still be in flight.
    const img = mark.current;
    if (img && !img.complete) img.addEventListener('load', place, { once: true });

    // Fonts landing changes every width in the bar, the nav included.
    document.fonts?.ready.then(place).catch(() => {});

    /*
      Watching the bar itself, not the window. The dot is placed from a
      measurement, so anything that moves the logo after that leaves it
      stranded — and the window never resizes for the worst case: the
      custom scrollbar mounts on idle, takes its strip of the width, and
      shifts a right-aligned logotype by about 15px. That is the Arabic
      bar, where the mark sits at the end of the line.
    */
    const watch = new ResizeObserver(place);
    if (header.current) watch.observe(header.current);
    window.addEventListener('resize', place);

    return () => {
      watch.disconnect();
      window.removeEventListener('resize', place);
      window.clearTimeout(settling.current);
      img?.removeEventListener('load', place);
    };
  }, [place]);

  return (
    <header ref={header} className={styles.header}>
      <a href="#main" aria-label={siteName}>
        <img
          ref={mark}
          className={styles.logo}
          src={logo.src}
          width={logo.width}
          height={logo.height}
          alt={siteName}
        />
      </a>

      <nav className={styles.nav}>
        {items.map((item) => (
          <RepelLink key={item.href} href={item.href} onActivate={visit}>
            {item.label}
          </RepelLink>
        ))}
      </nav>

      <a className={styles.switch} href={switchHref} hrefLang={switchLang} lang={switchLang}>
        {switchLabel}
      </a>

      <img
        ref={dot}
        className={styles.dot}
        src={dotArt.src}
        width={dotArt.width}
        height={dotArt.height}
        alt=""
        aria-hidden="true"
      />
    </header>
  );
}
