/**
 * Predicate parity with `packages/shadcn-ui/src/lib/constant/policy/class-governance-scope.ts`.
 * If these tests fail while TS resolution still passes, scope logic has forked — fix before merging.
 *
 * @see WAVE1_WAVE2_RULE_SPECS.md §0 — scope ordering matters (shell-ui before share).
 */
'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { resolveClassGovernanceScope } = require('./class-governance-scope.cjs')

test('ui-package: shadcn-ui src', () => {
  assert.equal(
    resolveClassGovernanceScope('C:/repo/packages/shadcn-ui/src/components/ui/button.tsx'),
    'ui-package'
  )
  assert.equal(
    resolveClassGovernanceScope('packages/shadcn-ui/src/lib/utils.ts'),
    'ui-package'
  )
})

test('feature-ui', () => {
  assert.equal(
    resolveClassGovernanceScope('/apps/web/src/features/finance/FinanceView.tsx'),
    'feature-ui'
  )
})

test('app-shell is more specific than shared-app-ui', () => {
  assert.equal(
    resolveClassGovernanceScope(
      'C:\\apps\\web\\src\\share\\components\\shell-ui\\shell-root.tsx'
    ),
    'app-shell'
  )
  assert.equal(
    resolveClassGovernanceScope(
      '/repo/apps/web/src/share/components/shell-ui/components/shell-header.tsx'
    ),
    'app-shell'
  )
})

test('shared-app-ui: share but not shell-ui', () => {
  assert.equal(
    resolveClassGovernanceScope('/apps/web/src/share/components/navigation/top-nav-bar.tsx'),
    'shared-app-ui'
  )
})

test('chart-interop', () => {
  assert.equal(
    resolveClassGovernanceScope('/src/features/dashboard/charts/RevenueChart.tsx'),
    'chart-interop'
  )
  assert.equal(resolveClassGovernanceScope('app/chart/line.tsx'), 'chart-interop')
})

test('rich-content', () => {
  assert.equal(
    resolveClassGovernanceScope('/apps/web/src/pages/rich-content/Page.tsx'),
    'rich-content'
  )
  assert.equal(resolveClassGovernanceScope('/editor/blocks.tsx'), 'rich-content')
  assert.equal(resolveClassGovernanceScope('/markdown/preview.tsx'), 'rich-content')
})

test('unrelated paths return null', () => {
  assert.equal(resolveClassGovernanceScope('/packages/core/src/index.ts'), null)
  assert.equal(resolveClassGovernanceScope('README.md'), null)
})

test('ambiguous overlap: feature under share is not used; features path wins first', () => {
  assert.equal(
    resolveClassGovernanceScope('/apps/web/src/features/x/share/thing.tsx'),
    'feature-ui'
  )
})
