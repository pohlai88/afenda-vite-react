/**
 * SHOWCASE PROOF STRIP
 *
 * Compact enterprise proof band reinforcing AFENDA's public positioning.
 * This section stages short, credible claims with light explanatory context
 * so the page feels product-serious rather than slogan-heavy.
 */

import {
  Activity,
  Eye,
  Gauge,
  ShieldCheck,
  Waypoints,
} from "lucide-react"

import { platformPreviewFixture } from "../data/platform-preview-fixtures"

function resolveProofIcon(index: number) {
  switch (index) {
    case 0:
      return Eye
    case 1:
      return Activity
    case 2:
      return ShieldCheck
    case 3:
      return Waypoints
    default:
      return Gauge
  }
}

export function ShowcaseProofStrip() {
  const { proofStrip } = platformPreviewFixture

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-[1.25rem] md:px-8 lg:px-10">
      <div className="grid gap-[0.75rem] xl:grid-cols-5">
        {proofStrip.map((item, index) => {
          const Icon = resolveProofIcon(index)

          return (
            <article
              key={item.id}
              className="group rounded-[1.5rem] border border-border/70 bg-card/50 px-[1rem] py-[1rem] shadow-sm transition-colors"
            >
              <div className="flex items-start gap-[0.875rem]">
                <div className="rounded-[1rem] border border-border/60 bg-background/80 p-[0.7rem]">
                  <Icon className="size-4" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-[0.95rem] font-semibold tracking-tight">
                    {item.label}
                  </h3>

                  {item.description ? (
                    <p className="mt-[0.35rem] text-[0.8rem] leading-5 text-muted-foreground">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
