import {
  AppFeedbackState,
  type AppFeedbackStateVariant,
} from "@/app/_components"
import { cn } from "@afenda/design-system/utils"

import type { StateSurfaceProps } from "../contract/app-surface-contract"

function resolveFeedbackVariant(
  kind: StateSurfaceProps["kind"]
): AppFeedbackStateVariant {
  switch (kind) {
    case "empty":
      return "empty"
    case "loading":
      return "loading"
    case "failure":
    case "forbidden":
      return "error"
  }
}

function resolveSurfaceToneClassName(
  surfaceKind: StateSurfaceProps["surfaceKind"]
): string {
  return surfaceKind === "truth"
    ? "border-l-2 border-l-secondary/45"
    : "border-l-2 border-l-primary/40"
}

export function StateSurface(props: StateSurfaceProps) {
  const { surfaceKind, kind, title, description, actions, icon, className } =
    props

  return (
    <section
      className={cn("ui-page ui-stack-relaxed", className)}
      data-surface-kind={surfaceKind}
      data-state-kind={kind}
    >
      <AppFeedbackState
        variant={resolveFeedbackVariant(kind)}
        title={title}
        description={description}
        actions={actions}
        icon={icon}
        className={resolveSurfaceToneClassName(surfaceKind)}
        data-slot="app.state-surface"
      />
    </section>
  )
}
