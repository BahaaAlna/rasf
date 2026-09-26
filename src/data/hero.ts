/*
  Hero copy.

  The sentence is static except for its FINAL word, which cycles.
  `lead` is everything before that word; `words` are the rotating options.

  TODO: every string here is a placeholder standing in for Bahaa's real
  copy. Replace `lead` and `words` for both locales — nothing else needs
  to change.
*/

import type { Locale } from '../lib/i18n';

export interface HeroCopy {
  /** The static part of the sentence, before the cycling word. */
  lead: string;
  /** The final word, rotated in order. */
  words: string[];
  /** Seconds each word is held before the next one rises. */
  interval: number;
}

export const hero: Record<Locale, HeroCopy> = {
  ar: {
    lead: 'نبني لأعمالك', // TODO: placeholder
    words: ['مواقع', 'متاجر', 'واجهات'], // TODO: placeholder
    interval: 2.4,
  },
  en: {
    lead: 'We build your business', // TODO: placeholder
    words: ['websites', 'stores', 'interfaces'], // TODO: placeholder
    interval: 2.4,
  },
};
