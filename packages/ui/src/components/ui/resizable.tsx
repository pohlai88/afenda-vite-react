import * as React from 'react'
import { GripVerticalIcon } from 'lucide-react'
import * as ResizablePrimitive from 'react-resizable-panels'

import { cn } from '@afenda/ui/lib/utils'

const RESIZABLE_LAYOUT_STORAGE_PREFIX = 'react-resizable-panels-v4:'
const LEGACY_LAYOUT_STORAGE_PREFIX = 'react-resizable-panels:'

type ResizableLayoutStorage = ResizablePrimitive.LayoutStorage
type ResizablePanelGroupProps = ResizablePrimitive.GroupProps & {
  autoSaveId?: string
  panelIds?: string[]
  storage?: ResizableLayoutStorage
}

function remapStorageKey(key: string) {
  if (key.startsWith(RESIZABLE_LAYOUT_STORAGE_PREFIX)) {
    return key
  }

  if (key.startsWith(LEGACY_LAYOUT_STORAGE_PREFIX)) {
    return key.replace(LEGACY_LAYOUT_STORAGE_PREFIX, RESIZABLE_LAYOUT_STORAGE_PREFIX)
  }

  return `${RESIZABLE_LAYOUT_STORAGE_PREFIX}${key}`
}

function createVersionedLayoutStorage(storage: ResizableLayoutStorage) {
  return {
    getItem(key: string) {
      return storage.getItem(remapStorageKey(key))
    },
    setItem(key: string, value: string) {
      storage.setItem(remapStorageKey(key), value)
    },
  } satisfies ResizableLayoutStorage
}

function resolvePanelIds(children: React.ReactNode) {
  const panelIds: string[] = []
  let fallbackIndex = 0

  const walk = (node: React.ReactNode) => {
    React.Children.forEach(node, (child) => {
      if (!React.isValidElement(child)) return

      const element = child as React.ReactElement<{
        children?: React.ReactNode
        id?: string | number
      }>

      if (element.type === React.Fragment) {
        walk(element.props.children)
        return
      }

      if (element.type === ResizablePrimitive.Panel) {
        const panelId = element.props.id
        panelIds.push(String(panelId ?? `panel-${fallbackIndex}`))
        fallbackIndex += 1
      }
    })
  }

  walk(children)
  return panelIds
}

function useDefaultLayout({
  debounceSaveMs,
  panelIds,
  storage,
  ...rest
}: Parameters<typeof ResizablePrimitive.useDefaultLayout>[0]) {
  const versionedStorage = React.useMemo(() => {
    if (storage) {
      return createVersionedLayoutStorage(storage)
    }

    if (typeof window === 'undefined') {
      return undefined
    }

    return createVersionedLayoutStorage(window.localStorage)
  }, [storage])

  return ResizablePrimitive.useDefaultLayout({
    debounceSaveMs,
    panelIds,
    storage: versionedStorage,
    ...rest,
  })
}

function ResizablePanelGroup({
  autoSaveId,
  children,
  className,
  defaultLayout,
  onLayoutChange,
  onLayoutChanged,
  panelIds,
  storage,
  ...props
}: ResizablePanelGroupProps) {
  const resolvedPanelIds = React.useMemo(
    () => panelIds ?? resolvePanelIds(children),
    [children, panelIds],
  )

  if (!autoSaveId) {
    return (
      <ResizablePrimitive.Group
        data-slot="resizable-panel-group"
        className={cn(
          'flex h-full w-full aria-[orientation=vertical]:flex-col',
          className,
        )}
        defaultLayout={defaultLayout}
        onLayoutChange={onLayoutChange}
        onLayoutChanged={onLayoutChanged}
        {...props}
      >
        {children}
      </ResizablePrimitive.Group>
    )
  }

  return (
    <AutoSaveResizablePanelGroup
      autoSaveId={autoSaveId}
      className={className}
      defaultLayout={defaultLayout}
      onLayoutChange={onLayoutChange}
      onLayoutChanged={onLayoutChanged}
      panelIds={resolvedPanelIds}
      storage={storage}
      {...props}
    >
      {children}
    </AutoSaveResizablePanelGroup>
  )
}

function AutoSaveResizablePanelGroup({
  autoSaveId,
  children,
  className,
  defaultLayout,
  onLayoutChange,
  onLayoutChanged,
  panelIds,
  storage,
  ...props
}: Omit<ResizablePanelGroupProps, 'autoSaveId'> & { autoSaveId: string }) {
  const persistedLayout = useDefaultLayout({
    id: autoSaveId,
    panelIds,
    storage,
  })

  const handleLayoutChange = React.useCallback(
    (layout: ResizablePrimitive.Layout) => {
      persistedLayout.onLayoutChange?.(layout)
      onLayoutChange?.(layout)
    },
    [onLayoutChange, persistedLayout],
  )

  const handleLayoutChanged = React.useCallback(
    (layout: ResizablePrimitive.Layout) => {
      persistedLayout.onLayoutChanged?.(layout)
      onLayoutChanged?.(layout)
    },
    [onLayoutChanged, persistedLayout],
  )

  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn(
        'flex h-full w-full aria-[orientation=vertical]:flex-col',
        className,
      )}
      defaultLayout={persistedLayout.defaultLayout ?? defaultLayout}
      onLayoutChange={handleLayoutChange}
      onLayoutChanged={handleLayoutChanged}
      {...props}
    >
      {children}
    </ResizablePrimitive.Group>
  )
}

function ResizablePanel({ ...props }: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  style,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        'group relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:-translate-y-1/2 aria-[orientation=horizontal]:after:translate-x-0 [&[aria-orientation=horizontal]>div]:rotate-90 data-[separator=active]:bg-border-strong transition-colors',
        className,
      )}
      style={{ cursor: 'auto', ...style }}
      {...props}
    >
      {withHandle ? (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border border-border bg-border opacity-0 transition-opacity duration-200 group-data-[separator=hover]:opacity-100 group-data-[separator=active]:opacity-100 hover:bg-background-surface-400 focus-within:bg-background-surface-400 group-data-[separator=active]:bg-foreground-muted">
          <GripVerticalIcon className="size-3 shrink-0" aria-hidden />
        </div>
      ) : null}
    </ResizablePrimitive.Separator>
  )
}

function usePanelRef() {
  return ResizablePrimitive.usePanelRef()
}

export type {
  ResizableLayoutStorage,
  ResizablePanelGroupProps,
}
export type ResizablePanelHandle = ResizablePrimitive.PanelImperativeHandle

export {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  useDefaultLayout,
  usePanelRef,
}
