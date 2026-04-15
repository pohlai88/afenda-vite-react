import { Component, type ErrorInfo, type ReactNode } from "react"
import { AlertTriangle } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { Button } from "@afenda/design-system/ui-primitives"

import { APP_SHELL_DEFAULT_HOME_HREF } from "./app-route-error-fallback"

type ShellOutletErrorBoundaryProps = {
  readonly children: ReactNode
}

type ShellOutletErrorBoundaryState = {
  readonly hasError: boolean
  readonly error: Error | null
}

/**
 * Catches React render errors in the shell **route outlet** subtree so navigation chrome
 * can remain mounted. Pair with {@link AppRouteErrorFallback} on the route for loader/action failures.
 */
export class ShellOutletErrorBoundary extends Component<
  ShellOutletErrorBoundaryProps,
  ShellOutletErrorBoundaryState
> {
  state: ShellOutletErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ShellOutletErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error("[ShellOutletErrorBoundary]", error, info.componentStack)
    }
  }

  private reset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ShellOutletErrorFallback
          error={this.state.error}
          onRetry={this.reset}
        />
      )
    }
    return this.props.children
  }
}

export function ShellOutletErrorFallback({
  error,
  onRetry,
}: {
  readonly error: Error | null
  readonly onRetry: () => void
}) {
  const { t } = useTranslation("shell")

  return (
    <section
      aria-labelledby="shell-outlet-error-title"
      className="ui-page ui-stack-relaxed flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center py-12"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex max-w-md flex-col items-center gap-[1rem] text-center">
        <div className="flex justify-center" aria-hidden>
          <AlertTriangle className="size-11 text-destructive" />
        </div>
        <h2 id="shell-outlet-error-title" className="ui-title-section">
          {t("states.outlet_error.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("states.outlet_error.description")}
        </p>
        {import.meta.env.DEV && error?.message ? (
          <pre
            className="max-h-32 w-full overflow-auto rounded-md border border-border bg-muted p-[0.75rem] text-left font-mono text-xs text-muted-foreground"
            data-testid="shell-outlet-error-detail"
          >
            {error.message}
          </pre>
        ) : null}
        <div className="flex flex-wrap justify-center gap-[0.5rem]">
          <Button type="button" onClick={onRetry}>
            {t("states.outlet_error.retry")}
          </Button>
          <Button variant="secondary" asChild>
            <Link to={APP_SHELL_DEFAULT_HOME_HREF}>
              {t("states.outlet_error.home")}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
