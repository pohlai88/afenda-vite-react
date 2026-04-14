import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { Button } from "@afenda/design-system/ui-primitives"

import { useShellTitle } from "../hooks/use-shell-title"

const APP_SHELL_NOT_FOUND_RETURN_HREF = "/app/events" as const

/**
 * Shell-scoped not-found page for `/app/*`.
 *
 * Drift control:
 * - fallback return destination is centralized
 * - resolved page title is computed once
 * - page remains presentational; route ownership stays outside this file
 */
export function AppShellNotFound() {
  const { t } = useTranslation("shell")
  const shellTitle = useShellTitle()

  const pageTitle = shellTitle ?? t("error.not_found.title")

  return (
    <section
      aria-labelledby="app-shell-not-found-title"
      className="ui-page ui-stack-relaxed"
    >
      <h1 id="app-shell-not-found-title" className="ui-title-page">
        {pageTitle}
      </h1>

      <p className="text-muted-foreground">
        {t("error.not_found.description")}
      </p>

      <Button asChild variant="secondary">
        <Link to={APP_SHELL_NOT_FOUND_RETURN_HREF}>
          {t("error.not_found.link_dashboard")}
        </Link>
      </Button>
    </section>
  )
}
