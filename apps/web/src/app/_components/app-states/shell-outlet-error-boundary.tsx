/**
 * -----------------------------------------------------------------------------
 * Shell Outlet Error Boundary
 * -----------------------------------------------------------------------------
 * Purpose:
 * - Catch React render errors in the shell outlet subtree so shell navigation
 *   remains mounted and recovery actions stay available.
 *
 * Rules:
 * - Pair with `AppRouteErrorFallback` for route loader/action failures.
 * - Keep retry explicit; do not auto-reset on child identity changes.
 * - Show diagnostic detail in development only.
 * -----------------------------------------------------------------------------
 */
import { Component, type ErrorInfo, type ReactNode } from "react"
import { AlertTriangle } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { Button } from "@afenda/design-system/ui-primitives"

import { APP_SHELL_DEFAULT_HOME_HREF } from "./app-route-error-fallback"

export interface ShellOutletErrorBoundaryProps {
  readonly children: ReactNode
}

export interface ShellOutletErrorBoundaryState {
  readonly hasError: boolean
  readonly error: Error | null
}

export interface ShellOutletErrorFallbackProps {
  readonly error: Error | null
  readonly onRetry: () => void
}

const INITIAL_STATE: ShellOutletErrorBoundaryState = {
  hasError: false,
  error: null,
}

const FALLBACK_COPY = {
  title: "This section failed to render",
  description:
    "Try again or return to the workspace. If this keeps happening, contact support.",
  retry: "Try again",
  home: "Back to workspace",
} as const

function logShellOutletBoundaryError(error: Error, info: ErrorInfo): void {
  if (!import.meta.env.DEV) {
    return
  }

  console.error("[ShellOutletErrorBoundary]", error, info.componentStack)
}

function normalizeErrorDetail(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }

  const normalized = value.replace(/\s+/g, " ").trim()
  return normalized.length > 0 ? normalized : null
}

function resolveShellOutletErrorDetail(error: Error | null): string | null {
  if (!error) {
    return null
  }

  const message = normalizeErrorDetail(error.message)
  if (message) {
    return message
  }

  const name = normalizeErrorDetail(error.name)
  return name && name !== "Error" ? name : null
}

/**
 * Catches React render errors in the shell **route outlet** subtree so navigation chrome
 * can remain mounted. Pair with {@link AppRouteErrorFallback} on the route for loader/action failures.
 */
export class ShellOutletErrorBoundary extends Component<
  ShellOutletErrorBoundaryProps,
  ShellOutletErrorBoundaryState
> {
  override state: ShellOutletErrorBoundaryState = INITIAL_STATE

  static getDerivedStateFromError(error: Error): ShellOutletErrorBoundaryState {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    logShellOutletBoundaryError(error, info)
  }

  private readonly reset = (): void => {
    this.setState(INITIAL_STATE)
  }

  override render(): ReactNode {
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
}: ShellOutletErrorFallbackProps) {
  const { t } = useTranslation("shell")
  const title = t("states.outlet_error.title", {
    defaultValue: FALLBACK_COPY.title,
  })
  const description = t("states.outlet_error.description", {
    defaultValue: FALLBACK_COPY.description,
  })
  const retryLabel = t("states.outlet_error.retry", {
    defaultValue: FALLBACK_COPY.retry,
  })
  const homeLabel = t("states.outlet_error.home", {
    defaultValue: FALLBACK_COPY.home,
  })
  const detail = resolveShellOutletErrorDetail(error)
  const showDevDetail = import.meta.env.DEV && detail !== null

  return (
    <section
      aria-labelledby="shell-outlet-error-title"
      className="ui-page ui-stack-relaxed flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center py-12"
      role="alert"
      aria-live="assertive"
      data-slot="app.shell-outlet-error-fallback"
    >
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="flex justify-center" aria-hidden="true">
          <AlertTriangle className="size-11 text-destructive" />
        </div>
        <div className="ui-stack-tight">
          <h2 id="shell-outlet-error-title" className="ui-title-section">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {showDevDetail ? (
          <pre
            className="max-h-32 w-full overflow-auto rounded-md border border-border bg-muted p-3 text-left font-mono text-xs text-muted-foreground"
            data-testid="shell-outlet-error-detail"
            data-slot="app.shell-outlet-error-fallback.detail"
          >
            {detail}
          </pre>
        ) : null}
        <div
          className="flex flex-wrap justify-center gap-2"
          data-slot="app.shell-outlet-error-fallback.actions"
        >
          <Button type="button" onClick={onRetry}>
            {retryLabel}
          </Button>
          <Button variant="secondary" asChild>
            <Link to={APP_SHELL_DEFAULT_HOME_HREF}>{homeLabel}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
