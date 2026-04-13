/**
 * TOAST PORT HOOK
 *
 * Adapts the app toast implementation to `ShellCommandToastPort` for shell
 * command feedback. Uses Sonner (`toast`) as the delivery channel.
 */

import { useMemo } from "react"
import { toast } from "sonner"

import type { ShellCommandToastPort } from "../services/shell-command-toast-adapter"

export function useToastPort(): ShellCommandToastPort {
  return useMemo(
    () => ({
      success: (message) => {
        toast.success(message)
      },
      error: (message) => {
        toast.error(message)
      },
      warning: (message) => {
        toast.warning(message)
      },
      info: (message) => {
        toast.info(message)
      },
    }),
    []
  )
}
