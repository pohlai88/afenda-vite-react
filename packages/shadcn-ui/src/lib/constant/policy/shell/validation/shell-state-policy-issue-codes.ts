/**
 * GOVERNANCE ISSUE CODES — shell state policy
 * Canonical issue codes for shell state doctrine validation and optional repo scan.
 * Scope: `validateShellStateDoctrine`, `validate-shell-state-policy`, dotted-literal scan.
 * Consumption: validators, CI, unit tests, governance reports.
 * Purpose: single const surface for autocomplete; string values stay stable (`shell_state_*` prefix).
 *
 * Keep in sync with `validate-shell-state-policy.ts` and `shell-state-doctrine.ts` when adding codes.
 */
export const ShellStatePolicyIssueCode = {
  DUPLICATE_DECLARATION: "shell_state_duplicate_declaration",
  MISSING_DECLARATION_FOR_VOCABULARY_KEY:
    "shell_state_missing_declaration_for_vocabulary_key",
  DECLARATION_NOT_IN_VOCABULARY: "shell_state_declaration_not_in_vocabulary",
  RESET_TRIGGERS_EMPTY: "shell_state_reset_triggers_empty",
  RESET_TRIGGER_INVALID: "shell_state_reset_trigger_invalid",
  ISOLATION_MISSING: "shell_state_isolation_missing",
  ISOLATION_INVALID: "shell_state_isolation_invalid",
  PERSISTENCE_MISSING: "shell_state_persistence_missing",
  PERSISTENCE_INVALID: "shell_state_persistence_invalid",
  UNDECLARED_DOTTED_LITERAL: "shell_state_undeclared_dotted_literal",
} as const

/** Union of all `ShellStatePolicyIssueCode` string literals (use for `ShellStatePolicyIssue["code"]`). */
export type ShellStatePolicyIssueCode =
  (typeof ShellStatePolicyIssueCode)[keyof typeof ShellStatePolicyIssueCode]
