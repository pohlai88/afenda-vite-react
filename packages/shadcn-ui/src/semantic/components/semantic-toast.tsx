import type { ReactNode } from "react"
import { AlertCircle, CheckCircle2, CircleDashed, Info, TriangleAlert } from "lucide-react"
import { toast, type ExternalToast, type ToasterProps } from "sonner"

import { Toaster } from "../../components/ui/sonner"
import { renderSemanticIcon } from "../internal/presentation"
import type { SemanticTone } from "../primitives/tone"

type SonnerSeverity = "success" | "info" | "warning" | "error"

const toastSeverityByTone: Record<SemanticTone, SonnerSeverity> = {
  brand: "info",
  success: "success",
  info: "info",
  warning: "warning",
  destructive: "error",
  neutral: "info",
}

const toastIconByTone = {
  brand: Info,
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert,
  destructive: AlertCircle,
  neutral: CircleDashed,
} as const

export interface SemanticToastOptions {
  title: ReactNode
  description?: ReactNode
  tone?: SemanticTone
  duration?: number
  action?: ExternalToast["action"]
  dismissible?: boolean
}

export function showSemanticToast({
  title,
  description,
  tone = "neutral",
  duration = 5000,
  action,
  dismissible = true,
}: SemanticToastOptions) {
  const severity = toastSeverityByTone[tone]

  return toast[severity](title, {
    description,
    duration,
    action,
    dismissible,
    icon: renderSemanticIcon(toastIconByTone[tone], "size-4"),
  })
}

export function SemanticToaster(props: ToasterProps) {
  return <Toaster closeButton richColors {...props} />
}
