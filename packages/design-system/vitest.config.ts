/// <reference types="vitest/config" />
import { getAfendaVitestNodeTestOptions } from '@afenda/vitest-config/vitest/defaults'
import { vitestModuleResolutionPlugin } from '@afenda/vitest-config/vitest/vite-module-resolution-plugin'
import { defineConfig } from 'vite'

/** Minimum coverage for lines / statements / functions on included surfaces. See VITEST.md. */
const COVERAGE_MIN_PCT = 90

/**
 * Branch coverage uses {@link COVERAGE_BRANCH_MIN_PCT} (not {@link COVERAGE_MIN_PCT}) because
 * a few defensive branches (e.g. missing normalized mode, missing merge key in `token-source`)
 * are hard to reach without refactoring eager module exports or heavy mocks.
 */
const COVERAGE_BRANCH_MIN_PCT = 86

const baseTest = getAfendaVitestNodeTestOptions()

/**
 * Canonical runtime surfaces only — not whole trees “because they exist”.
 * See VITEST.md: correctness/determinism/artifact gates first; coverage is a guardrail.
 */
const coverageInclude = [
  'icons/icon-policy.ts',
  'icons/libraries.ts',
  'utils/cn.ts',
  'design-architecture/scripts/lib/design-system-import-allowlist.ts',
  'design-architecture/scripts/lib/design-system-deprecated-surfaces.ts',
] as const

const coverageExclude = [
  '**/__tests__/**',
  '**/*.d.ts',
  '**/node_modules/**',
  '**/dist/**',
  'icons/__*.ts',
  'icons/__*.tsx',
] as const

/**
 * Design-system Vitest: node env, `__tests__` only, thresholds on `coverageInclude` (see VITEST.md).
 * Policy: do not lower thresholds or gut tests to “go green” — fix or test real behavior (VITEST.md).
 */
export default defineConfig({
  plugins: [vitestModuleResolutionPlugin({ bare: false })],
  test: {
    ...baseTest,
    name: '@afenda/design-system',
    include: ['**/__tests__/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      ...baseTest.coverage,
      // HTML coverage output is flaky for this package on Windows; keep stable machine + CLI reports.
      reporter: ['text', 'json'],
      include: [...coverageInclude],
      exclude: [
        ...(Array.isArray(baseTest.coverage?.exclude)
          ? baseTest.coverage.exclude
          : []),
        ...coverageExclude,
      ],
      thresholds: {
        lines: COVERAGE_MIN_PCT,
        statements: COVERAGE_MIN_PCT,
        functions: COVERAGE_MIN_PCT,
        branches: COVERAGE_BRANCH_MIN_PCT,
      },
    },
  },
})
