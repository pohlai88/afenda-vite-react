/**
 * Pure doctrine checks (no live `shellStatePolicy`); negative cases for governance.
 */
import { describe, expect, it } from "vitest"

import {
  ShellStatePolicyIssueCode,
  validateShellStateDoctrine,
} from "@afenda/shadcn-ui/lib/constant/policy/shell/validation/validate-shell-state-policy"

const baseVocab = ["a.key", "b.key"] as const

describe("validateShellStateDoctrine", () => {
  it("accepts a consistent doctrine input", () => {
    const issues = validateShellStateDoctrine({
      vocabularyKeys: ["sidebar.collapsed"],
      declaredStateKeys: [
        {
          key: "sidebar.collapsed",
          resetTriggers: ["logout"],
          isolation: "global",
          persistence: "persisted",
        },
      ],
      requireIsolationClassification: true,
      requirePersistenceClassification: true,
    })
    expect(issues).toEqual([])
  })

  it("flags duplicate declaration keys and short-circuits further checks", () => {
    const issues = validateShellStateDoctrine({
      vocabularyKeys: [...baseVocab],
      declaredStateKeys: [
        { key: "a.key", resetTriggers: ["logout"], isolation: "global", persistence: "ephemeral" },
        { key: "a.key", resetTriggers: ["logout"], isolation: "global", persistence: "ephemeral" },
        { key: "b.key", resetTriggers: ["logout"], isolation: "global", persistence: "ephemeral" },
      ],
      requireIsolationClassification: true,
      requirePersistenceClassification: true,
    })
    expect(issues).toHaveLength(1)
    expect(issues[0]?.code).toBe(ShellStatePolicyIssueCode.DUPLICATE_DECLARATION)
  })

  it("flags vocabulary key with no declaration", () => {
    const issues = validateShellStateDoctrine({
      vocabularyKeys: [...baseVocab, "missing.key"],
      declaredStateKeys: [
        { key: "a.key", resetTriggers: ["logout"], isolation: "global", persistence: "ephemeral" },
        { key: "b.key", resetTriggers: ["logout"], isolation: "global", persistence: "ephemeral" },
      ],
      requireIsolationClassification: true,
      requirePersistenceClassification: true,
    })
    expect(
      issues.some((i) => i.code === ShellStatePolicyIssueCode.MISSING_DECLARATION_FOR_VOCABULARY_KEY)
    ).toBe(true)
  })

  it("flags declaration key not in vocabulary", () => {
    const issues = validateShellStateDoctrine({
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
    })
    expect(issues.some((i) => i.code === ShellStatePolicyIssueCode.DECLARATION_NOT_IN_VOCABULARY)).toBe(
      true
    )
  })

  it("flags empty reset triggers", () => {
    const issues = validateShellStateDoctrine({
      vocabularyKeys: [...baseVocab],
      declaredStateKeys: [
        { key: "a.key", resetTriggers: [], isolation: "global", persistence: "ephemeral" },
        { key: "b.key", resetTriggers: ["logout"], isolation: "global", persistence: "ephemeral" },
      ],
      requireIsolationClassification: true,
      requirePersistenceClassification: true,
    })
    expect(issues.some((i) => i.code === ShellStatePolicyIssueCode.RESET_TRIGGERS_EMPTY)).toBe(true)
  })

  it("flags missing isolation when required", () => {
    const issues = validateShellStateDoctrine({
      vocabularyKeys: [...baseVocab],
      declaredStateKeys: [
        { key: "a.key", resetTriggers: ["logout"], persistence: "ephemeral" },
        { key: "b.key", resetTriggers: ["logout"], isolation: "global", persistence: "ephemeral" },
      ],
      requireIsolationClassification: true,
      requirePersistenceClassification: true,
    })
    expect(issues.some((i) => i.code === ShellStatePolicyIssueCode.ISOLATION_MISSING)).toBe(true)
  })

  it("flags missing persistence when required", () => {
    const issues = validateShellStateDoctrine({
      vocabularyKeys: [...baseVocab],
      declaredStateKeys: [
        { key: "a.key", resetTriggers: ["logout"], isolation: "global" },
        { key: "b.key", resetTriggers: ["logout"], isolation: "global", persistence: "ephemeral" },
      ],
      requireIsolationClassification: true,
      requirePersistenceClassification: true,
    })
    expect(issues.some((i) => i.code === ShellStatePolicyIssueCode.PERSISTENCE_MISSING)).toBe(true)
  })

  it("flags invalid reset trigger strings", () => {
    const issues = validateShellStateDoctrine({
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
    })
    expect(issues.some((i) => i.code === ShellStatePolicyIssueCode.RESET_TRIGGER_INVALID)).toBe(
      true
    )
  })

  it("flags invalid isolation when a value is present", () => {
    const issues = validateShellStateDoctrine({
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
    })
    expect(issues.some((i) => i.code === ShellStatePolicyIssueCode.ISOLATION_INVALID)).toBe(true)
  })

  it("flags invalid persistence when a value is present", () => {
    const issues = validateShellStateDoctrine({
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
    })
    expect(issues.some((i) => i.code === ShellStatePolicyIssueCode.PERSISTENCE_INVALID)).toBe(
      true
    )
  })
})
