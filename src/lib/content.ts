/*
  The content seam.

  Components import from THIS file only — never from `src/data/*` directly.
  When the Firebase admin dashboard lands, these getters become async and
  read from Firestore, and not a single component changes.
*/

import { site } from '../data/site';
import type { Locale } from './i18n';

export function getSite(locale: Locale) {
  return {
    url: site.url,
    name: site.name[locale],
    tagline: site.tagline[locale],
    description: site.description[locale],
    email: site.email,
    phone: site.phone,
    location: site.location[locale],
    timezone: site.timezone,
    socials: site.socials.filter((s) => s.href !== ''),
  };
}

export type SiteContent = ReturnType<typeof getSite>;

import { hero } from '../data/hero';

export function getHero(locale: Locale) {
  return hero[locale];
}

export type HeroContent = ReturnType<typeof getHero>;
