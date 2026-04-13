import { describe, expect, it } from "vitest"

import { createAppWorker } from "../create-app-worker"

describe("createAppWorker", () => {
  it("returns a Worker in environments that support it", () => {
    if (typeof Worker === "undefined") {
      return
    }
    const w = createAppWorker()
    expect(w).toBeInstanceOf(Worker)
    w.terminate()
  })
})
