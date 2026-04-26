import { describe, expect, it } from "vitest"

import { RequestDeduplicator } from "../src/request-deduplicator"

describe("RequestDeduplicator", () => {
  it("reuses the same in-flight request", async () => {
    const deduplicator = new RequestDeduplicator()
    let calls = 0

    const factory = async () => {
      calls += 1
      return "ok"
    }

    const [first, second] = await Promise.all([
      deduplicator.dedupe("same", factory),
      deduplicator.dedupe("same", factory),
    ])

    expect(first).toBe("ok")
    expect(second).toBe("ok")
    expect(calls).toBe(1)
  })
})
