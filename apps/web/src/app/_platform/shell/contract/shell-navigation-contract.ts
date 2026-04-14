import type { ShellNavigationLifecycleStatus } from "../constants/shell-lifecycle"
import type { ShellNavigationGroupId } from "../constants/shell-navigation-group-ids"
import type { ShellNavigationItemId } from "../constants/shell-navigation-item-ids"
import type { ShellIconName } from "../constants/shell-icon-names"
import type {
  ShellNavGroupLabelKey,
  ShellNavItemLabelKey,
} from "../types/shell-i18n-keys"

export interface ShellNavigationItem {
  readonly id: ShellNavigationItemId
  /** Stable identity; may diverge from `href` if routes move. */
  readonly routeId: ShellNavigationItemId
  readonly href: string
  readonly labelKey: ShellNavItemLabelKey
  readonly iconName: ShellIconName
  readonly groupId: ShellNavigationGroupId
  readonly order: number
  readonly permissionKeys?: readonly string[]
  readonly lifecycle: ShellNavigationLifecycleStatus
  readonly isEnabled?: boolean
}

export interface ShellNavigationGroup {
  readonly id: ShellNavigationGroupId
  readonly labelKey: ShellNavGroupLabelKey
  readonly order: number
}
