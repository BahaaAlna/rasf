/*
  The projects' own pages: getStaticPaths for /work/<slug> in a language,
  one page per project there. A project whose address would land on one
  of the pages under Work ("software", "designs"), or isn't a plain
  address, gets no page of its own rather than breaking another.
*/

import { getWork } from './content';
import type { Locale } from './i18n';

const TAKEN = new Set(['software', 'designs']);
const PLAIN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function projectPaths(locale: Locale) {
  return getWork(locale)
    .projects.filter((project) => PLAIN.test(project.slug) && !TAKEN.has(project.slug))
    .map((project) => ({ params: { slug: project.slug }, props: { project } }));
}
