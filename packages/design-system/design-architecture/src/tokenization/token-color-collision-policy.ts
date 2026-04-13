/**
 * TOKEN COLOR COLLISION POLICY
 *
 * Detects identical CSS color strings across semantic roles in primitive and derived
 * `ColorTokenRecord`s. Used by tests and CI to enforce generator/source contracts.
 *
 * Rules:
 * - Chart series tokens (`chart-*`) must not share an exact value with status signals
 *   (`success`, `warning`, `info`) -- different jobs (data viz vs semantic feedback).
 * - Other overlaps are classified as warnings (semantic collapse worth revisiting), not hard errors.
 */

import {
  chartColorTokenValues,
  colorTokenValues,
  themeModeValues,
} from './token-constants'
import type { ColorToken, ThemeMode } from './token-constants'
import type { ColorTokenRecord, ThemeModeRecord } from './token-types'

/** Status primitives that must stay distinct from chart hues. */
export const STATUS_SIGNAL_COLOR_TOKENS = [
  'success',
  'warning',
  'info',
] as const satisfies readonly ColorToken[]

export type ColorTokenLayer = 'primitive' | 'derived'

export type CollisionSeverity = 'error' | 'warn'

export interface ColorCollisionFinding {
  readonly severity: CollisionSeverity
  readonly mode: ThemeMode
  readonly layer: ColorTokenLayer
  readonly kind: string
  readonly value: string
  readonly tokens: readonly ColorToken[]
}

function sortTokens(left: ColorToken, right: ColorToken): number {
  return left.localeCompare(right)
}

/**
 * Invert a color record into groups of tokens that share the exact same value string.
 */
export function groupTokensByIdenticalValue(
  record: ColorTokenRecord,
): Map<string, ColorToken[]> {
  const byValue = new Map<string, ColorToken[]>()

  for (const key of colorTokenValues) {
    const value = record[key].trim()
    const tokens = byValue.get(value)

    if (tokens) {
      tokens.push(key)
      continue
    }

    byValue.set(value, [key])
  }

  for (const tokens of byValue.values()) {
    tokens.sort(sortTokens)
  }

  return byValue
}

const chartSet = new Set<ColorToken>(chartColorTokenValues)
const statusSet = new Set<ColorToken>(STATUS_SIGNAL_COLOR_TOKENS)

function isChartStatusOverlap(tokens: readonly ColorToken[]): boolean {
  let hasChart = false
  let hasStatus = false

  for (const token of tokens) {
    if (chartSet.has(token)) {
      hasChart = true
    }

    if (statusSet.has(token)) {
      hasStatus = true
    }

    if (hasChart && hasStatus) {
      return true
    }
  }

  return false
}

const ALLOWED_SECONDARY_MUTED_ACCENT_COLLAPSE = new Set<ColorToken>([
  'secondary',
  'muted',
  'accent',
])

function isSecondaryMutedAccentOnly(tokens: readonly ColorToken[]): boolean {
  if (tokens.length !== ALLOWED_SECONDARY_MUTED_ACCENT_COLLAPSE.size) {
    return false
  }

  return tokens.every((token) =>
    ALLOWED_SECONDARY_MUTED_ACCENT_COLLAPSE.has(token),
  )
}

function findSelectedTokens(
  tokens: readonly ColorToken[],
  selected: readonly ColorToken[],
): readonly ColorToken[] {
  const selectedSet = new Set<ColorToken>(selected)
  return tokens.filter((token) => selectedSet.has(token))
}

/**
 * Evaluate collision policy for one mode and layer. Errors must be empty for CI.
 */
export function evaluateColorTokenCollisions(options: {
  readonly record: ColorTokenRecord
  readonly mode: ThemeMode
  readonly layer: ColorTokenLayer
}): readonly ColorCollisionFinding[] {
  const { record, mode, layer } = options
  const byValue = groupTokensByIdenticalValue(record)
  const findings: ColorCollisionFinding[] = []

  for (const [value, tokens] of byValue) {
    if (tokens.length < 2) {
      continue
    }

    if (layer === 'primitive' && isChartStatusOverlap(tokens)) {
      findings.push({
        severity: 'error',
        mode,
        layer,
        kind: 'chart-status-signal-same-value',
        value,
        tokens,
      })

      continue
    }

    if (layer === 'primitive' && isSecondaryMutedAccentOnly(tokens)) {
      findings.push({
        severity: 'warn',
        mode,
        layer,
        kind: 'secondary-muted-accent-collapsed',
        value,
        tokens,
      })

      continue
    }

    if (layer === 'derived') {
      const tableHeaderSurfaceDisabledTokens = findSelectedTokens(tokens, [
        'table-header',
        'surface-disabled',
      ])

      if (tableHeaderSurfaceDisabledTokens.length === 2) {
        findings.push({
          severity: 'warn',
          mode,
          layer,
          kind: 'table-header-same-as-surface-disabled',
          value,
          tokens: tableHeaderSurfaceDisabledTokens,
        })
      }
    }
  }

  return findings
}

export function evaluateThemeColorCollisions(options: {
  readonly primitive: ThemeModeRecord<ColorTokenRecord>
  readonly derived: ThemeModeRecord<ColorTokenRecord>
}): readonly ColorCollisionFinding[] {
  const findings: ColorCollisionFinding[] = []

  for (const mode of themeModeValues) {
    findings.push(
      ...evaluateColorTokenCollisions({
        record: options.primitive[mode],
        mode,
        layer: 'primitive',
      }),
      ...evaluateColorTokenCollisions({
        record: options.derived[mode],
        mode,
        layer: 'derived',
      }),
    )
  }

  return findings
}
