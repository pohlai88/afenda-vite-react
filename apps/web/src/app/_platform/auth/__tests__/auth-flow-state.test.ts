import { describe, expect, it } from "vitest"

import {
  createInitialLoginFlowState,
  loginFlowReducer,
} from "../contracts/auth-flow-state"
import { createAuthReturnTarget } from "../contracts/auth-return-target"

describe("login flow state", () => {
  it("starts in identify", () => {
    const state = createInitialLoginFlowState()
    expect(state.kind).toBe("identify")
  })

  it("moves identify -> password-entry", () => {
    const identify = createInitialLoginFlowState()
    const next = loginFlowReducer(identify, {
      type: "identify-submitted",
      email: "user@afenda.local",
      recommendedMethod: "password",
    })
    expect(next.kind).toBe("password-entry")
    if (next.kind === "password-entry") {
      expect(next.email).toBe("user@afenda.local")
      expect(next.selectedMethod).toBe("password")
    }
  })

  it("completes sign-in with return target", () => {
    const password = loginFlowReducer(createInitialLoginFlowState(), {
      type: "identify-submitted",
      email: "user@afenda.local",
      recommendedMethod: "password",
    })
    expect(password.kind).toBe("password-entry")
    if (password.kind !== "password-entry") {
      throw new Error("expected password-entry")
    }
    const rt = createAuthReturnTarget("/app/workspace-demo", "?x=1", "#h")
    const done = loginFlowReducer(password, {
      type: "sign-in-success",
      receipt: ["ok"],
      returnTarget: rt,
    })
    expect(done.kind).toBe("completed")
    if (done.kind === "completed") {
      expect(done.returnTarget.pathname).toBe("/app/workspace-demo")
      expect(done.receipt).toContain("ok")
    }
  })
})
