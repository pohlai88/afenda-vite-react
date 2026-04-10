import { type MouseEventHandler } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@afenda/shadcn-ui/components/ui/button"
import { cn } from "@afenda/shadcn-ui/lib/utils"

export interface FeedbackTriggerProps {
  onClick?: MouseEventHandler<HTMLButtonElement>
  className?: string
}

/**
 * FeedbackTrigger is a text button (Supabase style) that opens the feedback popover.
 */
export function FeedbackTrigger({ onClick, className }: FeedbackTriggerProps) {
  const { t } = useTranslation("shell")

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(className)}
      aria-label={t("feedback.aria_label", "Send feedback")}
    >
      {t("feedback.label", "Feedback")}
    </Button>
  )
}
