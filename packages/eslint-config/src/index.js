import js from "@eslint/js"
import tseslint from "typescript-eslint"
import prettier from "eslint-config-prettier/flat"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import vitestPlugin from "@vitest/eslint-plugin"

import afendaUiPlugin from "./plugin.js"

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
      name: "afenda/global-ignores",
      ignores: [
        "**/dist/**",
        "**/build/**",
        "**/node_modules/**",
        "**/.turbo/**",
        "**/coverage/**",
        "**/.artifacts/**",
        "packages/vitest-config/_vitest-github/**",
        "packages/eslint-config/_eslint-github/**",
        "packages/design-system/.idea/**",
        ".legacy/**",
        "**/*.min.js",
      ],
    },
    {
      name: "afenda/linter-options",
      linterOptions: {
        reportUnusedDisableDirectives: "warn",
        reportUnusedInlineConfigs: "warn",
      },
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
      name: "afenda/typescript",
      files: ["**/*.{ts,tsx,mts,cts}"],
      rules: {
        "no-redeclare": "off",
        "no-unused-vars": "off",
        // TypeScript reports real redeclarations; this rule conflicts with common `const X` + `type X` patterns.
        "@typescript-eslint/no-redeclare": "off",
        "@typescript-eslint/no-unused-vars": [
          "warn",
          {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            caughtErrorsIgnorePattern: "^_",
          },
        ],
      },
    },
    {
      name: "afenda/browser",
      files: [
        "apps/web/**/*.{ts,tsx}",
        "packages/design-system/**/*.{ts,tsx}",
        "packages/shadcn-ui-deprecated/**/*.{ts,tsx}",
        "packages/features/**/*.{ts,tsx}",
      ],
      languageOptions: {
        globals: {
          ...globals.browser,
        },
      },
    },
    {
      name: "afenda/node",
      files: [
        "scripts/**/*.{js,mjs,cjs,ts,mts,cts}",
        "**/*.config.{js,mjs,cjs,ts,mts,cts}",
        "**/vite.config.*",
        "**/vitest.config.*",
        "**/playwright.config.*",
        "**/eslint.config.*",
        "**/prettier.config.*",
        "**/tailwind.config.*",
        "**/postcss.config.*",
      ],
      languageOptions: {
        globals: {
          ...globals.node,
        },
      },
    },
    {
      name: "afenda/react-vite",
      files: ["apps/web/**/*.{tsx,jsx}"],
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
      name: "afenda/vitest",
      files: [
        "**/*.{test,spec}.{ts,tsx,js,jsx}",
        "**/vitest.setup.{ts,js,mjs,cjs}",
        "**/setupTests.{ts,js}",
      ],
      ...vitestPlugin.configs.recommended,
      languageOptions: {
        ...vitestPlugin.configs.recommended.languageOptions,
        ...vitestPlugin.configs.env.languageOptions,
      },
      rules: {
        ...vitestPlugin.configs.recommended.rules,
        // Vitest supports `expect(actual, message)`; `valid-expect` is Jest-oriented.
        "vitest/valid-expect": "off",
        // Allow assertion helpers that branch on environment / feature flags.
        "vitest/no-conditional-expect": "off",
      },
    },
    {
      name: "afenda-ui/components-folders",
      files: ["**/components/**/*.{tsx,jsx}"],
      ignores: [
        "**/*.{test,spec}.{tsx,jsx}",
        "**/*.stories.{tsx,jsx}",
        "**/components/**/__tests__/**",
      ],
      plugins: {
        "afenda-ui": afendaUiPlugin,
      },
      rules: {
        // Any directory named `components/` at any depth (app or package): drift + no inline + no direct Radix.
        // driftOnly: block default palette scales (bg-blue-500, etc.) without a full token allowlist.
        "afenda-ui/token-only-tailwind": ["error", { driftOnly: true }],
        "afenda-ui/no-inline-styles": "error",
        "afenda-ui/no-direct-radix": "error",
      },
    },
    {
      name: "afenda-ui/auth-scroll-guard",
      files: ["apps/web/src/app/_platform/auth/routes/**/*.{tsx,jsx}"],
      plugins: {
        "afenda-ui": afendaUiPlugin,
      },
      rules: {
        "afenda-ui/no-auth-scroll-trap": "error",
      },
    },
    {
      name: "afenda-ui/app-surface-baseline-events-workspace",
      files: [
        "apps/web/src/app/_features/events-workspace/components/events-workspace-pages.tsx",
      ],
      plugins: {
        "afenda-ui": afendaUiPlugin,
      },
      rules: {
        "afenda-ui/require-app-surface-baseline": [
          "error",
          {
            requiredComponents: ["AppSurface", "StateSurface"],
            forbiddenIdentifiers: [
              "PageShell",
              "AuditPageShell",
              "WorkspaceErrorState",
              "EmptyWorkspaceState",
              "AppLoadingState",
              "AppErrorState",
              "AppEmptyState",
            ],
          },
        ],
      },
    },
    {
      name: "afenda-ui/app-surface-baseline-shell-route-state",
      files: [
        "apps/web/src/app/_platform/shell/components/app-shell-route-state.tsx",
      ],
      plugins: {
        "afenda-ui": afendaUiPlugin,
      },
      rules: {
        "afenda-ui/require-app-surface-baseline": [
          "error",
          {
            requiredComponents: ["AppSurface", "StateSurface"],
            forbiddenClassNameSnippets: ["ui-page"],
          },
        ],
      },
    },
    {
      name: "afenda-ui/app-surface-baseline-shell-not-found",
      files: [
        "apps/web/src/app/_platform/shell/components/app-shell-not-found.tsx",
      ],
      plugins: {
        "afenda-ui": afendaUiPlugin,
      },
      rules: {
        "afenda-ui/require-app-surface-baseline": [
          "error",
          {
            requiredComponents: ["AppShellRouteState"],
          },
        ],
      },
    },
    {
      name: "afenda-ui/app-surface-baseline-shell-access-denied",
      files: [
        "apps/web/src/app/_platform/shell/components/app-shell-access-denied.tsx",
      ],
      plugins: {
        "afenda-ui": afendaUiPlugin,
      },
      rules: {
        "afenda-ui/require-app-surface-baseline": [
          "error",
          {
            requiredComponents: ["AppShellRouteState"],
          },
        ],
      },
    },
    {
      name: "afenda-ui/app-surface-baseline-settings",
      files: [
        "apps/web/src/app/_features/better-auth-settings/better-auth-settings-view.tsx",
      ],
      plugins: {
        "afenda-ui": afendaUiPlugin,
      },
      rules: {
        "afenda-ui/require-app-surface-baseline": [
          "error",
          {
            requiredComponents: ["AppSurface", "StateSurface", "Settings"],
            requiredComponentProps: {
              Settings: ["embedded"],
            },
          },
        ],
      },
    },
    {
      name: "afenda-ui/app-surface-baseline-db-studio",
      files: [
        "apps/web/src/app/_features/db-studio/components/db-studio-page.tsx",
      ],
      plugins: {
        "afenda-ui": afendaUiPlugin,
      },
      rules: {
        "afenda-ui/require-app-surface-baseline": [
          "error",
          {
            requiredComponents: ["AppSurface", "StateSurface"],
          },
        ],
      },
    },
    prettier
  )
}

export function createRepositoryBoundaryConfig() {
  return [
    {
      name: "afenda/workspace-path-import-boundaries",
      files: ["apps/**/*.{js,jsx,ts,tsx}", "packages/**/*.{js,jsx,ts,tsx}"],
      ignores: [
        "**/*.{test,spec}.{js,jsx,ts,tsx}",
        "**/*.stories.{js,jsx,ts,tsx}",
        "**/__tests__/**",
      ],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                regex: "^(\\.\\./)+(apps|packages)/",
                message:
                  "Do not reach into sibling workspace roots by relative path. Use the owner app alias or package public entrypoint instead.",
              },
              {
                regex: "^@afenda/[^/]+/(src|scripts|dist|node_modules)(/|$)",
                message:
                  "Do not import workspace package internals by path. Consume declared package exports only.",
              },
            ],
          },
        ],
      },
    },
    {
      name: "afenda/operator-kernel-governed-boundaries",
      files: ["packages/operator-kernel/**/*.{js,jsx,ts,tsx,mjs,cjs}"],
      plugins: {
        "afenda-ui": afendaUiPlugin,
      },
      rules: {
        "afenda-ui/enforce-operator-kernel-boundaries": "error",
      },
    },
    {
      name: "afenda/operator-kernel-no-subprocess-runtime",
      files: ["packages/operator-kernel/src/**/*.{js,jsx,ts,tsx,mjs,cjs}"],
      plugins: {
        "afenda-ui": afendaUiPlugin,
      },
      rules: {
        "afenda-ui/no-operator-kernel-child-process": "error",
      },
    },
    {
      name: "afenda/web-routes/private-folder-import-fence",
      files: ["apps/web/src/routes/**/*.{js,jsx,ts,tsx}"],
      ignores: [
        "**/*.{test,spec}.{js,jsx,ts,tsx}",
        "**/*.stories.{js,jsx,ts,tsx}",
        "**/__tests__/**",
      ],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: [
                  "@/app/_features/*/*",
                  "../app/_features/*/*",
                  "@/app/_platform/*/*",
                  "../app/_platform/*/*",
                  "@/app/_features/*/components/*",
                  "@/app/_features/*/hooks/*",
                  "@/app/_features/*/services/*",
                  "@/app/_features/*/actions/*",
                  "@/app/_features/*/types/*",
                  "@/app/_features/*/utils/*",
                  "../app/_features/*/components/*",
                  "../app/_features/*/hooks/*",
                  "../app/_features/*/services/*",
                  "../app/_features/*/actions/*",
                  "../app/_features/*/types/*",
                  "../app/_features/*/utils/*",
                  "@/app/_platform/*/components/*",
                  "@/app/_platform/*/hooks/*",
                  "@/app/_platform/*/services/*",
                  "@/app/_platform/*/actions/*",
                  "@/app/_platform/*/types/*",
                  "@/app/_platform/*/utils/*",
                  "../app/_platform/*/components/*",
                  "../app/_platform/*/hooks/*",
                  "../app/_platform/*/services/*",
                  "../app/_platform/*/actions/*",
                  "../app/_platform/*/types/*",
                  "../app/_platform/*/utils/*",
                ],
                message:
                  "Route modules must depend on feature or platform entrypoints, not internal files or conventional private folders.",
              },
            ],
          },
        ],
      },
    },
    {
      name: "afenda/web-feature-route-boundaries",
      files: ["apps/web/src/app/_features/**/*.{js,jsx,ts,tsx}"],
      ignores: ["**/*.{test,spec}.{js,jsx,ts,tsx}", "**/__tests__/**"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["@/routes/*", "**/routes/*"],
                message:
                  "Feature modules must not import route modules. Route composition stays at the route or platform boundary.",
              },
            ],
          },
        ],
      },
    },
    {
      name: "afenda/web-feature-public-api-boundaries",
      files: ["apps/web/src/app/_features/**/*.{js,jsx,ts,tsx}"],
      ignores: ["**/*.{test,spec}.{js,jsx,ts,tsx}", "**/__tests__/**"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["@/app/_features/*/*"],
                message:
                  "Feature modules may depend on other features only through their public entrypoints.",
              },
            ],
          },
        ],
      },
    },
    {
      name: "afenda/web-platform-cross-domain-boundaries",
      files: ["apps/web/src/app/_platform/**/*.{js,jsx,ts,tsx}"],
      ignores: ["**/*.{test,spec}.{js,jsx,ts,tsx}", "**/__tests__/**"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                regex:
                  "^(\\.\\./)+(app-surface|auth|api-client|config|i18n|runtime|shell|tenant|theme|_template)(/[^/]+)+$",
                message:
                  "Platform modules must consume sibling platform domains through their entrypoints, not internal files.",
              },
              {
                regex:
                  "^@/app/_platform/(app-surface|auth|api-client|config|i18n|runtime|shell|tenant|theme|_template)(/[^/]+)+$",
                message:
                  "Platform modules must consume sibling platform domains through their entrypoints, not internal files.",
              },
            ],
          },
        ],
      },
    },
    {
      name: "afenda/web-platform-public-api-boundaries",
      files: ["apps/web/src/**/*.{js,jsx,ts,tsx}"],
      ignores: [
        "apps/web/src/app/_platform/**/*.{js,jsx,ts,tsx}",
        "**/*.{test,spec}.{js,jsx,ts,tsx}",
        "**/__tests__/**",
      ],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                regex: "^@/app/_platform$",
                message:
                  "Consume specific platform domain entrypoints instead of the root _platform barrel.",
              },
              {
                regex: "^(\\.\\./)+(app/_platform|_platform)$",
                message:
                  "Consume specific platform domain entrypoints instead of the root _platform barrel.",
              },
              {
                regex:
                  "^@/app/_platform/(app-surface|auth|api-client|config|i18n|runtime|tenant|theme|_template)(/[^/]+)+$",
                message:
                  "Outside _platform, consume platform domains through their curated public entrypoints.",
              },
              {
                regex: "^@/app/_platform/shell$",
                message:
                  "Outside _platform, consume shell through curated public entrypoints instead of the root shell barrel.",
              },
              {
                regex: "^(\\.\\./)+(app/_platform|_platform)/shell$",
                message:
                  "Outside _platform, consume shell through curated public entrypoints instead of the root shell barrel.",
              },
              {
                regex:
                  "^@/app/_platform/shell/(?!shell-(route|layout|command|validation)-surface$)[^/]+(?:/.*)?$",
                message:
                  "Outside _platform, consume shell through curated public entrypoints such as shell-route-surface, shell-layout-surface, shell-command-surface, or shell-validation-surface.",
              },
              {
                regex:
                  "^(\\.\\./)+(app/_platform|_platform)/(app-surface|auth|api-client|config|i18n|runtime|tenant|theme|_template)(/[^/]+)+$",
                message:
                  "Outside _platform, consume platform domains through their curated public entrypoints.",
              },
              {
                regex:
                  "^(\\.\\./)+(app/_platform|_platform)/shell/(?!shell-(route|layout|command|validation)-surface$)[^/]+(?:/.*)?$",
                message:
                  "Outside _platform, consume shell through curated public entrypoints such as shell-route-surface, shell-layout-surface, shell-command-surface, or shell-validation-surface.",
              },
            ],
          },
        ],
      },
    },
    {
      name: "afenda/web-share-feature-boundaries",
      files: ["apps/web/src/share/**/*.{js,jsx,ts,tsx}"],
      ignores: ["**/*.{test,spec}.{js,jsx,ts,tsx}", "**/__tests__/**"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["@/app/_features/*", "**/app/_features/*"],
                message:
                  "Promoted share modules must not import feature-owned code.",
              },
            ],
          },
        ],
      },
    },
    {
      name: "afenda/api-module-boundaries",
      files: ["apps/api/src/modules/**/*.{js,jsx,ts,tsx}"],
      ignores: ["**/*.{test,spec}.{js,jsx,ts,tsx}", "**/__tests__/**"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: [
                  "@/routes/*",
                  "@/middleware/*",
                  "**/routes/*",
                  "**/middleware/*",
                ],
                message:
                  "API modules must not import route or middleware modules directly.",
              },
            ],
          },
        ],
      },
    },
    {
      name: "afenda/api-routes/module-entrypoint-boundaries",
      files: ["apps/api/src/routes/**/*.{js,jsx,ts,tsx}"],
      ignores: ["**/*.{test,spec}.{js,jsx,ts,tsx}", "**/__tests__/**"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["@/modules/*/*", "../modules/*/*", "../../modules/*/*"],
                message:
                  "API routes must depend on module entrypoints, not module internal files.",
              },
            ],
          },
        ],
      },
    },
  ]
}

export { afendaUiPlugin }
