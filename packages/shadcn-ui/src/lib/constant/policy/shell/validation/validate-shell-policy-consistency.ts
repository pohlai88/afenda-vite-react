/**
 * GOVERNANCE VALIDATOR — validate-shell-policy-consistency
 * Cross-policy consistency: slot vs layout zones, tenant/workspace alignment, overlay/search alignment.
 * Scope: static doctrine checks across shell policy modules.
 * Consumption: validate-constants, CI.
 *
 * **Governance checklist for cross-policy validators**
 * - Type issue `code` with {@link ShellPolicyConsistencyIssueCode} (add new codes in the same PR).
 * - Prefer a pure `collect*Issues(ctx)` + `validate*WithContext` so tests do not mutate frozen policy.
 * - Document each check inline (workspace↔tenant, slot↔layout zone, overlay region, overlay stack, search, registry↔tenant).
 * - Keep live `validateShellPolicyConsistency()` as a thin wrapper over imported policy snapshots.
 *
 * @example Live policies (repo default)
 * ```ts
 * const report = validateShellPolicyConsistency()
 * expect(report.ok).toBe(true)
 * ```
 */
import { shellComponentRegistry } from "../registry/shell-component-registry"
import { shellLayoutPolicy } from "../policy/shell-layout-policy"
import { shellOverlayPolicy } from "../policy/shell-overlay-policy"
import { shellSearchPolicy } from "../policy/shell-search-policy"
import { shellSlotPolicy } from "../policy/shell-slot-policy"
import { shellTenantContextPolicy } from "../policy/shell-tenant-context-policy"
import { shellWorkspaceContextPolicy } from "../policy/shell-workspace-context-policy"

import { ShellPolicyConsistencyIssueCode } from "./shell-policy-consistency-issue-codes"
import type { ShellPolicyConsistencyIssueCode as ShellPolicyConsistencyIssueCodeType } from "./shell-policy-consistency-issue-codes"

/** Re-export for consumers that import validators from this module only. */
export { ShellPolicyConsistencyIssueCode } from "./shell-policy-consistency-issue-codes"

/** Single cross-policy consistency finding. */
export interface ShellPolicyConsistencyIssue {
  /** Stable code for CI; see {@link ShellPolicyConsistencyIssueCode}. */
  code: ShellPolicyConsistencyIssueCodeType
  /** Human-readable explanation. */
  message: string
}

/** Aggregate result from {@link validateShellPolicyConsistency}. */
export interface ShellPolicyConsistencyReport {
  ok: boolean
  issues: readonly ShellPolicyConsistencyIssue[]
}

/**
 * Primitive snapshot of policy inputs for {@link collectShellPolicyConsistencyIssues}.
 * Built from live modules via {@link buildShellPolicyConsistencyContextFromImports}.
 */
export interface ShellPolicyConsistencyContext {
  /** Workspace policy must stay aligned with tenant doctrine. */
  workspaceCompatibleWithTenantPolicy: boolean
  /** Zones declared on layout regions (order preserved; uniqueness not required here). */
  layoutRegionZones: readonly string[]
  /** When true, an `overlay` layout region must exist. */
  layoutRequireStableOverlayMountRegion: boolean
  /** Slot descriptors (id + zone) checked against layout zones. */
  slots: readonly { slotId: string; zone: string }[]
  /** When true, overlay kind rule stack priorities must be unique. */
  overlayEnforceStackPriority: boolean
  /** `stackPriority` values from overlay kind rules (same order as policy). */
  overlayKindRuleStackPriorities: readonly number[]
  /** When true, search must list approved result classes. */
  searchRequireGovernedSearchRegistration: boolean
  /** Length of `approvedResultClasses` (governed search). */
  searchApprovedResultClassesCount: number
  /** Keys from `shellComponentRegistry` (presence of `shell-tenant-switcher` is special-cased). */
  componentRegistryKeys: readonly string[]
  /** Tenant context: switcher allowed under strict mode. */
  tenantAllowSwitcherWhenStrict: boolean
}

function buildShellPolicyConsistencyContextFromImports(): ShellPolicyConsistencyContext {
  return {
    workspaceCompatibleWithTenantPolicy:
      shellWorkspaceContextPolicy.compatibleWithTenantPolicy,
    layoutRegionZones: shellLayoutPolicy.regions.map((r) => r.zone),
    layoutRequireStableOverlayMountRegion:
      shellLayoutPolicy.requireStableOverlayMountRegion,
    slots: shellSlotPolicy.slots.map((s) => ({
      slotId: s.slotId,
      zone: s.zone,
    })),
    overlayEnforceStackPriority: shellOverlayPolicy.enforceStackPriority,
    overlayKindRuleStackPriorities: shellOverlayPolicy.kindRules.map(
      (k) => k.stackPriority
    ),
    searchRequireGovernedSearchRegistration:
      shellSearchPolicy.requireGovernedSearchRegistration,
    searchApprovedResultClassesCount: shellSearchPolicy.approvedResultClasses.length,
    componentRegistryKeys: Object.keys(shellComponentRegistry),
    tenantAllowSwitcherWhenStrict: shellTenantContextPolicy.allowTenantSwitcherWhenStrict,
  }
}

/**
 * Pure consistency checks (no imports). Use {@link validateShellPolicyConsistencyWithContext} or tests.
 */
export function collectShellPolicyConsistencyIssues(
  ctx: ShellPolicyConsistencyContext
): ShellPolicyConsistencyIssue[] {
  const issues: ShellPolicyConsistencyIssue[] = []
  const layoutZones = new Set(ctx.layoutRegionZones)

  // Workspace ↔ tenant alignment
  if (!ctx.workspaceCompatibleWithTenantPolicy) {
    issues.push({
      code: ShellPolicyConsistencyIssueCode.WORKSPACE_TENANT_POLICY_INCOMPATIBLE,
      message:
        "shell-workspace-context-policy requires compatibleWithTenantPolicy to stay true.",
    })
  }

  // Slot zones must exist in layout policy regions
  for (const slot of ctx.slots) {
    if (!layoutZones.has(slot.zone)) {
      issues.push({
        code: ShellPolicyConsistencyIssueCode.SLOT_LAYOUT_ZONE_MISSING,
        message: `shell-layout-policy has no region for zone "${slot.zone}" required by slot "${slot.slotId}".`,
      })
    }
  }

  // Overlay region consistency
  if (
    ctx.layoutRequireStableOverlayMountRegion &&
    !layoutZones.has("overlay")
  ) {
    issues.push({
      code: ShellPolicyConsistencyIssueCode.OVERLAY_LAYOUT_MISSING,
      message:
        "shell-layout-policy must declare overlay region when requireStableOverlayMountRegion is true.",
    })
  }

  // Overlay stack priority uniqueness
  if (ctx.overlayEnforceStackPriority) {
    const priorities = ctx.overlayKindRuleStackPriorities
    if (new Set(priorities).size !== priorities.length) {
      issues.push({
        code: ShellPolicyConsistencyIssueCode.OVERLAY_STACK_PRIORITY_COLLISION,
        message:
          "shell-overlay-policy kindRules must use unique stackPriority values when enforceStackPriority is true.",
      })
    }
  }

  // Search policy must declare result classes when governed registration is required
  if (
    ctx.searchRequireGovernedSearchRegistration &&
    ctx.searchApprovedResultClassesCount === 0
  ) {
    issues.push({
      code: ShellPolicyConsistencyIssueCode.SEARCH_RESULT_CLASSES_EMPTY,
      message: "shell-search-policy approvedResultClasses must not be empty.",
    })
  }

  // Tenant switcher vs tenant context
  if (
    ctx.componentRegistryKeys.includes("shell-tenant-switcher") &&
    !ctx.tenantAllowSwitcherWhenStrict
  ) {
    issues.push({
      code: ShellPolicyConsistencyIssueCode.TENANT_SWITCHER_DISALLOWED,
      message:
        'shell-tenant-switcher is registered but shell-tenant-context-policy disallows the switcher when allowTenantSwitcherWhenStrict is false.',
    })
  }

  return issues
}

export function validateShellPolicyConsistencyWithContext(
  ctx: ShellPolicyConsistencyContext
): ShellPolicyConsistencyReport {
  const issues = collectShellPolicyConsistencyIssues(ctx)
  return {
    ok: issues.length === 0,
    issues,
  }
}

/** Validates imported shell policies for cross-module drift. */
export function validateShellPolicyConsistency(): ShellPolicyConsistencyReport {
  return validateShellPolicyConsistencyWithContext(
    buildShellPolicyConsistencyContextFromImports()
  )
}

/**
 * Frozen alias for discoverability (`ShellPolicyConsistencyUtils.validate`, etc.).
 * Named exports remain preferred for tree-shaking clarity.
 */
export const ShellPolicyConsistencyUtils = Object.freeze({
  validate: validateShellPolicyConsistency,
  validateWithContext: validateShellPolicyConsistencyWithContext,
  collectIssues: collectShellPolicyConsistencyIssues,
})
