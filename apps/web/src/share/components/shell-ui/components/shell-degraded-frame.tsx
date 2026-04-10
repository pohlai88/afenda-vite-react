import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from 'react'

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@afenda/ui/components/ui/alert'
import { cn } from '@afenda/ui/lib/utils'
import { AlertTriangleIcon } from 'lucide-react'

export interface ShellDegradedFrameProps extends ComponentPropsWithoutRef<'div'> {
  /** Short headline (e.g. “Limited availability”). */
  title: string
  /** Optional detail for operators or users. */
  description?: ReactNode
  /** Actions or extra controls (rendered below the description). */
  children?: ReactNode
}

/**
 * Canonical degraded / partial-outage shell surface (`content.main` occupant). Use when the app
 * remains usable but service quality or data freshness is reduced.
 */
export const ShellDegradedFrame = forwardRef<HTMLDivElement, ShellDegradedFrameProps>(
  function ShellDegradedFrame(
    { className, title, description, children, ...props },
    ref,
  ) {
    return (
      <div
        ref={ref}
        data-shell-zone="content"
        data-shell-key="shell-degraded-frame"
        className={cn('flex min-h-0 min-w-0 flex-1 flex-col p-4', className)}
        {...props}
      >
        <Alert variant="warning" className="max-w-3xl">
          <AlertTriangleIcon aria-hidden />
          <AlertTitle>{title}</AlertTitle>
          {description || children ? (
            <AlertDescription>
              {description}
              {children ? <div className="mt-3 flex flex-wrap gap-2">{children}</div> : null}
            </AlertDescription>
          ) : null}
        </Alert>
      </div>
    )
  },
)
