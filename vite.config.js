import { fileURLToPath, URL } from 'node:url'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    nodePolyfills(),
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
