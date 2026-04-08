import type { TruthResolution } from '../truth/truth-resolution'

/**
 * ResolutionSuggestion represents a suggested fix for a truth issue.
 * Displayed in `block-ui/panel/resolution-panel`.
 *
 * Example:
 * - problemKey: "fx_rate_missing"
 * - description: "Missing FX rate for MYR → USD on 2026-04-01"
 * - suggestedAction: "Add FX rate: 1 MYR = 0.21 USD"
 * - confidence: 0.95
 */
export interface ResolutionSuggestion {
  /** Unique suggestion ID */
  readonly id: string
  /** Problem identifier for lookup and i18n */
  readonly problemKey: string
  /** Description of the problem */
  readonly description: string
  /** Suggested action to resolve */
  readonly suggestedAction: string
  /** Confidence score (0-1), used for sorting and display */
  readonly confidence: number
  /** Reference to doctrine/policy */
  readonly doctrineRef?: string
  /** Resolution spec with type and action path */
  readonly resolution: TruthResolution
}
