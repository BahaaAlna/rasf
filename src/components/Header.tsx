import styles from './Header.module.css';

export interface HeaderProps {
  logo: { src: string; width: number; height: number };
  siteName: string;
  nav: { work: string; services: string; about: string; contact: string };
  /** Same page in the other language. */
  switchHref: string;
  switchLabel: string;
  /** BCP-47 tag of the language being switched TO, for `hreflang`. */
  switchLang: string;
}

/**
 * Static by design — no `client:*` directive, so this renders to plain HTML
 * and ships no JavaScript. Temporary: no mobile menu yet, the nav simply
 * hides below 48rem.
 */
export default function Header({
  logo,
  siteName,
  nav,
  switchHref,
  switchLabel,
  switchLang,
}: HeaderProps) {
  const items = [
    { href: '#work', label: nav.work },
    { href: '#services', label: nav.services },
    { href: '#about', label: nav.about },
    { href: '#contact', label: nav.contact },
  ];

  return (
    <header className={styles.header}>
      <a href="#main" aria-label={siteName}>
        <img
          className={styles.logo}
          src={logo.src}
          width={logo.width}
          height={logo.height}
          alt={siteName}
        />
      </a>

      <nav className={styles.nav}>
        {items.map((item) => (
          <a key={item.href} className={styles.link} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <a className={styles.switch} href={switchHref} hrefLang={switchLang} lang={switchLang}>
        {switchLabel}
      </a>
    </header>
  );
}
