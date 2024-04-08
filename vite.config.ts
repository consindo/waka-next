import tsconfigPaths from 'vite-tsconfig-paths'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths({ loose: true, })],
  test: {
    include: ['test/**/*.{test,spec}.{js,ts}'],
    coverage: {
      reporter: ['text', 'json-summary', 'json', 'html'],
      reportOnFailure: true,
      exclude: [...(configDefaults.coverage.exclude || []), '**/build/**', '**/.svelte-kit/**'],
    },
  },
})
