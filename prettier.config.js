/**
 * Single repo-wide Prettier config (see docs/dependencies/prettier.md).
 *
 * prettier-plugin-tailwindcss must only run for files covered by the matching
 * Tailwind v4 stylesheet `@source` graph. Running it on Node/API packages (e.g.
 * apps/api) or scripts outside `@source` makes Prettier error with "ignored due
 * to negative glob patterns" and can OOM when lint-staged fans out many workers.
 *
 * @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions}
 */
export default {
  endOfLine: "lf",
  semi: false,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "es5",
  printWidth: 80,
  overrides: [
    {
      files: ["apps/web/**/*.{js,jsx,ts,tsx,css}"],
      options: {
        plugins: ["prettier-plugin-tailwindcss"],
        tailwindStylesheet: "./apps/web/src/index.css",
        tailwindFunctions: ["cn", "cva"],
      },
    },
    {
      files: [
        "packages/design-system/ui-primitives/**/*.{js,jsx,ts,tsx}",
        "packages/design-system/icons/**/*.{js,jsx,ts,tsx}",
        "packages/design-system/hooks/**/*.{js,jsx,ts,tsx}",
        "packages/design-system/design-architecture/src/**/*.{js,jsx,ts,tsx,css}",
      ],
      options: {
        plugins: ["prettier-plugin-tailwindcss"],
        tailwindStylesheet:
          "./packages/design-system/design-architecture/src/prettier-tailwind-stylesheet.css",
      },
    },
  ],
}
