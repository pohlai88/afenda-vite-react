/**
 * GOVERNANCE VALIDATOR — validate-shell-runtime-contracts
 * Aligns component registry expectations with doctrine (search bar ↔ search policy, overlay ↔ overlay policy).
 * Scope: static checks; does not inspect React trees.
 * Consumption: validate-constants, CI.
 *
 * **Governance checklist (runtime contracts validator)**
 * - Type issue `code` with {@link ShellRuntimeContractIssueCode}; add codes in `shell-runtime-contract-issue-codes.ts` in the same PR.
 * - Prefer `collectShellRuntimeContractIssues(ctx)` + `validateShellRuntimeContractsWithContext` for tests (no mutation of frozen policy/registry).
 * - Document each phase inline: search bar ↔ search policy, overlay components ↔ overlay kind rules, metadata baseline parse.
 * - Keep `validateShellRuntimeContracts()` as a thin wrapper over {@link buildShellRuntimeContractValidationContextFromImports}.
 *
 * @example Live registry and policies
 * ```ts
 * const report = validateShellRuntimeContracts()
 * expect(report.ok).toBe(true)
 * ```
 */
import { shellComponentRegistry } from "../registry/shell-component-registry"
import {
  parseShellMetadata,
  shellMetadataDefaults,
} from "../contract/shell-metadata-contract"
import { shellOverlayPolicy } from "../policy/shell-overlay-policy"
import { shellSearchPolicy } from "../policy/shell-search-policy"

import { ShellRuntimeContractIssueCode } from "./shell-runtime-contract-issue-codes"
import type { ShellRuntimeContractIssueCode as ShellRuntimeContractIssueCodeType } from "./shell-runtime-contract-issue-codes"

/** Re-export for consumers that import only this module. */
export { ShellRuntimeContractIssueCode } from "./shell-runtime-contract-issue-codes"

export interface ShellRuntimeContractIssue {
  code: ShellRuntimeContractIssueCodeType
  message: string
}

export interface ShellRuntimeContractReport {
  ok: boolean
  issues: readonly ShellRuntimeContractIssue[]
}

/**
 * Inputs for {@link collectShellRuntimeContractIssues}. Built from live modules via
 * {@link buildShellRuntimeContractValidationContextFromImports}.
 */
export interface ShellRuntimeContractValidationContext {
  registryKeys: readonly string[]
  distinguishCommandPaletteFromSearch: boolean
  overlayKindRulesLength: number
  /**
   * Value passed to `parseShellMetadata` for the baseline check.
   * Defaults to {@link shellMetadataDefaults} when omitted.
   */
  metadataParseInput?: unknown
}

export function buildShellRuntimeContractValidationContextFromImports(): ShellRuntimeContractValidationContext {
  return {
    registryKeys: Object.keys(shellComponentRegistry),
    distinguishCommandPaletteFromSearch:
      shellSearchPolicy.distinguishCommandPaletteFromSearch,
    overlayKindRulesLength: shellOverlayPolicy.kindRules.length,
  }
}

/**
 * Pure checks against a context snapshot (CI + unit tests).
 */
export function collectShellRuntimeContractIssues(
  ctx: ShellRuntimeContractValidationContext
): ShellRuntimeContractIssue[] {
  const issues: ShellRuntimeContractIssue[] = []

  // Search bar ↔ search policy
  if (ctx.registryKeys.includes("shell-search-bar")) {
    if (!ctx.distinguishCommandPaletteFromSearch) {
      issues.push({
        code: ShellRuntimeContractIssueCode.SEARCH_BAR_REQUIRES_PALETTE_DISTINCTION,
        message:
          "shell-search-bar is registered; shell-search-policy should distinguish command palette from search for safe UX governance.",
      })
    }
  }

  // Overlay / popover components ↔ overlay policy kind rules
  if (
    ctx.registryKeys.includes("shell-overlay-container") ||
    ctx.registryKeys.includes("shell-popover-content")
  ) {
    if (ctx.overlayKindRulesLength < 1) {
      issues.push({
        code: ShellRuntimeContractIssueCode.OVERLAY_POLICY_EMPTY,
        message:
          "Overlay components are registered but shell-overlay-policy has no kindRules.",
      })
    }
  }

  // Metadata contract parse (baseline must match schema)
  try {
    parseShellMetadata(ctx.metadataParseInput ?? shellMetadataDefaults)
  } catch (e) {
    issues.push({
      code: ShellRuntimeContractIssueCode.METADATA_CONTRACT_PARSE_FAILED,
      message: `shell-metadata-contract baseline parse failed: ${e instanceof Error ? e.message : String(e)}`,
    })
  }

  return issues
}

export function validateShellRuntimeContractsWithContext(
  ctx: ShellRuntimeContractValidationContext
): ShellRuntimeContractReport {
  const issues = collectShellRuntimeContractIssues(ctx)
  return {
    ok: issues.length === 0,
    issues,
  }
}

export function validateShellRuntimeContracts(): ShellRuntimeContractReport {
  return validateShellRuntimeContractsWithContext(
    buildShellRuntimeContractValidationContextFromImports()
  )
}

/**
 * Frozen alias for discoverability (`ShellRuntimeContractUtils.validate`, etc.).
 * Named exports remain preferred for tree-shaking clarity.
 */
export const ShellRuntimeContractUtils = Object.freeze({
  validate: validateShellRuntimeContracts,
  validateWithContext: validateShellRuntimeContractsWithContext,
  collectIssues: collectShellRuntimeContractIssues,
  buildContextFromImports: buildShellRuntimeContractValidationContextFromImports,
})
