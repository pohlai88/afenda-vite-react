import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

export interface AppEmptyStateProps {
  readonly title?: string
  readonly description?: string
  readonly icon?: ReactNode
  readonly className?: string
  /** Optional actions (buttons, links) rendered below the description. */
  readonly children?: ReactNode
}

/**
 * Shared empty-state pattern for lists, tables, and feature panels (Vite SPA — no Next.js special files).
 * Defaults copy from the `shell` namespace; override `title` / `description` for feature-specific wording.
 */
export function AppEmptyState({
  title,
  description,
  icon,
  className,
  children,
}: AppEmptyStateProps) {
  const { t } = useTranslation("shell")
  const resolvedTitle = title ?? t("states.empty.default_title")
  const resolvedDescription =
    description ?? t("states.empty.default_description")

  return (
    <Empty
      className={cn("min-h-48 border-border/80", className)}
      data-slot="app.empty-state"
    >
      <EmptyContent>
        <EmptyHeader>
          {icon ? <EmptyMedia variant="icon">{icon}</EmptyMedia> : null}
          <EmptyTitle>{resolvedTitle}</EmptyTitle>
          <EmptyDescription>{resolvedDescription}</EmptyDescription>
        </EmptyHeader>
        {children}
      </EmptyContent>
    </Empty>
  )
}
