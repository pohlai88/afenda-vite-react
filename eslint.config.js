import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

/**
 * Flat ESLint config (ESLint 9+).
 * @see https://eslint.org/docs/latest/use/configure/configuration-files
 *
 * - `tsc -b` remains the source of truth for full typechecking (Vite transpiles only).
 * - Type-aware ESLint rules use projectService for each package src/ tree (glob ** /src/ **).
 * @see https://vite.dev/guide/features#transpile-only
 * @see https://typescript-eslint.io/getting-started/typed-linting
 */
const tsconfigRootDir = import.meta.dirname

const coreRules = {
  eqeqeq: ['warn', 'always', { null: 'ignore' }],
  'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
  'no-empty': ['warn', { allowEmptyCatch: true }],
  'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
  'no-var': 'error',
  'prefer-const': ['error', { destructuring: 'all' }],
}

const tsRules = {
  '@typescript-eslint/consistent-type-imports': [
    'error',
    { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
  ],
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      args: 'all',
      argsIgnorePattern: '^_',
      caughtErrors: 'all',
      caughtErrorsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true,
    },
  ],
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/no-require-imports': 'off',
  '@typescript-eslint/no-var-requires': 'off',
}

export default defineConfig([
  globalIgnores([
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/node_modules/**',
    '**/.vite/**',
    '**/.turbo/**',
    '**/public/**',
    '**/dev-dist/**',
    '**/__mocks__/**',
  ]),

  {
    name: 'base/javascript',
    files: ['**/*.{js,mjs,cjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2023,
      },
    },
    rules: { ...coreRules },
  },

  {
    name: 'typescript/root-config',
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/src/**'],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2023,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: { ...coreRules, ...tsRules },
  },

  {
    name: 'typescript/packages-testing',
    files: ['packages/testing/src/**/*.ts'],
    extends: [
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeCheckedOnly,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2023,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir,
      },
    },
    rules: { ...coreRules, ...tsRules },
  },

  {
    name: 'typescript-react/src-type-aware',
    files: ['**/src/**/*.{ts,tsx}'],
    ignores: ['**/packages/testing/**'],
    extends: [
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeCheckedOnly,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      jsxA11y.flatConfigs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2023,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...coreRules,
      ...tsRules,
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },

  {
    name: 'tooling-config-files',
    files: [
      'eslint.config.js',
      '*.config.{js,cjs,mjs,ts,mts,cts}',
      'vite.config.{js,ts,mts,cts}',
      'vitest.config.{js,ts,mts,cts}',
      'vitest.setup.ts',
      'scripts/**/*.ts',
    ],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  {
    name: 'tests',
    files: ['**/*.{test,spec}.{js,ts,tsx}', '**/__tests__/**/*.{js,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.vitest,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  /** Disables ESLint rules that conflict with Prettier (format stays on `pnpm format`). */
  eslintConfigPrettier,
])
