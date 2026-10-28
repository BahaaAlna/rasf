/*
  The content seam.

  Components import from THIS file only — never from `src/data/*` directly.

  What the dashboard saved (Firestore, content/*) is read once, as the
  site builds, and laid over the text in src/data: anything saved wins,
  anything never saved, or added to the site since, keeps its wording
  here. So the getters stay plain and synchronous, and if Firestore is
  out of reach the site simply builds from src/data as before.
*/

import type { Locale } from './i18n';
import { loadSections } from './firestore';
import { site } from '../data/site';
import { hero } from '../data/hero';
import { ui } from '../data/ui';
import { origin } from '../data/origin';
import { work } from '../data/work';
import { services } from '../data/services';
import { about, TOOLS } from '../data/about';
import { contact } from '../data/contact';
import { blog } from '../data/blog';

type Values = Record<string, unknown>;

const saved = await loadSections();

const isObject = (v: unknown): v is Values => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * `over` laid on `base`, object by object. Lists are taken whole, except
 * that each item that's an object is laid on the item at the same place
 * in `base`: so a field the site added after an item was saved (a
 * project's category, say) still has a value.
 */
function layer<T>(base: T, over: unknown): T {
  if (over === undefined || over === null) return base;
  if (Array.isArray(base) && Array.isArray(over)) {
    return over.map((item, i) => (isObject(item) && isObject(base[i]) ? layer(base[i], item) : item)) as T;
  }
  if (!isObject(base) || !isObject(over)) return over as T;
  const out: Values = { ...base };
  for (const [key, value] of Object.entries(over)) out[key] = layer(base[key], value);
  return out as T;
}

/** One language of a section: the dashboard's words over the site's. */
function words<T>(section: string, local: Record<Locale, T>, locale: Locale): T {
  return layer(local[locale], saved[section]?.[locale]);
}

/** A value both languages share, e.g. the email. */
function shared<T>(section: string, key: string, local: T): T {
  return layer(local, saved[section]?.[key]);
}

export function getSite(locale: Locale) {
  const own = {
    name: site.name[locale],
    tagline: site.tagline[locale],
    description: site.description[locale],
    location: site.location[locale],
  };
  const text = layer(own, saved.site?.[locale]);
  const socials = shared('site', 'socials', [...site.socials] as { label: string; href: string }[]);
  return {
    url: site.url,
    ...text,
    email: shared('site', 'email', site.email as string),
    phone: shared('site', 'phone', site.phone as string),
    timezone: site.timezone,
    socials: socials.filter((s) => s.href !== ''),
    /**
     * An icon uploaded in the dashboard, as PNG data: one for browser tabs
     * and one for home screens. Null means the default in public/.
     */
    icon: shared('site', 'icon', null as SiteIcon | null),
  };
}

export interface SiteIcon {
  /** A small PNG for the browser tab, as a data: URL. */
  tab: string;
  /** A 180px filled PNG for phone home screens, as a data: URL. */
  touch: string;
}

export type SiteContent = ReturnType<typeof getSite>;

export function getHero(locale: Locale) {
  return words('hero', hero, locale);
}

export type HeroContent = ReturnType<typeof getHero>;

export function getUI(locale: Locale) {
  return words('ui', ui, locale);
}

export type UIContent = ReturnType<typeof getUI>;

export function getOrigin(locale: Locale) {
  return words('origin', origin, locale);
}

export type OriginSection = ReturnType<typeof getOrigin>;

export function getWork(locale: Locale) {
  return words('work', work, locale);
}

export type WorkSection = ReturnType<typeof getWork>;

export function getServices(locale: Locale) {
  return words('services', services, locale);
}

export type ServicesSection = ReturnType<typeof getServices>;

export function getAbout(locale: Locale) {
  return {
    ...words('about', about, locale),
    /** Product names, the same in both languages. */
    tools: shared('about', 'tools', [...TOOLS] as string[]),
  };
}

export type AboutSection = ReturnType<typeof getAbout>;

export function getContact(locale: Locale) {
  return words('contact', contact, locale);
}

export type ContactSection = ReturnType<typeof getContact>;

/** The blog's own words, around the posts (the posts are in lib/blog.ts). */
export function getBlogCopy(locale: Locale) {
  return words('blog', blog, locale);
}
