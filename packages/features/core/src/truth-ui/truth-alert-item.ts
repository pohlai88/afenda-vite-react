import type { TruthResolution } from '../truth/truth-resolution'
import type { TruthSeverity } from '../truth/truth-status'

/**
 * Categories for truth alerts.
 * Maps to tabs in the truth-alert-panel.
 */
export type TruthAlertCategory =
  | 'invariant'
  | 'financial_integrity'
  | 'system'
  | 'message'

/**
 * TruthAlertItem represents a single alert in the truth-alert-panel.
 * This is the UI interpretation of TruthStatus with additional UI metadata.
 */
export interface TruthAlertItem {
  /** Unique alert ID */
  readonly id: string
  /** Invariant key for lookup and i18n */
  readonly invariantKey: string
  /** Severity determines left border color and sort order */
  readonly severity: TruthSeverity
  /** Priority for sorting within same severity */
  readonly priority?: number
  /** Human-readable title */
  readonly title: string
  /** Detailed description */
  readonly description: string
  /** Reference to doctrine/policy */
  readonly doctrineRef?: string
  /** How to resolve this alert */
  readonly resolution?: TruthResolution
  /** Entity references for navigation */
  readonly entityRefs?: readonly string[]
  /** ISO timestamp */
  readonly timestamp: string
  /** Category for tab filtering */
  readonly category: TruthAlertCategory
  /** Read/unread state */
  readonly read: boolean
}
