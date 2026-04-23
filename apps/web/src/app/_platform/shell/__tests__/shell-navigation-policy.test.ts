import { describe, expect, it } from "vitest"

import type { ShellNavigationItem } from "../contract/shell-navigation-contract"
import { shellNavigationItems } from "../policy/shell-navigation-policy"
import { filterShellNavigationItems } from "../services/filter-shell-navigation-items"

describe("filterShellNavigationItems", () => {
  it("returns the same ordered items when no permission gates apply", () => {
    const result = filterShellNavigationItems(shellNavigationItems, {
      permissions: ["ops:event:view", "ops:audit:view"],
    })
    expect(result.map((i) => i.id)).toEqual([
      "events",
      "audit",
      "counterparties",
      "my_project",
      "my_team",
      "my_report",
      "my_claim",
    ])
  })

  it("hides items when required permission keys are missing", () => {
    const items: ShellNavigationItem[] = [
      {
        id: "events",
        routeId: "events",
        href: "/app/events",
        labelKey: "nav.items.events",
        iconName: "ListIcon",
        groupId: "workspace",
        order: 0,
        lifecycle: "active",
        permissionKeys: ["a"],
      },
    ]
    expect(filterShellNavigationItems(items, { permissions: [] }).length).toBe(
      0
    )
    expect(
      filterShellNavigationItems(items, { permissions: ["a"] }).length
    ).toBe(1)
  })

  it("removes disabled lifecycle items from the sidebar list", () => {
    const items: ShellNavigationItem[] = [
      {
        id: "events",
        routeId: "events",
        href: "/app/events",
        labelKey: "nav.items.events",
        iconName: "ListIcon",
        groupId: "workspace",
        order: 0,
        lifecycle: "disabled",
      },
    ]
    expect(filterShellNavigationItems(items, { permissions: [] })).toEqual([])
  })

  it("keeps comingSoon items in the list (non-navigation handled in UI)", () => {
    const items: ShellNavigationItem[] = [
      {
        id: "events",
        routeId: "events",
        href: "/app/events",
        labelKey: "nav.items.events",
        iconName: "ListIcon",
        groupId: "workspace",
        order: 0,
        lifecycle: "comingSoon",
      },
    ]
    expect(filterShellNavigationItems(items, { permissions: [] })).toHaveLength(
      1
    )
  })
})
