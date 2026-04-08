import { CommandPaletteBar } from '@/share/components/search/command-palette-bar'

export interface CommandPaletteTriggerProps {
  onClick: () => void
}

export function CommandPaletteTrigger({
  onClick,
}: CommandPaletteTriggerProps) {
  return <CommandPaletteBar onOpen={onClick} />
}
