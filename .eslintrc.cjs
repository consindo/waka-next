module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:svelte/recommended',
    'prettier',
  ],
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
    requireConfigFile: false,
    extraFileExtensions: ['.svelte'],
  },
  env: {
    browser: true,
    es2020: true,
    node: true,
    mocha: true,
  },
  rules: {
    'no-warning-comments': ['warn', { terms: ['todo', 'bug', 'perf'], location: 'anywhere' }],
    'svelte/valid-compile': 'warn',
    'svelte/no-at-html-tags': 'warn',
  },
  ignorePatterns: ['**/build/*'],
}
