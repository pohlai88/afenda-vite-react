import { describe, expect, it, vi } from "vitest"

import { createShellCommandRegistry } from "../registry/shell-command-registry"

describe("createShellCommandRegistry", () => {
  it("returns definition for registered command id", () => {
    const handler = vi.fn()
    const registry = createShellCommandRegistry([{ commandId: "a.b", handler }])

    expect(registry.getDefinition("a.b")?.handler).toBe(handler)
    expect(registry.getDefinition(" a.b ")?.handler).toBe(handler)
  })

  it("returns undefined for unknown command id", () => {
    const registry = createShellCommandRegistry([
      { commandId: "known", handler: () => {} },
    ])

    expect(registry.getDefinition("unknown")).toBeUndefined()
  })

  it("throws when command id is empty after trim", () => {
    expect(() =>
      createShellCommandRegistry([{ commandId: "  ", handler: () => {} }])
    ).toThrow(/must not be empty/)
  })

  it("throws on duplicate command ids", () => {
    const h = () => {}
    expect(() =>
      createShellCommandRegistry([
        { commandId: "dup", handler: h },
        { commandId: "dup", handler: h },
      ])
    ).toThrow(/Duplicate shell command id/)
  })
})
