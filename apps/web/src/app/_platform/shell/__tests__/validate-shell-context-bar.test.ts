import { describe, expect, it } from "vitest"

import type { ShellContextBarDescriptor } from "../contract/shell-context-bar-contract"
import { validateShellContextBar } from "../services/validate-shell-context-bar"

describe("validateShellContextBar", () => {
  it("returns no issues for valid tabs and actions", () => {
    const contextBar: ShellContextBarDescriptor = {
      tabs: [
        {
          id: "overview",
          labelKey: "context_bar.events.tabs.overview",
          kind: "link",
          to: "/app/events",
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
              to: "/app/audit",
            },
          ],
        },
      ],
    }

    expect(validateShellContextBar(contextBar)).toEqual([])
  })

  it("requires at least one tab", () => {
    const contextBar: ShellContextBarDescriptor = {
      tabs: [],
      actions: [],
    }

    expect(validateShellContextBar(contextBar)).toContainEqual({
      code: "SHELL_CONTEXT_BAR_TABS_REQUIRED",
      message: "Context bar requires at least one tab.",
      path: "contextBar.tabs",
    })
  })

  it("reports invalid command and link tab payloads", () => {
    const contextBar: ShellContextBarDescriptor = {
      tabs: [
        {
          id: "bad-link",
          labelKey: "x",
          kind: "link",
          commandId: "should-not-exist",
        },
        {
          id: "bad-command",
          labelKey: "y",
          kind: "command",
          to: "/app/events",
        },
      ],
    }

    expect(validateShellContextBar(contextBar)).toEqual(
      expect.arrayContaining([
        {
          code: "SHELL_CONTEXT_BAR_TAB_MISSING_LINK_TARGET",
          message: 'Context bar link tab requires a non-empty "to".',
          path: "contextBar.tabs[0].to",
        },
        {
          code: "SHELL_CONTEXT_BAR_TAB_INVALID_LINK_CONFIGURATION",
          message: 'Context bar link tab must not define "commandId".',
          path: "contextBar.tabs[0].commandId",
        },
        {
          code: "SHELL_CONTEXT_BAR_TAB_MISSING_COMMAND_ID",
          message: 'Context bar command tab requires a non-empty "commandId".',
          path: "contextBar.tabs[1].commandId",
        },
        {
          code: "SHELL_CONTEXT_BAR_TAB_INVALID_COMMAND_CONFIGURATION",
          message: 'Context bar command tab must not define "to".',
          path: "contextBar.tabs[1].to",
        },
      ])
    )
  })

  it("reports invalid menu action configuration", () => {
    const contextBar: ShellContextBarDescriptor = {
      tabs: [
        {
          id: "overview",
          labelKey: "context_bar.events.tabs.overview",
          kind: "link",
          to: "/app/events",
        },
      ],
      actions: [
        {
          id: "menu",
          labelKey: "context_bar.events.actions.more",
          presentation: "menu",
          kind: "link",
          to: "/app/audit",
        },
      ],
    }

    expect(validateShellContextBar(contextBar)).toEqual(
      expect.arrayContaining([
        {
          code: "SHELL_CONTEXT_BAR_ACTION_MENU_INVALID_CONFIGURATION",
          message:
            "Menu context bar action must not define kind, to, or commandId on the action root.",
          path: "contextBar.actions[0]",
        },
        {
          code: "SHELL_CONTEXT_BAR_ACTION_MENU_ITEMS_REQUIRED",
          message:
            'Menu context bar action requires a non-empty "menuItems" list.',
          path: "contextBar.actions[0].menuItems",
        },
      ])
    )
  })
})
