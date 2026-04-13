/**
 * VALIDATE SHELL METADATA
 *
 * Field-level shell metadata checks. Catalog/system truth uses `assert-shell-route-catalog`.
 */

import type { ShellMetadata } from "../contract/shell-metadata-contract"
import type { ShellMetadataValidationCode } from "../contract/shell-metadata-validation-codes"
import { shellMetadataValidationCodes } from "../contract/shell-metadata-validation-codes"
import { validateShellHeaderActions } from "./validate-shell-header-actions"

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

  for (const issue of validateShellHeaderActions(
    metadata.headerActions ?? []
  )) {
    issues.push({
      code: shellMetadataValidationCodes.INVALID_HEADER_ACTION,
      message: `[${issue.code}] ${issue.message}`,
      path: issue.path,
    })
  }

  return issues
}
