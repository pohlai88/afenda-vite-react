/**
 * -----------------------------------------------------------------------------
 * App Feedback State Primitive
 * -----------------------------------------------------------------------------
 * Purpose:
 * - Provide a governed shared primitive for empty / loading / error UI states.
 *
 * Rules:
 * - Feature code should use this primitive instead of ad hoc feedback blocks.
 * - Actions are explicit via `actions`, not arbitrary layout composition.
 * - Visual slots are constrained to title / description / media / actions.
 * - Translation defaults come from `shell` namespace with safe fallbacks.
 * - Variant wrappers (`AppEmptyState`, `AppLoadingState`, `AppErrorState`)
 *   are the preferred feature-level entry points.
 * -----------------------------------------------------------------------------
 */

import { memo, type ReactNode } from "react"
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

export type AppFeedbackStateVariant = "empty" | "loading" | "error"

export interface AppFeedbackStateProps {
  readonly variant: AppFeedbackStateVariant
  readonly title?: string
  readonly description?: string
  readonly icon?: ReactNode
  readonly actions?: ReactNode
  readonly className?: string
  readonly "data-slot"?: string
}

export interface AppStateVariantProps {
  readonly title?: string
  readonly description?: string
  readonly icon?: ReactNode
  readonly actions?: ReactNode
  readonly className?: string
  readonly "data-slot"?: string
}

const FALLBACK_COPY = {
  empty: {
    title: "Nothing here yet",
    description: "There is no data to display right now.",
  },
  loading: {
    title: "Loading",
    description: "Please wait while content is being prepared.",
  },
  error: {
    title: "Something went wrong",
    description: "We could not load this content right now.",
  },
} as const

const TRANSLATION_KEYS = {
  empty: {
    title: "states.empty.default_title",
    description: "states.empty.default_description",
  },
  loading: {
    title: "states.loading.default_title",
    description: "states.loading.default_description",
  },
  error: {
    title: "states.error.default_title",
    description: "states.error.default_description",
  },
} as const

function resolveSlot(variant: AppFeedbackStateVariant) {
  switch (variant) {
    case "empty":
      return "app.empty-state"
    case "loading":
      return "app.loading-state"
    case "error":
      return "app.error-state"
  }
}

function resolveCopy(args: {
  readonly variant: AppFeedbackStateVariant
  readonly title?: string
  readonly description?: string
  readonly t: ReturnType<typeof useTranslation<"shell">>["t"]
}) {
  const { variant, title, description, t } = args
  const keys = TRANSLATION_KEYS[variant]
  const fallbacks = FALLBACK_COPY[variant]

  return {
    title:
      title ??
      t(keys.title, {
        defaultValue: fallbacks.title,
      }),
    description:
      description ??
      t(keys.description, {
        defaultValue: fallbacks.description,
      }),
  }
}

/**
 * Governed state primitive for shared shell / feature feedback surfaces.
 */
export const AppFeedbackState = memo(function AppFeedbackState({
  variant,
  title,
  description,
  icon,
  actions,
  className,
  "data-slot": dataSlot,
}: AppFeedbackStateProps) {
  const { t } = useTranslation("shell")
  const copy = resolveCopy({
    variant,
    title,
    description,
    t,
  })

  return (
    <Empty
      className={cn("min-h-[12rem] border-border/80", className)}
      data-slot={dataSlot ?? resolveSlot(variant)}
      data-variant={variant}
    >
      <EmptyContent>
        <EmptyHeader>
          {icon ? (
            <EmptyMedia variant="icon" aria-hidden="true">
              {icon}
            </EmptyMedia>
          ) : null}

          <EmptyTitle>{copy.title}</EmptyTitle>
          <EmptyDescription>{copy.description}</EmptyDescription>
        </EmptyHeader>

        {actions ? (
          <div data-slot="app.feedback-state.actions" className="mt-4">
            {actions}
          </div>
        ) : null}
      </EmptyContent>
    </Empty>
  )
})

export const AppEmptyState = memo(function AppEmptyState(
  props: AppStateVariantProps
) {
  return <AppFeedbackState {...props} variant="empty" />
})

export const AppLoadingState = memo(function AppLoadingState(
  props: AppStateVariantProps
) {
  return <AppFeedbackState {...props} variant="loading" />
})

export const AppErrorState = memo(function AppErrorState(
  props: AppStateVariantProps
) {
  return <AppFeedbackState {...props} variant="error" />
})
