import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import {
  Button,
  Card,
  CardContent,
  CardHeader,
} from "@afenda/design-system/ui-primitives"

/**
 * Marketing entry at `/` — outside `AppShellLayout`.
 * Structured for accessibility (skip link, heading order) and enterprise CTAs.
 */
export default function Landing() {
  const { t } = useTranslation("shell")

  return (
    <>
      <a
        className="sr-only inline-flex rounded-md bg-background px-4 py-2 text-sm font-medium shadow-lg focus-ring focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100"
        href="#landing-main"
      >
        {t("marketing.landing.skip_to_main")}
      </a>
      <main
        className="ui-page ui-stack-relaxed scroll-mt-4"
        id="landing-main"
        tabIndex={-1}
      >
        <header className="ui-header">
          <h1 className="ui-title-hero text-pretty">
            <span translate="no">{t("marketing.landing.brand_name")}</span>
            <span aria-hidden className="text-muted-foreground">
              {" "}
              —{" "}
            </span>
            <span>{t("marketing.landing.title")}</span>
          </h1>
          <p className="ui-lede text-muted-foreground">
            {t("marketing.landing.subtitle")}
          </p>
        </header>

        <section
          aria-labelledby="landing-start-heading"
          className="ui-stack-tight"
        >
          <h2 className="ui-title-section" id="landing-start-heading">
            {t("marketing.landing.section_start_heading")}
          </h2>
          <div className="flex min-w-0 touch-manipulation flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Button asChild variant="default">
              <Link to="/app/events">
                {t("marketing.landing.cta_workspace")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/app/login">{t("marketing.landing.sign_in")}</Link>
            </Button>
          </div>
        </section>

        <Card className="max-w-2xl">
          <CardHeader>
            <h2 className="text-lg leading-none font-semibold tracking-tight">
              {t("marketing.landing.section_highlights_heading")}
            </h2>
          </CardHeader>
          <CardContent>
            <ul className="ui-stack-tight list-disc pl-5 text-sm text-muted-foreground">
              <li className="min-w-0 wrap-break-word">
                {t("marketing.landing.feature_1")}
              </li>
              <li className="min-w-0 wrap-break-word">
                {t("marketing.landing.feature_2")}
              </li>
              <li className="min-w-0 wrap-break-word">
                {t("marketing.landing.feature_3")}
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
