/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export interface ShellMeta {
  /** Browser document title for the current page. */
  title?: string
  /** Breadcrumb segments to append/override after route-derived segments. */
  breadcrumbs?: { label: string; href?: string }[]
  /** Optional header actions rendered in the right slot of AppHeader. */
  actions?: ReactNode
}

interface ShellContextValue {
  meta: ShellMeta
  setMeta: (next: ShellMeta) => void
}

const ShellContext = createContext<ShellContextValue | null>(null)

export function ShellContextProvider({ children }: { children: ReactNode }) {
  const [meta, setMeta] = useState<ShellMeta>({})

  const value = useMemo<ShellContextValue>(() => ({ meta, setMeta }), [meta])

  useLayoutEffect(() => {
    if (meta.title) {
      document.title = `${meta.title} — Afenda`
    }
  }, [meta.title])

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
}

/**
 * Pages call this hook to push metadata (title, breadcrumb overrides, header
 * actions) into the shell chrome without prop drilling.
 *
 * Inspired by Grafana AppChromeService and Supabase ProjectLayout title API.
 */
export function useShellMeta(incoming: ShellMeta) {
  const ctx = useContext(ShellContext)

  const setMeta = ctx?.setMeta

  useLayoutEffect(() => {
    setMeta?.(incoming)
    return () => setMeta?.({})
    // Deps use stringified values to avoid infinite loops from object identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setMeta, incoming.title, JSON.stringify(incoming.breadcrumbs)])
}

/**
 * Shell chrome components (AppHeader, AppBreadcrumb) read current page
 * metadata through this hook.
 */
export function useShellContext() {
  const ctx = useContext(ShellContext)
  if (!ctx) {
    throw new Error('useShellContext must be used within ShellContextProvider')
  }
  return ctx
}
