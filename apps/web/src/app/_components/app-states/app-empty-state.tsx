import type { ReactNode } from "react"

import {
  AppEmptyState as GovernedAppEmptyState,
  type AppStateVariantProps,
} from "./app-feedback-state"

export interface AppEmptyStateProps extends AppStateVariantProps {
  /** Deprecated compatibility alias. Prefer `actions`. */
  readonly children?: ReactNode
}

/**
 * Compatibility wrapper for the governed empty-state primitive.
 * Prefer importing `AppEmptyState` from `app-feedback-state.tsx` via the barrel.
 */
export function AppEmptyState({
  actions,
  children,
  ...props
}: AppEmptyStateProps) {
  return <GovernedAppEmptyState {...props} actions={actions ?? children} />
}
