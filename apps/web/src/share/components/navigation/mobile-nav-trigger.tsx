import { MenuIcon } from 'lucide-react'

import { Button } from '@afenda/ui/components/ui/button'

export interface MobileNavTriggerProps {
  onClick: () => void
  expanded?: boolean
  className?: string
}

export function MobileNavTrigger({
  onClick,
  expanded,
  className,
}: MobileNavTriggerProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={className ?? 'md:hidden'}
      onClick={onClick}
      aria-label="Open navigation"
      aria-expanded={expanded}
    >
      <MenuIcon className="h-5 w-5" />
    </Button>
  )
}
