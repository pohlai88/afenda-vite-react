import type { PaletteCommand, PaletteGroup } from './command-palette.types'
import { PALETTE_GROUP_ORDER } from './command-palette.types'
import { rankAndDedupeCommands } from './command-palette-utils'

/**
 * One visual block in browse mode (no query): either a whole palette group or a nav subsection.
 */
export interface PaletteBrowseDisplayBlock {
  readonly key: string
  readonly paletteGroup: PaletteGroup
  /** Nav label from commands; when null, use translated default heading for `paletteGroup`. */
  readonly sectionLabel: string | null
  readonly commands: readonly PaletteCommand[]
}

/**
 * Flattens all groups in canonical order, then ranks/dedupes for unified query results.
 */
export function buildPaletteQueryCommands(
  groups: ReadonlyMap<PaletteGroup, readonly PaletteCommand[]>,
): PaletteCommand[] {
  const flat = PALETTE_GROUP_ORDER.flatMap((g) => groups.get(g) ?? [])
  return rankAndDedupeCommands(flat)
}

/**
 * Builds ordered display blocks for browse mode (empty query), including `search` subsection split.
 */
export function buildPaletteBrowseBlocks(
  groups: ReadonlyMap<PaletteGroup, readonly PaletteCommand[]>,
): PaletteBrowseDisplayBlock[] {
  const out: PaletteBrowseDisplayBlock[] = []

  for (const group of PALETTE_GROUP_ORDER) {
    const cmds = groups.get(group) ?? []
    if (cmds.length === 0) continue

    if (group === 'search') {
      const bySection = new Map<string, PaletteCommand[]>()
      for (const cmd of cmds) {
        const sectionKey = cmd.section ?? ''
        const list = bySection.get(sectionKey)
        if (list) list.push(cmd)
        else bySection.set(sectionKey, [cmd])
      }
      for (const [sectionLabel, sectionCmds] of bySection.entries()) {
        out.push({
          key: `search-${sectionLabel || 'default'}`,
          paletteGroup: group,
          sectionLabel: sectionLabel ? sectionLabel : null,
          commands: sectionCmds,
        })
      }
      continue
    }

    out.push({
      key: group,
      paletteGroup: group,
      sectionLabel: null,
      commands: cmds,
    })
  }

  return out
}
