import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { Button } from "@afenda/design-system/ui-primitives"

/**
 * Transitional auth-boundary placeholder outside `AppShellLayout`.
 * Replace when a formal auth runtime exists.
 */
export default function AppLogin() {
  const { t } = useTranslation("shell")

  return (
    <main className="ui-page ui-stack-relaxed">
      <header className="ui-header">
        <h1 className="ui-title-page">{t("login.placeholder.title")}</h1>
        <p className="ui-lede text-muted-foreground">
          {t("login.placeholder.body")}
        </p>
      </header>
      <Button asChild variant="default">
        <Link to="/app/events">{t("login.placeholder.continue")}</Link>
      </Button>
    </main>
  )
}
