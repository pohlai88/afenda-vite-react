/**
 * VALIDATE SHELL HEADER ACTIONS
 *
 * Validator for declarative shell header action descriptors.
 * Protects shell consumers from malformed interactive metadata.
 */

import type { ShellHeaderActionDescriptor } from "../contract/shell-header-action-contract"

export interface ShellHeaderActionValidationIssue {
  code:
    | "SHELL_HEADER_ACTION_INVALID_ID"
    | "SHELL_HEADER_ACTION_DUPLICATE_ID"
    | "SHELL_HEADER_ACTION_INVALID_LABEL_KEY"
    | "SHELL_HEADER_ACTION_INVALID_KIND"
    | "SHELL_HEADER_ACTION_MISSING_COMMAND_ID"
    | "SHELL_HEADER_ACTION_MISSING_LINK_TARGET"
    | "SHELL_HEADER_ACTION_INVALID_COMMAND_CONFIGURATION"
    | "SHELL_HEADER_ACTION_INVALID_LINK_CONFIGURATION"
  message: string
  path: string
}

export function validateShellHeaderActions(
  actions: readonly ShellHeaderActionDescriptor[]
): ShellHeaderActionValidationIssue[] {
  const issues: ShellHeaderActionValidationIssue[] = []
  const seenIds = new Set<string>()

  for (const [index, action] of actions.entries()) {
    const basePath = `headerActions[${index}]`
    const normalizedId = action.id.trim()
    const normalizedLabelKey = action.labelKey.trim()
    const normalizedCommandId = action.commandId?.trim()
    const normalizedTo = action.to?.trim()

    const kind = action.kind
    if (kind !== "link" && kind !== "command") {
      issues.push({
        code: "SHELL_HEADER_ACTION_INVALID_KIND",
        message: `Unsupported header action kind "${String(kind)}".`,
        path: `${basePath}.kind`,
      })
      continue
    }

    if (normalizedId.length === 0) {
      issues.push({
        code: "SHELL_HEADER_ACTION_INVALID_ID",
        message: "Header action id must not be empty.",
        path: `${basePath}.id`,
      })
    } else if (seenIds.has(normalizedId)) {
      issues.push({
        code: "SHELL_HEADER_ACTION_DUPLICATE_ID",
        message: `Duplicate header action id "${normalizedId}" detected.`,
        path: `${basePath}.id`,
      })
    } else {
      seenIds.add(normalizedId)
    }

    if (normalizedLabelKey.length === 0) {
      issues.push({
        code: "SHELL_HEADER_ACTION_INVALID_LABEL_KEY",
        message: "Header action labelKey must not be empty.",
        path: `${basePath}.labelKey`,
      })
    }

    if (kind === "command") {
      if (!normalizedCommandId) {
        issues.push({
          code: "SHELL_HEADER_ACTION_MISSING_COMMAND_ID",
          message: 'Command header action requires a non-empty "commandId".',
          path: `${basePath}.commandId`,
        })
      }

      if (normalizedTo) {
        issues.push({
          code: "SHELL_HEADER_ACTION_INVALID_COMMAND_CONFIGURATION",
          message: 'Command header action must not define "to".',
          path: `${basePath}.to`,
        })
      }
    }

    if (kind === "link") {
      if (!normalizedTo) {
        issues.push({
          code: "SHELL_HEADER_ACTION_MISSING_LINK_TARGET",
          message: 'Link header action requires a non-empty "to".',
          path: `${basePath}.to`,
        })
      }

      if (normalizedCommandId) {
        issues.push({
          code: "SHELL_HEADER_ACTION_INVALID_LINK_CONFIGURATION",
          message: 'Link header action must not define "commandId".',
          path: `${basePath}.commandId`,
        })
      }
    }
  }

  return issues
}
