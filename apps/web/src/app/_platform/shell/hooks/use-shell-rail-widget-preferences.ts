import { useCallback, useMemo, useState } from "react"

import type { ShellNavigationItemId } from "../constants/shell-navigation-item-ids"
import { shellRailWidgetSlots } from "../components/shell-rail-sidebar-block/shell-rail-widgets.config"

const STORAGE_KEY = "afenda.shell.railWidgets.v2"

/** Config order of feature ids on the rail (excludes `add`). */
const shellRailFeatureSlotOrder: readonly ShellNavigationItemId[] =
  shellRailWidgetSlots
    .filter(
      (
        s
      ): s is Extract<
        (typeof shellRailWidgetSlots)[number],
        { kind: "feature" }
      > => s.kind === "feature"
    )
    .map((s) => s.featureId)

function defaultEnabledIds(): ShellNavigationItemId[] {
  return [...shellRailFeatureSlotOrder]
}

function normalizeEnabledIds(
  ids: ReadonlySet<ShellNavigationItemId>
): ShellNavigationItemId[] {
  return shellRailFeatureSlotOrder.filter((id) => ids.has(id))
}

function loadStored(): ShellNavigationItemId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultEnabledIds()
    const parsed = JSON.parse(raw) as { enabled?: unknown }
    if (!Array.isArray(parsed.enabled)) return defaultEnabledIds()
    const allowed = new Set(shellRailFeatureSlotOrder)
    const picked = parsed.enabled.filter(
      (id): id is ShellNavigationItemId =>
        typeof id === "string" && allowed.has(id as ShellNavigationItemId)
    )
    const normalized = normalizeEnabledIds(new Set(picked))
    return normalized.length > 0 ? normalized : defaultEnabledIds()
  } catch {
    return defaultEnabledIds()
  }
}

function persist(enabled: readonly ShellNavigationItemId[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled: [...enabled] }))
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * Which **feature** rail widgets the user keeps visible. Order follows
 * `shellRailWidgetSlots`. At least one feature stays enabled.
 */
export function useShellRailWidgetPreferences() {
  const [enabledIds, setEnabledIds] = useState<ShellNavigationItemId[]>(() =>
    loadStored()
  )

  const enabledSet = useMemo(() => new Set(enabledIds), [enabledIds])

  const toggleFeature = useCallback((id: ShellNavigationItemId) => {
    setEnabledIds((prev) => {
      const s = new Set(prev)
      if (s.has(id)) {
        if (s.size <= 1) return prev
        s.delete(id)
      } else {
        s.add(id)
      }
      const next = normalizeEnabledIds(s)
      const safe = next.length > 0 ? next : prev
      persist(safe)
      return safe
    })
  }, [])

  return {
    enabledIds,
    enabledSet,
    toggleFeature,
  }
}
