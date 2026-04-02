import { sveltekit } from '@sveltejs/kit/vite'
import path from 'path'

export default {
  plugins: [
    sveltekit(),
  ],
  build: {
    assetsInlineLimit: 0,
  },
  server: {
    port: 5181,
    fs: {
      allow: ['../..'],
    },
  },
  preview: {
    port: 4174,
  },
  resolve: {
    alias: {
      '@lib': path.resolve(__dirname, '../../lib'),
    },
  },
}
