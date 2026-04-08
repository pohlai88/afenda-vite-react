import type { ComponentPropsWithoutRef } from 'react'

import { cn } from '@afenda/ui/lib/utils'

export type SearchOverlayShellProps = ComponentPropsWithoutRef<'div'>

export function SearchOverlayShell({
  className,
  ...props
}: SearchOverlayShellProps) {
  return (
    <div
      data-slot="search-overlay-shell"
      className={cn(
        'absolute top-full right-0 left-0 z-50 mt-1 rounded-2xl border border-border bg-popover shadow-lg',
        className,
      )}
      {...props}
    />
  )
}
