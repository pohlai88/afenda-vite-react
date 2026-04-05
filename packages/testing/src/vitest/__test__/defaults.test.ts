import { afterEach, describe, expect, test, vi } from 'vitest'

import {
  AFENDA_VITEST_INCLUDE,
  getAfendaVitestNodeTestOptions,
  getAfendaVitestTestOptions,
} from '../defaults'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('getAfendaVitestTestOptions', () => {
  test('scopes discovery to __test__ directories', () => {
    const opts = getAfendaVitestTestOptions()
    expect(opts.include).toEqual([...AFENDA_VITEST_INCLUDE])
    expect(opts.include?.[0]).toContain('__test__')
  })

  test('defaults to jsdom environment and shared setup', () => {
    const opts = getAfendaVitestTestOptions()
    expect(opts.setupFiles).toEqual(['@afenda/testing/vitest/setup'])
    expect(opts.environment).toBe('jsdom')
  })

  test('accepts typed environment override', () => {
    const opts = getAfendaVitestTestOptions({ environment: 'happy-dom' })
    expect(opts.environment).toBe('happy-dom')
  })

  test('resets mocks by default', () => {
    const opts = getAfendaVitestTestOptions()
    expect(opts.clearMocks).toBe(true)
    expect(opts.mockReset).toBe(true)
    expect(opts.restoreMocks).toBe(true)
  })
})

describe('getAfendaVitestNodeTestOptions', () => {
  test('uses node environment with no setup files', () => {
    const opts = getAfendaVitestNodeTestOptions()
    expect(opts.environment).toBe('node')
    expect(opts.setupFiles).toEqual([])
  })
})

describe('coverage thresholds', () => {
  test('uses default preset when VITEST_COVERAGE_STRICT is unset', () => {
    const opts = getAfendaVitestTestOptions()
    expect(opts.coverage).toMatchObject({
      thresholds: { lines: 5, statements: 5, functions: 5, branches: 3 },
    })
  })

  test('uses strict preset when VITEST_COVERAGE_STRICT=1', () => {
    vi.stubEnv('VITEST_COVERAGE_STRICT', '1')
    const opts = getAfendaVitestTestOptions()
    expect(opts.coverage).toMatchObject({
      thresholds: { lines: 80, statements: 80, functions: 70, branches: 50 },
    })
  })

  test('allows per-metric env overrides', () => {
    vi.stubEnv('VITEST_COVERAGE_LINES', '42')
    vi.stubEnv('VITEST_COVERAGE_BRANCHES', '15')
    const opts = getAfendaVitestTestOptions()
    expect(opts.coverage).toMatchObject({
      thresholds: { lines: 42, statements: 5, functions: 5, branches: 15 },
    })
  })

  test('ignores non-numeric env values', () => {
    vi.stubEnv('VITEST_COVERAGE_LINES', 'abc')
    const opts = getAfendaVitestTestOptions()
    expect(opts.coverage).toMatchObject({
      thresholds: { lines: 5 },
    })
  })
})

describe('pool resolution', () => {
  test('omits pool when VITEST_POOL is unset', () => {
    const opts = getAfendaVitestTestOptions()
    expect(opts.pool).toBeUndefined()
  })

  test('sets pool from VITEST_POOL env', () => {
    vi.stubEnv('VITEST_POOL', 'threads')
    const opts = getAfendaVitestTestOptions()
    expect(opts.pool).toBe('threads')
  })

  test('ignores invalid pool values', () => {
    vi.stubEnv('VITEST_POOL', 'banana')
    const opts = getAfendaVitestTestOptions()
    expect(opts.pool).toBeUndefined()
  })
})
