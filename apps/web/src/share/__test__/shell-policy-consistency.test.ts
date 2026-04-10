/**
 * Cross-policy consistency (pure contexts; no mutation of frozen policy objects).
 */
import { describe, expect, it } from "vitest"

import {
  ShellPolicyConsistencyIssueCode,
  collectShellPolicyConsistencyIssues,
  validateShellPolicyConsistency,
  validateShellPolicyConsistencyWithContext,
  type ShellPolicyConsistencyContext,
} from "@afenda/shadcn-ui/lib/constant/policy/shell/validation/validate-shell-policy-consistency"

/** Minimal context that satisfies all checks (adjust fields per test). */
function basePassingContext(): ShellPolicyConsistencyContext {
  return {
    workspaceCompatibleWithTenantPolicy: true,
    layoutRegionZones: [
      "root",
      "header",
      "sidebar",
      "content",
      "panel",
      "overlay",
      "command",
      "footer",
    ],
    layoutRequireStableOverlayMountRegion: true,
    slots: [{ slotId: "header.frame", zone: "header" }],
    overlayEnforceStackPriority: false,
    overlayKindRuleStackPriorities: [0],
    searchRequireGovernedSearchRegistration: false,
    searchApprovedResultClassesCount: 1,
    componentRegistryKeys: [],
    tenantAllowSwitcherWhenStrict: true,
  }
}

describe("validateShellPolicyConsistency", () => {
  it("passes for checked-in policies", () => {
    const report = validateShellPolicyConsistency()
    expect(report.ok, report.issues.map((i) => i.message).join("\n")).toBe(true)
    expect(report.issues).toHaveLength(0)
  })

  it("flags workspace ↔ tenant misalignment", () => {
    const issues = collectShellPolicyConsistencyIssues({
      ...basePassingContext(),
      workspaceCompatibleWithTenantPolicy: false,
    })
    expect(issues).toContainEqual({
      code: ShellPolicyConsistencyIssueCode.WORKSPACE_TENANT_POLICY_INCOMPATIBLE,
      message: expect.any(String),
    })
  })

  it("flags slot zone missing from layout regions", () => {
    const issues = collectShellPolicyConsistencyIssues({
      ...basePassingContext(),
      layoutRegionZones: ["content"],
      slots: [{ slotId: "header.frame", zone: "header" }],
    })
    expect(issues.some((i) => i.code === ShellPolicyConsistencyIssueCode.SLOT_LAYOUT_ZONE_MISSING)).toBe(
      true
    )
  })

  it("flags missing overlay layout region when required", () => {
    const issues = collectShellPolicyConsistencyIssues({
      ...basePassingContext(),
      layoutRegionZones: ["root", "header", "content"],
      layoutRequireStableOverlayMountRegion: true,
    })
    expect(issues).toContainEqual({
      code: ShellPolicyConsistencyIssueCode.OVERLAY_LAYOUT_MISSING,
      message: expect.any(String),
    })
  })

  it("flags overlay stack priority collision when enforcement is on", () => {
    const issues = collectShellPolicyConsistencyIssues({
      ...basePassingContext(),
      overlayEnforceStackPriority: true,
      overlayKindRuleStackPriorities: [1, 1],
    })
    expect(issues).toContainEqual({
      code: ShellPolicyConsistencyIssueCode.OVERLAY_STACK_PRIORITY_COLLISION,
      message: expect.any(String),
    })
  })

  it("flags empty search result classes when governed registration is required", () => {
    const issues = collectShellPolicyConsistencyIssues({
      ...basePassingContext(),
      searchRequireGovernedSearchRegistration: true,
      searchApprovedResultClassesCount: 0,
    })
    expect(issues).toContainEqual({
      code: ShellPolicyConsistencyIssueCode.SEARCH_RESULT_CLASSES_EMPTY,
      message: expect.any(String),
    })
  })

  it("flags tenant switcher registered when tenant policy disallows it", () => {
    const issues = collectShellPolicyConsistencyIssues({
      ...basePassingContext(),
      componentRegistryKeys: ["shell-tenant-switcher"],
      tenantAllowSwitcherWhenStrict: false,
    })
    expect(issues).toContainEqual({
      code: ShellPolicyConsistencyIssueCode.TENANT_SWITCHER_DISALLOWED,
      message: expect.any(String),
    })
  })

  it("exposes validateWithContext on the report helper", () => {
    const report = validateShellPolicyConsistencyWithContext(basePassingContext())
    expect(report.ok).toBe(true)
  })
})
