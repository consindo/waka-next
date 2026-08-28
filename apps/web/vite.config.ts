import { sveltekit } from '@sveltejs/kit/vite'
import devtoolsJson from 'vite-plugin-devtools-json'
import path from 'path'

export default {
  plugins: [sveltekit(), devtoolsJson()],
  server: {
    port: 5180,
  },
  preview: {
    port: 4173,
  },
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
