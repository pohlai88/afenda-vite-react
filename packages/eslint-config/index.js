import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import { createRequire } from 'node:module'
import tseslint from 'typescript-eslint'

const require = createRequire(import.meta.url)
const afendaUiPlugin = require('./afenda-ui-plugin/index.cjs')

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

export function createConfig({ rootDir = process.cwd() } = {}) {
  const tsconfigRootDir = rootDir

  return defineConfig([
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
      name: 'apps/web/features-formatting-governance',
      files: [
        'apps/web/src/features/**/*.{ts,tsx}',
        'apps/web/src/pages/**/*.{ts,tsx}',
      ],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector:
              "NewExpression[callee.object.name='Intl'][callee.property.name='NumberFormat']",
            message:
              'Use share/i18n/format helpers (formatNumber, formatCurrency, formatPercent) instead of Intl.NumberFormat in feature code.',
          },
          {
            selector:
              "CallExpression[callee.object.name='Intl'][callee.property.name='NumberFormat']",
            message:
              'Use share/i18n/format helpers (formatNumber, formatCurrency, formatPercent) instead of Intl.NumberFormat in feature code.',
          },
          {
            selector:
              "NewExpression[callee.object.name='Intl'][callee.property.name='DateTimeFormat']",
            message:
              'Use share/i18n/format helper formatDate instead of Intl.DateTimeFormat in feature code.',
          },
          {
            selector:
              "CallExpression[callee.object.name='Intl'][callee.property.name='DateTimeFormat']",
            message:
              'Use share/i18n/format helper formatDate instead of Intl.DateTimeFormat in feature code.',
          },
          {
            selector:
              "CallExpression[callee.property.name='toLocaleString'], CallExpression[callee.property.name='toLocaleDateString'], CallExpression[callee.property.name='toLocaleTimeString']",
            message:
              'Use share/i18n/format helpers (formatNumber, formatCurrency, formatPercent, formatDate) instead of toLocale* in feature code.',
          },
        ],
      },
    },

    {
      name: 'afenda-ui/governance',
      files: [
        'packages/ui/src/components/**/*.{ts,tsx}',
        'apps/web/src/features/**/*.{ts,tsx}',
        'apps/web/src/share/components/**/*.{ts,tsx}',
      ],
      ignores: [
        '**/*.{test,spec}.{ts,tsx}',
        '**/__tests__/**',
        '**/__test__/**',
        '**/*.stories.{ts,tsx}',
      ],
      plugins: {
        'afenda-ui': afendaUiPlugin,
      },
      rules: {
        'afenda-ui/no-raw-colors': 'error',
        'afenda-ui/no-inline-style-theming': 'error',
        'afenda-ui/semantic-token-allowlist': 'error',
        'afenda-ui/no-local-semantic-map': 'error',
      },
    },

    {
      name: 'afenda-ui/chart-inline-style-exception',
      files: [
        'apps/web/src/**/chart/**/*.{ts,tsx}',
        'apps/web/src/**/charts/**/*.{ts,tsx}',
        'apps/web/src/**/charting/**/*.{ts,tsx}',
        'packages/ui/src/components/ui/chart.tsx',
      ],
      plugins: {
        'afenda-ui': afendaUiPlugin,
      },
      rules: {
        'afenda-ui/no-inline-style-theming': 'off',
      },
    },

    {
      name: 'afenda-ui/feature-resolver-exclusivity',
      files: [
        'apps/web/src/features/**/*.{ts,tsx}',
        'apps/web/src/pages/**/*.{ts,tsx}',
      ],
      ignores: [
        '**/*.{test,spec}.{ts,tsx}',
        '**/__tests__/**',
        '**/__test__/**',
        '**/*.stories.{ts,tsx}',
      ],
      plugins: {
        'afenda-ui': afendaUiPlugin,
      },
      rules: {
        'afenda-ui/no-direct-semantic-color': 'error',
      },
    },

    {
      name: 'packages/ui/component-library-overrides',
      files: ['packages/ui/src/**/*.{ts,tsx}'],
      rules: {
        'react-refresh/only-export-components': 'off',
        'no-restricted-syntax': [
          'error',
          {
            selector:
              "JSXAttribute[name.name='className'][value.value=/\\bsr-only\\b/]",
            message:
              'Use the shared VisuallyHidden primitive instead of raw sr-only JSX in packages/ui.',
          },
        ],
      },
    },

    {
      name: 'packages/shadcn-ui/component-library-overrides',
      files: ['packages/shadcn-ui/src/**/*.{ts,tsx}'],
      rules: {
        'react-refresh/only-export-components': 'off',
      },
    },

    {
      name: 'packages/ui/base-ui-boundary',
      files: ['packages/ui/src/**/*.{ts,tsx}'],
      ignores: ['packages/ui/src/components/ui/combobox.tsx'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: '@base-ui/react',
                message:
                  'Use radix-ui primitives in packages/ui. The only approved @base-ui/react exception is packages/ui/src/components/ui/combobox.tsx.',
              },
            ],
          },
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
      files: [
        '**/*.{test,spec}.{js,ts,tsx}',
        '**/__tests__/**/*.{js,ts,tsx}',
        '**/__test__/**/*.{js,ts,tsx}',
      ],
      languageOptions: {
        globals: {
          ...globals.vitest,
        },
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        'no-console': 'off',
      },
    },

    eslintConfigPrettier,
  ])
}

export default createConfig()
