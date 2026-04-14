import { describe, expect, it } from "vitest"

import type { ShellContextBarDescriptor } from "../contract/shell-context-bar-contract"
import { resolveShellContextBar } from "../services/resolve-shell-context-bar"

describe("resolveShellContextBar", () => {
  const contextBar: ShellContextBarDescriptor = {
    tabs: [
      {
        id: "overview",
        labelKey: "context_bar.events.tabs.overview",
        kind: "link",
        to: "/app/events/",
      },
      {
        id: "refresh-tab",
        labelKey: "context_bar.events.actions.refresh",
        kind: "command",
        commandId: "refresh-events-view",
      },
    ],
    actions: [
      {
        id: "refresh",
        labelKey: "context_bar.events.actions.refresh",
        presentation: "button",
        kind: "command",
        commandId: "refresh-events-view",
      },
      {
        id: "menu",
        labelKey: "context_bar.events.actions.more",
        presentation: "menu",
        menuItems: [
          {
            id: "open-audit",
            labelKey: "context_bar.events.actions.menu.audit",
            kind: "link",
            to: "/app/audit/",
          },
        ],
      },
    ],
  }

  it("normalizes labels and path targets", () => {
    const resolved = resolveShellContextBar({
      contextBar,
      pathname: "/app/events",
      translate: (key) => `t:${key}`,
    })

    expect(resolved).toEqual({
      tabs: [
        {
          id: "overview",
          labelKey: "context_bar.events.tabs.overview",
          label: "t:context_bar.events.tabs.overview",
          kind: "link",
          to: "/app/events",
          commandId: undefined,
          badgeCount: undefined,
          visibility: "always",
          disabled: false,
          isActive: true,
        },
        {
          id: "refresh-tab",
          labelKey: "context_bar.events.actions.refresh",
          label: "t:context_bar.events.actions.refresh",
          kind: "command",
          to: undefined,
          commandId: "refresh-events-view",
          badgeCount: undefined,
          visibility: "always",
          disabled: false,
          isActive: false,
        },
      ],
      actions: [
        {
          id: "refresh",
          labelKey: "context_bar.events.actions.refresh",
          label: "t:context_bar.events.actions.refresh",
          presentation: "button",
          kind: "command",
          to: undefined,
          commandId: "refresh-events-view",
          iconName: undefined,
          group: undefined,
          visibility: "always",
          disabled: false,
        },
        {
          id: "menu",
          labelKey: "context_bar.events.actions.more",
          label: "t:context_bar.events.actions.more",
          presentation: "menu",
          menuItems: [
            {
              id: "open-audit",
              labelKey: "context_bar.events.actions.menu.audit",
              label: "t:context_bar.events.actions.menu.audit",
              kind: "link",
              to: "/app/audit",
              commandId: undefined,
              disabled: false,
            },
          ],
          group: undefined,
          visibility: "always",
          disabled: false,
        },
      ],
    })
  })
})
