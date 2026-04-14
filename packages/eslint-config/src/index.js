import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier/flat'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import vitestPlugin from '@vitest/eslint-plugin'

import afendaUiPlugin from './plugin.js'

/** @typedef {{ rootDir: string }} CreateConfigOptions */

/**
 * Afenda monorepo ESLint policy (flat config): Node + Vite + TypeScript + React + Vitest.
 * All presets live here; the repo root `eslint.config.js` should only call `createConfig` and add repo-specific overrides.
 *
 * Performance: typed rules use the default typescript-eslint `recommended` preset (not `recommendedTypeChecked`)
 * to keep `pnpm run lint` fast. Opt into type-aware rules later via `parserOptions.projectService` + `recommendedTypeChecked`.
 *
 * @param {CreateConfigOptions} [opts]
 * @returns {import('eslint').Linter.Config[]}
 */
export function createConfig(opts = {}) {
  const { rootDir } = opts
  void rootDir

  return tseslint.config(
    {
      name: 'afenda/global-ignores',
      ignores: [
        '**/dist/**',
        '**/build/**',
        '**/node_modules/**',
        '**/.turbo/**',
        '**/coverage/**',
        '**/.artifacts/**',
        'packages/vitest-config/_vitest-github/**',
        'packages/eslint-config/_eslint-github/**',
        'packages/design-system/.idea/**',
        '.legacy/**',
        '**/*.min.js',
      ],
    },
    {
      name: 'afenda/linter-options',
      linterOptions: {
        reportUnusedDisableDirectives: 'warn',
        reportUnusedInlineConfigs: 'warn',
      },
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
      name: 'afenda/typescript',
      files: ['**/*.{ts,tsx,mts,cts}'],
      rules: {
        'no-redeclare': 'off',
        'no-unused-vars': 'off',
        // TypeScript reports real redeclarations; this rule conflicts with common `const X` + `type X` patterns.
        '@typescript-eslint/no-redeclare': 'off',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
      },
    },
    {
      name: 'afenda/browser',
      files: [
        'apps/web/**/*.{ts,tsx}',
        'packages/design-system/**/*.{ts,tsx}',
        'packages/shadcn-ui-deprecated/**/*.{ts,tsx}',
        'packages/features/**/*.{ts,tsx}',
      ],
      languageOptions: {
        globals: {
          ...globals.browser,
        },
      },
    },
    {
      name: 'afenda/node',
      files: [
        'scripts/**/*.{js,mjs,cjs,ts,mts,cts}',
        '**/*.config.{js,mjs,cjs,ts,mts,cts}',
        '**/vite.config.*',
        '**/vitest.config.*',
        '**/playwright.config.*',
        '**/eslint.config.*',
        '**/prettier.config.*',
        '**/tailwind.config.*',
        '**/postcss.config.*',
      ],
      languageOptions: {
        globals: {
          ...globals.node,
        },
      },
    },
    {
      name: 'afenda/react-vite',
      files: ['apps/web/**/*.{tsx,jsx}'],
      plugins: {
        ...reactHooks.configs.flat.recommended.plugins,
        ...reactRefresh.configs.vite.plugins,
      },
      rules: {
        ...reactHooks.configs.flat.recommended.rules,
        ...reactRefresh.configs.vite.rules,
      },
    },
    {
      name: 'afenda/vitest',
      files: [
        '**/*.{test,spec}.{ts,tsx,js,jsx}',
        '**/vitest.setup.{ts,js,mjs,cjs}',
        '**/setupTests.{ts,js}',
      ],
      ...vitestPlugin.configs.recommended,
      languageOptions: {
        ...vitestPlugin.configs.recommended.languageOptions,
        ...vitestPlugin.configs.env.languageOptions,
      },
      rules: {
        ...vitestPlugin.configs.recommended.rules,
        // Vitest supports `expect(actual, message)`; `valid-expect` is Jest-oriented.
        'vitest/valid-expect': 'off',
        // Allow assertion helpers that branch on environment / feature flags.
        'vitest/no-conditional-expect': 'off',
      },
    },
    {
      name: 'afenda-ui/components-folders',
      files: ['**/components/**/*.{tsx,jsx}'],
      ignores: [
        '**/*.{test,spec}.{tsx,jsx}',
        '**/*.stories.{tsx,jsx}',
        '**/components/**/__tests__/**',
      ],
      plugins: {
        'afenda-ui': afendaUiPlugin,
      },
      rules: {
        // Any directory named `components/` at any depth (app or package): drift + no inline + no direct Radix.
        // driftOnly: block default palette scales (bg-blue-500, etc.) without a full token allowlist.
        'afenda-ui/token-only-tailwind': ['error', { driftOnly: true }],
        'afenda-ui/no-inline-styles': 'error',
        'afenda-ui/no-direct-radix': 'error',
      },
    },
    prettier,
  )
}

export { afendaUiPlugin }
