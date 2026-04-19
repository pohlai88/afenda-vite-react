import { createConfig } from "@afenda/eslint-config"

const baseConfig = createConfig({ rootDir: import.meta.dirname })

export default [
  ...baseConfig,
  {
    name: "governed-ui/import-fence",
    files: ["apps/**/*.{js,jsx,ts,tsx}", "packages/**/*.{js,jsx,ts,tsx}"],
    ignores: [
      "packages/design-system/**/*.{js,jsx,ts,tsx}",
      "packages/shadcn-ui-deprecated/src/**/*.{js,jsx,ts,tsx}",
      "apps/web/src/api-client/**",
      "**/*.{test,spec}.{js,jsx,ts,tsx}",
      "**/*.stories.{js,jsx,ts,tsx}",
      "**/__tests__/**",
      "**/__test__/**",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@radix-ui/react-*"],
              message: "Use governed wrapped primitives only.",
            },
            {
              group: ["class-variance-authority"],
              message: "Define variants only in the governed UI package.",
            },
            {
              group: ["@/api-client/web-*"],
              message:
                "Import from `@/api-client` (index barrel) only; do not deep-import `web-*` modules from feature code (`apps/web/src/api-client` may use relative `./web-*` imports).",
            },
          ],
        },
      ],
    },
  },
  {
    name: "design-system/token-authority-boundaries-literals",
    files: ["**/*.{ts,tsx}"],
    ignores: [
      "**/token-authority-boundaries.ts",
      "**/deprecated-surface.ts",
      "**/node_modules/**",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            'Literal[value="packages/shadcn-ui-deprecated/src/afenda-design-system/theme.ts"]',
          message:
            "Deprecated theme path string is centralized in design-system `deprecated-surface.ts` (historical metadata). Do not duplicate elsewhere.",
        },
      ],
    },
  },
]
