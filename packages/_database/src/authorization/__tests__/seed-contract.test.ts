import { describe, expect, it } from "vitest"

import {
  defaultPermissions,
  defaultRolePermissionKeys,
} from "../seeds/default-permissions-and-roles"

describe("authorization seed contract", () => {
  it("keeps default permission keys unique", () => {
    const keys = defaultPermissions.map((permission) => permission.key)

    expect(new Set(keys).size).toBe(keys.length)
  })

  it("keeps admin as the full default permission union", () => {
    expect(defaultRolePermissionKeys.admin).toEqual(
      defaultPermissions.map((permission) => permission.key)
    )
  })

  it("keeps default roles additive", () => {
    expect(defaultRolePermissionKeys.operator).toEqual(
      expect.arrayContaining([...defaultRolePermissionKeys.viewer])
    )
    expect(defaultRolePermissionKeys.manager).toEqual(
      expect.arrayContaining([...defaultRolePermissionKeys.operator])
    )
  })
})
