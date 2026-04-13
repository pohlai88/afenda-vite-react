/**
 * BANNER FEEDBACK PORT HOOK
 *
 * Presents prominent, persistent-style notifications. Interim implementation
 * uses Sonner with longer duration and top-center position; swap for a dedicated
 * banner region when the app provides one.
 */

import { useMemo } from "react"
import { toast } from "sonner"

import type { ShellCommandBannerPort } from "../contract/shell-command-feedback-contract"

const bannerToastOptions = {
  duration: 10_000,
  position: "top-center" as const,
}

export function useBannerPort(): ShellCommandBannerPort {
  return useMemo(
    () => ({
      show: ({ severity, message }) => {
        if (severity === "success") {
          toast.success(message, bannerToastOptions)
          return
        }
        if (severity === "error") {
          toast.error(message, bannerToastOptions)
          return
        }
        if (severity === "warning") {
          toast.warning(message, bannerToastOptions)
          return
        }
        if (severity === "info") {
          toast.info(message, bannerToastOptions)
          return
        }
        toast(message, bannerToastOptions)
      },
    }),
    []
  )
}
