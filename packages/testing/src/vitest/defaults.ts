/**
 * Shared Vitest `test` options for Afenda apps and packages.
 *
 * Convention: tests live only under dedicated `__test__` folders inside `src/`
 * (no colocated `*.test.ts` next to implementation files).
 *
 * Runtime vs hardcoded: pool, coverage thresholds, and environment honor
 * `process.env`. Vitest also honors `VITEST_MIN_THREADS`,
 * `VITEST_MAX_THREADS`, `VITEST_POOL_TIMEOUT`, etc. — see
 * https://vitest.dev/config/#options — in addition to CLI flags.
 */
/// <reference types="vitest/config" />
import type { InlineConfig } from 'vitest/node'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const AFENDA_VITEST_INCLUDE = [
  'src/**/__test__/**/*.{test,spec}.{ts,tsx}',
] as const

export type VitestEnvironment = 'jsdom' | 'node' | 'happy-dom' | 'edge-runtime'

type VitestPool = 'forks' | 'vmThreads' | 'threads'

const VALID_POOLS = new Set<VitestPool>(['forks', 'vmThreads', 'threads'])

// ---------------------------------------------------------------------------
// Coverage thresholds
// ---------------------------------------------------------------------------

interface CoverageThresholds {
  lines: number
  statements: number
  functions: number
  branches: number
}

const COVERAGE_PRESETS = {
  default: { lines: 5, statements: 5, functions: 5, branches: 3 },
  strict: { lines: 80, statements: 80, functions: 70, branches: 50 },
} as const satisfies Record<string, CoverageThresholds>

/**
 * Resolve coverage thresholds from env, falling back to a preset.
 *
 * - `VITEST_COVERAGE_STRICT=1` selects the `strict` preset.
 * - Per-metric overrides: `VITEST_COVERAGE_LINES`, `VITEST_COVERAGE_STATEMENTS`,
 *   `VITEST_COVERAGE_FUNCTIONS`, `VITEST_COVERAGE_BRANCHES` (numeric strings).
 *
 * Manually ratchet the `default` preset upward as test coverage grows.
 */
function resolveCoverageThresholds(): CoverageThresholds {
  const preset =
    process.env.VITEST_COVERAGE_STRICT === '1'
      ? COVERAGE_PRESETS.strict
      : COVERAGE_PRESETS.default

  return {
    lines: envInt('VITEST_COVERAGE_LINES') ?? preset.lines,
    statements: envInt('VITEST_COVERAGE_STATEMENTS') ?? preset.statements,
    functions: envInt('VITEST_COVERAGE_FUNCTIONS') ?? preset.functions,
    branches: envInt('VITEST_COVERAGE_BRANCHES') ?? preset.branches,
  }
}

function envInt(key: string): number | undefined {
  const v = process.env[key]
  if (v === undefined) return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

// ---------------------------------------------------------------------------
// Pool
// ---------------------------------------------------------------------------

function resolvePoolFromEnv(): VitestPool | undefined {
  const p = process.env.VITEST_POOL
  if (p !== undefined && VALID_POOLS.has(p as VitestPool)) {
    return p as VitestPool
  }
  return undefined
}

// ---------------------------------------------------------------------------
// Coverage excludes
// ---------------------------------------------------------------------------

const COVERAGE_EXCLUDE = [
  'node_modules/**',
  '**/node_modules/**',
  'dist/**',
  '**/__test__/**',
  '**/*.{d.ts,test.ts,test.tsx,spec.ts,spec.tsx}',
  '**/*.config.{js,ts,mjs,cjs,mts,cts}',
  '**/postcss.config.*',
  '**/*.{css,scss,json}',
] as const

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface AfendaVitestOptions {
  /** @default 'jsdom' */
  environment?: VitestEnvironment
  /** @default ['@afenda/testing/vitest/setup'] */
  setupFiles?: string[]
}

/**
 * Default `test` block for Vite-powered apps (jsdom + shared setup).
 * Spread into `defineConfig({ test: getAfendaVitestTestOptions() })`.
 */
export function getAfendaVitestTestOptions(
  options?: AfendaVitestOptions,
): InlineConfig {
  const pool = resolvePoolFromEnv()

  const config: InlineConfig = {
    globals: true,
    environment: options?.environment ?? 'jsdom',
    setupFiles: options?.setupFiles ?? ['@afenda/testing/vitest/setup'],
    include: [...AFENDA_VITEST_INCLUDE],
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [...COVERAGE_EXCLUDE],
      thresholds: resolveCoverageThresholds(),
    },
  }

  if (pool !== undefined) {
    config.pool = pool
  }

  return config
}

/**
 * Minimal `test` options for workspace packages that run Vitest in **node** (no DOM).
 */
export function getAfendaVitestNodeTestOptions(
  options?: Pick<AfendaVitestOptions, 'setupFiles'>,
): InlineConfig {
  return getAfendaVitestTestOptions({
    environment: 'node',
    setupFiles: options?.setupFiles ?? [],
  })
}
