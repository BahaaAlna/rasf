/*
  "What is Rasf?" — the section that answers its own name.

  `lead` is only the first half of the question. The second half is the
  paved wordmark underneath it, which carries the question mark, so the
  two read as one line: lead + the name + "?".

  Draft copy, written from Bahaa's brief: the Arabic meaning of the word,
  and the precision it stands for. TODO: sign-off.
*/

import type { Locale } from '../lib/i18n';

export interface OriginColumn {
  /** Ordinal, in the numerals of its own language. */
  n: string;
  title: string;
  body: string;
}

export interface OriginContent {
  /** Reads into the paved wordmark: "What is" → "Rasf?" */
  lead: string;
  /** The cards open on hover only, so the page has to say so. */
  hint: string;
  columns: [OriginColumn, OriginColumn, OriginColumn];
}

export const origin: Record<Locale, OriginContent> = {
  ar: {
    lead: 'ما هو',
    hint: 'مرِّر فوق الاسم',
    columns: [
      {
        n: '٠١',
        title: 'المعنى',
        body: 'رَصْف، في العربية: أن تضع الحجر إلى جانب الحجر في نظام، حتى يصير الطريق.',
      },
      {
        n: '٠٢',
        title: 'الأصل',
        body: 'اخترناه للدقّة التي يقتضيها. لا حجر في غير موضعه، ولا فراغ بلا سبب.',
      },
      {
        n: '٠٣',
        title: 'لماذا',
        body: 'وهذه الدقّة نفسها تذهب إلى كل مشروع: كل تفصيل مرصوف حيث ينبغي أن يكون.',
      },
    ],
  },
  en: {
    lead: 'What is',
    hint: 'Hover the name',
    columns: [
      {
        n: '01',
        title: 'The meaning',
        body: 'Rasf is Arabic for paving: laying stone beside stone, in order, until there is a road.',
      },
      {
        n: '02',
        title: 'The origin',
        body: 'We chose it for the precision it demands. No stone out of place, no gap without a reason.',
      },
      {
        n: '03',
        title: 'Why',
        body: 'That same precision goes into every project: every detail laid exactly where it belongs.',
      },
    ],
  },
};
