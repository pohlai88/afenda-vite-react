import { describe, expect, it } from "vitest"

import { createMachineRegistry } from "../src/core/registry.js"
import { lynxCoreManifest, lynxGeneralSkill } from "../src/skills/index.js"

describe("createMachineRegistry", () => {
  it("registers skills from manifests", () => {
    const registry = createMachineRegistry([lynxCoreManifest])

    expect(registry.listSkills()).toEqual([lynxGeneralSkill])
    expect(registry.getSkill("general")).toBe(lynxGeneralSkill)
  })

  it("rejects duplicate skill ids across manifests", () => {
    expect(() =>
      createMachineRegistry([
        lynxCoreManifest,
        {
          id: "duplicate-manifest",
          name: "Duplicate",
          version: "0.0.0",
          skills: [lynxGeneralSkill],
        },
      ])
    ).toThrow('Machine skill "general" is registered twice.')
  })
})
