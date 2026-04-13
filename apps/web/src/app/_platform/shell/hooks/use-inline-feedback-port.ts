/**
 * INLINE FEEDBACK PORT HOOK
 *
 * Form-adjacent or scoped messaging. Interim implementation uses Sonner with
 * bottom-center placement; replace with field/banner wiring when forms own
 * inline error state.
 */

import { useMemo } from "react"
import { toast } from "sonner"

import type { ShellCommandInlineFeedbackPort } from "../contract/shell-command-feedback-contract"

const inlineToastOptions = {
  duration: 6000,
  position: "bottom-center" as const,
}

export function useInlineFeedbackPort(): ShellCommandInlineFeedbackPort {
  return useMemo(
    () => ({
      show: ({ severity, message }) => {
        if (severity === "success") {
          toast.success(message, inlineToastOptions)
          return
        }
        if (severity === "error") {
          toast.error(message, inlineToastOptions)
          return
        }
        if (severity === "warning") {
          toast.warning(message, inlineToastOptions)
          return
        }
        if (severity === "info") {
          toast.info(message, inlineToastOptions)
          return
        }
        toast(message, inlineToastOptions)
      },
    }),
    []
  )
}
