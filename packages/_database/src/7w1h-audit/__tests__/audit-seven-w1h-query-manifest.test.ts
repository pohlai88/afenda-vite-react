import { describe, expect, it } from "vitest"

import { auditSevenW1hPgPathLiteral } from "../contracts/audit-seven-w1h-query-manifest"

describe("audit-seven-w1h-query-manifest", () => {
  it("auditSevenW1hPgPathLiteral formats a two-segment JSON path", () => {
    expect(auditSevenW1hPgPathLiteral(["where", "pathname"])).toBe(
      "'{where,pathname}'"
    )
  })
})
