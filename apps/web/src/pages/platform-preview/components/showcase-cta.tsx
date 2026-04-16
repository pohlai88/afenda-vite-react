/**
 * SHOWCASE CTA
 *
 * Closing conviction block for the AFENDA platform preview.
 * This section reinforces product seriousness and converts the page
 * from staged proof into a clear next step.
 */

import { ArrowRight, ShieldCheck, Waypoints } from "lucide-react"

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

export function ShowcaseCta() {
  const { cta, proofStrip } = platformPreviewFixture
  const proofItems = proofStrip.slice(0, 3)

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-14 md:px-8 lg:px-10">
      <div className="overflow-hidden rounded-[2.25rem] border border-border/70 bg-card/55 shadow-sm">
        <div className="grid gap-[1.25rem] p-[1.25rem] md:p-[1.75rem] lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)] lg:items-stretch lg:p-[2rem]">
          <div className="rounded-4xl border border-border/60 bg-background/75 p-[1.25rem] md:p-[1.5rem]">
            <div className="flex flex-wrap items-center gap-[0.625rem]">
              <span className="inline-flex items-center rounded-full border border-border/70 bg-card/70 px-[0.85rem] py-[0.45rem] text-[0.75rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                Next step
              </span>
              <Badge
                variant="outline"
                className="rounded-full px-[0.75rem] py-[0.2rem]"
              >
                Platform walkthrough
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full px-[0.75rem] py-[0.2rem]"
              >
                Finance · Control · Audit
              </Badge>
            </div>

            <div className="mt-[1rem] max-w-3xl">
              <h2 className="text-[2rem] leading-[1.05] font-semibold tracking-[-0.03em] md:text-[2.75rem]">
                {cta.title}
              </h2>
              <p className="mt-[0.875rem] max-w-2xl text-base leading-7 text-muted-foreground">
                {cta.description}
              </p>
            </div>

            <div className="mt-[1.25rem] flex flex-wrap gap-[0.75rem]">
              {cta.actions.map((action) => (
                <Button
                  key={action.id}
                  size="lg"
                  variant={actionVariant(action.kind)}
                >
                  {action.label}
                </Button>
              ))}
            </div>

            <div className="mt-[1.25rem] grid gap-[0.75rem] border-t border-border/70 pt-[1.1rem] md:grid-cols-3">
              <div className="rounded-3xl border border-border/60 bg-card/55 p-[1rem]">
                <div className="flex items-center gap-[0.55rem] text-[0.8rem] tracking-[0.12em] text-muted-foreground uppercase">
                  <ShieldCheck className="size-4" />
                  <span>Control posture</span>
                </div>
                <div className="mt-[0.55rem] text-sm leading-6 text-foreground">
                  See how workflows expose readiness, risk, and evidence before
                  action is taken.
                </div>
              </div>

              <div className="rounded-3xl border border-border/60 bg-card/55 p-[1rem]">
                <div className="flex items-center gap-[0.55rem] text-[0.8rem] tracking-[0.12em] text-muted-foreground uppercase">
                  <Waypoints className="size-4" />
                  <span>Event continuity</span>
                </div>
                <div className="mt-[0.55rem] text-sm leading-6 text-foreground">
                  Follow how business movement, operator trace, and integration
                  signals stay connected.
                </div>
              </div>

              <div className="rounded-3xl border border-border/60 bg-card/55 p-[1rem]">
                <div className="flex items-center gap-[0.55rem] text-[0.8rem] tracking-[0.12em] text-muted-foreground uppercase">
                  <ArrowRight className="size-4" />
                  <span>Operational fit</span>
                </div>
                <div className="mt-[0.55rem] text-sm leading-6 text-foreground">
                  Evaluate whether AFENDA matches the density and discipline
                  your teams actually need.
                </div>
              </div>
            </div>
          </div>

          <aside className="grid gap-[0.875rem]">
            <div className="rounded-4xl border border-border/60 bg-background/75 p-[1.25rem]">
              <div className="text-[0.75rem] tracking-[0.13em] text-muted-foreground uppercase">
                What the walkthrough proves
              </div>

              <div className="mt-[0.875rem] space-y-[0.65rem]">
                {proofItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[1rem] border border-border/60 bg-card/55 px-[0.95rem] py-[0.85rem]"
                  >
                    <div className="text-sm font-medium tracking-tight">
                      {item.label}
                    </div>
                    {item.description ? (
                      <p className="mt-[0.3rem] text-xs leading-5 text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-4xl border border-border/60 bg-card/60 p-[1.25rem]">
              <div className="text-[0.75rem] tracking-[0.13em] text-muted-foreground uppercase">
                Positioning
              </div>
              <div className="mt-[0.5rem] text-[1.35rem] font-semibold tracking-tight">
                Not another dashboard. A visible operating system for business
                truth.
              </div>
              <p className="mt-[0.75rem] text-sm leading-6 text-muted-foreground">
                AFENDA is designed for organizations that need more than
                transaction screens, disconnected approvals, and after-the-fact
                audit reconstruction.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
