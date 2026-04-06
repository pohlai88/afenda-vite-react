import type { ComponentType, SVGProps } from 'react'

import type { TruthSeverity } from '@afenda/core/truth'

/**
 * Normalized command row for the global palette (cmdk + ranking + dedupe).
 * @see usePaletteCommands in `use-palette-commands.ts`
 */
export type PaletteCommandKind =
  | 'navigate'
  | 'audit'
  | 'resolve'
  | 'action'
  | 'setting'

/** Section headings; render order is defined by `PALETTE_GROUP_ORDER`. */
export type PaletteGroup =
  | 'recent'
  | 'pinned'
  | 'suggested'
  | 'search'
  | 'audit'
  | 'resolve'
  | 'actions'
  | 'settings'

export interface PaletteCommand {
  readonly id: string
  readonly kind: PaletteCommandKind
  /** Canonical group before recent/pinned/suggested overrides at render time. */
  readonly group: PaletteGroup
  /** When set (e.g. main nav label), `search` rows split into multiple `CommandGroup`s. */
  readonly section?: string
  readonly title: string
  readonly subtitle?: string
  /** Extra tokens for cmdk `value` / fuzzy matching. */
  readonly keywords: readonly string[]
  readonly icon?: ComponentType<SVGProps<SVGSVGElement>>
  /** Shown via `CommandShortcut` (display only until global chord router exists). */
  readonly shortcut?: string
  /** Higher sorts earlier within the same section. */
  readonly priority: number
  readonly run: () => void
  readonly severity?: TruthSeverity
  readonly confidence?: number
  readonly entityRefs?: readonly string[]
  /** When true, UI may show a pin control (stored in `GlobalSearchProvider`). */
  readonly pinEligible?: boolean
}

export const PALETTE_GROUP_ORDER: readonly PaletteGroup[] = [
  'recent',
  'pinned',
  'suggested',
  'search',
  'audit',
  'resolve',
  'actions',
  'settings',
] as const
