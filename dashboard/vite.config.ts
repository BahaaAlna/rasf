import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Read every file with the dashboard's own settings, the website's data
  // files too: theirs (../web/tsconfig.json) builds on Astro's, which isn't
  // installed when only the dashboard is (as on Cloudflare).
  tsconfig: './tsconfig.app.json',
  server: {
    fs: {
      // The section editors start from the website's own data files
      // (../web/src/data), so the dev server may read the website too.
      // The share preview draws with the site's logos (../web/src/assets).
      allow: ['.', '../web/src/data', '../web/src/lib', '../web/src/content', '../web/src/assets', '../web/public'],
    },
  },
})
