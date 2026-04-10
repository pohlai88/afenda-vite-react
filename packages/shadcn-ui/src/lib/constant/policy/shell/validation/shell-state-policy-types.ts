/**
 * Shared types for shell state policy validation (avoids circular imports between doctrine + runner).
 *
 * **Governance checklist for new Issue / Report shapes**
 * - Type `code` with {@link ShellStatePolicyIssueCode} (never plain `string`) so CI and docs stay aligned.
 * - JSDoc every field (`message`, optional `file` / `line`, and report `ok` / `issues`).
 * - Add an `@example` block showing a realistic failing {@link ShellStatePolicyReport}.
 * - When adding codes, update `shell-state-policy-issue-codes.ts` in the same change.
 *
 * @example Failing report (literal code matches {@link ShellStatePolicyIssueCode})
 * ```ts
 * import type { ShellStatePolicyReport } from "./shell-state-policy-types"
 *
 * const report: ShellStatePolicyReport = {
 *   ok: false,
 *   issues: [
 *     {
 *       code: "shell_state_missing_declaration_for_vocabulary_key",
 *       message: 'Governed state key "sidebar.collapsed" has no matching declaration.',
 *       file: "shell-state-policy.ts",
 *       line: 42,
 *     },
 *   ],
 * }
 * ```
 */
import type { ShellStatePolicyIssueCode } from "./shell-state-policy-issue-codes"

/** Single finding from doctrine validation or repo scan. */
export interface ShellStatePolicyIssue {
  /** Stable machine-readable code; see {@link ShellStatePolicyIssueCode}. */
  code: ShellStatePolicyIssueCode
  /** Human-readable explanation for logs and CI output. */
  message: string
  /** Source file when the issue comes from a scan (e.g. dotted literal). */
  file?: string
  /** 1-based line in `file`, when applicable. */
  line?: number
}

/** Aggregate result from `validateShellStatePolicy` (doctrine + optional scan). */
export interface ShellStatePolicyReport {
  /** True when `issues` is empty. */
  ok: boolean
  /** All issues from doctrine checks and optional repo scan. */
  issues: readonly ShellStatePolicyIssue[]
}

/**
 * Discoverability helper — use named types for typing; this object is not for runtime data.
 * Prefer `import type { ShellStatePolicyIssue, ShellStatePolicyReport }`.
 */
export const ShellStatePolicyTypes = Object.freeze({
  Issue: {} as ShellStatePolicyIssue,
  Report: {} as ShellStatePolicyReport,
})
