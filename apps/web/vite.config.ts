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
    port: 5180,
  },
  preview: {
    port: 4173,
  },
}
