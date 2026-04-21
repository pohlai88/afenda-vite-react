import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Info,
  Shield,
} from "lucide-react"

import { cn } from "@afenda/design-system/utils"

import type {
  FeatureTemplateMetric,
  FeatureTemplateTone,
} from "../types/feature-template"
import { getFeatureTemplateToneClassName } from "../feature-template-policy"

export interface OperationalMetricStripProps {
  readonly metrics: readonly FeatureTemplateMetric[]
}

function MetricIcon({ tone }: { readonly tone?: FeatureTemplateTone }) {
  const className = "size-3.5"

  switch (tone) {
    case "success":
      return <CheckCircle2 className={className} aria-hidden />
    case "warning":
      return <AlertTriangle className={className} aria-hidden />
    case "danger":
      return <Shield className={className} aria-hidden />
    case "info":
      return <Info className={className} aria-hidden />
    default:
      return <Activity className={className} aria-hidden />
  }
}

export function OperationalMetricStrip({
  metrics,
}: OperationalMetricStripProps) {
  if (metrics.length === 0) {
    return (
      <section className="ui-empty-state" aria-label="Operational metrics">
        No operational metrics are available for this workspace scope.
      </section>
    )
  }

  return (
    <section
      aria-label="Operational intelligence"
      className="grid min-w-0 gap-[0.75rem] sm:grid-cols-2 xl:grid-cols-5"
    >
      {metrics.map((metric) => (
        <article className="ui-metric-card" key={metric.id}>
          <div className="flex min-w-0 items-center justify-between gap-[0.75rem]">
            <p className="truncate text-sm text-muted-foreground">
              {metric.label}
            </p>
            <span
              className={cn(
                "ui-status-pill shrink-0 px-2 py-1",
                getFeatureTemplateToneClassName(metric.tone)
              )}
            >
              <MetricIcon tone={metric.tone} />
            </span>
          </div>
          <p className="mt-4 truncate text-3xl leading-none font-semibold tracking-tight text-foreground">
            {metric.value}
          </p>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {metric.helper}
          </p>
          {metric.trendLabel ? (
            <p
              className={cn(
                "mt-3 inline-flex max-w-full truncate rounded-full border px-2 py-1 text-xs font-medium",
                getFeatureTemplateToneClassName(metric.tone)
              )}
            >
              {metric.trendLabel}
            </p>
          ) : null}
        </article>
      ))}
    </section>
  )
}
