import { useParams } from "react-router-dom"

import { EvidenceActionPanel } from "./evidence-action-panel"
import { EventTimelinePanel } from "./event-timeline-panel"
import { FeatureCommandHeader } from "./feature-command-header"
import { OperationalMetricStrip } from "./operational-metric-strip"
import { OperationalSignalGrid } from "./operational-signal-grid"
import { PriorityQueuePanel } from "./priority-queue-panel"
import { SystemHealthPanel } from "./system-health-panel"
import { useFeatureTemplate } from "../hooks/use-feature-template"
import type { FeatureTemplateRecord } from "../types/feature-template"
import type { FeatureTemplateSlug } from "../types/feature-template"

export interface FeatureTemplateViewProps {
  /** When routes use static paths (e.g. `/app/events`), pass slug explicitly. */
  readonly slug?: FeatureTemplateSlug
}

/**
 * Copyable ERP feature template: route input -> hook -> service/action model -> view.
 */
export function FeatureTemplateView({
  slug: slugProp,
}: FeatureTemplateViewProps) {
  const { slug: paramSlug = "" } = useParams<{ slug: string }>()
  const slug = slugProp ?? paramSlug
  const { actionResult, commands, feature, isLoading, runCommand } =
    useFeatureTemplate(slug)

  if (isLoading || !feature) {
    return (
      <section className="ui-page ui-stack-relaxed" aria-busy="true">
        <p className="text-sm text-muted-foreground">Loading feature…</p>
      </section>
    )
  }

  function handleOpenRecord(_record: FeatureTemplateRecord): void {
    runCommand("open-primary-record")
  }

  return (
    <section className="ui-page ui-stack-relaxed">
      <FeatureCommandHeader
        feature={feature}
        commands={commands}
        onRunCommand={runCommand}
      />

      <OperationalMetricStrip metrics={feature.metrics} />

      <div className="ui-workbench-grid">
        <PriorityQueuePanel
          records={feature.records}
          onOpenRecord={handleOpenRecord}
        />
        <EventTimelinePanel records={feature.records} />
        <div className="grid min-w-0 gap-4">
          <EvidenceActionPanel
            feature={feature}
            commands={commands}
            actionResult={actionResult}
            onRunCommand={runCommand}
          />
          <SystemHealthPanel feature={feature} />
        </div>
      </div>

      <OperationalSignalGrid feature={feature} />
    </section>
  )
}
