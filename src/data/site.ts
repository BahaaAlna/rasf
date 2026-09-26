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

  /** TODO: confirm. Shown in <title> and OG tags. */
  tagline: {
    ar: 'استوديو تطوير واجهات أمامية',
    en: 'Front-end development studio',
  } satisfies Localized<string>,

  /** TODO: confirm — placeholder description, replace before launch. */
  description: {
    ar: 'نبني مواقع سريعة وواضحة للأعمال. [نص مؤقت — بانتظار المحتوى النهائي]',
    en: 'Fast, clear websites for businesses. [Placeholder — awaiting final copy]',
  } satisfies Localized<string>,

  /** TODO: real contact details. */
  email: 'hello@example.com',
  phone: '',

  /** TODO: confirm location, used in the mono metadata labels. */
  location: {
    ar: 'دمشق، سوريا',
    en: 'Damascus, Syria',
  } satisfies Localized<string>,

  /** IANA zone for the live local time in the footer. */
  timezone: 'Asia/Damascus',

  /** TODO: real profile URLs. Empty entries are not rendered. */
  socials: [
    { label: 'GitHub', href: '' },
    { label: 'LinkedIn', href: '' },
  ],
} as const;
