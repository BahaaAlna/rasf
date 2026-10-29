/*
  Bringing everything the site has today into the dashboard in one go:
  every section never saved here, as the site shows it now, and every
  blog post written as a Markdown file in the website. From then on the
  dashboard holds the site's original content.

  Nothing already saved here is touched, so running it twice is harmless.
*/

import { SECTIONS } from './sections';
import { getSection, saveSection } from '../lib/content';
import { postExists, savePost, type PostVersion } from '../lib/posts';

/** The website's Markdown posts, as text: web/src/content/blog/{ar,en}/*.md */
const files = import.meta.glob('../../../web/src/content/blog/*/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

interface FilePost {
  date: Date;
  draft: boolean;
  ar: PostVersion | null;
  en: PostVersion | null;
}

/** A Markdown post's front matter (title, description, date, draft) and body. */
function parse(source: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const meta: Record<string, string> = {};
  for (const line of (match?.[1] ?? '').split(/\r?\n/)) {
    const pair = line.match(/^(\w+):\s*(.*)$/);
    if (pair) meta[pair[1]] = pair[2].trim().replace(/^(['"])(.*)\1$/, '$2');
  }
  return { meta, body: (match?.[2] ?? source).trim() + '\n' };
}

/** The Markdown posts, grouped by address: one post, each language a version of it. */
function filePosts(): Map<string, FilePost> {
  const posts = new Map<string, FilePost>();
  for (const [path, source] of Object.entries(files)) {
    const [, lang, slug] = path.match(/\/(ar|en)\/([^/]+)\.md$/) ?? [];
    if (!lang || !slug) continue;
    const { meta, body } = parse(source);
    const post = posts.get(slug) ?? { date: new Date(meta.date || Date.now()), draft: false, ar: null, en: null };
    post[lang as 'ar' | 'en'] = { title: meta.title ?? slug, description: meta.description ?? '', body };
    if (meta.draft === 'true') post.draft = true;
    posts.set(slug, post);
  }
  return posts;
}

export interface ImportResult {
  sections: string[];
  posts: string[];
}

/** Posts written as files that aren't in the dashboard yet, by slug. */
export async function waitingPosts(): Promise<string[]> {
  const waiting: string[] = [];
  for (const slug of filePosts().keys()) if (!(await postExists(slug))) waiting.push(slug);
  return waiting;
}

export async function importAll(): Promise<ImportResult> {
  const result: ImportResult = { sections: [], posts: [] };

  for (const section of SECTIONS) {
    if (await getSection(section.id)) continue;
    await saveSection(section.id, section.current());
    result.sections.push(section.title);
  }

  for (const [slug, post] of filePosts()) {
    if (await postExists(slug)) continue;
    await savePost({ slug, ...post });
    result.posts.push(slug);
  }

  return result;
}
