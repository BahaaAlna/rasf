import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import RepelLink from './RepelLink';
import { LOGO_DOT } from '../../../lib/logo/dot';
import { getLenis } from '../../../lib/lenis';
import styles from './Header.module.css';

export interface HeaderProps {
  /** The wordmark exactly as drawn, dot and all. It is never altered. */
  logo: { src: string; width: number; height: number };
  siteName: string;
  nav: { work: string; services: string; about: string; blog: string; contact: string };
  /**
   * The home page in this language, for pages other than home: the
   * section links then lead back to it. Left out on the home page itself,
   * where they are plain jumps down the page.
   */
  home?: string;
  /** The blog in this language. */
  blogHref: string;
  /** The pages under Work, opened from it on hover: Software and Designs. */
  workMenu: { label: string; href: string }[];
  /** Same page in the other language. */
  switchHref: string;
  switchLabel: string;
  /** BCP-47 tag of the language being switched TO, for `hreflang`. */
  switchLang: string;
  /** Which set of dot coordinates to use. */
  locale: 'ar' | 'en';
  /** The dot artwork — the travelling copy, not the one in the logo. */
  dot: { src: string; width: number; height: number };
  /** The phone menu's button, closed and open. */
  menuLabels: { open: string; close: string };
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
 * Work opens a small menu of the pages under it, on hover or when a
 * link in it has focus. The opening is plain CSS, so it works before
 * hydration too; once hydrated, the dot follows into the menu and settles
 * under whichever page the pointer is on, as it does for the bar's words.
 *
 * On a phone (48rem and under) the bar keeps only the logo and a Menu
 * button. It opens a sheet over the page, under the bar: every link,
 * large and numbered, Work's pages beneath it, and the language switch.
 * A link, the button again, or Escape closes it; the page behind is held
 * still while it's open.
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
  home,
  blogHref,
  workMenu,
  menuLabels,
}: HeaderProps) {
  const section = (id: string) => `${home ?? ''}#${id}`;
  const items: { href: string; label: string; menu?: HeaderProps['workMenu'] }[] = [
    { href: section('work'), label: nav.work, menu: workMenu },
    { href: section('services'), label: nav.services },
    { href: section('about'), label: nav.about },
    { href: blogHref, label: nav.blog },
    { href: section('contact'), label: nav.contact },
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

  /*
    Inside Work's menu the dot only moves between words: passing from
    Work to a page, or from one page to the next, never sends it home on
    the way. It goes home once the pointer leaves the menu as a whole.
  */
  const inMenu = useRef(false);
  const stay = useCallback(
    (field: HTMLElement | null) => {
      if (field || !inMenu.current) visit(field);
    },
    [visit],
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

  const [open, setOpen] = useState(false);
  const sheet = useRef<HTMLElement>(null);

  // While the sheet is open: the page behind stays still, Escape closes it.
  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
    sheet.current?.querySelector('a')?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
      lenis?.start();
    };
  }, [open]);

  /*
    Picking a link closes the sheet. Smooth scrolling is let go first, in
    the same moment: the jump to a section on this page goes through it,
    and runs before the sheet has finished closing.
  */
  const pick = () => {
    getLenis()?.start();
    document.documentElement.style.overflow = '';
    setOpen(false);
  };
  const number = (n: number) => n.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en', { minimumIntegerDigits: 2 });

  return (
    <>
    <header ref={header} className={styles.header}>
      <a href={home ?? '#main'} aria-label={siteName}>
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
        {items.map((item) =>
          item.menu ? (
            <div
              key={item.href}
              className={styles.menu}
              onPointerEnter={() => (inMenu.current = true)}
              onPointerLeave={() => {
                inMenu.current = false;
                visit(null);
              }}
            >
              <RepelLink href={item.href} onActivate={stay}>
                {item.label}
              </RepelLink>
              <div className={styles.menuPanel}>
                <ul className={styles.menuList}>
                  {item.menu.map((entry) => (
                    <li key={entry.href}>
                      <a
                        className={styles.menuLink}
                        href={entry.href}
                        onPointerEnter={(e) => visit(e.currentTarget)}
                        onPointerLeave={() => stay(null)}
                        onFocus={(e) => visit(e.currentTarget)}
                        onBlur={() => visit(null)}
                      >
                        {entry.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <RepelLink key={item.href} href={item.href} onActivate={visit}>
              {item.label}
            </RepelLink>
          ),
        )}
      </nav>

      <a className={styles.switch} href={switchHref} hrefLang={switchLang} lang={switchLang} data-weightless>
        <span className={styles.switchLabel} data-weightless-label>
          {switchLabel}
        </span>
      </a>

      <button
        type="button"
        className={styles.menuButton}
        aria-expanded={open}
        aria-controls="site-sheet"
        onClick={() => setOpen(!open)}
      >
        <span className={styles.menuDot} aria-hidden="true" />
        {open ? menuLabels.close : menuLabels.open}
      </button>

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

    {/*
      The phone menu. Beside the bar, not in it: the bar's blur makes it
      the box any fixed child is placed in, which would trap the sheet
      inside the bar's own height.
    */}
    <nav
      ref={sheet}
      id="site-sheet"
      className={styles.sheet}
      data-open={open}
      aria-label={menuLabels.open}
      inert={!open}
    >
      <ol className={styles.sheetList}>
        {items.map((item, i) => (
          <li key={item.href} className={styles.sheetItem} style={{ '--i': i } as CSSProperties}>
            <a className={styles.sheetLink} href={item.href} onClick={pick}>
              <span className={styles.sheetN}>{number(i + 1)}</span>
              {item.label}
            </a>
            {item.menu && (
              <ul className={styles.sheetSub}>
                {item.menu.map((entry) => (
                  <li key={entry.href}>
                    <a className={styles.sheetSubLink} href={entry.href} onClick={pick}>
                      {entry.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
      <a
        className={styles.switch + ' ' + styles.sheetSwitch}
        href={switchHref}
        hrefLang={switchLang}
        lang={switchLang}
        onClick={pick}
      >
        {switchLabel}
      </a>
    </nav>
    </>
  );
}
