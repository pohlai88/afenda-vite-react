import { describe, expect, it } from "vitest"

import {
  shellMetadataValidationCodeList,
  shellMetadataValidationCodes,
} from "../contract/shell-metadata-validation-codes"
import * as Shell from "../index"

/**
 * Guard against barrel drift: these symbols must remain re-exported from `index.ts`
 * so governance scripts, CI, and route modules keep a stable import path.
 */
const REQUIRED_GOVERNANCE_EXPORTS = [
  "assertShellMetadata",
  "assertShellRouteCatalog",
  "buildShellValidationReport",
  "collectShellRouteCatalogIssues",
  "mapShellMetadataValidationToShellInvariant",
  "shellMetadataValidationCodeList",
  "shellMetadataValidationCodes",
  "shellRouteMetadataList",
  "resolveShellMetadata",
  "validateShellMetadata",
] as const

describe("shell public surface (barrel)", () => {
  it.each(REQUIRED_GOVERNANCE_EXPORTS)("exports %s", (name) => {
    expect(name in Shell, `missing export: ${name}`).toBe(true)
    expect(
      (Shell as Record<string, unknown>)[name],
      `undefined export: ${name}`
    ).toBeDefined()
  })

  it("exports shellMetadataValidationCodeList aligned with shellMetadataValidationCodes", () => {
    expect(shellMetadataValidationCodeList.length).toBe(
      Object.keys(shellMetadataValidationCodes).length
    )
    expect(new Set(shellMetadataValidationCodeList).size).toBe(
      shellMetadataValidationCodeList.length
    )
    for (const code of shellMetadataValidationCodeList) {
      expect(code).toMatch(/^SHELL_METADATA_/)
    }
  })
})
