import { FileCheck2, ShieldCheck } from "lucide-react"

import { Button } from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

import type {
  FeatureTemplateCommand,
  FeatureTemplateCommandId,
  FeatureTemplateCommandResult,
  FeatureTemplateDefinition,
} from "../types/feature-template"

export interface EvidenceActionPanelProps {
  readonly feature: FeatureTemplateDefinition
  readonly commands: readonly FeatureTemplateCommand[]
  readonly actionResult: FeatureTemplateCommandResult | null
  readonly onRunCommand: (commandId: FeatureTemplateCommandId) => void
}

export function EvidenceActionPanel({
  feature,
  commands,
  actionResult,
  onRunCommand,
}: EvidenceActionPanelProps) {
  return (
    <aside
      className="max-w-full ui-density-panel min-w-0 overflow-hidden"
      aria-labelledby="evidence-actions-title"
    >
      <div className="border-b border-border-muted px-4 py-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-success/35 bg-success/10 text-success">
            <ShieldCheck className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 id="evidence-actions-title" className="ui-title-section">
              Evidence & Actions
            </h2>
            <p className="mt-1 text-sm wrap-break-word text-muted-foreground">
              Reviewer handoff and control-plane commands for this feature.
            </p>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-3 p-4">
        <div className="min-w-0 overflow-hidden rounded-xl border border-border-muted bg-muted/35 p-3">
          <div className="flex min-w-0 items-center gap-2">
            <FileCheck2 className="size-4 shrink-0 text-success" aria-hidden />
            <p className="min-w-0 truncate text-sm font-medium text-foreground">
              Audit packet status
            </p>
          </div>
          <p className="mt-2 text-xs leading-relaxed wrap-break-word text-muted-foreground">
            {feature.records.length} scoped records are available for evidence
            export and reviewer traceability.
          </p>
        </div>

        <div className="grid min-w-0 gap-2">
          {commands.map((command) => (
            <Button
              type="button"
              variant={
                command.id === "export-audit-pack" ? "default" : "outline"
              }
              className={cn(
                "h-auto max-w-full min-w-0 shrink whitespace-normal",
                "w-full items-stretch justify-start rounded-xl p-0 text-left focus-visible:ring-2 focus-visible:ring-ring",
                command.id !== "export-audit-pack" &&
                  "border-border-muted bg-card/55 hover:bg-accent/45"
              )}
              key={command.id}
              onClick={() => onRunCommand(command.id)}
            >
              <span className="min-w-0 px-3 py-2.5">
                <span className="block truncate text-sm font-semibold">
                  {command.label}
                </span>
                <span className="mt-1 line-clamp-2 block text-xs font-normal opacity-80">
                  {command.description}
                </span>
              </span>
            </Button>
          ))}
        </div>

        {actionResult ? (
          <p
            className="min-w-0 overflow-hidden rounded-xl border border-info/35 bg-info/10 p-3 text-sm leading-relaxed wrap-break-word text-info"
            role="status"
            aria-live="polite"
          >
            {actionResult.message}
          </p>
        ) : null}
      </div>
    </aside>
  )
}
