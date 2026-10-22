/*
  About — what the studio believes, what it builds with, how a project runs.

  The name and its meaning live in "What is Rasf?" (origin.ts), and what
  we make lives in Services; this is how we work.
  Software leads here too: building first, design after.

  Draft copy. TODO: sign-off on the manifesto and process, and the real
  list of technologies.
*/

import type { Locale } from '../lib/i18n';

export interface Step {
  title: string;
  note: string;
}

export interface AboutContent {
  /** Set very large; it inks in word by word as the page scrolls. */
  manifesto: string;
  /** How a project runs, start to finish. */
  processTitle: string;
  steps: Step[];
  /** Small label on the band of technologies. */
  toolsLabel: string;
}

/**
 * The technologies we build with, run past in a band. Product names, so
 * the same in both languages. TODO: confirm the real list.
 */
export const TOOLS = [
  'Astro',
  'React',
  'Next.js',
  'TypeScript',
  'Node.js',
  'Firebase',
  'Tailwind CSS',
  'Figma',
  'Illustrator',
] as const;

export const about: Record<Locale, AboutContent> = {
  ar: {
    manifesto: 'نحن لا نزخرف. نبني برمجيات تعمل، من أول فكرة حتى آخر سطر، ونجعلها جميلة على الطريق.',
    processTitle: 'كيف يسير المشروع',
    steps: [
      { title: 'الاكتشاف', note: 'نفهم أهدافك ومستخدميك، وكيف يبدو النجاح.' },
      { title: 'التصميم', note: 'المسارات أولاً، ثم الشاشات، حتى يصبح كل شيء في مكانه.' },
      { title: 'البناء', note: 'كود نظيف وسريع، تراه وهو ينمو.' },
      { title: 'الإطلاق', note: 'مُختبَر، منشور، ومُسلَّم إليك.' },
      { title: 'الدعم', note: 'نبقى معك للإصلاحات والتحديثات وما يأتي بعدها.' },
    ],
    toolsLabel: 'نبني بـ',
  },
  en: {
    manifesto: "We don't decorate. We build software that works, from the first idea to the last line, and make it beautiful along the way.",
    processTitle: 'How a project runs',
    steps: [
      { title: 'Discover', note: 'We learn your goals, your users, and what success looks like.' },
      { title: 'Design', note: 'Flows first, then screens, until every piece is in its place.' },
      { title: 'Build', note: 'Clean, fast code, and you see it as it grows.' },
      { title: 'Launch', note: 'Tested, deployed, and handed over.' },
      { title: 'Support', note: 'We stay on for fixes, updates, and whatever comes next.' },
    ],
    toolsLabel: 'Built with',
  },
};
