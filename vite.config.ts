import { sveltekit } from '@sveltejs/kit/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    sveltekit(),
    visualizer({
      emitFile: true,
    }),
  ],
  test: {
    include: ['test/**/*.{test,spec}.{js,ts}'],
    coverage: {
      reporter: ['text', 'json-summary', 'json', 'html'],
      reportOnFailure: true,
    },
  },
})
