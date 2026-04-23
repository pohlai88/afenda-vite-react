/**
 * Vitest: `schema/identity/index.ts` barrel parity (IAM re-exports + bootstrap service).
 */
import { describe, expect, it } from "vitest"

import * as IdentityBarrel from "../index"
import {
  EXPECTED_IDENTITY_BARREL_EXPORT_COUNT,
  IDENTITY_BARREL_EXPORT_NAMES,
} from "./identity-inventory"

describe("schema/identity/index barrel manifest", () => {
  it("runtime export keys equal the inventory exactly", () => {
    expect(new Set(Object.keys(IdentityBarrel))).toEqual(
      new Set(IDENTITY_BARREL_EXPORT_NAMES)
    )
  })

  it("documents six exports (including deprecated users alias)", () => {
    expect(IDENTITY_BARREL_EXPORT_NAMES.length).toBe(
      EXPECTED_IDENTITY_BARREL_EXPORT_COUNT
    )
  })

  it.each(IDENTITY_BARREL_EXPORT_NAMES)("%s is defined", (name) => {
    const v = IdentityBarrel[name as keyof typeof IdentityBarrel]
    expect(v, name).toBeDefined()
  })

  it("keeps deprecated users alias identical to userAccounts", () => {
    expect(IdentityBarrel.users).toBe(IdentityBarrel.userAccounts)
  })
})
