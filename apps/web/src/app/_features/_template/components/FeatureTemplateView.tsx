import { useParams } from "react-router-dom"

import { useFeatureTemplate } from "../hooks/use-feature-template"
import type { FeatureTemplateSlug } from "../types/feature-template"
import {
  formatFeatureTemplateStatus,
  getFeatureTemplateStatusClassName,
} from "../utils/feature-template-utils"

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

  return (
    <section className="ui-page ui-stack-relaxed">
      <header className="ui-header">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="ui-title-page">{feature.title}</h1>
          <span
            className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-medium ${getFeatureTemplateStatusClassName(
              feature.status
            )}`}
          >
            {formatFeatureTemplateStatus(feature.status)}
          </span>
        </div>
        <p className="ui-lede">{feature.description}</p>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        {feature.metrics.map((metric) => (
          <article
            className="rounded-md border border-border bg-card p-4 text-card-foreground"
            key={metric.id}
          >
            <p className="text-sm text-muted-foreground">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {metric.helper}
            </p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <section className="rounded-md border border-border bg-card text-card-foreground">
          <div className="border-b border-border p-4">
            <h2 className="text-base font-semibold">Work queue</h2>
            <p className="text-sm text-muted-foreground">
              Feature-local records shaped by the service contract.
            </p>
          </div>
          <div className="divide-y divide-border">
            {feature.records.map((record) => (
              <article className="p-4" key={record.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-medium">{record.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {record.description}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${getFeatureTemplateStatusClassName(
                      record.status
                    )}`}
                  >
                    {formatFeatureTemplateStatus(record.status)}
                  </span>
                </div>
                <dl className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                  <div>
                    <dt className="font-medium text-foreground">Owner</dt>
                    <dd>{record.owner}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">Updated</dt>
                    <dd>{new Date(record.updatedAt).toLocaleString()}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <aside className="rounded-md border border-border bg-card p-4 text-card-foreground">
          <h2 className="text-base font-semibold">Feature actions</h2>
          <div className="mt-3 grid gap-2">
            {commands.map((command) => (
              <button
                className="rounded-md border border-border px-3 py-2 text-left text-sm focus-ring hover:bg-accent hover:text-accent-foreground"
                key={command.id}
                onClick={() => {
                  runCommand(command.id)
                }}
                type="button"
              >
                <span className="block font-medium">{command.label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {command.description}
                </span>
              </button>
            ))}
          </div>

          {actionResult ? (
            <p
              className="mt-4 rounded-md border border-border bg-muted p-3 text-sm text-muted-foreground"
              role="status"
            >
              {actionResult.message}
            </p>
          ) : null}
        </aside>
      </div>
    </section>
  )
}
