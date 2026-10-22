/*
  The content seam.

  Components import from THIS file only — never from `src/data/*` directly.
  When the Firebase admin dashboard lands, these getters become async and
  read from Firestore, and not a single component changes.
*/

import type { Locale } from './i18n';
import { site } from '../data/site';
import { hero } from '../data/hero';
import { ui } from '../data/ui';
import { origin } from '../data/origin';
import { work } from '../data/work';
import { services } from '../data/services';
import { about } from '../data/about';
import { contact } from '../data/contact';

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

export function getHero(locale: Locale) {
  return hero[locale];
}

export type HeroContent = ReturnType<typeof getHero>;

export function getUI(locale: Locale) {
  return ui[locale];
}

export type UIContent = ReturnType<typeof getUI>;

export function getOrigin(locale: Locale) {
  return origin[locale];
}

export type OriginSection = ReturnType<typeof getOrigin>;

export function getWork(locale: Locale) {
  return work[locale];
}

export type WorkSection = ReturnType<typeof getWork>;

export function getServices(locale: Locale) {
  return services[locale];
}

export type ServicesSection = ReturnType<typeof getServices>;

export function getAbout(locale: Locale) {
  return about[locale];
}

export type AboutSection = ReturnType<typeof getAbout>;

export function getContact(locale: Locale) {
  return contact[locale];
}

export type ContactSection = ReturnType<typeof getContact>;
