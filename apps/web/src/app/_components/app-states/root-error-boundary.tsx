/**
 * -----------------------------------------------------------------------------
 * Root Error Boundary
 * -----------------------------------------------------------------------------
 * Purpose:
 * - Catch React render errors above `RouterProvider`.
 *
 * Rules:
 * - Must not depend on React Router for recovery actions.
 * - Uses a plain fallback UI so recovery still works if router state is corrupted.
 * - Logs diagnostic detail in development only.
 * - Exposes an explicit retry action that clears captured boundary state.
 * -----------------------------------------------------------------------------
 */
import { Component, type ErrorInfo, type ReactNode } from "react"

import { RootErrorFallback } from "./root-error-fallback"

export interface RootErrorBoundaryProps {
  readonly children: ReactNode
}

export interface RootErrorBoundaryState {
  readonly hasError: boolean
  readonly error: Error | null
}

const INITIAL_STATE: RootErrorBoundaryState = {
  hasError: false,
  error: null,
}

function logRootBoundaryError(error: Error, info: ErrorInfo): void {
  if (!import.meta.env.DEV) {
    return
  }

  console.error("[RootErrorBoundary]", error, info.componentStack)
}

/**
 * Catches React render errors above {@link RouterProvider}. Uses plain links (not React Router)
 * so recovery still works if the router subtree has to unmount.
 */
export class RootErrorBoundary extends Component<
  RootErrorBoundaryProps,
  RootErrorBoundaryState
> {
  override state: RootErrorBoundaryState = INITIAL_STATE

  static getDerivedStateFromError(error: Error): RootErrorBoundaryState {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    logRootBoundaryError(error, info)
  }

  private readonly reset = (): void => {
    this.setState(INITIAL_STATE)
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return <RootErrorFallback error={this.state.error} onRetry={this.reset} />
    }

    return this.props.children
  }
}
