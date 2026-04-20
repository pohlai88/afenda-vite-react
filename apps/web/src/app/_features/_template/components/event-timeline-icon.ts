type TimelineCategoryIconKind = "default" | "integration" | "workflow"

const TIMELINE_CATEGORY_ICON_KIND_BY_CATEGORY = {
  Integration: "integration",
  Webhook: "integration",
  Workflow: "workflow",
  Policy: "workflow",
} as const satisfies Partial<Record<string, TimelineCategoryIconKind>>

export function resolveTimelineIconKind(
  category?: string
): TimelineCategoryIconKind {
  if (!category) {
    return "default"
  }

  if (
    Object.prototype.hasOwnProperty.call(
      TIMELINE_CATEGORY_ICON_KIND_BY_CATEGORY,
      category
    )
  ) {
    return TIMELINE_CATEGORY_ICON_KIND_BY_CATEGORY[
      category as keyof typeof TIMELINE_CATEGORY_ICON_KIND_BY_CATEGORY
    ]
  }

  return "default"
}
