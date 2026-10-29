/*
  Each project's share picture, in each language it's written in:
  /og/work/ar/<slug>.jpg and /og/work/en/<slug>.jpg (see lib/og.ts).
  Projects without a photograph share the site's picture.
*/
import type { APIRoute, GetStaticPaths } from 'astro';
import { getWork } from '../../../../lib/content';
import { locales, type Locale } from '../../../../lib/i18n';
import { hasPhoto, projectCard } from '../../../../lib/og';

export const getStaticPaths = (() =>
  locales.flatMap((locale) =>
    getWork(locale)
      .projects.filter((project) => hasPhoto(project.image))
      .map((project) => ({
        params: { locale, slug: project.slug },
        props: { locale, project: { name: project.name, kind: project.kind, image: project.image } },
      })),
  )) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const jpg = await projectCard(props.project, props.locale as Locale);
  return new Response(new Uint8Array(jpg), { headers: { 'Content-Type': 'image/jpeg' } });
};
