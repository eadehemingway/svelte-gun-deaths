import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [svelte()],

  build: {
    target: 'es6',

    lib: {
      entry: 'src/main.ts',
      formats: ['iife'],
      name: 'template',
      fileName: () => 'template.js',
    },

    outDir: '.',
  }
})
