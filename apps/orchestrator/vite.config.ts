import { sveltekit } from '@sveltejs/kit/vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default {
  plugins: [
    sveltekit(),
    visualizer({
      emitFile: true,
    }),
  ],
  server: {
    port: 5181,
    fs: {
      allow: ['../..'],
    },
  },
  preview: {
    port: 4174,
  },
}
