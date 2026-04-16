"use client"

import { ShieldCheck } from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  Badge,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@afenda/design-system/ui-primitives"

import { useAuthIntelligence } from "../../auth"

function trustToneClassName(
  level: "low" | "medium" | "high" | "verified"
): string {
  if (level === "verified") {
    return "border-success/45 bg-success/10 text-success"
  }
  if (level === "high") {
    return "border-info/45 bg-info/10 text-info"
  }
  if (level === "medium") {
    return "border-warning/45 bg-warning/10 text-warning"
  }
  return "border-destructive/45 bg-destructive/10 text-destructive"
}

export function ShellAuthTrustBeacon() {
  const { t } = useTranslation("shell")
  const { data } = useAuthIntelligence()
  const tone = trustToneClassName(data.trustLevel)
  const trustLabel = t(`auth_security.trust.${data.trustLevel}`)
  const tooltip = t("auth_security.beacon_tooltip", {
    trust: trustLabel,
    score: data.score,
  })

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={`h-[2rem] rounded-full px-2.5 ${tone}`}
        >
          <ShieldCheck className="mr-1.5 size-3.5" aria-hidden />
          <span className="text-xs tabular-nums">{data.score}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="bottom">{tooltip}</TooltipContent>
    </Tooltip>
  )
}
