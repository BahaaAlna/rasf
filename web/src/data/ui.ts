/*
  Interface strings. Not page content — just the words the shell needs.
  TODO markers indicate copy still awaiting Bahaa's sign-off.
*/

import type { Locale } from '../lib/i18n';

export interface UIStrings {
  nav: { work: string; services: string; about: string; blog: string; contact: string };
  /** The two pages under Work, in the menu it opens and as their headings. */
  workPages: { software: string; designs: string };
  actions: { viewWork: string; contact: string };
  switchTo: string;
  /** A few words about the name, under it on the loading screen. Its closing full stop takes the accent. */
  slogan: string;
  /** The button that opens and closes the menu on a phone. */
  menu: { open: string; close: string };
  /** Supporting line under the hero sentence. TODO: confirm. */
  heroSupport: string;
}

export const ui: Record<Locale, UIStrings> = {
  ar: {
    nav: {
      work: 'الأعمال',
      services: 'الخدمات',
      about: 'من نحن',
      blog: 'المدونة',
      contact: 'تواصل',
    },
    workPages: { software: 'برمجيات', designs: 'تصاميم' },
    actions: { viewWork: 'شاهد الأعمال', contact: 'ابدأ مشروعك' },
    switchTo: 'English',
    slogan: 'حجراً حجراً.',
    menu: { open: 'القائمة', close: 'إغلاق' },
    heroSupport: 'استوديو برمجيات وتصميم. نبني المواقع وتطبيقات الويب كاملة، من أول فكرة حتى الإطلاق، ونصمم هوياتها.',
  },
  en: {
    nav: {
      work: 'Work',
      services: 'Services',
      about: 'About',
      blog: 'Blog',
      contact: 'Contact',
    },
    workPages: { software: 'Software', designs: 'Designs' },
    actions: { viewWork: 'View work', contact: 'Start a project' },
    switchTo: 'العربية',
    slogan: 'Stone by stone.',
    menu: { open: 'Menu', close: 'Close' },
    heroSupport: 'A software and design studio. We build websites and web apps end to end, from the first idea to launch, and design the brands behind them.',
  },
};
