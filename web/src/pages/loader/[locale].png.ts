/*
  The loading screen's picture in each language: /loader/ar.png and
  /loader/en.png (see lib/og.ts), with the slogan from the dashboard.
*/
import type { APIRoute, GetStaticPaths } from 'astro';
import { getUI } from '../../lib/content';
import { locales, type Locale } from '../../lib/i18n';
import { loaderMark } from '../../lib/og';

export const getStaticPaths = (() =>
  locales.map((locale) => ({ params: { locale }, props: { locale, slogan: getUI(locale).slogan } }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await loaderMark(String(props.slogan), props.locale as Locale);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
