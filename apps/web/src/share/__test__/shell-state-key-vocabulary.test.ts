/**
 * Shell state key vocabulary — tuple/schema sync, policy declaration coverage, and live validator smoke.
 * Detailed doctrine matrices live in `validate-shell-state-policy.test.ts` and
 * `shell-state-doctrine.test.ts`.
 */
import { describe, expect, it } from "vitest"

import { shellStatePolicy } from "@afenda/shadcn-ui/lib/constant/policy/shell/policy/shell-state-policy"
import {
  ShellStateKeys,
  shellStateKeySchema,
  shellStateKeyValues,
} from "@afenda/shadcn-ui/lib/constant/policy/shell/shell-state-key-vocabulary"
import { validateShellStatePolicy } from "@afenda/shadcn-ui/lib/constant/policy/shell/validation/validate-shell-state-policy"

describe("shell state key vocabulary", () => {
  it("keeps z.enum options aligned with the canonical tuple", () => {
    expect(shellStateKeySchema.options).toEqual([...shellStateKeyValues])
  })

  it("accepts every tuple value via the schema", () => {
    for (const key of shellStateKeyValues) {
      expect(shellStateKeySchema.safeParse(key).success).toBe(true)
    }
  })

  it("rejects keys not in the vocabulary", () => {
    expect(shellStateKeySchema.safeParse("not.in.vocabulary").success).toBe(false)
  })

  it("exposes ShellStateKeys as the same values and schema", () => {
    expect(ShellStateKeys.values).toBe(shellStateKeyValues)
    expect(ShellStateKeys.schema).toBe(shellStateKeySchema)
  })
})

describe("shell state key vocabulary ↔ shell-state-policy", () => {
  it("declares every vocabulary key exactly once", () => {
    const declared = shellStatePolicy.declaredStateKeys.map((d) => d.key)
    expect(new Set(declared).size).toBe(declared.length)

    const vocab = new Set(shellStateKeyValues)
    const fromPolicy = new Set(declared)
    expect(fromPolicy).toEqual(vocab)
  })

  it("passes shell state policy validation (live doctrine path)", () => {
    const report = validateShellStatePolicy()
    expect(report.ok, report.issues.map((i) => i.message).join("\n")).toBe(true)
  })
})
