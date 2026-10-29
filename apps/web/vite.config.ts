import adapter from '@sveltejs/adapter-node'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { sveltekit } from '@sveltejs/kit/vite'
import devtoolsJson from 'vite-plugin-devtools-json'
import path from 'path'

export default {
  plugins: [
    sveltekit({
      paths: {
        origin: 'https://waka.app',
      },
      preprocess: vitePreprocess(),
      adapter: adapter(),
      alias: { '@lib': '../../lib', '@regions': '../../regions' },
    }),
    devtoolsJson(),
  ],
  server: { port: 5180, fs: { allow: ['../..'] } },
  preview: { port: 4173 },
  resolve: {
    alias: {
      '@lib': path.resolve(import.meta.dirname, '../../lib'),
      '@regions': path.resolve(import.meta.dirname, '../../regions'),
    },
  },
  optimizeDeps: {
    // todo: remove this if possible?
    exclude: ['maplibre-gl'],
  },
}
