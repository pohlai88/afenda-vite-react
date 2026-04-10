/**
 * Shell runtime contracts validator — live integration + synthetic `ShellRuntimeContractValidationContext`.
 *
 * **Coverage layout**
 * - Live: `validateShellRuntimeContracts()` smoke.
 * - Synthetic: `collectShellRuntimeContractIssues({ ...buildShellRuntimeContractValidationContextFromImports(), … })` per `ShellRuntimeContractIssueCode` (search policy flag, overlay kind count, `metadataParseInput`).
 */
import { describe, expect, it } from "vitest"

import {
  ShellRuntimeContractIssueCode,
  buildShellRuntimeContractValidationContextFromImports,
  collectShellRuntimeContractIssues,
  validateShellRuntimeContracts,
  validateShellRuntimeContractsWithContext,
} from "@afenda/shadcn-ui/lib/constant/policy/shell/validation/validate-shell-runtime-contracts"

describe("validateShellRuntimeContracts", () => {
  it("passes for the checked-in registry and policies", () => {
    const report = validateShellRuntimeContracts()
    expect(report.ok, report.issues.map((i) => `${i.code}: ${i.message}`).join("\n")).toBe(
      true
    )
    expect(report.issues).toHaveLength(0)
  })

  it("flags search bar when command palette is not distinguished from search", () => {
    const base = buildShellRuntimeContractValidationContextFromImports()
    const issues = collectShellRuntimeContractIssues({
      ...base,
      registryKeys: [...base.registryKeys, "shell-search-bar"],
      distinguishCommandPaletteFromSearch: false,
    })
    expect(
      issues.some(
        (i) =>
          i.code === ShellRuntimeContractIssueCode.SEARCH_BAR_REQUIRES_PALETTE_DISTINCTION
      )
    ).toBe(true)
  })

  it("flags empty overlay policy when overlay-related components are registered", () => {
    const base = buildShellRuntimeContractValidationContextFromImports()
    const issues = collectShellRuntimeContractIssues({
      ...base,
      registryKeys: ["shell-overlay-container"],
      overlayKindRulesLength: 0,
    })
    expect(
      issues.some((i) => i.code === ShellRuntimeContractIssueCode.OVERLAY_POLICY_EMPTY)
    ).toBe(true)
  })

  it("flags metadata contract parse failures", () => {
    const base = buildShellRuntimeContractValidationContextFromImports()
    const issues = collectShellRuntimeContractIssues({
      ...base,
      metadataParseInput: { zone: "not-a-valid-shell-zone" },
    })
    expect(
      issues.some((i) => i.code === ShellRuntimeContractIssueCode.METADATA_CONTRACT_PARSE_FAILED)
    ).toBe(true)
  })

  it("exposes validateWithContext", () => {
    const ctx = buildShellRuntimeContractValidationContextFromImports()
    const report = validateShellRuntimeContractsWithContext(ctx)
    expect(report.ok).toBe(true)
  })
})
