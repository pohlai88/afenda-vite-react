import { cn } from '@afenda/ui/lib/utils'

import { useShellMetadataContext } from '../providers'

export interface ShellActionSlotProps {
  className?: string
}

export function ShellActionSlot({ className }: ShellActionSlotProps) {
  const { metadata } = useShellMetadataContext()

  if (!metadata.actions) return null

  const classes = cn('flex items-center gap-2', className)

  return (
    <div className={classes} role="toolbar" aria-label="Page actions">
      {metadata.actions}
    </div>
  )
}
