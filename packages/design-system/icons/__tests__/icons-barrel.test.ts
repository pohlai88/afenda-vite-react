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
import { describe, expect, it } from 'vitest'

import * as HugeiconsBarrel from '../__hugeicons__'
import * as LucideBarrel from '../__lucide__'
import * as PhosphorBarrel from '../__phosphor__'
import * as RemixiconBarrel from '../__remixicon__'
import * as TablerBarrel from '../__tabler__'

describe('icon barrels', () => {
  it('exports at least one icon per generated library', () => {
    expect(Object.keys(LucideBarrel).length).toBeGreaterThan(0)
    expect(Object.keys(TablerBarrel).length).toBeGreaterThan(0)
    expect(Object.keys(HugeiconsBarrel).length).toBeGreaterThan(0)
    expect(Object.keys(PhosphorBarrel).length).toBeGreaterThan(0)
    expect(Object.keys(RemixiconBarrel).length).toBeGreaterThan(0)
  })
})
