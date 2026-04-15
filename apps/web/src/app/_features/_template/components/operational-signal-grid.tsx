import { Network, NotebookPen, Radar } from "lucide-react"

import type { FeatureTemplateDefinition } from "../types/feature-template"

export interface OperationalSignalGridProps {
  readonly feature: FeatureTemplateDefinition
}

const SIGNALS = [
  {
    title: "Audit Coverage",
    description:
      "Policy checks, actor identity, and scope lineage are attached.",
    icon: Radar,
  },
  {
    title: "Integration Signals",
    description: "Connector events stay tied to ledger-visible state changes.",
    icon: Network,
  },
  {
    title: "Operator Notes",
    description:
      "Review comments can be linked back to the source event stream.",
    icon: NotebookPen,
  },
] as const

export function OperationalSignalGrid({ feature }: OperationalSignalGridProps) {
  return (
    <section
      aria-label="Operational assurance"
      className="grid gap-3 lg:grid-cols-3"
    >
      {SIGNALS.map((signal) => {
        const Icon = signal.icon

        return (
          <article className="ui-density-panel p-4" key={signal.title}>
            <div className="flex min-w-0 items-start gap-3">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-info/35 bg-info/10 text-info">
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-foreground">
                  {signal.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {signal.description}
                </p>
                <p className="mt-3 ui-mono-token text-muted-foreground">
                  <span translate="no">{feature.slug}</span> / active scope
                </p>
              </div>
            </div>
          </article>
        )
      })}
    </section>
  )
}
