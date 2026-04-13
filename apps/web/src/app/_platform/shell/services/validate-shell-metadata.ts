/**
 * VALIDATE SHELL METADATA
 *
 * Field-level shell metadata checks. Catalog/system truth uses `assert-shell-route-catalog`.
 */

import type { ShellMetadata } from "../contract/shell-metadata-contract"
import type { ShellMetadataValidationCode } from "../contract/shell-metadata-validation-codes"
import { shellMetadataValidationCodes } from "../contract/shell-metadata-validation-codes"

export interface ShellMetadataValidationIssue {
  code: ShellMetadataValidationCode
  message: string
  path: string
}

export function validateShellMetadata(
  metadata: ShellMetadata
): ShellMetadataValidationIssue[] {
  const issues: ShellMetadataValidationIssue[] = []

  const titleKey = metadata.titleKey
  if (titleKey === undefined || titleKey.trim().length === 0) {
    issues.push({
      code: shellMetadataValidationCodes.EMPTY_TITLE_KEY,
      message: "Shell metadata titleKey is required and must not be empty.",
      path: "titleKey",
    })
  }

  const seenBreadcrumbIds = new Set<string>()

  for (const [index, breadcrumb] of (metadata.breadcrumbs ?? []).entries()) {
    const basePath = `breadcrumbs[${index}]`
    const normalizedId = breadcrumb.id.trim()

    // Empty ids are never added to `seenBreadcrumbIds`, so two blanks emit two
    // EMPTY_BREADCRUMB_ID issues — not DUPLICATE_BREADCRUMB_ID.
    if (normalizedId.length === 0) {
      issues.push({
        code: shellMetadataValidationCodes.EMPTY_BREADCRUMB_ID,
        message: "Breadcrumb id must not be empty.",
        path: `${basePath}.id`,
      })
    } else if (seenBreadcrumbIds.has(normalizedId)) {
      issues.push({
        code: shellMetadataValidationCodes.DUPLICATE_BREADCRUMB_ID,
        message: `Duplicate breadcrumb id "${normalizedId}" detected.`,
        path: `${basePath}.id`,
      })
    } else {
      seenBreadcrumbIds.add(normalizedId)
    }

    if (breadcrumb.labelKey.trim().length === 0) {
      issues.push({
        code: shellMetadataValidationCodes.EMPTY_BREADCRUMB_LABEL_KEY,
        message: "Breadcrumb labelKey must not be empty.",
        path: `${basePath}.labelKey`,
      })
    }

    if (breadcrumb.to !== undefined && breadcrumb.to.trim().length === 0) {
      issues.push({
        code: shellMetadataValidationCodes.EMPTY_BREADCRUMB_TO,
        message: "Breadcrumb `to` must not be an empty string.",
        path: `${basePath}.to`,
      })
    }
  }

  const seenHeaderActionIds = new Set<string>()

  for (const [index, action] of (metadata.headerActions ?? []).entries()) {
    const basePath = `headerActions[${index}]`
    const normalizedId = action.id.trim()

    if (normalizedId.length === 0) {
      issues.push({
        code: shellMetadataValidationCodes.DUPLICATE_HEADER_ACTION_ID,
        message: "Header action id must not be empty.",
        path: `${basePath}.id`,
      })
    } else if (seenHeaderActionIds.has(normalizedId)) {
      issues.push({
        code: shellMetadataValidationCodes.DUPLICATE_HEADER_ACTION_ID,
        message: `Duplicate header action id "${normalizedId}" detected.`,
        path: `${basePath}.id`,
      })
    } else {
      seenHeaderActionIds.add(normalizedId)
    }

    if (action.labelKey.trim().length === 0) {
      issues.push({
        code: shellMetadataValidationCodes.INVALID_HEADER_ACTION_LABEL_KEY,
        message: "Header action labelKey must not be empty.",
        path: `${basePath}.labelKey`,
      })
    }

    if (action.kind !== "link" && action.kind !== "command") {
      issues.push({
        code: shellMetadataValidationCodes.INVALID_HEADER_ACTION_KIND,
        message: `Unsupported header action kind "${String(action.kind)}".`,
        path: `${basePath}.kind`,
      })
      continue
    }

    if (action.kind === "link") {
      if (action.to === undefined || action.to.trim().length === 0) {
        issues.push({
          code: shellMetadataValidationCodes.INVALID_HEADER_ACTION_TARGET,
          message: 'Header action kind "link" requires a non-empty `to`.',
          path: `${basePath}.to`,
        })
      }

      if (action.commandId !== undefined) {
        issues.push({
          code: shellMetadataValidationCodes.CONTRADICTORY_HEADER_ACTION_PAYLOAD,
          message: 'Header action kind "link" must not define `commandId`.',
          path: `${basePath}.commandId`,
        })
      }
    }

    if (action.kind === "command") {
      if (
        action.commandId === undefined ||
        action.commandId.trim().length === 0
      ) {
        issues.push({
          code: shellMetadataValidationCodes.INVALID_HEADER_ACTION_COMMAND_ID,
          message:
            'Header action kind "command" requires a non-empty `commandId`.',
          path: `${basePath}.commandId`,
        })
      }

      if (action.to !== undefined) {
        issues.push({
          code: shellMetadataValidationCodes.CONTRADICTORY_HEADER_ACTION_PAYLOAD,
          message: 'Header action kind "command" must not define `to`.',
          path: `${basePath}.to`,
        })
      }
    }
  }

  return issues
}
