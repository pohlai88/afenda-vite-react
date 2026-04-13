import { describe, expect, it } from "vitest"

import { createShellCommandActivityStore } from "../store/shell-command-activity-store"

describe("ShellCommandActivityStore", () => {
  it("tracks running state correctly", () => {
    const store = createShellCommandActivityStore()

    expect(store.isRunning("test")).toBe(false)

    store.start("test")
    expect(store.isRunning("test")).toBe(true)

    store.finish("test")
    expect(store.isRunning("test")).toBe(false)
  })

  it("prevents duplicate start", () => {
    const store = createShellCommandActivityStore()

    expect(store.start("test")).toBe(true)
    expect(store.start("test")).toBe(false)
  })

  it("notifies subscribers", () => {
    const store = createShellCommandActivityStore()

    let count = 0
    const unsub = store.subscribe(() => {
      count += 1
    })

    store.start("test")
    store.finish("test")

    expect(count).toBe(2)

    unsub()
  })

  it("rejects empty command id for start", () => {
    const store = createShellCommandActivityStore()
    expect(store.start("   ")).toBe(false)
  })
})
