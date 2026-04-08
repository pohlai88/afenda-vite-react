/**
 * SEMANTIC ADAPTER — truth-severity
 * Tier 2 (Governed Semantic System): multi-field presentation mapping for TruthSeverity.
 * Scope: maps each TruthSeverity value to a governed set of Tailwind class strings.
 * Authority: this file is the single source of truth for TruthSeverity presentation classes.
 * Authoring: compile-time only — no runtime Zod parsing needed for a static class registry.
 * Consumption: import getTruthSeverityPresentation from @afenda/shadcn-ui/semantic.
 * Constraints: do not re-create this mapping in apps/web or any feature code.
 * Purpose: eliminate shadow semantic layers and keep severity presentation governed.
 */
import type { TruthSeverity } from "@afenda/core/truth"

export interface TruthSeverityPresentation {
  readonly badgeClassName: string
  readonly borderClassName: string
  readonly dotClassName: string
  readonly iconClassName: string
  readonly pillClassName: string
  readonly rowClassName: string
  readonly textClassName: string
}

const TRUTH_SEVERITY_PRESENTATION: Record<
  TruthSeverity,
  TruthSeverityPresentation
> = {
  valid: {
    badgeClassName:
      "bg-[var(--color-truth-valid)] text-[var(--color-truth-valid-foreground)]",
    borderClassName: "border-l-[var(--color-truth-valid)]",
    dotClassName: "bg-[var(--color-truth-valid)]",
    iconClassName: "fill-(--color-truth-valid) text-(--color-truth-valid)",
    pillClassName: "bg-truth-valid-subtle text-(--color-truth-valid)",
    rowClassName: "ui-truth-row-valid",
    textClassName: "text-(--color-truth-valid)",
  },
  warning: {
    badgeClassName:
      "bg-[var(--color-truth-warning)] text-[var(--color-truth-warning-foreground)]",
    borderClassName: "border-l-[var(--color-truth-warning)]",
    dotClassName: "bg-[var(--color-truth-warning)]",
    iconClassName: "fill-(--color-truth-warning) text-(--color-truth-warning)",
    pillClassName: "bg-truth-warning-subtle text-(--color-truth-warning)",
    rowClassName: "ui-truth-row-warning",
    textClassName: "text-(--color-truth-warning)",
  },
  broken: {
    badgeClassName:
      "bg-[var(--color-truth-broken)] text-[var(--color-truth-broken-foreground)]",
    borderClassName: "border-l-[var(--color-truth-broken)]",
    dotClassName: "bg-[var(--color-truth-broken)]",
    iconClassName: "fill-(--color-truth-broken) text-(--color-truth-broken)",
    pillClassName: "bg-truth-broken-subtle text-(--color-truth-broken)",
    rowClassName: "ui-truth-row-broken",
    textClassName: "text-(--color-truth-broken)",
  },
  pending: {
    badgeClassName:
      "bg-[var(--color-truth-pending)] text-[var(--color-truth-pending-foreground)]",
    borderClassName: "border-l-[var(--color-truth-pending)]",
    dotClassName: "bg-[var(--color-truth-pending)]",
    iconClassName: "fill-(--color-truth-pending) text-(--color-truth-pending)",
    pillClassName: "bg-truth-pending-subtle text-(--color-truth-pending)",
    rowClassName: "ui-truth-row-pending",
    textClassName: "text-(--color-truth-pending)",
  },
  neutral: {
    badgeClassName:
      "bg-[var(--color-truth-neutral)] text-[var(--color-truth-neutral-foreground)]",
    borderClassName: "border-l-[var(--color-truth-neutral)]",
    dotClassName: "bg-[var(--color-truth-neutral)]",
    iconClassName: "fill-(--color-truth-neutral) text-(--color-truth-neutral)",
    pillClassName: "bg-truth-neutral-subtle text-(--color-truth-neutral)",
    rowClassName: "ui-truth-row-neutral",
    textClassName: "text-(--color-truth-neutral)",
  },
} as const satisfies Record<TruthSeverity, TruthSeverityPresentation>

export function getTruthSeverityPresentation(
  severity: TruthSeverity
): TruthSeverityPresentation {
  return TRUTH_SEVERITY_PRESENTATION[severity]
}
