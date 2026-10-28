// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://rasf.studio',
  i18n: {
    locales: ['ar', 'en'],
    defaultLocale: 'ar',
    routing: {
      // Arabic is served from / with no prefix; English from /en/.
      prefixDefaultLocale: false,
    },
  },
  integrations: [react(), sitemap({ i18n: { defaultLocale: 'ar', locales: { ar: 'ar', en: 'en' } } })],
});
