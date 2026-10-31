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

/** When a post last changed: its edit, if that came after it was published. */
export const modifiedOf = (post: Post): Date =>
  post.data.updated && post.data.updated > post.data.date ? post.data.updated : post.data.date;

/*
  Related posts, for the links under each one. Posts carry no tags, so
  they're matched on their words: each post is weighed as a bag of words
  (the title counting most, then the description, then the body), words
  that every post uses count for little (tf-idf), and the closest by
  cosine come first.
*/

/** One spelling for an Arabic word, with the common prefixes off, so "والتصميم" meets "تصميم". */
function stem(word: string): string {
  const plain = word
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');
  const bare = plain.replace(/^(وال|بال|كال|فال|لل|ال)/, '');
  return bare.length >= 3 ? bare : plain;
}

function terms(text: string): string[] {
  return (text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).map(stem).filter((word) => word.length >= 3);
}

function weigh(post: Post): Map<string, number> {
  const counts = new Map<string, number>();
  const add = (text: string, weight: number) =>
    terms(text).forEach((term) => counts.set(term, (counts.get(term) ?? 0) + weight));
  add(post.data.title, 4);
  add(post.data.description, 2);
  add(post.body ?? '', 1);
  return counts;
}

const neighbours = new Map<Locale, Promise<Map<string, Post[]>>>();

async function rank(locale: Locale): Promise<Map<string, Post[]>> {
  const posts = await getPosts(locale);
  const bags = posts.map(weigh);
  const spread = new Map<string, number>();
  bags.forEach((bag) => bag.forEach((_, term) => spread.set(term, (spread.get(term) ?? 0) + 1)));

  const vectors = bags.map((bag) => {
    const vector = new Map<string, number>();
    bag.forEach((count, term) => vector.set(term, (1 + Math.log(count)) * Math.log(posts.length / spread.get(term)!)));
    const length = Math.hypot(...vector.values()) || 1;
    vector.forEach((value, term) => vector.set(term, value / length));
    return vector;
  });

  const cosine = (a: Map<string, number>, b: Map<string, number>) => {
    let sum = 0;
    a.forEach((value, term) => (sum += value * (b.get(term) ?? 0)));
    return sum;
  };

  return new Map(
    posts.map((post, i) => [
      post.id,
      posts
        .map((other, j) => ({ other, score: i === j ? -1 : cosine(vectors[i], vectors[j]) }))
        .filter(({ score }) => score >= 0)
        .sort((a, b) => b.score - a.score)
        .map(({ other }) => other),
    ]),
  );
}

/** The posts closest to this one in its language, closest first. */
export async function relatedPosts(post: Post, count = 3): Promise<Post[]> {
  const locale = localeOf(post);
  if (!neighbours.has(locale)) neighbours.set(locale, rank(locale));
  return ((await neighbours.get(locale)!).get(post.id) ?? []).slice(0, count);
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
