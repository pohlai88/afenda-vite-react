import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import {
  Badge,
  Button,
  Card,
  CardContent,
} from "@afenda/design-system/ui-primitives"

import { MarketingThemeCycleButton } from "./marketing-theme-cycle-button"

const postureCardClassName = "gap-0 border-border py-4 shadow-sm"
const postureCardContentClassName = "space-y-1 p-0 px-4"

export function MarketingLandingHero() {
  const { t } = useTranslation("shell")

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-linear-to-b from-card via-card to-background shadow-sm">
      <div className="absolute inset-x-0 top-0 h-px bg-border" />
      <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.25fr_0.75fr] lg:px-8 lg:py-10">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Design system</Badge>
            <Badge variant="outline">Theme contract</Badge>
            <Badge variant="outline">Enterprise UI</Badge>
          </div>

          <div className="space-y-3">
            <p className="ui-marketing-path">apps/web/src/index.css</p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
              {t("marketing.token_playground.title")}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {t("marketing.token_playground.subtitle")}
            </p>
            <p className="pt-1">
              <Link
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                to="#index-css-atlas"
              >
                {t("marketing.index_css.jump_link")}
              </Link>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <MarketingThemeCycleButton />
            <Button asChild variant="default">
              <Link to="/app/events">
                {t("marketing.landing.cta_workspace")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/app">{t("marketing.landing.sign_in")}</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm backdrop-blur-sm">
          <p className="ui-marketing-eyebrow">System posture</p>
          <div className="mt-4 space-y-4">
            <Card className={postureCardClassName}>
              <CardContent className={postureCardContentClassName}>
                <p className="text-sm font-medium text-card-foreground">
                  Governed tokens
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Theme variables, utilities, and primitives resolve from the
                  same semantic source.
                </p>
              </CardContent>
            </Card>
            <Card className={postureCardClassName}>
              <CardContent className={postureCardContentClassName}>
                <p className="text-sm font-medium text-card-foreground">
                  Dense by default
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Built for long working sessions, operational review, and
                  high-data enterprise screens.
                </p>
              </CardContent>
            </Card>
            <Card className={postureCardClassName}>
              <CardContent className={postureCardContentClassName}>
                <p className="text-sm font-medium text-card-foreground">
                  Contract-first
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  This page is not just visual preview. It is evidence that
                  the token contract is usable at runtime.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
