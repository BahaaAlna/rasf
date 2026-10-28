/*
  Maintenance mode. While it's on, every page of the site shows only a
  short note in its place (see BaseLayout): the name, that we'll be back,
  and how to reach us meanwhile. Switched from the dashboard; it takes
  effect, either way, the next time the site is published.

  Draft copy. TODO: sign-off.
*/

import type { Locale } from '../lib/i18n';

export interface MaintenanceWords {
  /** The big line. Its closing full stop takes the accent. */
  title: string;
  message: string;
  /** Before the email address. */
  reach: string;
}

export const maintenance: { on: boolean } & Record<Locale, MaintenanceWords> = {
  on: false,
  ar: {
    title: 'نعود قريباً.',
    message: 'نعمل على تحسين الموقع، وسيعود خلال وقت قصير.',
    reach: 'وفي الأثناء، راسلنا على',
  },
  en: {
    title: 'Back soon.',
    message: 'We’re making the site better, and it will be back shortly.',
    reach: 'In the meantime, write to us at',
  },
};
