import type { ShellIntegritySeverity } from '@afenda/shadcn-ui/semantic'

import type { ResolutionSpec } from './resolution'

/** Single invariant / warning row for shell health displays. */
export interface ShellInvariantStatus {
  readonly severity: ShellIntegritySeverity
  readonly priority?: number
  readonly invariantKey: string
  readonly message: string
  readonly doctrineRef?: string
  readonly resolution?: ResolutionSpec
  readonly entityRefs?: readonly string[]
}

export interface ShellHealthSummary {
  readonly integrityScore: number
  readonly invariantFailures: readonly ShellInvariantStatus[]
  readonly warnings: readonly ShellInvariantStatus[]
  readonly lastReconciliation?: string
}
