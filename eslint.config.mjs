import eslint from '@eslint/js'
import eslintPluginSvelte from 'eslint-plugin-svelte'
import globals from 'globals'
import svelteParser from 'svelte-eslint-parser'
import tseslint from 'typescript-eslint'

export default [
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  ...eslintPluginSvelte.configs['flat/recommended'],
  {
    ignores: ['**/.svelte-kit/*', '**/build/*', '**/*.netlify/*'],
  },
  {
    files: ['**/*.svelte', '*.svelte', '**/*.svelte.ts', '*.svelte.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parser: svelteParser,
      parserOptions: {
        parser: {
          ts: '@typescript-eslint/parser',
        },
        extraFileExtensions: ['.svelte', '.svelte.ts'],
      },
    },
  },
  {
    rules: {
      'no-warning-comments': ['warn', { terms: ['todo', 'bug', 'perf'], location: 'anywhere' }],
      'svelte/valid-compile': 'warn',
      'svelte/no-at-html-tags': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'svelte/require-each-key': 'warn',
    },
  },
]
