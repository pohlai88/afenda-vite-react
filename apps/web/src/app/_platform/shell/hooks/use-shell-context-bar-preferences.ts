import { useCallback, useMemo, useState } from "react"

import {
  parseShellContextBarPreferences,
  serializeShellContextBarPreferences,
  shellContextBarPreferencesStorageKey,
} from "../services/shell-context-bar-preferences"

export interface UseShellContextBarPreferencesResult {
  hiddenActionIds: readonly string[]
  visibleActionIds: readonly string[]
  hiddenActionIdSet: ReadonlySet<string>
  isActionVisible: (id: string) => boolean
  toggleActionVisibility: (id: string) => void
  showAllActions: () => void
}

/**
 * Per-browser visibility preferences for context-bar quick actions.
 */
export function useShellContextBarPreferences(
  actionIds: readonly string[]
): UseShellContextBarPreferencesResult {
  const [hiddenActionIds, setHiddenActionIds] = useState<readonly string[]>(
    () =>
      parseShellContextBarPreferences(
        typeof localStorage === "undefined"
          ? null
          : localStorage.getItem(shellContextBarPreferencesStorageKey),
        actionIds
      )
  )

  const hiddenActionIdSet = useMemo(
    () => new Set(hiddenActionIds),
    [hiddenActionIds]
  )

  const visibleActionIds = useMemo(
    () => actionIds.filter((id) => !hiddenActionIdSet.has(id)),
    [actionIds, hiddenActionIdSet]
  )

  const persist = useCallback((nextHiddenActionIds: readonly string[]) => {
    try {
      localStorage.setItem(
        shellContextBarPreferencesStorageKey,
        serializeShellContextBarPreferences(nextHiddenActionIds)
      )
    } catch {
      // ignore storage failures
    }
  }, [])

  const toggleActionVisibility = useCallback(
    (id: string) => {
      setHiddenActionIds((prev) => {
        const next = new Set(prev)

        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }

        const visibleCount = actionIds.filter(
          (actionId) => !next.has(actionId)
        ).length
        if (visibleCount === 0) {
          return prev
        }

        const normalized = actionIds.filter((actionId) => next.has(actionId))
        persist(normalized)
        return normalized
      })
    },
    [actionIds, persist]
  )

  const showAllActions = useCallback(() => {
    setHiddenActionIds(() => {
      persist([])
      return []
    })
  }, [persist])

  return {
    hiddenActionIds,
    visibleActionIds,
    hiddenActionIdSet,
    isActionVisible: (id) => !hiddenActionIdSet.has(id),
    toggleActionVisibility,
    showAllActions,
  }
}
