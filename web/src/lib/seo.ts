/*
  What search engines read about a page beyond its words: its one true
  address, and a description of the studio and the page in schema.org
  terms (JSON-LD), so a result can show the name, logo, the path to the
  page and an article's date instead of guessing them.

  Every page carries the studio and the site; a page adds what it is (an
  article, a project) and where it sits (its breadcrumbs). All of it is
  one graph, linked by @id, as Google prefers.
*/

import { site as siteData } from '../data/site';
import { getSite } from './content';
import { localizePath, type Locale } from './i18n';

const ORIGIN = siteData.url;

/**
 * A page's full address, as the host serves it. Pages are folders, so
 * the address ends in a slash; without it the host answers with a
 * redirect, and a canonical link must never point at a redirect.
 */
export function pageUrl(path: string, locale: Locale): string {
  const local = localizePath(path, locale);
  return new URL(local.endsWith('/') ? local : `${local}/`, ORIGIN).href;
}

export const absolute = (path: string) => new URL(path, ORIGIN).href;

const ORG = `${ORIGIN}/#organization`;
const WEBSITE = `${ORIGIN}/#website`;

/** The logo search engines show for the studio: public/logo.png. */
const LOGO = { url: absolute('/logo.png'), width: 600, height: 279 };

/** The studio and the site, on every page. */
function studio(locale: Locale) {
  const own = getSite(locale);
  const other = getSite(locale === 'ar' ? 'en' : 'ar');
  // Placeholder addresses aren't facts; leave them out until they're real.
  const email = own.email && !/@example\./.test(own.email) ? own.email : undefined;

  return [
    {
      '@type': 'Organization',
      '@id': ORG,
      name: own.name,
      alternateName: other.name,
      url: pageUrl('/', locale),
      logo: { '@type': 'ImageObject', ...LOGO },
      image: absolute('/og-default.png'),
      description: own.description,
      email,
      telephone: own.phone || undefined,
      address: { '@type': 'PostalAddress', addressCountry: 'SY' },
      areaServed: 'Worldwide',
      knowsLanguage: ['ar', 'en'],
      sameAs: own.socials.length ? own.socials.map((s) => s.href) : undefined,
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE,
      url: pageUrl('/', locale),
      name: own.name,
      alternateName: other.name,
      inLanguage: ['ar', 'en'],
      publisher: { '@id': ORG },
    },
  ];
}

export interface Crumb {
  name: string;
  /** Locale-independent path, like `/blog`. */
  path: string;
}

/** What a page adds about itself. */
export type PageKind =
  | { type: 'page' }
  | { type: 'article'; published: Date; modified?: Date; image?: string }
  | { type: 'project'; year?: string; image?: string };

export interface PageFacts {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  /** From the home page down to, but not including, this page. */
  trail?: Crumb[];
  kind?: PageKind;
}

/** The whole graph for one page, ready for a JSON-LD script. */
export function graph({ locale, path, title, description, trail, kind = { type: 'page' } }: PageFacts) {
  const url = pageUrl(path, locale);
  const page = `${url}#webpage`;
  const nodes: Record<string, unknown>[] = [...studio(locale)];

  const crumbs = trail && [...trail, { name: title, path }];
  if (crumbs) {
    nodes.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: crumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: pageUrl(c.path, locale),
      })),
    });
  }

  nodes.push({
    '@type': kind.type === 'article' ? ['WebPage', 'ItemPage'] : 'WebPage',
    '@id': page,
    url,
    name: title,
    description,
    inLanguage: locale,
    isPartOf: { '@id': WEBSITE },
    about: path === '/' ? { '@id': ORG } : undefined,
    breadcrumb: crumbs ? { '@id': `${url}#breadcrumb` } : undefined,
  });

  if (kind.type === 'article') {
    nodes.push({
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      headline: title,
      description,
      datePublished: kind.published.toISOString(),
      dateModified: (kind.modified ?? kind.published).toISOString(),
      inLanguage: locale,
      url,
      image: kind.image ?? absolute('/og-default.png'),
      author: { '@id': ORG },
      publisher: { '@id': ORG },
      mainEntityOfPage: { '@id': page },
    });
  }

  if (kind.type === 'project') {
    // The year may be written in Arabic numerals; schema.org wants 2026, not ٢٠٢٦.
    const year = kind.year?.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).trim();
    nodes.push({
      '@type': 'CreativeWork',
      '@id': `${url}#work`,
      name: title,
      description,
      dateCreated: year && /^\d{4}$/.test(year) ? year : undefined,
      inLanguage: locale,
      url,
      image: kind.image,
      creator: { '@id': ORG },
      mainEntityOfPage: { '@id': page },
    });
  }

  return { '@context': 'https://schema.org', '@graph': nodes };
}

/**
 * The graph as text for a <script> tag. JSON.stringify drops the
 * undefined fields; `<` is escaped so no value can close the tag early.
 */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');
