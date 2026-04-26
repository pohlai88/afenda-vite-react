import { describe, expect, it } from "vitest"

import { BatchLoader } from "../src/batch-loader"

describe("BatchLoader", () => {
  it("batches queued keys into one batch request", async () => {
    const batches: string[][] = []
    const loader = new BatchLoader<string, string>(async (keys) => {
      batches.push([...keys])
      return new Map(keys.map((key) => [key, key.toUpperCase()]))
    })

    const [a, b] = await Promise.all([loader.load("a"), loader.load("b")])

    expect(a).toBe("A")
    expect(b).toBe("B")
    expect(batches).toEqual([["a", "b"]])
  })
})
