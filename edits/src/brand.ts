/*
  The studio's look and words, as the video needs them.

  Colours are the site's own (web/src/styles/tokens.css); the words come
  from web/src/data, so the video says what the site says.
*/

import { continueRender, delayRender, staticFile } from 'remotion';

export type Locale = 'ar' | 'en';

export const color = {
  paper: '#f5f2eb',
  paperSunk: '#eeeae1',
  ink: '#18181c',
  inkMuted: '#86837b',
  accent: '#183fc0',
  rule: '#18181c1f',
};

export const font = {
  display: { en: "'Bricolage Grotesque', system-ui, sans-serif", ar: "'Lateef', serif" },
  mono: "'IBM Plex Mono', ui-monospace, monospace",
};

export const copy = {
  ar: {
    tagline: 'استوديو برمجيات وتصميم',
    slogan: 'حجراً حجراً.',
    sections: { hero: 'الرئيسية', work: 'الأعمال', services: 'الخدمات', about: 'من نحن', contact: 'تواصل' },
    heading: 'لنبنِ شيئاً معاً.',
    emailLabel: 'راسلنا مباشرة',
    cta: 'ابدأ مشروعك',
  },
  en: {
    tagline: 'Software & design studio',
    slogan: 'Stone by stone.',
    sections: { hero: 'Home', work: 'Work', services: 'Services', about: 'About', contact: 'Contact' },
    heading: "Let's build something.",
    emailLabel: 'Write to us directly',
    cta: 'Start a project',
  },
} satisfies Record<Locale, unknown>;

export const contact = {
  email: 'hello@rasf.studio',
  instagram: '@rasf_studio',
  site: 'rasf.studio',
};

/*
  The logotype, measured off brand/LogoTransparent*.png (1536 × 1024):
  where its dot sits, as fractions of the image, and the box to cut out
  so the drawn dot can stand in for the printed one.
*/
export const logo = {
  en: {
    src: 'LogoTransparentEn.png',
    dot: { x: 0.7373, y: 0.604, size: 0.0469 },
    cut: 'polygon(0 0, 100% 0, 100% 54.7%, 70.6% 54.7%, 70.6% 100%, 0 100%)',
  },
  ar: {
    src: 'LogoTransparentAr.png',
    dot: { x: 0.2093, y: 0.5361, size: 0.0319 },
    cut: 'polygon(23.4% 0, 100% 0, 100% 100%, 23.4% 100%)',
  },
};

// The site's own fonts, loaded before the first frame is drawn.
const fonts = [
  new FontFace('Bricolage Grotesque', `url(${staticFile('fonts/bricolage.woff2')})`, { weight: '200 800' }),
  new FontFace('IBM Plex Mono', `url(${staticFile('fonts/plex-mono.woff2')})`, { weight: '400' }),
  new FontFace('Lateef', `url(${staticFile('fonts/lateef-400.woff2')})`, { weight: '400' }),
  new FontFace('Lateef', `url(${staticFile('fonts/lateef-600.woff2')})`, { weight: '600' }),
];
const waiting = delayRender('Loading fonts');
Promise.all(fonts.map((f) => f.load())).then((loaded) => {
  loaded.forEach((f) => document.fonts.add(f));
  continueRender(waiting);
});
