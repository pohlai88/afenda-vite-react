/**
 * SEMANTIC ADAPTER — integrity severity
 * Maps shell integrity / invariant severity levels to semantic UI presentation.
 * Token names may still reference legacy `--color-truth-*` CSS variables until tokens are renamed.
 */
import type { LucideIcon } from "lucide-react"
import { AlertCircle, CheckCircle2, CircleDashed, LoaderCircle, TriangleAlert } from "lucide-react"

import { getToneBgClass, getToneTextClass } from "../../lib/constant/semantic/tone"
import type { SemanticTone } from "../primitives/tone"

/** Severity levels for invariant / integrity signals in shell UI (maps to semantic tokens). */
export type ShellIntegritySeverity =
  | "valid"
  | "warning"
  | "broken"
  | "pending"
  | "neutral"

export interface IntegritySeverityUiModel {
  readonly tone: SemanticTone
  readonly label: string
  readonly icon: LucideIcon
}

const integritySeverityUiModelMap: Record<ShellIntegritySeverity, IntegritySeverityUiModel> = {
  valid: {
    tone: "success",
    label: "Valid",
    icon: CheckCircle2,
  },
  warning: {
    tone: "warning",
    label: "Warning",
    icon: TriangleAlert,
  },
  broken: {
    tone: "destructive",
    label: "Broken",
    icon: AlertCircle,
  },
  pending: {
    tone: "info",
    label: "Pending",
    icon: LoaderCircle,
  },
  neutral: {
    tone: "neutral",
    label: "Neutral",
    icon: CircleDashed,
  },
} as const satisfies Record<ShellIntegritySeverity, IntegritySeverityUiModel>

export function getIntegritySeverityUiModel(
  severity: ShellIntegritySeverity,
): IntegritySeverityUiModel {
  return integritySeverityUiModelMap[severity]
}

export interface IntegritySeverityPresentation {
  readonly badgeClassName: string
  readonly borderClassName: string
  readonly dotClassName: string
  readonly iconClassName: string
  readonly pillClassName: string
  readonly rowClassName: string
  readonly textClassName: string
}

const INTEGRITY_SEVERITY_PRESENTATION: Record<
  ShellIntegritySeverity,
  IntegritySeverityPresentation
> = {
  valid: {
    badgeClassName: `${getToneBgClass("success")} ${getToneTextClass("success")}`,
    borderClassName: "border-l-[var(--color-truth-valid)]",
    dotClassName: "bg-[var(--color-truth-valid)]",
    iconClassName: "fill-(--color-truth-valid) text-(--color-truth-valid)",
    pillClassName: "bg-truth-valid-subtle text-(--color-truth-valid)",
    rowClassName: "ui-truth-row-valid",
    textClassName: "text-(--color-truth-valid)",
  },
  warning: {
    badgeClassName: `${getToneBgClass("warning")} ${getToneTextClass("warning")}`,
    borderClassName: "border-l-[var(--color-truth-warning)]",
    dotClassName: "bg-[var(--color-truth-warning)]",
    iconClassName: "fill-(--color-truth-warning) text-(--color-truth-warning)",
    pillClassName: "bg-truth-warning-subtle text-(--color-truth-warning)",
    rowClassName: "ui-truth-row-warning",
    textClassName: "text-(--color-truth-warning)",
  },
  broken: {
    badgeClassName: `${getToneBgClass("destructive")} ${getToneTextClass("destructive")}`,
    borderClassName: "border-l-[var(--color-truth-broken)]",
    dotClassName: "bg-[var(--color-truth-broken)]",
    iconClassName: "fill-(--color-truth-broken) text-(--color-truth-broken)",
    pillClassName: "bg-truth-broken-subtle text-(--color-truth-broken)",
    rowClassName: "ui-truth-row-broken",
    textClassName: "text-(--color-truth-broken)",
  },
  pending: {
    badgeClassName: `${getToneBgClass("info")} ${getToneTextClass("info")}`,
    borderClassName: "border-l-[var(--color-truth-pending)]",
    dotClassName: "bg-[var(--color-truth-pending)]",
    iconClassName: "fill-(--color-truth-pending) text-(--color-truth-pending)",
    pillClassName: "bg-truth-pending-subtle text-(--color-truth-pending)",
    rowClassName: "ui-truth-row-pending",
    textClassName: "text-(--color-truth-pending)",
  },
  neutral: {
    badgeClassName: `${getToneBgClass("neutral")} ${getToneTextClass("neutral")}`,
    borderClassName: "border-l-[var(--color-truth-neutral)]",
    dotClassName: "bg-[var(--color-truth-neutral)]",
    iconClassName: "fill-(--color-truth-neutral) text-(--color-truth-neutral)",
    pillClassName: "bg-truth-neutral-subtle text-(--color-truth-neutral)",
    rowClassName: "ui-truth-row-neutral",
    textClassName: "text-(--color-truth-neutral)",
  },
} as const satisfies Record<ShellIntegritySeverity, IntegritySeverityPresentation>

export function getIntegritySeverityPresentation(
  severity: ShellIntegritySeverity,
): IntegritySeverityPresentation {
  return INTEGRITY_SEVERITY_PRESENTATION[severity]
}
