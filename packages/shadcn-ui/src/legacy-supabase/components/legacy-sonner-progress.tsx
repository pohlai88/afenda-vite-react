import { Loader2 } from "lucide-react"
import type * as React from "react"

import { Progress } from "@/components/ui/progress"

/**
 * Progress + message layout for Sonner toasts (legacy Supabase pattern).
 *
 * @example
 * toast.loading(
 *   <LegacySonnerProgress progress={0} message="Downloading files..." />,
 *   { id: toastId, closeButton: false },
 * )
 */
export function LegacySonnerProgress({
  progress,
  progressPrefix,
  action,
  message,
  description = "Please do not close the browser",
}: {
  progress: number
  progressPrefix?: string
  action?: React.ReactNode
  message: string
  description?: string
}) {
  return (
    <div className="flex w-full gap-3">
      <Loader2 className="mt-0.5 size-4 animate-spin text-foreground-muted" />
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full justify-between">
          <p className="text-sm text-foreground">{message}</p>
          <p className="font-mono text-sm text-foreground-light">
            {progressPrefix ?? ""}
            {`${Number(progress).toFixed(0)}%`}
          </p>
        </div>
        <Progress value={progress} className="w-full" />
        <div className="flex flex-row items-center justify-between gap-2">
          <small className="text-xs text-foreground-lighter">{description}</small>
          {action}
        </div>
      </div>
    </div>
  )
}
