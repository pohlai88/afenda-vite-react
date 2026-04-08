import type { ComponentProps, ReactNode } from 'react'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@afenda/ui/components/ui/resizable'
import { cn } from '@afenda/ui/lib/utils'

export interface ErpContentAreaSplitViewProps {
  autoSaveId?: string
  className?: string
  orientation?: 'horizontal' | 'vertical'
  primary: ReactNode
  secondary: ReactNode
  primaryId?: string
  primaryDefaultSize?: number | string
  secondaryId?: string
  secondaryDefaultSize?: number | string
  secondaryMinSize?: number | string
  secondaryMaxSize?: number | string
  secondaryCollapsible?: boolean
  secondaryCollapsedSize?: number | string
  withHandle?: boolean
}

export interface ErpContentAreaProps extends ComponentProps<'section'> {
  containerClassName?: string
  splitView?: ErpContentAreaSplitViewProps
}

export function ErpContentArea({
  children,
  className,
  containerClassName,
  splitView,
  ...props
}: ErpContentAreaProps) {
  const content = splitView ? (
    <ResizablePanelGroup
      autoSaveId={splitView.autoSaveId}
      className={cn('min-h-0 flex-1', splitView.className)}
      orientation={splitView.orientation ?? 'horizontal'}
      panelIds={[splitView.primaryId ?? 'primary', splitView.secondaryId ?? 'secondary']}
    >
      <ResizablePanel
        id={splitView.primaryId ?? 'primary'}
        defaultSize={splitView.primaryDefaultSize}
      >
        <div className="flex h-full min-h-0 flex-col" data-slot="erp-content-area-primary">
          {splitView.primary}
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle={splitView.withHandle ?? true} />
      <ResizablePanel
        collapsible={splitView.secondaryCollapsible}
        collapsedSize={splitView.secondaryCollapsedSize}
        defaultSize={splitView.secondaryDefaultSize}
        id={splitView.secondaryId ?? 'secondary'}
        maxSize={splitView.secondaryMaxSize}
        minSize={splitView.secondaryMinSize}
      >
        <div className="flex h-full min-h-0 flex-col" data-slot="erp-content-area-secondary">
          {splitView.secondary}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ) : (
    children
  )

  return (
    <section
      data-slot="erp-content-area"
      className={cn('flex min-h-0 flex-1 flex-col overflow-y-auto', className)}
      {...props}
    >
      <div className="flex flex-1 flex-col">
        <div
          className={cn(
            '@container/main flex flex-1 flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6',
            containerClassName,
          )}
        >
          {content}
        </div>
      </div>
    </section>
  )
}
