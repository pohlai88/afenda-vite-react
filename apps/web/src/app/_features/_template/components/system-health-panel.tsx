import { Activity, RadioTower, ShieldCheck, Waypoints } from "lucide-react"

import { cn } from "@afenda/design-system/utils"

import type { FeatureTemplateDefinition } from "../types/feature-template"
import {
  formatFeatureTemplateStatus,
  getFeatureTemplateStatusClassName,
} from "../feature-template-policy"

export interface SystemHealthPanelProps {
  readonly feature: FeatureTemplateDefinition
}

const HEALTH_ROWS = [
  {
    label: "Ingestion",
    value: "Live",
    icon: RadioTower,
  },
  {
    label: "Audit writer",
    value: "Synced",
    icon: ShieldCheck,
  },
  {
    label: "Workflow bus",
    value: "Nominal",
    icon: Waypoints,
  },
] as const

export function SystemHealthPanel({ feature }: SystemHealthPanelProps) {
  return (
    <section
      className="max-w-full ui-density-panel min-w-0 overflow-hidden p-[1rem]"
      aria-labelledby="system-health-title"
    >
      <div className="flex min-w-0 items-start justify-between gap-[0.75rem]">
        <div className="min-w-0">
          <h2 id="system-health-title" className="ui-title-section">
            System Health
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Service-state signals for the active scope.
          </p>
        </div>
        <span
          className={cn(
            "ui-status-pill shrink-0",
            getFeatureTemplateStatusClassName(feature.status)
          )}
        >
          {formatFeatureTemplateStatus(feature.status)}
        </span>
      </div>

      <div className="mt-4 grid gap-[0.5rem]">
        {HEALTH_ROWS.map((row) => {
          const Icon = row.icon

          return (
            <div
              className="flex min-w-0 items-center justify-between gap-[0.75rem] rounded-xl border border-border-muted bg-muted/30 px-3 py-2.5"
              key={row.label}
            >
              <span className="inline-flex min-w-0 items-center gap-[0.5rem] text-sm text-muted-foreground">
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{row.label}</span>
              </span>
              <span className="ui-status-pill shrink-0 border-success/35 bg-success/10 text-success">
                {row.value}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-4 min-w-0 overflow-hidden rounded-xl border border-border-muted bg-card/55 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-[0.5rem] text-sm font-medium text-foreground">
          <Activity className="size-4 shrink-0 text-info" aria-hidden />
          <span className="min-w-0 truncate">Control coverage</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed wrap-break-word text-muted-foreground">
          Scope, command, and evidence metadata are visible before operator
          action, reducing audit reconstruction work.
        </p>
      </div>
    </section>
  )
}
