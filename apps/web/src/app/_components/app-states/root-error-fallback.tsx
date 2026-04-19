import { AlertTriangle } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@afenda/design-system/ui-primitives"

import { publicSpaHomeHref } from "./public-spa-href"

export function RootErrorFallback({
  error,
  onRetry,
}: {
  readonly error: Error | null
  readonly onRetry: () => void
}) {
  const { t } = useTranslation("shell")
  const homeHref = publicSpaHomeHref()

  return (
    <div
      className="flex min-h-svh flex-col items-center justify-center bg-background p-[1.5rem]"
      role="alert"
      aria-live="assertive"
    >
      <section
        aria-labelledby="root-error-title"
        className="ui-page ui-stack-relaxed max-w-md text-center"
      >
        <div className="flex justify-center" aria-hidden>
          <AlertTriangle className="size-12 text-destructive" />
        </div>
        <h1 id="root-error-title" className="ui-title-page">
          {t("states.root_error.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("states.root_error.description")}
        </p>
        {import.meta.env.DEV && error?.message ? (
          <pre
            className="max-h-[10rem] overflow-auto rounded-md border border-border bg-muted p-[0.75rem] text-left font-mono text-xs text-muted-foreground"
            data-testid="root-error-detail"
          >
            {error.message}
          </pre>
        ) : null}
        <div className="flex flex-wrap justify-center gap-[0.5rem]">
          <Button type="button" onClick={onRetry}>
            {t("states.root_error.retry")}
          </Button>
          <Button type="button" variant="secondary" asChild>
            <a href={homeHref}>{t("states.root_error.home")}</a>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              window.location.reload()
            }}
          >
            {t("states.root_error.reload")}
          </Button>
        </div>
      </section>
    </div>
  )
}
