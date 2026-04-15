import { describe, expect, it } from "vitest"

import {
  authFlowReducer,
  authFlowStateToQuery,
  createInitialAuthFlowState,
} from "../services/auth-flow-orchestrator"

describe("auth flow orchestrator", () => {
  it("builds initial state from query params", () => {
    const state = createInitialAuthFlowState({
      step: "challenge",
      email: "ops@afenda.local",
      method: "passkey",
      challenge: "pk_abc",
    })
    expect(state.step).toBe("challenge")
    expect(state.method).toBe("passkey")
    expect(state.email).toBe("ops@afenda.local")
    expect(state.challenge?.challengeId).toBe("pk_abc")
  })

  it("moves identify -> method -> challenge -> complete", () => {
    const identify = createInitialAuthFlowState({})
    const method = authFlowReducer(identify, {
      type: "identify-submitted",
      email: "user@afenda.local",
      method: "password",
    })
    expect(method.step).toBe("method")

    const challenged = authFlowReducer(method, {
      type: "challenge-started",
      challenge: {
        challengeId: "pk_1",
        type: "passkey_assertion",
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
        attemptsRemaining: 3,
      },
    })
    expect(challenged.step).toBe("challenge")

    const completed = authFlowReducer(challenged, {
      type: "complete",
      receipt: ["challenge ok"],
    })
    expect(completed.step).toBe("complete")
    expect(completed.receipt).toHaveLength(1)
  })

  it("serializes state into stable query params", () => {
    const state = createInitialAuthFlowState({
      step: "method",
      email: "user@afenda.local",
      method: "social",
    })
    const params = authFlowStateToQuery(state)
    expect(params.get("step")).toBe("method")
    expect(params.get("email")).toBe("user@afenda.local")
    expect(params.get("method")).toBe("social")
  })
})
