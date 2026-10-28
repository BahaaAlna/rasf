/*
  The blog's own words — headings and labels around the posts. The posts
  themselves are Markdown files in src/content/blog/.

  Draft copy. TODO: sign-off.
*/

import type { Locale } from '../lib/i18n';

export interface BlogContent {
  /** The big line on the list page. Its closing full stop takes the accent. */
  heading: string;
  intro: string;
  /** Shown while there are no posts in this language yet. */
  empty: string;
  /** "{n}" is filled in with the minutes. */
  readingTime: string;
  /** On a post, the way back to the list. */
  back: string;
  /** Under a post: the way to the contact form. */
  next: { label: string; cta: string };
}

export const blog: Record<Locale, BlogContent> = {
  ar: {
    heading: 'المدونة.',
    intro: 'ما نتعلمه ونحن نبني: البرمجة والتصميم، وكيف يُصنع موقع أو تطبيق من أول فكرة حتى الإطلاق.',
    empty: 'لا مقالات بعد. قريباً.',
    readingTime: '{n} دقائق قراءة',
    back: 'كل المقالات',
    next: { label: 'عندك فكرة؟', cta: 'ابدأ مشروعك' },
  },
  en: {
    heading: 'Blog.',
    intro: 'What we learn while we build: software and design, and how a website or app gets made, from the first idea to launch.',
    empty: 'No posts yet. Soon.',
    readingTime: '{n} min read',
    back: 'All posts',
    next: { label: 'Have an idea?', cta: 'Start a project' },
  },
};
