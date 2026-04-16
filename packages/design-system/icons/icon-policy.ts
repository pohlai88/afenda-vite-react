/**
 * Afenda design-system — icons (hand-maintained).
 *
 * `createIconLoader` / `Icon*` load icons by `name` via React `use()` and lazy
 * imports of `__lucide__.ts` … `__remixicon__.ts` (generated; do not edit — run
 * `pnpm run icons:generate` in `packages/design-system`; see `build-icons.ts`).
 *
 * `libraries.ts` is generator input; `icon-policy.ts` + ESLint govern dynamic use.
 * Public API: `@afenda/design-system/icons`.
 *
 * Governance: dynamic loaders (`name="…"`) are for registry/CMS/studio only;
 * product UI should use static imports. ESLint: `afenda-ui/no-dynamic-icon-name-prop`.
 */
export const iconPolicy = {
  allowDynamicIconsInProductUI: false,
  requireStaticImports: true,
  allowedDynamicPathFragments: [
    "packages/design-system/icons",
    "/registry/",
    "/cms/",
    "/studio/",
  ],
} as const
