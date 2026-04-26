import { describe, expect, it } from "vitest"

import { buildCursorQuery, decodeCursor, encodeCursor } from "../src/cursor"

describe("cursor helpers", () => {
  it("encodes and decodes cursor payloads", () => {
    const cursor = encodeCursor("abc", "2026-04-25T00:00:00.000Z")
    expect(decodeCursor(cursor)).toEqual({
      id: "abc",
      sortValue: "2026-04-25T00:00:00.000Z",
    })
  })

  it("builds a cursor query descriptor", () => {
    const cursor = encodeCursor("row-1", 123)
    expect(
      buildCursorQuery(
        { cursor, direction: "forward", limit: 20 },
        "createdAt",
        "desc"
      )
    ).toEqual({
      take: 21,
      orderBy: { createdAt: "desc" },
      cursor: { id: "row-1" },
      skip: 1,
    })
  })
})
