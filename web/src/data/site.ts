/*
  Site-wide facts. Every value marked TODO is a placeholder waiting on
  real content — nothing here is invented copy presented as final.
*/

import type { Locale } from '../lib/i18n';

export type Localized<T> = Record<Locale, T>;

export const site = {
  /** TODO: confirm final domain. Also set `site` in astro.config.mjs. */
  url: 'https://rasf.studio',

  name: {
    ar: 'رصف',
    en: 'Rasf',
  } satisfies Localized<string>,

  /**
   * TODO: confirm. Shown in <title> and OG tags. Rasf is a whole studio,
   * software first: building comes before design in every line.
   */
  tagline: {
    ar: 'استوديو برمجيات وتصميم',
    en: 'Software & design studio',
  } satisfies Localized<string>,

  /** TODO: confirm — draft description, written to the software-first brief. */
  description: {
    ar: 'نبني البرمجيات من الفكرة حتى الإطلاق — مواقع، تطبيقات ويب، ومتاجر — ونصمم الهويات التي تحملها.',
    en: 'We build software end to end — websites, web apps and online stores — and design the brands they carry.',
  } satisfies Localized<string>,

  /** TODO: real contact details. */
  email: 'hello@example.com',
  phone: '',

  /** Where we are, as one line under the email in Contact. */
  location: {
    ar: 'من سوريا إلى العالم',
    en: 'From Syria to all the world',
  } satisfies Localized<string>,

  /** IANA zone for the live local time in the footer. */
  timezone: 'Asia/Damascus',

  /** TODO: real profile URLs. Empty entries are not rendered. */
  socials: [
    { label: 'GitHub', href: '' },
    { label: 'LinkedIn', href: '' },
  ],
} as const;
