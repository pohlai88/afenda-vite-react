import { History, KeyRound, LifeBuoy } from "lucide-react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { Button } from "@afenda/design-system/ui-primitives"

import { AUTH_ROUTES } from "../../auth-paths"
import type { AuthIntelligenceSnapshot } from "../../contracts/auth-domain"
import type { AuthContinuityViewModel } from "../../contracts/auth-view-model"

type SessionContinuityPanelProps = {
  readonly snapshot: AuthIntelligenceSnapshot
  readonly model: AuthContinuityViewModel
  readonly onResetChallenge: () => void
}

function formatExpiry(expiresAtIso: string): string {
  const parsed = new Date(expiresAtIso)
  if (Number.isNaN(parsed.valueOf())) {
    return "N/A"
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed)
}

export function SessionContinuityPanel(props: SessionContinuityPanelProps) {
  const { snapshot, model, onResetChallenge } = props
  const { t } = useTranslation("shell")

  return (
    <div className="ui-stack-tight">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {t("auth_security.continuity_title")}
      </p>

      <div className="rounded-xl border border-border-muted bg-card/55 p-[0.75rem]">
        <div className="mb-1 flex items-center gap-[0.5rem] text-sm font-medium">
          <History className="size-4 text-muted-foreground" aria-hidden />
          {t("auth_security.last_trusted_session")}
        </div>
        <p className="text-xs text-muted-foreground">
          {snapshot.lastSeenLabel}
        </p>
      </div>

      <div className="rounded-xl border border-border-muted bg-card/55 p-[0.75rem]">
        <div className="mb-1 flex items-center gap-[0.5rem] text-sm font-medium">
          <KeyRound className="size-4 text-muted-foreground" aria-hidden />
          {t("auth_security.current_flow")}
        </div>

        <p className="text-xs text-muted-foreground">
          {t("auth_security.flow_label", {
            step: model.currentStep,
            method: model.currentMethod,
          })}
        </p>

        {model.challenge ? (
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">
              {model.challenge.title}
            </p>
            <p>{model.challenge.description}</p>

            {model.challenge.expiresAtIso ? (
              <p>
                {t("auth_security.challenge_expires", {
                  time: formatExpiry(model.challenge.expiresAtIso),
                })}
              </p>
            ) : null}

            {typeof model.challenge.attemptsRemaining === "number" ? (
              <p>{`Attempts remaining: ${model.challenge.attemptsRemaining}`}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="ui-stack-tight">
        {model.challenge ? (
          <Button type="button" variant="outline" onClick={onResetChallenge}>
            {t("auth_security.challenge_use_another")}
          </Button>
        ) : null}

        <Button asChild type="button" variant="ghost">
          <Link to={AUTH_ROUTES.forgotPassword}>
            <LifeBuoy className="mr-2 size-4" aria-hidden />
            {t("auth_security.recovery_action")}
          </Link>
        </Button>
      </div>
    </div>
  )
}
