/**
 * SHELL COMMAND ACTIVITY HOOK
 *
 * React hook exposing command activity state with subscription.
 */

import { useSyncExternalStore } from "react"

import { shellCommandActivityStore } from "../store/shell-command-activity-store-instance"

export function useShellCommandActivity(commandId: string): boolean {
  return useSyncExternalStore(
    shellCommandActivityStore.subscribe,
    () => shellCommandActivityStore.isRunning(commandId),
    () => false
  )
}
