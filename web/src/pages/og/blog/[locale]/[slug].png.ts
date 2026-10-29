/*
  Each published post's share picture, in its own language:
  /og/blog/ar/<slug>.png and /og/blog/en/<slug>.png (see lib/og.ts).
*/
import type { APIRoute, GetStaticPaths } from 'astro';
import { getPosts, slugOf } from '../../../../lib/blog';
import { locales, type Locale } from '../../../../lib/i18n';
import { postCard } from '../../../../lib/og';

export const getStaticPaths = (async () => {
  const paths = [];
  for (const locale of locales) {
    for (const post of await getPosts(locale)) {
      paths.push({ params: { locale, slug: slugOf(post) }, props: { title: post.data.title, locale } });
    }
  }
  return paths;
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await postCard(String(props.title), props.locale as Locale);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
