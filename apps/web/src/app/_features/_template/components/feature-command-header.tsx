import { ArrowUpRight, MoreHorizontal, RefreshCw } from "lucide-react"

import { Button } from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

import type {
  FeatureTemplateCommand,
  FeatureTemplateCommandId,
  FeatureTemplateDefinition,
} from "../types/feature-template"
import {
  formatFeatureTemplateStatus,
  getFeatureTemplateStatusClassName,
} from "../utils/feature-template-utils"

const LAST_SYNC_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

export interface FeatureCommandHeaderProps {
  readonly feature: FeatureTemplateDefinition
  readonly commands: readonly FeatureTemplateCommand[]
  readonly onRunCommand: (commandId: FeatureTemplateCommandId) => void
}

function resolveCommand(
  commands: readonly FeatureTemplateCommand[],
  id: FeatureTemplateCommandId
): FeatureTemplateCommand | undefined {
  return commands.find((command) => command.id === id)
}

function formatLastSync(feature: FeatureTemplateDefinition): string {
  const latest = feature.records[0]
  if (!latest) {
    return "No records observed"
  }

  return `Last sync ${LAST_SYNC_FORMATTER.format(new Date(latest.updatedAt))}`
}

export function FeatureCommandHeader({
  feature,
  commands,
  onRunCommand,
}: FeatureCommandHeaderProps) {
  const refreshCommand = resolveCommand(commands, "refresh-view")
  const exportCommand = resolveCommand(commands, "export-audit-pack")
  const reviewCommand = resolveCommand(commands, "review-queue")

  return (
    <header className="ui-command-surface px-4 py-4 md:px-5">
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="ui-mono-token tracking-widest text-muted-foreground uppercase">
              Workspace Command Surface
            </p>
            <span
              className={cn(
                "ui-status-pill",
                getFeatureTemplateStatusClassName(feature.status)
              )}
            >
              {formatFeatureTemplateStatus(feature.status)}
            </span>
          </div>

          <h1 className="mt-3 max-w-3xl ui-title-hero text-balance">
            {feature.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem]">
            {feature.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span translate="no">Acme Treasury Ltd</span>
            <span aria-hidden>/</span>
            <span>Finance / Accounts payable</span>
            <span aria-hidden>/</span>
            <span>{formatLastSync(feature)}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {refreshCommand ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-2 rounded-full border-border-muted bg-card/70 focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => onRunCommand(refreshCommand.id)}
            >
              <RefreshCw className="size-3.5" aria-hidden />
              {refreshCommand.label}
            </Button>
          ) : null}

          {exportCommand ? (
            <Button
              type="button"
              size="sm"
              className="gap-2 rounded-full focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => onRunCommand(exportCommand.id)}
            >
              <ArrowUpRight className="size-3.5" aria-hidden />
              {exportCommand.label}
            </Button>
          ) : null}

          {reviewCommand ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="gap-2 rounded-full text-muted-foreground hover:bg-accent/55 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => onRunCommand(reviewCommand.id)}
            >
              <MoreHorizontal className="size-3.5" aria-hidden />
              More
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
