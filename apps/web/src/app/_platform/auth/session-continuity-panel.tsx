import { History, KeyRound, LifeBuoy } from "lucide-react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { Button } from "@afenda/design-system/ui-primitives"

import type {
  AuthChallengeState,
  AuthIntelligenceSnapshot,
  AuthRecommendedMethod,
} from "./types/auth-ecosystem"

type SessionContinuityPanelProps = {
  readonly snapshot: AuthIntelligenceSnapshot
  readonly currentMethod: AuthRecommendedMethod
  readonly currentStep: "identify" | "method" | "challenge" | "complete"
  readonly challenge: AuthChallengeState | null
  readonly onResetChallenge: () => void
}

function formatChallengeExpiry(expiresAt: string): string {
  const parsed = new Date(expiresAt)
  if (Number.isNaN(parsed.valueOf())) {
    return "N/A"
  }
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed)
}

export function SessionContinuityPanel({
  snapshot,
  currentMethod,
  currentStep,
  challenge,
  onResetChallenge,
}: SessionContinuityPanelProps) {
  const { t } = useTranslation("shell")

  return (
    <div className="ui-stack-tight">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {t("auth_security.continuity_title")}
      </p>

      <div className="rounded-xl border border-border-muted bg-card/55 p-3">
        <div className="mb-1 flex items-center gap-2 text-sm font-medium">
          <History className="size-4 text-muted-foreground" aria-hidden />
          {t("auth_security.last_trusted_session")}
        </div>
        <p className="text-xs text-muted-foreground">
          {snapshot.lastSeenLabel}
        </p>
      </div>

      <div className="rounded-xl border border-border-muted bg-card/55 p-3">
        <div className="mb-1 flex items-center gap-2 text-sm font-medium">
          <KeyRound className="size-4 text-muted-foreground" aria-hidden />
          {t("auth_security.current_flow")}
        </div>
        <p className="text-xs text-muted-foreground">
          {t("auth_security.flow_label", {
            step: currentStep,
            method: currentMethod,
          })}
        </p>
        {challenge ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {t("auth_security.challenge_expires", {
              time: formatChallengeExpiry(challenge.expiresAt),
            })}
          </p>
        ) : null}
      </div>

      <div className="ui-stack-tight">
        {challenge ? (
          <Button type="button" variant="outline" onClick={onResetChallenge}>
            {t("auth_security.resume_reset")}
          </Button>
        ) : null}
        <Button asChild type="button" variant="ghost">
          <Link to="/forgot-password">
            <LifeBuoy className="mr-2 size-4" aria-hidden />
            {t("auth_security.recovery_action")}
          </Link>
        </Button>
      </div>
    </div>
  )
}
