import { describe, expect, it } from "vitest"

import {
  getCapabilitiesForMode,
  getModeScopePolicy,
} from "../src/plugins/features-sdk/mode/operator-mode-policy.js"

describe("governed Operator mode policy", () => {
  it("keeps guided operator on read and safe diagnostic capabilities", () => {
    expect(getCapabilitiesForMode("guided_operator")).toEqual([
      "read",
      "diagnose",
      "execute_safe",
    ])
    expect(getModeScopePolicy("guided_operator")).toMatchObject({
      singleExactNextCommand: true,
      allowMutation: false,
    })
  })

  it("allows architect commander to reach guarded generation", () => {
    expect(getCapabilitiesForMode("architect_commander")).toContain(
      "generate_guarded"
    )
    expect(getModeScopePolicy("architect_commander")).toMatchObject({
      allowMutation: true,
    })
  })

  it("lets feature devops plan without mutation", () => {
    expect(getCapabilitiesForMode("feature_devops")).toEqual([
      "read",
      "diagnose",
      "execute_safe",
      "plan",
    ])
    expect(getModeScopePolicy("feature_devops")).toMatchObject({
      allowMutation: false,
    })
  })
})
