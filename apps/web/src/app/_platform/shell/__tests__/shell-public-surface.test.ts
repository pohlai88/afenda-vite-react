import { describe, expect, it } from "vitest"

import {
  shellMetadataValidationCodeList,
  shellMetadataValidationCodes,
} from "../contract/shell-metadata-validation-codes"
import * as ShellCommandSurface from "../shell-command-surface"
import * as ShellLayoutSurface from "../shell-layout-surface"
import * as Shell from "../index"
import * as ShellRouteSurface from "../shell-route-surface"
import * as ShellValidationSurface from "../shell-validation-surface"

/**
 * Guard against barrel drift: these symbols must remain re-exported from `index.ts`
 * so governance scripts, CI, and route modules keep a stable import path.
 */
const REQUIRED_GOVERNANCE_EXPORTS = [
  "assertShellMetadata",
  "assertShellRouteCatalog",
  "buildShellResolutionTrace",
  "buildShellValidationReport",
  "collectShellRouteCatalogIssues",
  "diffShellValidationReports",
  "formatShellValidationReportDiff",
  "mapShellMetadataValidationToShellInvariant",
  "SHELL_VALIDATION_REPORT_SCHEMA_VERSION",
  "shellMetadataValidationCodeList",
  "shellMetadataValidationCodes",
  "shellValidationReportDoctrine",
] as const

const REQUIRED_ROOT_EXPORTS = [
  "AppShellAccessDenied",
  "AppShellLayout",
  "AppShellNotFound",
  "AppShellSidebar",
  "ShellLeftSidebar",
  "ShellLeftSidebarLayout",
  "ShellScopeLineageBar",
  "ShellTopNav",
] as const

const REQUIRED_ROUTE_SURFACE_EXPORTS = [
  "shellAppChildRouteDefinitions",
  "shellAppDefaultChildSegment",
  "shellAppLayoutRoute",
  "shellAppNotFoundRoute",
  "shellAppSettingsAccountPath",
  "shellAppSettingsAccountRoute",
  "shellAppSettingsSecurityRoute",
] as const

const REQUIRED_LAYOUT_SURFACE_EXPORTS = [
  "AppShellAccessDenied",
  "AppShellLayout",
  "AppShellNotFound",
  "AppShellSidebar",
  "ShellLeftSidebar",
  "ShellLeftSidebarLayout",
  "ShellScopeLineageBar",
  "ShellTopNav",
] as const

const REQUIRED_COMMAND_SURFACE_EXPORTS = [
  "createShellCommandExecutor",
  "shellCommandActivityStore",
  "useShellCommandActivity",
  "useShellCommandRunner",
] as const

const REQUIRED_VALIDATION_SURFACE_EXPORTS = [
  ...REQUIRED_GOVERNANCE_EXPORTS,
  "resolveShellMetadata",
  "validateShellMetadata",
] as const

describe("shell public surface (barrel)", () => {
  it.each(REQUIRED_ROOT_EXPORTS)("exports %s", (name) => {
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

describe("shell route surface", () => {
  it.each(REQUIRED_ROUTE_SURFACE_EXPORTS)("exports %s", (name) => {
    expect(
      name in ShellRouteSurface,
      `missing route surface export: ${name}`
    ).toBe(true)
    expect(
      (ShellRouteSurface as Record<string, unknown>)[name],
      `undefined route surface export: ${name}`
    ).toBeDefined()
  })
})

describe("shell layout surface", () => {
  it.each(REQUIRED_LAYOUT_SURFACE_EXPORTS)("exports %s", (name) => {
    expect(
      name in ShellLayoutSurface,
      `missing layout surface export: ${name}`
    ).toBe(true)
    expect(
      (ShellLayoutSurface as Record<string, unknown>)[name],
      `undefined layout surface export: ${name}`
    ).toBeDefined()
  })
})

describe("shell command surface", () => {
  it.each(REQUIRED_COMMAND_SURFACE_EXPORTS)("exports %s", (name) => {
    expect(
      name in ShellCommandSurface,
      `missing command surface export: ${name}`
    ).toBe(true)
    expect(
      (ShellCommandSurface as Record<string, unknown>)[name],
      `undefined command surface export: ${name}`
    ).toBeDefined()
  })
})

describe("shell validation surface", () => {
  it.each(REQUIRED_VALIDATION_SURFACE_EXPORTS)("exports %s", (name) => {
    expect(
      name in ShellValidationSurface,
      `missing validation surface export: ${name}`
    ).toBe(true)
    expect(
      (ShellValidationSurface as Record<string, unknown>)[name],
      `undefined validation surface export: ${name}`
    ).toBeDefined()
  })
})
