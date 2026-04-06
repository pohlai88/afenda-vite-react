/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'

import type {
  ShellMetadata,
  ShellMetadataContextValue,
  ShellMetadataProviderProps,
} from './shell-metadata-provider.types'

const DEFAULT_TITLE_SUFFIX = 'Afenda'
const EMPTY_SHELL_METADATA: ShellMetadata = {}

const ShellMetadataContext = createContext<ShellMetadataContextValue | null>(
  null,
)

export function ShellMetadataProvider({
  children,
  titleSuffix = DEFAULT_TITLE_SUFFIX,
}: ShellMetadataProviderProps) {
  const [metadata, setMetadata] = useState<ShellMetadata>(EMPTY_SHELL_METADATA)

  const value = useMemo<ShellMetadataContextValue>(
    () => ({ metadata, setMetadata }),
    [metadata],
  )

  useLayoutEffect(() => {
    document.title = metadata.title
      ? `${metadata.title} — ${titleSuffix}`
      : titleSuffix
  }, [metadata.title, titleSuffix])

  return (
    <ShellMetadataContext.Provider value={value}>
      {children}
    </ShellMetadataContext.Provider>
  )
}

/**
 * Route-level views call this hook to publish page metadata into the shared
 * shell chrome without prop drilling.
 */
export function useShellMetadata(incoming: ShellMetadata) {
  const context = useContext(ShellMetadataContext)
  const setMetadata = context?.setMetadata

  useLayoutEffect(() => {
    setMetadata?.(incoming)

    return () => setMetadata?.(EMPTY_SHELL_METADATA)
    // Deps use stringified values to avoid loops from object identity churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    setMetadata,
    incoming.title,
    incoming.actions,
    JSON.stringify(incoming.breadcrumbs),
  ])
}

/**
 * Shell chrome components consume current metadata through this hook.
 */
export function useShellMetadataContext() {
  const context = useContext(ShellMetadataContext)

  if (!context) {
    throw new Error(
      'useShellMetadataContext must be used within ShellMetadataProvider',
    )
  }

  return context
}
