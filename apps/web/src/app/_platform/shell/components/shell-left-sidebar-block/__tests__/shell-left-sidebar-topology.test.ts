import type { TFunction } from "i18next"
import { describe, expect, it, vi } from "vitest"

import { shellNavigationItems } from "../../../policy/shell-navigation-policy"
import {
  buildShellLeftSidebarNavigationModel,
  resolveShellLeftSidebarActiveModuleId,
  resolveShellLeftSidebarActiveSubmoduleId,
} from "../shell-left-sidebar-topology"

const t = ((key: string) => key) as TFunction<"shell">
const enabledWidgetIds = new Set(shellNavigationItems.map((item) => item.id))

describe("shell-left-sidebar-topology", () => {
  it("resolves the active module and submodule from location state", () => {
    expect(
      resolveShellLeftSidebarActiveModuleId("/app/events", shellNavigationItems)
    ).toBe("events")
    expect(
      resolveShellLeftSidebarActiveSubmoduleId("?view=activity", "events")
    ).toBe("activity")
    expect(resolveShellLeftSidebarActiveSubmoduleId("", "audit")).toBe("trail")
  })

  it("builds a sectioned explorer model from the canonical shell policy", () => {
    const model = buildShellLeftSidebarNavigationModel({
      t,
      pathname: "/app/events",
      search: "?view=activity",
      allowedItems: shellNavigationItems,
      enabledWidgetIds,
      toggleWidget: vi.fn(),
    })

    expect(model.activeModuleId).toBe("events")
    expect(model.activeSubmoduleId).toBe("activity")
    expect(model.moduleSections).toHaveLength(3)
    expect(model.moduleSections[0]?.label).toBe("nav.workspace.section_primary")
    expect(model.moduleSections[0]?.items[0]?.label).toBe("nav.items.events")
    expect(model.moduleSections[0]?.items[0]?.submoduleCount).toBe(2)
    expect(model.widgetShelf.label).toBe("nav.workspace.section_app")
    expect(model.widgetShelf.items).toHaveLength(8)
    expect(model.widgetShelf.items[0]?.description).toBe(
      "nav.widgets.customize"
    )
    expect(model.widgetShelf.items[4]?.description).toBe(
      "nav.lifecycle.coming_soon"
    )
  })
})
