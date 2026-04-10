import { type ReactNode } from "react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { getAlertToneClass } from "../../lib/constant/semantic/tone"
import { cn } from "../../lib/utils"
import type { SemanticEmphasis } from "../primitives/emphasis"
import type { SemanticTone } from "../primitives/tone"

export const SemanticDialog = Dialog
export const SemanticDialogTrigger = DialogTrigger
export const SemanticDialogClose = DialogClose

export interface SemanticDialogContentProps {
  tone?: SemanticTone
  emphasis?: SemanticEmphasis
  title?: ReactNode
  description?: ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "full"
  children?: ReactNode
  actions?: ReactNode
  className?: string
}

export function SemanticDialogContent({
  tone = "neutral",
  emphasis = "soft",
  title,
  description,
  size = "md",
  children,
  actions,
  className,
}: SemanticDialogContentProps) {
  return (
    <DialogContent
      size={size}
      data-slot="semantic-dialog-content"
      className={cn("overflow-hidden p-0", className)}
    >
      <DialogHeader
        className={cn(
          "border-b px-6 py-4",
          getAlertToneClass(tone, emphasis)
        )}
      >
        {title ? <DialogTitle>{title}</DialogTitle> : null}
        {description ? <DialogDescription>{description}</DialogDescription> : null}
      </DialogHeader>
      <div className="px-6 py-5">{children}</div>
      {actions ? <DialogFooter className="border-t px-6 py-4">{actions}</DialogFooter> : null}
    </DialogContent>
  )
}
