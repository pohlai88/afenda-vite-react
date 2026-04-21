import { Fragment } from "react"
import { ArrowUpRight, MoreHorizontal, RefreshCw } from "lucide-react"

import { Button } from "@afenda/design-system/ui-primitives"

import { FeatureTemplateStatusPill } from "./feature-template-status-pill"
import type {
  FeatureTemplateCommand,
  FeatureTemplateCommandId,
  FeatureTemplateDefinition,
} from "../types/feature-template"
import {
  formatFeatureTemplateLastSync,
  normalizeFeatureTemplateText,
} from "../feature-template-formatters"

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

function resolveFeatureContextLabels(
  feature: FeatureTemplateDefinition
): readonly {
  readonly key: string
  readonly label: string
  readonly translateNo?: boolean
}[] {
  const labels = [
    {
      key: "workspace",
      label: normalizeFeatureTemplateText(feature.workspaceLabel),
      translateNo: true,
    },
    {
      key: "scope",
      label: normalizeFeatureTemplateText(feature.scopeLabel),
    },
    {
      key: "last-sync",
      label: formatFeatureTemplateLastSync(feature.records),
    },
  ]

  return labels.filter(
    (
      item
    ): item is {
      readonly key: string
      readonly label: string
      readonly translateNo?: boolean
    } => item.label !== null
  )
}

export function FeatureCommandHeader({
  feature,
  commands,
  onRunCommand,
}: FeatureCommandHeaderProps) {
  const refreshCommand = resolveCommand(commands, "refresh-view")
  const exportCommand = resolveCommand(commands, "export-audit-pack")
  const reviewCommand = resolveCommand(commands, "review-queue")
  const featureContextLabels = resolveFeatureContextLabels(feature)

  return (
    <header className="ui-command-surface px-4 py-4 md:px-5">
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="ui-mono-token tracking-widest text-muted-foreground uppercase">
              Workspace Command Surface
            </p>
            <FeatureTemplateStatusPill status={feature.status} />
          </div>

          <h1 className="mt-3 max-w-3xl ui-title-hero text-balance">
            {feature.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem]">
            {feature.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {featureContextLabels.map((item, index) => (
              <Fragment key={item.key}>
                {index > 0 ? <span aria-hidden>/</span> : null}
                <span translate={item.translateNo ? "no" : undefined}>
                  {item.label}
                </span>
              </Fragment>
            ))}
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
