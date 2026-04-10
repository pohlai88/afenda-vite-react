/**
 * GOVERNANCE ISSUE CODES — shell runtime contracts
 * Canonical codes for registry ↔ search/overlay/metadata expectations.
 * Scope: `validate-shell-runtime-contracts`, CI, unit tests.
 * Purpose: const + derived union for autocomplete; wire values are stable.
 *
 * Keep in sync with `validate-shell-runtime-contracts.ts`.
 */
export const ShellRuntimeContractIssueCode = {
  SEARCH_BAR_REQUIRES_PALETTE_DISTINCTION: "search_bar_requires_palette_distinction",
  OVERLAY_POLICY_EMPTY: "overlay_policy_empty",
  METADATA_CONTRACT_PARSE_FAILED: "metadata_contract_parse_failed",
} as const

/** Union of all `ShellRuntimeContractIssueCode` string literals (use for `ShellRuntimeContractIssue["code"]`). */
export type ShellRuntimeContractIssueCode =
  (typeof ShellRuntimeContractIssueCode)[keyof typeof ShellRuntimeContractIssueCode]
