import { cn } from '@afenda/ui/lib/utils'

import { useShellMetadataContext } from '../../providers'

export interface ShellTitleProps {
  className?: string
  fallback?: string
}

export function ShellTitle({ className, fallback }: ShellTitleProps) {
  const { metadata } = useShellMetadataContext()
  const title = metadata.title ?? fallback

  if (!title) return null

  const classes = cn(
    'truncate text-sm font-semibold tracking-tight text-foreground',
    className,
  )

  return <span className={classes}>{title}</span>
}
