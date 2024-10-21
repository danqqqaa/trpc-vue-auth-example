import { fileURLToPath, URL } from 'node:url'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwind from 'tailwindcss'
import path from 'path'
import dirname from "path"

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwind(),],
    },
  },
  plugins: [
    vue(), tsconfigPaths()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@apps/*': path.resolve("/../apps/server-limit/*"),
      //  fileURLToPath(new URL('../apps/server-limit/*', import.meta.url)),
      // '@packages/*':  path.resolve(dirnam,"@/../../../packages/z/auth"),
    }
  }
})
