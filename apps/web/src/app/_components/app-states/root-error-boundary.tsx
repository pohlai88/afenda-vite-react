import { Component, type ErrorInfo, type ReactNode } from "react"

import { RootErrorFallback } from "./root-error-fallback"

type RootErrorBoundaryProps = {
  readonly children: ReactNode
}

type RootErrorBoundaryState = {
  readonly hasError: boolean
  readonly error: Error | null
}

/**
 * Catches React render errors above {@link RouterProvider}. Uses plain links (not React Router)
 * so recovery still works if the router subtree has to unmount.
 */
export class RootErrorBoundary extends Component<
  RootErrorBoundaryProps,
  RootErrorBoundaryState
> {
  state: RootErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): RootErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error("[RootErrorBoundary]", error, info.componentStack)
    }
  }

  private reset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <RootErrorFallback error={this.state.error} onRetry={this.reset} />
    }
    return this.props.children
  }
}
