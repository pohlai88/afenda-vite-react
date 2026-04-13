import { describe, expect, it } from "vitest"

import type { ShellHeaderActionDescriptor } from "../contract/shell-header-action-contract"
import { resolveShellHeaderActions } from "../services/resolve-shell-header-actions"

describe("resolveShellHeaderActions", () => {
  const translate = (key: string): string => `t:${key}`

  it("returns an empty array when no actions are provided", () => {
    expect(
      resolveShellHeaderActions({
        actions: [],
        translate,
      })
    ).toEqual([])
  })

  it("resolves link actions with normalized target paths", () => {
    const actions: readonly ShellHeaderActionDescriptor[] = [
      {
        id: "create-invoice",
        labelKey: "actions.createInvoice",
        kind: "link",
        to: "/billing/invoices/create/",
      },
    ]

    expect(
      resolveShellHeaderActions({
        actions,
        translate,
      })
    ).toEqual([
      {
        id: "create-invoice",
        labelKey: "actions.createInvoice",
        label: "t:actions.createInvoice",
        kind: "link",
        to: "/billing/invoices/create",
        commandId: undefined,
        icon: undefined,
        emphasis: "default",
        isDisabled: false,
      },
    ])
  })

  it("resolves command actions with trimmed command ids", () => {
    const actions: readonly ShellHeaderActionDescriptor[] = [
      {
        id: "refresh",
        labelKey: "actions.refresh",
        kind: "command",
        commandId: " refresh-active-view ",
        emphasis: "primary",
        isDisabled: true,
      },
    ]

    expect(
      resolveShellHeaderActions({
        actions,
        translate,
      })
    ).toEqual([
      {
        id: "refresh",
        labelKey: "actions.refresh",
        label: "t:actions.refresh",
        kind: "command",
        to: undefined,
        commandId: "refresh-active-view",
        icon: undefined,
        emphasis: "primary",
        isDisabled: true,
      },
    ])
  })

  it("normalizes blank icon values to undefined", () => {
    const actions: readonly ShellHeaderActionDescriptor[] = [
      {
        id: "open-help",
        labelKey: "actions.help",
        kind: "command",
        commandId: "open-help",
        icon: " ",
      },
    ]

    const result = resolveShellHeaderActions({
      actions,
      translate,
    })

    expect(result[0]?.icon).toBeUndefined()
  })

  it("uses the supplied translator for final labels", () => {
    const actions: readonly ShellHeaderActionDescriptor[] = [
      {
        id: "new-order",
        labelKey: "actions.newOrder",
        kind: "link",
        to: "/sales/orders/new",
      },
    ]

    const result = resolveShellHeaderActions({
      actions,
      translate: (key) => `resolved:${key}`,
    })

    expect(result[0]?.label).toBe("resolved:actions.newOrder")
  })
})
