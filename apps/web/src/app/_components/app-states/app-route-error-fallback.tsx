import { AlertCircle } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link, useNavigate, useRouteError } from "react-router-dom"

import { Button } from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

import { resolveRouteErrorMessage } from "./resolve-route-error"

/** Default recovery target inside `/app` (matches shell not-found home). */
export const APP_SHELL_DEFAULT_HOME_HREF = "/app/events" as const

/**
 * React Router `errorElement` surface for `/app/*` and public routes (`/`, `/auth/*`).
 * Wrap with {@link AppThemeProvider} or {@link PublicThemeProvider} at the route table.
 *
 * @param homeHref - `Link` target for "home" (default: ERP shell; use `"/"` for marketing/auth).
 */
export function AppRouteErrorFallback({
  className,
  homeHref = APP_SHELL_DEFAULT_HOME_HREF,
}: {
  readonly className?: string
  readonly homeHref?: string
}) {
  const error = useRouteError()
  const { t } = useTranslation("shell")
  const navigate = useNavigate()
  const detail = resolveRouteErrorMessage(error)

  return (
    <div
      className={cn(
        "flex min-h-svh flex-col items-center justify-center bg-background p-[1.5rem]",
        className
      )}
    >
      <section
        aria-labelledby="app-route-error-title"
        className="ui-page ui-stack-relaxed max-w-md text-center"
        role="alert"
      >
        <div className="flex justify-center" aria-hidden>
          <AlertCircle className="size-12 text-destructive" />
        </div>
        <h1 id="app-route-error-title" className="ui-title-page">
          {t("states.route_error.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("states.route_error.description")}
        </p>
        {import.meta.env.DEV ? (
          <pre
            className="max-h-[10rem] overflow-auto rounded-md border border-border bg-muted p-[0.75rem] text-left font-mono text-xs text-muted-foreground"
            data-testid="app-route-error-detail"
          >
            {detail}
          </pre>
        ) : null}
        <div className="flex flex-wrap justify-center gap-[0.5rem]">
          <Button type="button" onClick={() => navigate(0)}>
            {t("states.route_error.retry")}
          </Button>
          <Button variant="secondary" asChild>
            <Link to={homeHref}>{t("states.route_error.home")}</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
