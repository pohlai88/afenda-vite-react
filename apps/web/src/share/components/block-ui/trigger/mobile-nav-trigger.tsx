import { MenuIcon } from "lucide-react"

import { Button } from "@afenda/shadcn-ui/components/ui/button"

export interface MobileNavTriggerProps {
  onClick: () => void
  expanded?: boolean
}

export function MobileNavTrigger({ onClick, expanded }: MobileNavTriggerProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full md:hidden"
      onClick={onClick}
      aria-label="Open navigation"
      aria-expanded={expanded}
    >
      <MenuIcon aria-hidden />
    </Button>
  )
}
