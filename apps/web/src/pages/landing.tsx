import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { Button } from "@afenda/design-system/ui-primitives"

import { AUTH_ROUTES } from "@/app/_platform/auth"

/** Public homepage at `/` (wrapped by `MarketingLayout`). */
export default function LandingPage() {
  const { t } = useTranslation("shell")

  return (
    <main
      className="flex min-h-dvh flex-col bg-background px-4 py-16 text-foreground sm:px-6"
      id="main"
    >
      <div className="mx-auto flex w-full max-w-lg flex-col gap-[1.5rem]">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          {t("marketing.landing.title")}
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          {t("marketing.landing.subtitle")}
        </p>
        <div className="flex flex-wrap gap-[0.75rem] pt-2">
          <Button asChild>
            <Link to="/app">{t("marketing.landing.cta_workspace")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={AUTH_ROUTES.login}>{t("marketing.landing.sign_in")}</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
