export const locales = ['ar', 'en'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ar';

/** Text direction for a locale. */
export const dirFor = (locale: Locale): 'rtl' | 'ltr' => (locale === 'ar' ? 'rtl' : 'ltr');

/** The other locale — used by the language switcher. */
export const otherLocale = (locale: Locale): Locale => (locale === 'ar' ? 'en' : 'ar');

/** Human name of a locale, written in that locale. */
export const localeName: Record<Locale, string> = {
  ar: 'العربية',
  en: 'English',
};

/** Which locale a URL belongs to. */
export function getLocale(url: URL): Locale {
  const first = url.pathname.split('/').filter(Boolean)[0];
  return locales.includes(first as Locale) ? (first as Locale) : defaultLocale;
}

/**
 * Strip the locale prefix, returning the locale-independent path.
 * `/en/work/ecostone` and `/work/ecostone` both become `/work/ecostone`.
 */
export function stripLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (locales.includes(segments[0] as Locale)) segments.shift();
  return '/' + segments.join('/');
}

/** Build the URL for `path` in `locale`. Pass locale-independent paths. */
export function localizePath(path: string, locale: Locale): string {
  const clean = stripLocale(path).replace(/\/+$/, '');
  if (locale === defaultLocale) return clean === '' ? '/' : clean;
  return clean === '' ? `/${locale}/` : `/${locale}${clean}`;
}

/** The current page's address in the other language. */
export function alternatePath(url: URL, target: Locale): string {
  return localizePath(url.pathname, target);
}
