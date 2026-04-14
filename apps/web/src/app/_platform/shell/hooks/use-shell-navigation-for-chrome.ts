import { useMemo } from "react"

import { shellRailWidgetConfig } from "../components/shell-rail-sidebar-block/shell-rail-widgets.config"
import {
  SHELL_RAIL_WIDGET_MAX_HARD,
  SHELL_RAIL_WIDGET_MAX_RECOMMENDED,
} from "../components/shell-rail-sidebar-block/shell-rail-layout"
import type { ShellNavigationItem } from "../contract/shell-navigation-contract"
import { orderNavigationItemsByRailConfig } from "../services/order-navigation-by-rail-config"
import { useShellNavigation } from "./use-shell-navigation"

/**
 * Navigation items for **shell chrome** (rail + labels panel): permission-filtered
 * catalog, then **widget config** (order + subset). Brand slot is separate.
 */
export function useShellNavigationForChrome(): readonly ShellNavigationItem[] {
  const base = useShellNavigation()

  return useMemo(() => {
    const ordered = orderNavigationItemsByRailConfig(
      base,
      shellRailWidgetConfig.enabledFeatureIds
    )

    if (import.meta.env.DEV && ordered.length > SHELL_RAIL_WIDGET_MAX_HARD) {
      console.warn(
        `[shell] Rail widget count (${ordered.length}) exceeds recommended max (${SHELL_RAIL_WIDGET_MAX_RECOMMENDED}) and hard cap (${SHELL_RAIL_WIDGET_MAX_HARD}). Consider overflow UI.`
      )
    }

    return ordered
  }, [base])
}
