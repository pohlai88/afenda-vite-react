import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { Button } from "@afenda/design-system/ui-primitives"

export function AppShellNotFound() {
  const { t } = useTranslation("shell")

  return (
    <section
      aria-labelledby="app-shell-not-found-title"
      className="ui-page ui-stack-relaxed"
    >
      <h1 className="ui-title-page" id="app-shell-not-found-title">
        {t("error.not_found.title")}
      </h1>
      <p className="text-muted-foreground">
        {t("error.not_found.description")}
      </p>
      <Button asChild variant="secondary">
        <Link to="/app/events">{t("error.not_found.link_dashboard")}</Link>
      </Button>
    </section>
  )
}
