import { describe, expect, it } from "vitest"

import {
  buildAuditChangeEvidence,
  computeAuditFieldChanges,
  maskAuditSnapshot,
} from "../services/build-audit-change-evidence"

describe("build-audit-change-evidence", () => {
  it("computes field-level changes and masks sensitive fields", () => {
    const evidence = buildAuditChangeEvidence({
      previousValue: {
        name: "Alice",
        password: "before-secret",
        profile: { email: "alice@example.com" },
      },
      nextValue: {
        name: "Bob",
        password: "after-secret",
        profile: { email: "bob@example.com" },
      },
    })

    expect(evidence.changes).toEqual([
      {
        field: "name",
        oldValue: "Alice",
        newValue: "Bob",
        masked: false,
      },
      {
        field: "password",
        oldValue: "***",
        newValue: "***",
        masked: true,
      },
      {
        field: "profile.email",
        oldValue: "alice@example.com",
        newValue: "bob@example.com",
        masked: false,
      },
    ])
    expect(evidence.previousValue).toEqual({
      name: "Alice",
      password: "***",
      profile: { email: "alice@example.com" },
    })
    expect(evidence.nextValue).toEqual({
      name: "Bob",
      password: "***",
      profile: { email: "bob@example.com" },
    })
  })

  it("ignores configured fields", () => {
    const changes = computeAuditFieldChanges(
      { updatedAt: "old", status: "draft" },
      { updatedAt: "new", status: "posted" },
      { ignoredFields: ["updatedAt"] }
    )

    expect(changes).toEqual([
      {
        field: "status",
        oldValue: "draft",
        newValue: "posted",
        masked: false,
      },
    ])
  })

  it("can omit snapshots when only field changes are needed", () => {
    const evidence = buildAuditChangeEvidence({
      previousValue: { token: "abc" },
      nextValue: { token: "xyz" },
      includeSnapshots: false,
    })

    expect(evidence).toEqual({
      changes: [
        {
          field: "token",
          oldValue: "***",
          newValue: "***",
          masked: true,
        },
      ],
    })
  })

  it("masks nested snapshots recursively", () => {
    expect(
      maskAuditSnapshot({
        nested: {
          apiKey: "secret-value",
        },
      })
    ).toEqual({
      nested: {
        apiKey: "***",
      },
    })
  })
})
