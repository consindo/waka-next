import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/**/*.{test,spec}.{js,ts}'],
    coverage: {
      reporter: ['text', 'json-summary', 'json', 'html'],
      reportOnFailure: true,
      exclude: [...(configDefaults.coverage.exclude || []), '**/build/**', '**/.svelte-kit/**'],
    },
  },
})
