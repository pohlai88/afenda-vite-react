import { describe, expect, it } from "vitest"

import { resolveSetupState } from "../contracts/auth-setup-state"

describe("resolveSetupState", () => {
  it("returns auth when there is no authenticated session", () => {
    expect(
      resolveSetupState({
        isAuthenticated: false,
        hasActiveOrganization: false,
        user: null,
      })
    ).toBe("auth")
  })

  it("requires a workspace when the user is authenticated without an active organization", () => {
    expect(
      resolveSetupState({
        isAuthenticated: true,
        hasActiveOrganization: false,
        user: {
          name: "Jane Doe",
          username: "jane",
        },
      })
    ).toBe("workspace_required")
  })

  it("recommends profile completion when workspace context exists but required identity fields are missing", () => {
    expect(
      resolveSetupState(
        {
          isAuthenticated: true,
          hasActiveOrganization: true,
          user: {
            name: "Jane Doe",
            displayUsername: "",
          },
        },
        {
          requireUsername: true,
          useDisplayUsername: true,
        }
      )
    ).toBe("profile_recommended")
  })

  it("returns ready when auth, workspace, and profile heuristics are satisfied", () => {
    expect(
      resolveSetupState(
        {
          isAuthenticated: true,
          hasActiveOrganization: true,
          user: {
            name: "Jane Doe",
            username: "jane",
          },
        },
        {
          requireUsername: true,
        }
      )
    ).toBe("ready")
  })
})
