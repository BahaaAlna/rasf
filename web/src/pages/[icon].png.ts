/*
  The site's icon when one was uploaded in the dashboard: /icon.png for
  browser tabs and /icon-touch.png for home screens, written out from the
  PNG data the dashboard saved. With no upload, nothing is written here
  and the pages link to the defaults in public/ instead.
*/
import type { APIRoute, GetStaticPaths } from 'astro';
import { getSite } from '../lib/content';

export const getStaticPaths = (() => {
  const { icon } = getSite('ar');
  if (!icon) return [];
  return [
    { params: { icon: 'icon' }, props: { data: icon.tab } },
    { params: { icon: 'icon-touch' }, props: { data: icon.touch } },
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
  const base64 = String(props.data).replace(/^data:image\/png;base64,/, '');
  return new Response(Buffer.from(base64, 'base64'), { headers: { 'Content-Type': 'image/png' } });
};
