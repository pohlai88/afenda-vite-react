/**
 * Shell state policy validator tests (doctrine + optional narrow repo scan).
 *
 * **Coverage layout**
 * - Live policy: default path and `scanRepo` integration smoke tests.
 * - Synthetic doctrine: `doctrineInputOverride` → `collectShellStatePolicyIssues` (no frozen policy mutation).
 * - Dotted-literal scan: `collectUndeclaredDottedLiteralIssuesFromSource` (pure; same rules as repo scan).
 * - Full doctrine matrix per code: `shell-state-doctrine.test.ts` (`validateShellStateDoctrine`).
 *
 * **Template — mapping issue codes → how to exercise**
 * | Code | Primary test surface |
 * |------|----------------------|
 * | `DUPLICATE_DECLARATION` | below (`collectShellStatePolicyIssues` + override) + `shell-state-doctrine.test.ts` |
 * | `MISSING_DECLARATION_FOR_VOCABULARY_KEY` | below + `shell-state-doctrine.test.ts` |
 * | `DECLARATION_NOT_IN_VOCABULARY` | below + `shell-state-doctrine.test.ts` |
 * | `RESET_TRIGGERS_*` | below + `shell-state-doctrine.test.ts` |
 * | `ISOLATION_*`, `PERSISTENCE_*` | below + `shell-state-doctrine.test.ts` |
 * | `UNDECLARED_DOTTED_LITERAL` | below (`collectUndeclaredDottedLiteralIssuesFromSource`); live `scanRepo` smoke |
 */
import { describe, expect, it } from "vitest"

import { ShellStatePolicyIssueCode } from "@afenda/shadcn-ui/lib/constant/policy/shell/validation/shell-state-policy-issue-codes"
import {
  collectShellStatePolicyIssues,
  collectUndeclaredDottedLiteralIssuesFromSource,
  validateShellStatePolicy,
} from "@afenda/shadcn-ui/lib/constant/policy/shell/validation/validate-shell-state-policy"

const baseVocab = ["a.key", "b.key"] as const

describe("validateShellStatePolicy", () => {
  it("doctrine phase passes for the checked-in policy", () => {
    const report = validateShellStatePolicy()
    expect(report.ok, report.issues.map((i) => i.message).join("\n")).toBe(true)
    expect(report.issues).toHaveLength(0)
  })

  it("collectShellStatePolicyIssues matches validateShellStatePolicy issues for the default path", () => {
    const collected = collectShellStatePolicyIssues()
    const report = validateShellStatePolicy()
    expect(collected).toEqual([...report.issues])
    expect(report.ok).toBe(collected.length === 0)
  })

  it("doctrine + narrow repo scan passes (shell-ui + policy/shell/runtime)", () => {
    const report = validateShellStatePolicy({ scanRepo: true })
    expect(report.ok, report.issues.map((i) => i.message).join("\n")).toBe(true)
  })
})

describe("collectShellStatePolicyIssues (doctrineInputOverride)", () => {
  it("flags DUPLICATE_DECLARATION", () => {
    const issues = collectShellStatePolicyIssues({
      doctrineInputOverride: {
        vocabularyKeys: [...baseVocab],
        declaredStateKeys: [
          { key: "a.key", resetTriggers: ["logout"], isolation: "global", persistence: "ephemeral" },
          { key: "a.key", resetTriggers: ["logout"], isolation: "global", persistence: "ephemeral" },
          { key: "b.key", resetTriggers: ["logout"], isolation: "global", persistence: "ephemeral" },
        ],
        requireIsolationClassification: true,
        requirePersistenceClassification: true,
      },
    })
    expect(issues).toEqual([
      expect.objectContaining({ code: ShellStatePolicyIssueCode.DUPLICATE_DECLARATION }),
    ])
  })

  it("flags MISSING_DECLARATION_FOR_VOCABULARY_KEY", () => {
    const issues = collectShellStatePolicyIssues({
      doctrineInputOverride: {
        declaredStateKeys: [],
        vocabularyKeys: ["sidebar.collapsed"],
        requireIsolationClassification: true,
        requirePersistenceClassification: true,
      },
    })
    expect(
      issues.some((i) => i.code === ShellStatePolicyIssueCode.MISSING_DECLARATION_FOR_VOCABULARY_KEY)
    ).toBe(true)
  })

  it("flags DECLARATION_NOT_IN_VOCABULARY", () => {
    const issues = collectShellStatePolicyIssues({
      doctrineInputOverride: {
        vocabularyKeys: [...baseVocab],
        declaredStateKeys: [
          { key: "a.key", resetTriggers: ["logout"], isolation: "global", persistence: "ephemeral" },
          { key: "b.key", resetTriggers: ["logout"], isolation: "global", persistence: "ephemeral" },
          {
            key: "orphan.key",
            resetTriggers: ["logout"],
            isolation: "global",
            persistence: "ephemeral",
          },
        ],
        requireIsolationClassification: true,
        requirePersistenceClassification: true,
      },
    })
    expect(issues.some((i) => i.code === ShellStatePolicyIssueCode.DECLARATION_NOT_IN_VOCABULARY)).toBe(
      true
    )
  })

  it("flags RESET_TRIGGERS_EMPTY", () => {
    const issues = collectShellStatePolicyIssues({
      doctrineInputOverride: {
        vocabularyKeys: [...baseVocab],
        declaredStateKeys: [
          { key: "a.key", resetTriggers: [], isolation: "global", persistence: "ephemeral" },
          { key: "b.key", resetTriggers: ["logout"], isolation: "global", persistence: "ephemeral" },
        ],
        requireIsolationClassification: true,
        requirePersistenceClassification: true,
      },
    })
    expect(issues.some((i) => i.code === ShellStatePolicyIssueCode.RESET_TRIGGERS_EMPTY)).toBe(true)
  })

  it("flags RESET_TRIGGER_INVALID", () => {
    const issues = collectShellStatePolicyIssues({
      doctrineInputOverride: {
        vocabularyKeys: [...baseVocab],
        declaredStateKeys: [
          {
            key: "a.key",
            resetTriggers: ["not_a_governed_trigger"],
            isolation: "global",
            persistence: "ephemeral",
          },
          { key: "b.key", resetTriggers: ["logout"], isolation: "global", persistence: "ephemeral" },
        ],
        requireIsolationClassification: true,
        requirePersistenceClassification: true,
      },
    })
    expect(issues.some((i) => i.code === ShellStatePolicyIssueCode.RESET_TRIGGER_INVALID)).toBe(true)
  })

  it("flags ISOLATION_MISSING", () => {
    const issues = collectShellStatePolicyIssues({
      doctrineInputOverride: {
        vocabularyKeys: [...baseVocab],
        declaredStateKeys: [
          { key: "a.key", resetTriggers: ["logout"], persistence: "ephemeral" },
          { key: "b.key", resetTriggers: ["logout"], isolation: "global", persistence: "ephemeral" },
        ],
        requireIsolationClassification: true,
        requirePersistenceClassification: true,
      },
    })
    expect(issues.some((i) => i.code === ShellStatePolicyIssueCode.ISOLATION_MISSING)).toBe(true)
  })

  it("flags ISOLATION_INVALID", () => {
    const issues = collectShellStatePolicyIssues({
      doctrineInputOverride: {
        vocabularyKeys: [...baseVocab],
        declaredStateKeys: [
          {
            key: "a.key",
            resetTriggers: ["logout"],
            isolation: "not_a_governed_isolation",
            persistence: "ephemeral",
          },
          { key: "b.key", resetTriggers: ["logout"], isolation: "global", persistence: "ephemeral" },
        ],
        requireIsolationClassification: true,
        requirePersistenceClassification: true,
      },
    })
    expect(issues.some((i) => i.code === ShellStatePolicyIssueCode.ISOLATION_INVALID)).toBe(true)
  })

  it("flags PERSISTENCE_MISSING", () => {
    const issues = collectShellStatePolicyIssues({
      doctrineInputOverride: {
        vocabularyKeys: [...baseVocab],
        declaredStateKeys: [
          { key: "a.key", resetTriggers: ["logout"], isolation: "global" },
          { key: "b.key", resetTriggers: ["logout"], isolation: "global", persistence: "ephemeral" },
        ],
        requireIsolationClassification: true,
        requirePersistenceClassification: true,
      },
    })
    expect(issues.some((i) => i.code === ShellStatePolicyIssueCode.PERSISTENCE_MISSING)).toBe(true)
  })

  it("flags PERSISTENCE_INVALID", () => {
    const issues = collectShellStatePolicyIssues({
      doctrineInputOverride: {
        vocabularyKeys: [...baseVocab],
        declaredStateKeys: [
          {
            key: "a.key",
            resetTriggers: ["logout"],
            isolation: "global",
            persistence: "not_a_governed_persistence",
          },
          { key: "b.key", resetTriggers: ["logout"], isolation: "global", persistence: "ephemeral" },
        ],
        requireIsolationClassification: true,
        requirePersistenceClassification: true,
      },
    })
    expect(issues.some((i) => i.code === ShellStatePolicyIssueCode.PERSISTENCE_INVALID)).toBe(true)
  })
})

describe("collectUndeclaredDottedLiteralIssuesFromSource", () => {
  it("flags UNDECLARED_DOTTED_LITERAL for a synthetic quoted key not in vocabulary or slot ids", () => {
    const issues = collectUndeclaredDottedLiteralIssuesFromSource(
      "synthetic/fixture.ts",
      'const rogue = "governance.synthetic.bad"'
    )
    expect(issues).toContainEqual({
      code: ShellStatePolicyIssueCode.UNDECLARED_DOTTED_LITERAL,
      message: expect.any(String),
      file: "synthetic/fixture.ts",
      line: 1,
    })
  })

  it("does not flag literals whose first segment is in DOTTED_LITERAL_FIRST_SEGMENT_IGNORE", () => {
    const issues = collectUndeclaredDottedLiteralIssuesFromSource(
      "synthetic/i18n.ts",
      'const t = "common.settings.title"'
    )
    expect(issues).toHaveLength(0)
  })

  it("does not flag a governed shell state key literal", () => {
    const issues = collectUndeclaredDottedLiteralIssuesFromSource(
      "synthetic/ok.ts",
      'const k = "sidebar.collapsed"'
    )
    expect(issues).toHaveLength(0)
  })
})
