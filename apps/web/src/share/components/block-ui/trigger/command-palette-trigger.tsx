import { type MouseEventHandler, useMemo } from 'react'
import { SearchIcon } from 'lucide-react'

import { Button } from '@afenda/ui/components/ui/button'
import { Kbd } from '@afenda/ui/components/ui/kbd'
import { cn } from '@afenda/ui/lib/utils'

function useIsApplePlatform(): boolean {
  return useMemo(
    () =>
      typeof navigator !== 'undefined' &&
      /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent),
    [],
  )
}

export interface CommandPaletteTriggerProps {
  onClick: MouseEventHandler<HTMLButtonElement>
  className?: string
}

export function CommandPaletteTrigger({
  onClick,
  className,
}: CommandPaletteTriggerProps) {
  const isApple = useIsApplePlatform()

  return (
    <Button
      type="button"
      variant="outline"
      aria-label="Open command palette"
      className={cn(
        'hidden h-8 w-56 justify-start gap-2 text-muted-foreground md:flex',
        className,
      )}
      onClick={onClick}
    >
      <SearchIcon className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="flex-1 text-left text-xs">Search...</span>
      <Kbd
        aria-label={`Keyboard shortcut: ${isApple ? 'Command K' : 'Ctrl K'}`}
      >
        {isApple ? '⌘K' : 'Ctrl K'}
      </Kbd>
    </Button>
  )
}
