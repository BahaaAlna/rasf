/*
  Blog posts in Firestore: one document per post in `posts`, its id the
  slug, the same address the website uses (/blog/{slug}, /en/blog/{slug}).

  A post carries each language it is written in, Arabic and English, as
  its own title, description and Markdown body. Either can be missing,
  as on the website, where a post may exist in one language only.
*/

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export type Lang = 'ar' | 'en';

export const LANGS: Lang[] = ['ar', 'en'];

export const LANG_NAMES: Record<Lang, string> = { ar: 'العربية', en: 'English' };

export interface PostVersion {
  title: string;
  description: string;
  /** Markdown, as the website's post files are. */
  body: string;
}

export interface Post {
  slug: string;
  date: Date;
  /** Drafts never appear on the live site. */
  draft: boolean;
  ar: PostVersion | null;
  en: PostVersion | null;
  updatedAt: Date | null;
}

const posts = collection(db, 'posts');

/** Lowercase letters, digits and single hyphens: safe in a URL and as an id. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fromDoc(slug: string, data: Record<string, unknown>): Post {
  const date = data.date instanceof Timestamp ? data.date.toDate() : new Date();
  const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null;
  return {
    slug,
    date,
    draft: Boolean(data.draft),
    ar: (data.ar as PostVersion | null) ?? null,
    en: (data.en as PostVersion | null) ?? null,
    updatedAt,
  };
}

/** Newest first, drafts included: the dashboard sees everything. */
export async function listPosts(): Promise<Post[]> {
  const snap = await getDocs(query(posts, orderBy('date', 'desc')));
  return snap.docs.map((d) => fromDoc(d.id, d.data()));
}

export async function getPost(slug: string): Promise<Post | null> {
  const snap = await getDoc(doc(posts, slug));
  return snap.exists() ? fromDoc(snap.id, snap.data()) : null;
}

export async function postExists(slug: string): Promise<boolean> {
  return (await getDoc(doc(posts, slug))).exists();
}

export async function savePost(post: Omit<Post, 'updatedAt'>): Promise<void> {
  await setDoc(doc(posts, post.slug), {
    date: Timestamp.fromDate(post.date),
    draft: post.draft,
    ar: post.ar,
    en: post.en,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePost(slug: string): Promise<void> {
  await deleteDoc(doc(posts, slug));
}

/** The title to show for a post in a list: Arabic first, as the site is. */
export const titleOf = (post: Post) => post.ar?.title || post.en?.title || post.slug;
