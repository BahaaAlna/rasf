/*
  Hero copy.

  The sentence is static except for its FINAL word, which cycles.
  `lead` is everything before that word; `words` are the rotating options.

  Copy is final, supplied by Bahaa.
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
    lead: 'لا شيء عشوائي. كل تفصيل مرصوف في',
    words: ['موقعك', 'متجرك', 'علامتك', 'منتجك'],
    interval: 2.6,
  },
  en: {
    lead: 'Nothing random. Every detail laid into your',
    words: ['website', 'store', 'brand', 'product'],
    interval: 2.6,
  },
};
