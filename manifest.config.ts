import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'Editor Browser Extension',
  version: '1.0.0',
  description: 'A Chrome extension built with Vue 3 and CRXJS',
  action: {
    default_popup: 'index.html',
  },
  permissions: ['activeTab', 'storage'],
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content-app.ts'],
    },
  ],
})
