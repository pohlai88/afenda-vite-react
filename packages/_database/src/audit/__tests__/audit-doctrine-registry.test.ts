import { describe, expect, it } from "vitest"

import {
  getAuditDoctrineDefinition,
  getAuditInvariantDefinition,
  listAuditDoctrineDefinitions,
  listAuditInvariantDefinitions,
} from "../contracts/audit-doctrine-registry"

describe("audit-doctrine-registry", () => {
  it("list helpers return all definitions", () => {
    expect(listAuditDoctrineDefinitions().length).toBeGreaterThan(0)
    expect(listAuditInvariantDefinitions().length).toBeGreaterThan(0)
  })

  it("getters return stable rows", () => {
    const d = getAuditDoctrineDefinition("doctrine.audit.append-only")
    expect(d.key).toBe("doctrine.audit.append-only")
    const inv = getAuditInvariantDefinition(
      "invariant.audit.no-in-place-correction"
    )
    expect(inv.doctrineRef).toBe("doctrine.audit.append-only")
  })
})
