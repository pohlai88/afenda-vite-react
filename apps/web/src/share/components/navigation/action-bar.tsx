import { cn } from '@afenda/ui/lib/utils'

import { useActionBarContext } from '../providers'
import { ActionBarItem } from './action-bar-item'

export interface ActionBarProps {
  className?: string
}

/**
 * ActionBar renders Row 2 of the header -- a horizontal tab strip.
 * Tabs are registered by module pages via useActionBar().
 * Only renders when tabs are registered; otherwise returns null.
 */
export function ActionBar({ className }: ActionBarProps) {
  const { tabs } = useActionBarContext()

  if (tabs.length === 0) {
    return null
  }

  return (
    <nav
      className={cn(
        'flex items-center gap-1 overflow-x-auto border-b border-border bg-background px-4',
        className,
      )}
      aria-label="Module navigation"
    >
      {tabs.map((tab) => (
        <ActionBarItem key={tab.key} tab={tab} />
      ))}
    </nav>
  )
}
