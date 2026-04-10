/**
 * PURE DOCTRINE CHECK — shell state (no I/O; no full `shellStatePolicy` object required)
 * Use for unit tests and tooling; production path passes declarations + vocabulary from policy.
 * Governed enum tuples are imported from `shell-state-policy.ts` so trigger / classification
 * checks stay aligned with Zod (single source of truth for allowed strings).
 *
 * **Governance checklist for new doctrine validators**
 * - Duplicate keys: declarations must be unique per key.
 * - Coverage: every vocabulary key has exactly one declaration; every declaration is in vocabulary.
 * - Reset triggers: non-empty; each entry must match `shellStateResetTriggerValues`.
 * - Isolation / persistence: when required flags are on, each row must set a value; any set value
 *   must match `shellStateIsolationValues` / `shellStatePersistenceValues`.
 *
 * @example Valid input → no issues
 * ```ts
 * validateShellStateDoctrine({
 *   declaredStateKeys: [
 *     {
 *       key: "sidebar.collapsed",
 *       resetTriggers: ["logout"],
 *       isolation: "global",
 *       persistence: "persisted",
 *     },
 *   ],
 *   vocabularyKeys: ["sidebar.collapsed"],
 *   requireIsolationClassification: true,
 *   requirePersistenceClassification: true,
 * }) // → []
 * ```
 *
 * @example Missing declaration for a vocabulary key
 * ```ts
 * validateShellStateDoctrine({
 *   declaredStateKeys: [],
 *   vocabularyKeys: ["sidebar.collapsed"],
 *   requireIsolationClassification: true,
 *   requirePersistenceClassification: true,
 * }) // → [MISSING_DECLARATION_FOR_VOCABULARY_KEY]
 * ```
 */
import {
  shellStateIsolationValues,
  shellStatePersistenceValues,
  shellStateResetTriggerValues,
} from "../policy/shell-state-policy"
import { ShellStatePolicyIssueCode } from "./shell-state-policy-issue-codes"
import type { ShellStatePolicyIssue } from "./shell-state-policy-types"

const RESET_TRIGGER_SET = new Set<string>(shellStateResetTriggerValues)
const ISOLATION_SET = new Set<string>(shellStateIsolationValues)
const PERSISTENCE_SET = new Set<string>(shellStatePersistenceValues)

/** Minimal declaration slice needed for doctrine checks. */
export interface ShellStateDoctrineDeclarationInput {
  key: string
  resetTriggers: readonly string[]
  isolation?: string | null
  persistence?: string | null
}

export interface ShellStateDoctrineInput {
  declaredStateKeys: readonly ShellStateDoctrineDeclarationInput[]
  vocabularyKeys: readonly string[]
  requireIsolationClassification: boolean
  requirePersistenceClassification: boolean
}

function hasClassificationValue(value: string | null | undefined): value is string {
  return value != null && value !== ""
}

/**
 * Validates vocabulary ↔ declarations (bijection), reset triggers, and optional classification flags.
 * Does not run repo scan.
 *
 * Checks performed:
 * - Duplicate declaration keys (short-circuits further checks when found)
 * - Missing declarations for vocabulary keys
 * - Declarations not present in vocabulary
 * - Empty reset trigger lists
 * - Reset triggers not in the governed reset-trigger enum
 * - Missing isolation classification when required
 * - Isolation value present but not in the governed isolation enum
 * - Missing persistence classification when required
 * - Persistence value present but not in the governed persistence enum
 */
export function validateShellStateDoctrine(
  input: ShellStateDoctrineInput
): ShellStatePolicyIssue[] {
  const issues: ShellStatePolicyIssue[] = []
  const vocabularySet = new Set(input.vocabularyKeys)

  const declared = input.declaredStateKeys.map((d) => d.key)
  const declaredSet = new Set(declared)

  if (declaredSet.size !== declared.length) {
    issues.push({
      code: ShellStatePolicyIssueCode.DUPLICATE_DECLARATION,
      message: "declaredStateKeys contains duplicate key entries.",
    })
    return issues
  }

  for (const key of input.vocabularyKeys) {
    if (!declaredSet.has(key)) {
      issues.push({
        code: ShellStatePolicyIssueCode.MISSING_DECLARATION_FOR_VOCABULARY_KEY,
        message: `Governed state key "${key}" from vocabulary has no matching declaration.`,
      })
    }
  }

  for (const key of declared) {
    if (!vocabularySet.has(key)) {
      issues.push({
        code: ShellStatePolicyIssueCode.DECLARATION_NOT_IN_VOCABULARY,
        message: `Declaration references key "${key}" which is not in the vocabulary.`,
      })
    }
  }

  for (const row of input.declaredStateKeys) {
    if (row.resetTriggers.length < 1) {
      issues.push({
        code: ShellStatePolicyIssueCode.RESET_TRIGGERS_EMPTY,
        message: `State key "${row.key}" must declare at least one reset trigger.`,
      })
    } else {
      for (const trigger of row.resetTriggers) {
        if (!RESET_TRIGGER_SET.has(trigger)) {
          issues.push({
            code: ShellStatePolicyIssueCode.RESET_TRIGGER_INVALID,
            message: `State key "${row.key}" declares invalid reset trigger "${trigger}".`,
          })
        }
      }
    }

    if (input.requireIsolationClassification && !hasClassificationValue(row.isolation)) {
      issues.push({
        code: ShellStatePolicyIssueCode.ISOLATION_MISSING,
        message: `State key "${row.key}" must declare isolation when requireIsolationClassification is true.`,
      })
    } else if (
      hasClassificationValue(row.isolation) &&
      !ISOLATION_SET.has(row.isolation)
    ) {
      issues.push({
        code: ShellStatePolicyIssueCode.ISOLATION_INVALID,
        message: `State key "${row.key}" declares invalid isolation "${row.isolation}".`,
      })
    }

    if (input.requirePersistenceClassification && !hasClassificationValue(row.persistence)) {
      issues.push({
        code: ShellStatePolicyIssueCode.PERSISTENCE_MISSING,
        message: `State key "${row.key}" must declare persistence when requirePersistenceClassification is true.`,
      })
    } else if (
      hasClassificationValue(row.persistence) &&
      !PERSISTENCE_SET.has(row.persistence)
    ) {
      issues.push({
        code: ShellStatePolicyIssueCode.PERSISTENCE_INVALID,
        message: `State key "${row.key}" declares invalid persistence "${row.persistence}".`,
      })
    }
  }

  return issues
}

/**
 * Frozen alias for discoverability (`ShellStateDoctrineUtils.validate`, etc.).
 * Named export remains preferred for tree-shaking clarity.
 */
export const ShellStateDoctrineUtils = Object.freeze({
  validate: validateShellStateDoctrine,
})
