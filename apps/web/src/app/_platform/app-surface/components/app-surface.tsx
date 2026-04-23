import { Fragment } from "react"
import { Link } from "react-router-dom"

import { Button } from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

import type { AppSurfaceProps } from "../contract/app-surface-contract"
import { validateAppSurfaceContract } from "../services/validate-app-surface-contract"

function resolveSurfaceBadgeLabel(kind: AppSurfaceProps["contract"]["kind"]) {
  return kind === "truth" ? "Truth surface" : "Workspace surface"
}

function resolveSurfaceBadgeClassName(
  kind: AppSurfaceProps["contract"]["kind"]
): string {
  return kind === "truth"
    ? "border-secondary/30 bg-secondary/10 text-secondary-foreground"
    : "border-primary/25 bg-primary/10 text-foreground"
}

function renderAction(
  action: NonNullable<AppSurfaceProps["contract"]["header"]["actions"]>[number]
) {
  const variant = action.variant ?? "outline"

  if (action.kind === "link" && action.href) {
    return (
      <Button
        key={action.id}
        asChild
        variant={variant}
        disabled={action.disabled}
      >
        <Link to={action.href}>{action.label}</Link>
      </Button>
    )
  }

  return (
    <Button
      key={action.id}
      type="button"
      variant={variant}
      disabled={action.disabled}
      onClick={action.onAction}
    >
      {action.label}
    </Button>
  )
}

export function AppSurface(props: AppSurfaceProps) {
  const { contract, children, className } = props

  validateAppSurfaceContract(contract)

  return (
    <section
      className={cn("ui-page ui-stack-relaxed", className)}
      data-slot="app.surface"
      data-surface-kind={contract.kind}
    >
      <header className="ui-command-surface px-4 py-4 md:px-5">
        <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="ui-mono-token tracking-widest text-muted-foreground uppercase">
                {contract.header.kicker ??
                  (contract.kind === "truth"
                    ? "Truth audit"
                    : "Operating surface")}
              </p>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                  resolveSurfaceBadgeClassName(contract.kind)
                )}
              >
                {resolveSurfaceBadgeLabel(contract.kind)}
              </span>
            </div>
            <h1 className="mt-3 ui-title-hero text-balance">
              {contract.header.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem]">
              {contract.header.description}
            </p>
            {contract.metaRow?.items.length ? (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {contract.metaRow.items.map((item, index) => (
                  <Fragment key={item.id}>
                    {index > 0 ? <span aria-hidden>/</span> : null}
                    <span>
                      <span className="sr-only">{item.label}: </span>
                      {item.value}
                    </span>
                  </Fragment>
                ))}
              </div>
            ) : null}
          </div>
          {contract.header.actions?.length ? (
            <div
              className="flex flex-wrap items-center gap-3"
              data-slot="app.surface.actions"
            >
              {contract.header.actions.map(renderAction)}
            </div>
          ) : null}
        </div>
      </header>

      <div data-slot="app.surface.content">{children}</div>
    </section>
  )
}
