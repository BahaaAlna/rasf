/*
  Interface strings. Not page content — just the words the shell needs.
  TODO markers indicate copy still awaiting Bahaa's sign-off.
*/

import type { Locale } from '../lib/i18n';

export interface UIStrings {
  nav: { work: string; services: string; about: string; contact: string };
  actions: { viewWork: string; contact: string };
  switchTo: string;
  /** Supporting line under the hero sentence. TODO: confirm. */
  heroSupport: string;
}

export const ui: Record<Locale, UIStrings> = {
  ar: {
    nav: {
      work: 'الأعمال',
      services: 'الخدمات',
      about: 'من نحن',
      contact: 'تواصل',
    },
    actions: { viewWork: 'شاهد الأعمال', contact: 'ابدأ مشروعك' },
    switchTo: 'English',
    heroSupport: 'استوديو تطوير واجهات أمامية. نبني مواقع تُحمّل بسرعة وتعمل على كل شاشة.',
  },
  en: {
    nav: {
      work: 'Work',
      services: 'Services',
      about: 'About',
      contact: 'Contact',
    },
    actions: { viewWork: 'View work', contact: 'Start a project' },
    switchTo: 'العربية',
    heroSupport: 'A front-end development studio. We build sites that load fast and work on every screen.',
  },
};
