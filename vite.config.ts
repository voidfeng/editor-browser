import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { crx } from '@crxjs/vite-plugin'
import UnoCSS from 'unocss/vite'
import manifest from './manifest.config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [UnoCSS(), vue(), vueDevTools(), crx({ manifest })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    cors: {
      origin: [/chrome-extension:\/\//]
    }
  }
})
