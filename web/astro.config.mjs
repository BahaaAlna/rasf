// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { loadPosts } from './src/lib/firestore.ts';

const SITE = 'https://rasf.studio';

// When each post last changed, by its address in both languages, so the
// sitemap tells search engines which posts to read again.
/** @type {Map<string, string>} */
const lastmod = new Map();
for (const post of (await loadPosts()) ?? []) {
  const at = (post.updated && post.updated > post.date ? post.updated : post.date).toISOString();
  if (post.ar) lastmod.set(`${SITE}/blog/${post.slug}/`, at);
  if (post.en) lastmod.set(`${SITE}/en/blog/${post.slug}/`, at);
}

// https://astro.build/config
export default defineConfig({
  site: SITE,
  i18n: {
    locales: ['ar', 'en'],
    defaultLocale: 'ar',
    routing: {
      // Arabic is served from / with no prefix; English from /en/.
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    react(),
    sitemap({
      i18n: { defaultLocale: 'ar', locales: { ar: 'ar', en: 'en' } },
      serialize: (item) => ({ ...item, lastmod: lastmod.get(item.url) ?? item.lastmod }),
    }),
  ],
});
