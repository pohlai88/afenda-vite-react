/**
 * SHOWCASE HERO
 *
 * Public product positioning block for the AFENDA platform preview.
 * This hero stages operational truth, visible control posture, and
 * enterprise-grade workflow density without relying on runtime shell state.
 */

import { Badge, Button } from "@afenda/design-system/ui-primitives"

import { platformPreviewFixture } from "../data/platform-preview-fixtures"

function actionVariant(kind: "primary" | "secondary" | "ghost") {
  switch (kind) {
    case "primary":
      return "default" as const
    case "secondary":
      return "outline" as const
    case "ghost":
      return "ghost" as const
  }
}

export function ShowcaseHero() {
  const { hero, scope } = platformPreviewFixture
  const [primaryAction, secondaryAction] = hero.actions
  const scopeChips = scope.chips ?? []

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-[4.5rem] md:px-8 lg:px-10">
      <div className="grid gap-[1.5rem]">
        <div className="flex flex-wrap items-center gap-[0.75rem]">
          <span className="inline-flex items-center rounded-full border border-border/70 bg-card/70 px-[0.875rem] py-[0.5rem] text-[0.75rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            {hero.eyebrow}
          </span>

          {hero.badges.map((badge) => (
            <Badge
              key={badge}
              variant="outline"
              className="rounded-full px-[0.75rem] py-[0.25rem]"
            >
              {badge}
            </Badge>
          ))}
        </div>

        <div className="grid gap-[1.5rem] lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)] lg:items-stretch">
          <div className="rounded-[2rem] border border-border/70 bg-card/45 p-[1.5rem] shadow-sm md:p-[2rem]">
            <div className="grid gap-[1.5rem]">
              <div className="grid gap-[1rem]">
                <h1 className="max-w-5xl text-[2.5rem] leading-[1.02] font-semibold tracking-[-0.04em] text-balance md:text-[3.5rem] lg:text-[4.25rem]">
                  {hero.title}
                </h1>

                <p className="max-w-3xl text-[1rem] leading-7 text-muted-foreground md:text-[1.125rem]">
                  {hero.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-[0.75rem]">
                {primaryAction ? (
                  <Button size="lg" variant={actionVariant(primaryAction.kind)}>
                    {primaryAction.label}
                  </Button>
                ) : null}

                {secondaryAction ? (
                  <Button
                    size="lg"
                    variant={actionVariant(secondaryAction.kind)}
                  >
                    {secondaryAction.label}
                  </Button>
                ) : null}
              </div>

              <div className="grid gap-[0.75rem] border-t border-border/70 pt-[1.25rem] xl:grid-cols-3">
                {hero.metrics.map((metric) => (
                  <article
                    key={metric.id}
                    className="rounded-[1.25rem] border border-border/60 bg-background/75 p-[1rem]"
                  >
                    <div className="text-[0.75rem] tracking-[0.14em] text-muted-foreground uppercase">
                      {metric.label}
                    </div>
                    <div className="mt-[0.5rem] text-[1.5rem] font-semibold tracking-tight">
                      {metric.value}
                    </div>
                    {metric.caption ? (
                      <p className="mt-[0.5rem] text-[0.875rem] leading-6 text-muted-foreground">
                        {metric.caption}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          </div>

          <aside className="grid gap-[1rem]">
            <div className="rounded-[2rem] border border-border/70 bg-card/55 p-[1.25rem] shadow-sm">
              <div className="flex items-start justify-between gap-[1rem] border-b border-border/70 pb-[0.875rem]">
                <div>
                  <div className="text-[0.75rem] tracking-[0.14em] text-muted-foreground uppercase">
                    Active operating scope
                  </div>
                  <div className="mt-[0.375rem] text-[1.25rem] font-semibold tracking-tight">
                    {scope.module}
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className="rounded-full px-[0.75rem] py-[0.25rem]"
                >
                  {scope.periodLabel ?? "Live workspace"}
                </Badge>
              </div>

              <div className="mt-[1rem] grid gap-[0.75rem]">
                {scopeChips.map((chip) => (
                  <div
                    key={chip.id}
                    className="rounded-[1.25rem] border border-border/60 bg-background/75 px-[1rem] py-[0.875rem]"
                  >
                    <div className="text-[0.75rem] tracking-[0.12em] text-muted-foreground uppercase">
                      {chip.label}
                    </div>
                    <div className="mt-[0.25rem] text-[0.95rem] font-medium tracking-tight">
                      {chip.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-border/70 bg-card/50 p-[1.25rem] shadow-sm">
              <div className="text-[0.75rem] tracking-[0.14em] text-muted-foreground uppercase">
                Why teams switch
              </div>

              <div className="mt-[0.875rem] grid gap-[0.75rem]">
                <div className="rounded-[1.25rem] border border-border/60 bg-background/75 p-[1rem]">
                  <div className="text-[0.95rem] font-medium tracking-tight">
                    Scope is visible before action
                  </div>
                  <p className="mt-[0.375rem] text-[0.875rem] leading-6 text-muted-foreground">
                    Tenant, entity, role, and working module stay present in the
                    operating surface instead of being reconstructed later.
                  </p>
                </div>

                <div className="rounded-[1.25rem] border border-border/60 bg-background/75 p-[1rem]">
                  <div className="text-[0.95rem] font-medium tracking-tight">
                    Evidence remains attached to movement
                  </div>
                  <p className="mt-[0.375rem] text-[0.875rem] leading-6 text-muted-foreground">
                    Events, controls, and operator trace move together so
                    business meaning survives approvals, escalations, and
                    review.
                  </p>
                </div>

                <div className="rounded-[1.25rem] border border-border/60 bg-background/75 p-[1rem]">
                  <div className="text-[0.95rem] font-medium tracking-tight">
                    Density stays readable during long hours
                  </div>
                  <p className="mt-[0.375rem] text-[0.875rem] leading-6 text-muted-foreground">
                    Surfaces are compact and information-rich, but calm enough
                    for serious operational work.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
