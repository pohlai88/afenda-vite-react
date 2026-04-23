import { shellNavigationItems } from "../policy/shell-navigation-policy"
import { filterShellNavigationItems } from "./filter-shell-navigation-items"

export function resolveShellHomeHref(
  permissions: ReadonlySet<string> | readonly string[]
): string | null {
  return (
    filterShellNavigationItems(shellNavigationItems, { permissions }).find(
      (item) => item.lifecycle === "active"
    )?.href ?? null
  )
}
