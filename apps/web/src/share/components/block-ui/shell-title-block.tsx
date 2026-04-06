import { cn } from '@afenda/ui/lib/utils'

import { ShellActionSlot, ShellTitle } from '../shell-ui'

export interface ShellTitleBlockProps {
  className?: string
  titleClassName?: string
  actionsClassName?: string
  fallbackTitle?: string
}

export function ShellTitleBlock({
  className,
  titleClassName,
  actionsClassName,
  fallbackTitle,
}: ShellTitleBlockProps) {
  const containerClasses = cn(
    'flex min-w-0 items-center justify-between gap-3',
    className,
  )

  return (
    <div className={containerClasses}>
      <div className="min-w-0 flex-1">
        <ShellTitle className={titleClassName} fallback={fallbackTitle} />
      </div>
      <ShellActionSlot className={actionsClassName} />
    </div>
  )
}
