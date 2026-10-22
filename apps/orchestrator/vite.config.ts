import adapter from '@sveltejs/adapter-node'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { sveltekit } from '@sveltejs/kit/vite'
import path from 'path'

export default {
  plugins: [
    sveltekit({
      preprocess: vitePreprocess(),
      adapter: adapter(),
      alias: { '@lib': '../../lib', '@regions': '../../regions' },
    }),
  ],
  build: { assetsInlineLimit: 0 },
  server: { port: 5181, fs: { allow: ['../..'] } },
  preview: { port: 4174 },
  resolve: {
    alias: {
      '@lib': path.resolve(import.meta.dirname, '../../lib'),
      '@regions': path.resolve(import.meta.dirname, '../../regions'),
    },
  },
}
