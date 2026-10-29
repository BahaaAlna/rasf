/*
  The blog's side of the content seam: posts read from the `blog`
  collection, sorted and split by language. Pages import from here, as
  they import everything else from lib/content.ts.
*/

import { getCollection, type CollectionEntry } from 'astro:content';
import { localizePath, otherLocale, type Locale } from './i18n';
import { getBlogCopy } from './content';

export type Post = CollectionEntry<'blog'>;

export function getBlog(locale: Locale) {
  return getBlogCopy(locale);
}

export type BlogSection = ReturnType<typeof getBlog>;

/** `ar/hello` → `hello`: the file name, shared with its translation. */
export const slugOf = (post: Post) => post.id.split('/').slice(1).join('/');

export const localeOf = (post: Post) => post.id.split('/')[0] as Locale;

/** Newest first. Drafts only while developing. */
export async function getPosts(locale: Locale): Promise<Post[]> {
  const posts = await getCollection(
    'blog',
    (post) => localeOf(post) === locale && (import.meta.env.DEV || !post.data.draft),
  );
  // Same-day posts in a fixed order, so each stays on the same page of the list.
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf() || a.id.localeCompare(b.id));
}

/** How many posts each page of the list shows. */
export const PER_PAGE = 8;

/** How many pages the list has in this language; always at least one. */
export const pageCount = (posts: number) => Math.max(1, Math.ceil(posts / PER_PAGE));

/** Locale-independent path of a page of the list: the first is the blog itself. */
export const listPath = (page: number) => (page <= 1 ? '/blog' : `/blog/page/${page}`);

/** The list's pages after the first, for getStaticPaths. */
export async function listPaths(locale: Locale) {
  const pages = pageCount((await getPosts(locale)).length);
  return Array.from({ length: pages - 1 }, (_, i) => ({ params: { page: String(i + 2) }, props: { page: i + 2 } }));
}

/** Locale-independent path of a post, e.g. `/blog/hello`. */
export const postPath = (slug: string) => `/blog/${slug}`;

export const postHref = (post: Post) => localizePath(postPath(slugOf(post)), localeOf(post));

/** Rough minutes to read, from the Markdown source. Never less than one. */
export function readingMinutes(post: Post): number {
  const words = (post.body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(date: Date, locale: Locale): string {
  return date.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** getStaticPaths for a language's posts, each told if it has a translation. */
export async function postPaths(locale: Locale) {
  const [posts, others] = await Promise.all([getPosts(locale), getPosts(otherLocale(locale))]);
  const translatedSlugs = new Set(others.map(slugOf));

  return posts.map((post) => ({
    params: { slug: slugOf(post) },
    props: { post, translated: translatedSlugs.has(slugOf(post)) },
  }));
}
