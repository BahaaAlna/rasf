/*
  The studio's projects, in Firestore at content/projects: one document
  holding the list, in the order the site shows it. A project is written
  once: what's the same in both languages (its address, which page lists
  it, the live link, the year, its pictures) at the top, and its words in
  Arabic and English beside them.

  The website reads this document in place of the projects that used to
  live inside the Work section (see web/src/lib/content.ts). Until it's
  first saved, the list starts from the projects in the site's own data.
*/

import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { work } from '../../../web/src/data/work';
import type { Lang } from './posts';

export type Category = 'software' | 'design';

export interface ProjectWords {
  name: string;
  /** Website, web app, identity… */
  kind: string;
  /** One or two sentences, beside its picture on the Software and Designs pages. */
  summary: string;
  /** The text on its own page: paragraphs, ## headings, - lists, [words](https://…) links. */
  body: string;
  /** What we did on it, a few short items. */
  scope: string[];
}

export interface Project {
  /** Its page: /work/<slug>. */
  slug: string;
  category: Category;
  /** The finished thing, if it can be visited. */
  link: string;
  year: string;
  /** Shown beside it in lists. A path under the site's public folder, about 4:3. */
  image: string;
  /** More pictures on its page. */
  gallery: string[];
  /** One of the projects on the home page (HOME_LIMIT at most). */
  featured: boolean;
  ar: ProjectWords;
  en: ProjectWords;
}

const ref = doc(db, 'content', 'projects');

/** Its address: lowercase letters, digits and single hyphens, and not one of Work's own pages. */
export const isSlug = (slug: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && !['software', 'designs'].includes(slug);

/** How many projects the home page shows; the site shows the first ones until any are chosen. */
export const HOME_LIMIT = 4;

export const blankWords = (): ProjectWords => ({ name: '', kind: '', summary: '', body: '', scope: [] });

export const blankProject = (): Project => ({
  slug: '',
  category: 'software',
  link: '',
  year: '',
  image: '',
  gallery: [],
  featured: false,
  ar: blankWords(),
  en: blankWords(),
});

/** The projects from the site's own data, paired by address across the two languages. */
function fromSite(): Project[] {
  return work.ar.projects.map((ar, i) => {
    const en = work.en.projects.find((p) => p.slug === ar.slug);
    const words = (p: typeof ar | undefined): ProjectWords =>
      p ? { name: p.name, kind: p.kind, summary: p.summary, body: p.body, scope: [...p.scope] } : blankWords();
    return {
      slug: ar.slug,
      category: ar.category,
      link: ar.link,
      year: ar.year,
      image: ar.image,
      gallery: [...ar.gallery],
      featured: i < HOME_LIMIT,
      ar: words(ar),
      en: words(en),
    };
  });
}

export interface StoredProjects {
  projects: Project[];
  updatedAt: Date | null;
  /** False while the list has never been saved here. */
  saved: boolean;
}

export async function getProjects(): Promise<StoredProjects> {
  const snap = await getDoc(ref);
  if (!snap.exists()) return { projects: fromSite(), updatedAt: null, saved: false };
  const data = snap.data();
  return {
    // Saved before the home page could be chosen: `featured` is simply false.
    projects: ((data.items as Project[]) ?? []).map((p) => ({ ...p, featured: p.featured === true })),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
    saved: true,
  };
}

/** Lines trimmed and empty ones dropped, text trimmed at the ends. */
function tidy(project: Project): Project {
  const words = (w: ProjectWords): ProjectWords => ({
    name: w.name.trim(),
    kind: w.kind.trim(),
    summary: w.summary.trim(),
    body: w.body.trim(),
    scope: w.scope.map((s) => s.trim()).filter(Boolean),
  });
  return {
    ...project,
    slug: project.slug.trim(),
    link: project.link.trim(),
    year: project.year.trim(),
    image: project.image.trim(),
    gallery: project.gallery.map((s) => s.trim()).filter(Boolean),
    ar: words(project.ar),
    en: words(project.en),
  };
}

export async function saveProjects(projects: Project[]): Promise<void> {
  await setDoc(ref, { items: projects.map(tidy), updatedAt: serverTimestamp() });
}

/** The name to show for a project in a list: Arabic first, as the site is. */
export const nameOf = (p: Project, lang: Lang = 'ar') => p[lang].name || p[lang === 'ar' ? 'en' : 'ar'].name || p.slug;
