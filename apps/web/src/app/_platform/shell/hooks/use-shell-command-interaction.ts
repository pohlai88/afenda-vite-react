/**
 * SHELL COMMAND INTERACTION HOOK
 *
 * React-subscribing interaction state: `isRunning` updates trigger re-renders.
 * Policy matches `resolveShellCommandInteractionPolicy`; concurrency is enforced
 * via the same rules as `createShellCommandInteractionController`.
 *
 * Each hook instance has its own activity scope (e.g. one screen or feature).
 * For **app-wide** command running state and cross-surface disablement, use
 * `shellCommandActivityStore` / `useShellCommandActivity` / `useShellCommandRunner`.
 */

import { useCallback, useMemo, useRef, useState } from "react"

import type {
  ShellCommandInteractionContext,
  ShellCommandInteractionPolicy,
} from "../contract/shell-command-interaction-contract"
import { resolveShellCommandInteractionPolicy } from "../services/resolve-shell-command-interaction-policy"

export type ShellCommandRunResult<T> =
  | { started: false }
  | { started: true; result: T }
  | { started: true; error: unknown }

export interface UseShellCommandInteractionResult {
  isRunning: (commandId: string) => boolean
  getPolicy: (
    context: ShellCommandInteractionContext
  ) => ShellCommandInteractionPolicy
  canStart: (context: ShellCommandInteractionContext) => boolean
  start: (context: ShellCommandInteractionContext) => boolean
  finish: (commandId: string) => void
  run: <T>(
    context: ShellCommandInteractionContext,
    execute: () => Promise<T>
  ) => Promise<ShellCommandRunResult<T>>
}

export function useShellCommandInteraction(): UseShellCommandInteractionResult {
  const runningRef = useRef(new Set<string>())
  const [tick, setTick] = useState(0)

  const bump = useCallback(() => {
    setTick((t) => t + 1)
  }, [])

  const getPolicy = useCallback(
    (context: ShellCommandInteractionContext) =>
      resolveShellCommandInteractionPolicy(context),
    []
  )

  const canStart = useCallback(
    (context: ShellCommandInteractionContext) => {
      void tick
      const policy = resolveShellCommandInteractionPolicy(context)
      if (policy.concurrency === "allow" || policy.concurrency === "replace") {
        return true
      }
      return !runningRef.current.has(context.commandId)
    },
    [tick]
  )

  const isRunning = useCallback(
    (commandId: string) => {
      void tick
      return runningRef.current.has(commandId)
    },
    [tick]
  )

  const start = useCallback(
    (context: ShellCommandInteractionContext) => {
      const policy = resolveShellCommandInteractionPolicy(context)
      if (
        policy.concurrency === "block" &&
        runningRef.current.has(context.commandId)
      ) {
        return false
      }
      runningRef.current.add(context.commandId)
      bump()
      return true
    },
    [bump]
  )

  const finish = useCallback(
    (commandId: string) => {
      if (runningRef.current.delete(commandId)) {
        bump()
      }
    },
    [bump]
  )

  const run = useCallback(
    async <T>(
      context: ShellCommandInteractionContext,
      execute: () => Promise<T>
    ): Promise<ShellCommandRunResult<T>> => {
      if (!start(context)) {
        return { started: false }
      }
      try {
        const result = await execute()
        return { started: true, result }
      } catch (error) {
        return { started: true, error }
      } finally {
        finish(context.commandId)
      }
    },
    [start, finish]
  )

  return useMemo(
    () => ({
      isRunning,
      getPolicy,
      canStart,
      start,
      finish,
      run,
    }),
    [isRunning, getPolicy, canStart, start, finish, run]
  )
}
