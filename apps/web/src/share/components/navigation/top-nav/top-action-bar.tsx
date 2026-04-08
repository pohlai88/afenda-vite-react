import { cn } from '@afenda/ui/lib/utils'

import { useActionBarContext } from '../../providers'
import { TopActionBarCustomiseMenu } from './top-action-bar-customise'
import { TopActionBarWidget } from './top-action-bar-widget'

export interface TopActionBarProps {
  className?: string
}

/**
 * Row 2 under the main top nav: user-visible subset of module-registered actions.
 * Catalog via `useActionBar`; visibility via prefs (default: all).
 */
export function TopActionBar({ className }: TopActionBarProps) {
  const { tabs, availableTabs, scopeKey } = useActionBarContext()

  if (availableTabs.length === 0) {
    return null
  }

  return (
    <nav
      className={cn(
        'flex items-center gap-1 overflow-x-auto border-b border-border bg-background px-(--top-nav-padding-x) lg:px-(--top-nav-padding-x-lg)',
        className,
      )}
      aria-label="Module navigation"
    >
      {tabs.map((tab) => (
        <TopActionBarWidget key={tab.key} tab={tab} />
      ))}
      {scopeKey ? <TopActionBarCustomiseMenu /> : null}
    </nav>
  )
}
