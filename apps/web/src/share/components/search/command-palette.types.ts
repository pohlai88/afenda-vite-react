import type { ComponentType, SVGProps } from 'react'

import type { ShellIntegritySeverity } from '@afenda/shadcn-ui/semantic'

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
  readonly group: PaletteGroup
  readonly section?: string
  readonly title: string
  readonly subtitle?: string
  readonly keywords: readonly string[]
  readonly icon?: ComponentType<SVGProps<SVGSVGElement>>
  readonly shortcut?: string
  readonly priority: number
  readonly run: () => void
  readonly severity?: ShellIntegritySeverity
  readonly confidence?: number
  readonly entityRefs?: readonly string[]
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
