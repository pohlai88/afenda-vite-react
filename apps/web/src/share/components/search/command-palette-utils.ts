import type { PaletteCommand } from './command-palette.types'

/**
 * Sorts by priority (higher first), then title; dedupes by `id` so the
 * highest-priority row for each id is kept.
 */
export function rankAndDedupeCommands(
  commands: readonly PaletteCommand[],
): PaletteCommand[] {
  const seen = new Set<string>()

  return [...commands]
    .sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority
      return a.title.localeCompare(b.title)
    })
    .filter((cmd) => {
      if (seen.has(cmd.id)) return false
      seen.add(cmd.id)
      return true
    })
}
