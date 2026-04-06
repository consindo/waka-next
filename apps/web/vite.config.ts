import { sveltekit } from '@sveltejs/kit/vite'
import path from 'path'

export default {
  plugins: [sveltekit()],
  server: {
    port: 5180,
  },
  preview: {
    port: 4173,
  },
  resolve: {
    alias: {
      '@lib': path.resolve(__dirname, '../../lib'),
    },
  },
}
