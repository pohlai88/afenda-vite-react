import { describe, expect, it } from "vitest"

import type { ShellMetadata } from "../contract/shell-metadata-contract"
import { shellMetadataValidationCodes } from "../contract/shell-metadata-validation-codes"
import { validateShellMetadata } from "../services/validate-shell-metadata"

describe("validateShellMetadata headerActions", () => {
  it("returns no issues for valid header actions", () => {
    const metadata: ShellMetadata = {
      titleKey: "breadcrumb.events",
      headerActions: [
        {
          id: "create-invoice",
          labelKey: "actions.createInvoice",
          kind: "link",
          to: "/billing/invoices/create",
        },
        {
          id: "refresh",
          labelKey: "actions.refresh",
          kind: "command",
          commandId: "refresh-active-view",
          tone: "primary",
        },
      ],
    }

    expect(validateShellMetadata(metadata)).toEqual([])
  })

  it("reports an empty header action id", () => {
    const metadata: ShellMetadata = {
      titleKey: "breadcrumb.events",
      headerActions: [
        {
          id: " ",
          labelKey: "actions.refresh",
          kind: "command",
          commandId: "refresh-active-view",
        },
      ],
    }

    expect(validateShellMetadata(metadata)).toEqual([
      {
        code: shellMetadataValidationCodes.INVALID_HEADER_ACTION,
        message:
          "[SHELL_HEADER_ACTION_INVALID_ID] Header action id must not be empty.",
        path: "headerActions[0].id",
      },
    ])
  })

  it("reports duplicate header action ids", () => {
    const metadata: ShellMetadata = {
      titleKey: "breadcrumb.events",
      headerActions: [
        {
          id: "refresh",
          labelKey: "actions.refresh",
          kind: "command",
          commandId: "refresh-a",
        },
        {
          id: "refresh",
          labelKey: "actions.reload",
          kind: "command",
          commandId: "refresh-b",
        },
      ],
    }

    expect(validateShellMetadata(metadata)).toEqual([
      {
        code: shellMetadataValidationCodes.INVALID_HEADER_ACTION,
        message:
          '[SHELL_HEADER_ACTION_DUPLICATE_ID] Duplicate header action id "refresh" detected.',
        path: "headerActions[1].id",
      },
    ])
  })

  it("reports an empty header action labelKey", () => {
    const metadata: ShellMetadata = {
      titleKey: "breadcrumb.events",
      headerActions: [
        {
          id: "refresh",
          labelKey: " ",
          kind: "command",
          commandId: "refresh-active-view",
        },
      ],
    }

    expect(validateShellMetadata(metadata)).toEqual([
      {
        code: shellMetadataValidationCodes.INVALID_HEADER_ACTION,
        message:
          "[SHELL_HEADER_ACTION_INVALID_LABEL_KEY] Header action labelKey must not be empty.",
        path: "headerActions[0].labelKey",
      },
    ])
  })

  it("reports missing `to` for link actions", () => {
    const metadata: ShellMetadata = {
      titleKey: "breadcrumb.events",
      headerActions: [
        {
          id: "create",
          labelKey: "actions.create",
          kind: "link",
        },
      ],
    }

    expect(validateShellMetadata(metadata)).toEqual([
      {
        code: shellMetadataValidationCodes.INVALID_HEADER_ACTION,
        message:
          '[SHELL_HEADER_ACTION_MISSING_LINK_TARGET] Link header action requires a non-empty "to".',
        path: "headerActions[0].to",
      },
    ])
  })

  it("reports missing `commandId` for command actions", () => {
    const metadata: ShellMetadata = {
      titleKey: "breadcrumb.events",
      headerActions: [
        {
          id: "refresh",
          labelKey: "actions.refresh",
          kind: "command",
        },
      ],
    }

    expect(validateShellMetadata(metadata)).toEqual([
      {
        code: shellMetadataValidationCodes.INVALID_HEADER_ACTION,
        message:
          '[SHELL_HEADER_ACTION_MISSING_COMMAND_ID] Command header action requires a non-empty "commandId".',
        path: "headerActions[0].commandId",
      },
    ])
  })

  it("reports contradictory payload when link action defines commandId", () => {
    const metadata: ShellMetadata = {
      titleKey: "breadcrumb.events",
      headerActions: [
        {
          id: "create",
          labelKey: "actions.create",
          kind: "link",
          to: "/sales/orders/new",
          commandId: "should-not-exist",
        },
      ],
    }

    expect(validateShellMetadata(metadata)).toEqual([
      {
        code: shellMetadataValidationCodes.INVALID_HEADER_ACTION,
        message:
          '[SHELL_HEADER_ACTION_INVALID_LINK_CONFIGURATION] Link header action must not define "commandId".',
        path: "headerActions[0].commandId",
      },
    ])
  })

  it("reports contradictory payload when command action defines to", () => {
    const metadata: ShellMetadata = {
      titleKey: "breadcrumb.events",
      headerActions: [
        {
          id: "refresh",
          labelKey: "actions.refresh",
          kind: "command",
          commandId: "refresh-active-view",
          to: "/should-not-exist",
        },
      ],
    }

    expect(validateShellMetadata(metadata)).toEqual([
      {
        code: shellMetadataValidationCodes.INVALID_HEADER_ACTION,
        message:
          '[SHELL_HEADER_ACTION_INVALID_COMMAND_CONFIGURATION] Command header action must not define "to".',
        path: "headerActions[0].to",
      },
    ])
  })
})
