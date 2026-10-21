/*
  Selected work — a few words about the studio, then a short list of
  projects, each linking to its own page. Software leads: building comes
  first in the intro and in the order of the projects, design after.

  Draft copy, and the projects are placeholders: no real names, years,
  images or pages exist yet. TODO: replace `projects` with the real ones
  once their pages are built; `slug` becomes the path, `/work/<slug>`, and
  `image` is the picture that floats beside the row on hover — the
  project's landing shot or its key visual. The placeholders in
  `public/work/` are drawn at 4:3; keep real images near that shape.
*/

import type { Locale } from '../lib/i18n';

export interface WorkProject {
  /** Path segment of the project's page: `/work/<slug>`. */
  slug: string;
  name: string;
  /** What kind of work it was — website, web app, identity… — in a few words. */
  kind: string;
  year: string;
  /** Shown on hover. A path under `public/`, ideally 4:3. */
  image: string;
}

export interface WorkContent {
  /** A few sentences about who we are, before the work itself. */
  intro: string;
  /** Small label above the list. */
  listLabel: string;
  /** Link to the page listing every project. */
  allLabel: string;
  projects: WorkProject[];
}

export const work: Record<Locale, WorkContent> = {
  ar: {
    intro:
      'نحن استوديو يبني البرمجيات من أول فكرة حتى آخر سطر: مواقع، تطبيقات ويب، ومتاجر إلكترونية — ونصمم الهويات التي تحملها. نرصفها حجراً حجراً، كل قطعة في مكانها. هذه بعض الطرق التي رصفناها.',
    listLabel: 'أعمال مختارة',
    allLabel: 'كل الأعمال',
    projects: [
      { slug: 'project-one', name: 'مشروع ٠١', kind: 'موقع متكامل', year: '٢٠٢٦', image: '/work/project-one.svg' },
      { slug: 'project-two', name: 'مشروع ٠٢', kind: 'تطبيق ويب', year: '٢٠٢٦', image: '/work/project-two.svg' },
      { slug: 'project-three', name: 'مشروع ٠٣', kind: 'متجر إلكتروني', year: '٢٠٢٥', image: '/work/project-three.svg' },
      { slug: 'project-four', name: 'مشروع ٠٤', kind: 'هوية بصرية', year: '٢٠٢٥', image: '/work/project-four.svg' },
    ],
  },
  en: {
    intro:
      'We are a studio that builds software end to end, from the first idea to the last line of code: websites, web apps and online stores, and the brands they carry. Laid stone by stone, every piece in its place. Here are a few of the roads we have paved.',
    listLabel: 'Selected work',
    allLabel: 'All work',
    projects: [
      { slug: 'project-one', name: 'Project 01', kind: 'Website, end to end', year: '2026', image: '/work/project-one.svg' },
      { slug: 'project-two', name: 'Project 02', kind: 'Web app', year: '2026', image: '/work/project-two.svg' },
      { slug: 'project-three', name: 'Project 03', kind: 'Online store', year: '2025', image: '/work/project-three.svg' },
      { slug: 'project-four', name: 'Project 04', kind: 'Brand identity', year: '2025', image: '/work/project-four.svg' },
    ],
  },
};
