import { describe, expect, it } from "vitest"

import {
  PermissionDeniedError,
  hasPermissionInKeys,
  permissionRowsToKeys,
} from "../policy/permission-policy"
import {
  defaultPermissions,
  defaultRolePermissionKeys,
} from "../seeds/default-permissions-and-roles"

describe("authorization permission policy", () => {
  it("normalizes effective permission rows into a sorted union", () => {
    expect(
      permissionRowsToKeys([
        { key: "finance:gl:read" },
        { key: "finance:journal:post" },
        { key: "finance:gl:read" },
      ])
    ).toEqual(["finance:gl:read", "finance:journal:post"])
  })

  it("checks permission membership by stable key", () => {
    expect(hasPermissionInKeys(["finance:gl:read"], "finance:gl:read")).toBe(
      true
    )
    expect(hasPermissionInKeys(["finance:gl:read"], "admin:roles:manage")).toBe(
      false
    )
  })

  it("uses default role permission keys that exist in the seed catalog", () => {
    const permissionKeys = new Set(
      defaultPermissions.map((permission) => permission.key)
    )
    const unknownKeys = Object.values(defaultRolePermissionKeys)
      .flat()
      .filter((permissionKey) => !permissionKeys.has(permissionKey))

    expect(unknownKeys).toEqual([])
  })

  it("exposes a typed denial error for server policy callers", () => {
    const error = new PermissionDeniedError("admin:roles:manage")

    expect(error.name).toBe("PermissionDeniedError")
    expect(error.message).toContain("admin:roles:manage")
  })
})
