import { cn } from "@afenda/design-system/utils"

import type { FeatureTemplateStatus } from "../types/feature-template"
import {
  formatFeatureTemplateStatus,
  getFeatureTemplateStatusClassName,
} from "../feature-template-policy"

export interface FeatureTemplateStatusPillProps {
  readonly status: FeatureTemplateStatus
  readonly className?: string
}

export function FeatureTemplateStatusPill({
  status,
  className,
}: FeatureTemplateStatusPillProps) {
  return (
    <span
      className={cn(
        "ui-status-pill shrink-0 px-2 py-1",
        getFeatureTemplateStatusClassName(status),
        className
      )}
    >
      {formatFeatureTemplateStatus(status)}
    </span>
  )
}
