import { ShieldCheck, TriangleAlert } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Badge } from "@afenda/design-system/ui-primitives"

import type {
  AuthIntelligenceSnapshot,
  AuthRiskReason,
} from "./types/auth-ecosystem"

type IdentityIntelligenceHudProps = {
  readonly snapshot: AuthIntelligenceSnapshot
  readonly loading?: boolean
}

function trustLabelKey(
  trust: AuthIntelligenceSnapshot["trustLevel"]
):
  | "auth_security.trust.low"
  | "auth_security.trust.medium"
  | "auth_security.trust.high"
  | "auth_security.trust.verified" {
  if (trust === "verified") {
    return "auth_security.trust.verified"
  }
  if (trust === "high") {
    return "auth_security.trust.high"
  }
  if (trust === "medium") {
    return "auth_security.trust.medium"
  }
  return "auth_security.trust.low"
}

function trustToneClassName(
  trust: AuthIntelligenceSnapshot["trustLevel"]
): string {
  if (trust === "verified") {
    return "border-success/45 bg-success/10 text-success"
  }
  if (trust === "high") {
    return "border-info/45 bg-info/10 text-info"
  }
  if (trust === "medium") {
    return "border-warning/45 bg-warning/10 text-warning"
  }
  return "border-destructive/45 bg-destructive/10 text-destructive"
}

function riskToneClassName(risk: AuthRiskReason["severity"]): string {
  if (risk === "danger") {
    return "border-destructive/40 bg-destructive/10 text-destructive"
  }
  if (risk === "warning") {
    return "border-warning/40 bg-warning/10 text-warning"
  }
  return "border-border-muted bg-muted/30 text-muted-foreground"
}

export function IdentityIntelligenceHud({
  snapshot,
  loading = false,
}: IdentityIntelligenceHudProps) {
  const { t } = useTranslation("shell")
  const scoreFormatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  })
  const trustKey = trustLabelKey(snapshot.trustLevel)
  const passkeyKey = snapshot.passkeyAvailable
    ? "auth_security.passkey_ready"
    : "auth_security.passkey_not_ready"

  return (
    <div className="ui-stack-tight">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t("auth_security.hud_title")}
        </p>
        <Badge
          variant="outline"
          className={trustToneClassName(snapshot.trustLevel)}
        >
          <ShieldCheck className="size-3.5" aria-hidden />
          {t(trustKey)}
        </Badge>
      </div>

      <div className="rounded-xl ui-shell-panel-raised px-4 py-3">
        <p className="text-xs text-muted-foreground">
          {t("auth_security.trust_score")}
        </p>
        <p className="text-2xl font-semibold tracking-tight tabular-nums">
          {scoreFormatter.format(snapshot.score)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {loading ? t("actions.command_running") : snapshot.lastSeenLabel}
        </p>
      </div>

      <dl className="grid gap-3 text-sm">
        <div className="rounded-lg border border-border-muted bg-card/55 px-3 py-2">
          <dt className="text-xs text-muted-foreground">
            {t("auth_security.device")}
          </dt>
          <dd className="truncate font-medium">{snapshot.deviceLabel}</dd>
        </div>
        <div className="rounded-lg border border-border-muted bg-card/55 px-3 py-2">
          <dt className="text-xs text-muted-foreground">
            {t("auth_security.region")}
          </dt>
          <dd className="truncate font-medium">{snapshot.regionLabel}</dd>
        </div>
        <div className="rounded-lg border border-border-muted bg-card/55 px-3 py-2">
          <dt className="text-xs text-muted-foreground">
            {t("auth_security.fast_lane")}
          </dt>
          <dd className="truncate font-medium">{t(passkeyKey)}</dd>
        </div>
      </dl>

      <div className="ui-stack-tight">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t("auth_security.risk_reasons")}
        </p>
        <ul className="ui-stack-tight">
          {snapshot.reasons.map((reason) => (
            <li
              key={reason.code}
              className={`rounded-lg border px-3 py-2 text-sm ${riskToneClassName(reason.severity)}`}
            >
              <div className="flex items-start gap-2">
                <TriangleAlert
                  className="mt-0.5 size-3.5 shrink-0"
                  aria-hidden
                />
                <span>{reason.label}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
