import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // The section editors start from the website's own data files
      // (../web/src/data), so the dev server may read the website too.
      allow: ['.', '../web/src/data', '../web/src/lib', '../web/src/content', '../web/public'],
    },
  },
})
