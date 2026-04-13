/**
 * Afenda design-system — icons (hand-maintained).
 *
 * `createIconLoader` / `Icon*` load icons by `name` via React `use()` and lazy
 * imports of `__lucide__.ts` … `__remixicon__.ts` (generated; do not edit — run
 * `pnpm run icons:generate` in `packages/design-system`; see `build-icons.ts`).
 *
 * `libraries.ts` is generator input; `icon-policy.ts` + ESLint govern dynamic use.
 * Public API: `@afenda/design-system/icons`.
 */
export { createIconLoader } from './create-icon-loader'
export { iconPolicy } from './icon-policy'
export {
  iconLibraries,
  type IconLibraries,
  type IconLibrary,
  type IconLibraryName,
} from './libraries'
export { IconHugeicons } from './icon-hugeicons'
export { IconLucide } from './icon-lucide'
export { IconPhosphor } from './icon-phosphor'
export { IconRemixicon } from './icon-remixicon'
export { IconTabler } from './icon-tabler'
