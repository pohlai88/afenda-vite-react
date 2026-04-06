import type { ReactNode } from 'react'

export interface ShellBreadcrumbItem {
  readonly label: string
  readonly href?: string
}

export interface ShellMetadata {
  /** Browser document title for the current page. */
  title?: string
  /** Breadcrumb segments to append or override after route-derived segments. */
  breadcrumbs?: readonly ShellBreadcrumbItem[]
  /** Optional header actions rendered by shell chrome. */
  actions?: ReactNode
}

export interface ShellMetadataContextValue {
  readonly metadata: ShellMetadata
  setMetadata: (next: ShellMetadata) => void
}

export interface ShellMetadataProviderProps {
  readonly children: ReactNode
  /** Optional suffix appended to document titles, such as the app name. */
  titleSuffix?: string
}
