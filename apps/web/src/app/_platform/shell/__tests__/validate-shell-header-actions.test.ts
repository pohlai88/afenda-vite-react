import { describe, expect, it } from "vitest"

import type { ShellHeaderActionDescriptor } from "../contract/shell-header-action-contract"
import { validateShellHeaderActions } from "../services/validate-shell-header-actions"

describe("validateShellHeaderActions", () => {
  it("returns no issues for valid actions", () => {
    const actions: readonly ShellHeaderActionDescriptor[] = [
      {
        id: "refresh",
        labelKey: "actions.refresh",
        kind: "command",
        commandId: "dashboard.refresh",
      },
      {
        id: "create",
        labelKey: "actions.create",
        kind: "link",
        to: "/orders/new",
      },
    ]

    expect(validateShellHeaderActions(actions)).toEqual([])
  })

  it("reports empty id", () => {
    const actions: readonly ShellHeaderActionDescriptor[] = [
      {
        id: " ",
        labelKey: "actions.refresh",
        kind: "command",
        commandId: "dashboard.refresh",
      },
    ]

    expect(validateShellHeaderActions(actions)).toEqual([
      {
        code: "SHELL_HEADER_ACTION_INVALID_ID",
        message: "Header action id must not be empty.",
        path: "headerActions[0].id",
      },
    ])
  })

  it("reports duplicate ids", () => {
    const actions: readonly ShellHeaderActionDescriptor[] = [
      {
        id: "refresh",
        labelKey: "actions.refresh",
        kind: "command",
        commandId: "dashboard.refresh",
      },
      {
        id: "refresh",
        labelKey: "actions.retry",
        kind: "command",
        commandId: "dashboard.retry",
      },
    ]

    expect(validateShellHeaderActions(actions)).toEqual([
      {
        code: "SHELL_HEADER_ACTION_DUPLICATE_ID",
        message: 'Duplicate header action id "refresh" detected.',
        path: "headerActions[1].id",
      },
    ])
  })

  it("reports missing commandId for command actions", () => {
    const actions: readonly ShellHeaderActionDescriptor[] = [
      {
        id: "refresh",
        labelKey: "actions.refresh",
        kind: "command",
      },
    ]

    expect(validateShellHeaderActions(actions)).toEqual([
      {
        code: "SHELL_HEADER_ACTION_MISSING_COMMAND_ID",
        message: 'Command header action requires a non-empty "commandId".',
        path: "headerActions[0].commandId",
      },
    ])
  })

  it("reports invalid command configuration when `to` is present", () => {
    const actions: readonly ShellHeaderActionDescriptor[] = [
      {
        id: "refresh",
        labelKey: "actions.refresh",
        kind: "command",
        commandId: "dashboard.refresh",
        to: "/dashboard",
      },
    ]

    expect(validateShellHeaderActions(actions)).toEqual([
      {
        code: "SHELL_HEADER_ACTION_INVALID_COMMAND_CONFIGURATION",
        message: 'Command header action must not define "to".',
        path: "headerActions[0].to",
      },
    ])
  })

  it("reports missing `to` for link actions", () => {
    const actions: readonly ShellHeaderActionDescriptor[] = [
      {
        id: "create",
        labelKey: "actions.create",
        kind: "link",
      },
    ]

    expect(validateShellHeaderActions(actions)).toEqual([
      {
        code: "SHELL_HEADER_ACTION_MISSING_LINK_TARGET",
        message: 'Link header action requires a non-empty "to".',
        path: "headerActions[0].to",
      },
    ])
  })

  it("reports invalid link configuration when commandId is present", () => {
    const actions: readonly ShellHeaderActionDescriptor[] = [
      {
        id: "create",
        labelKey: "actions.create",
        kind: "link",
        to: "/orders/new",
        commandId: "orders.create",
      },
    ]

    expect(validateShellHeaderActions(actions)).toEqual([
      {
        code: "SHELL_HEADER_ACTION_INVALID_LINK_CONFIGURATION",
        message: 'Link header action must not define "commandId".',
        path: "headerActions[0].commandId",
      },
    ])
  })
})
