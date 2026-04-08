import type { PaletteCommand } from './command-palette.types'

/** Maps truth / palette fields to row chrome; extend here as audit/resolve UX grows. */
export function paletteCommandRowClassName(
  cmd: Pick<PaletteCommand, 'severity'>,
): string | undefined {
  if (cmd.severity === 'broken') {
    return 'text-(--color-truth-broken-foreground)'
  }
  return undefined
}

export function paletteSeverityBadgeLabel(
  cmd: Pick<PaletteCommand, 'severity'>,
): string | null {
  if (!cmd.severity || cmd.severity === 'neutral') return null
  return cmd.severity
}
