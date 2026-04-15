import type {
  AuthChallengeState,
  AuthRecommendedMethod,
} from "../types/auth-ecosystem"

export type AuthFlowStep = "identify" | "method" | "challenge" | "complete"

export interface AuthFlowState {
  readonly step: AuthFlowStep
  readonly email: string
  readonly method: AuthRecommendedMethod
  readonly challenge: AuthChallengeState | null
  readonly receipt: readonly string[]
}

export type AuthFlowAction =
  | {
      readonly type: "identify-submitted"
      readonly email: string
      readonly method: AuthRecommendedMethod
    }
  | { readonly type: "method-selected"; readonly method: AuthRecommendedMethod }
  | {
      readonly type: "challenge-started"
      readonly challenge: AuthChallengeState
    }
  | { readonly type: "challenge-cleared" }
  | { readonly type: "complete"; readonly receipt: readonly string[] }
  | { readonly type: "reset" }

export interface AuthFlowQueryInput {
  readonly step?: string | null
  readonly email?: string | null
  readonly method?: string | null
  readonly challenge?: string | null
}

const defaultState: AuthFlowState = {
  step: "identify",
  email: "",
  method: "password",
  challenge: null,
  receipt: [],
}

function normalizeStep(step: string | null | undefined): AuthFlowStep {
  if (
    step === "identify" ||
    step === "method" ||
    step === "challenge" ||
    step === "complete"
  ) {
    return step
  }
  return "identify"
}

function normalizeMethod(
  method: string | null | undefined
): AuthRecommendedMethod {
  if (method === "password" || method === "social" || method === "passkey") {
    return method
  }
  return "password"
}

function challengeFromId(id: string): AuthChallengeState {
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString()
  return {
    challengeId: id,
    type: "passkey_assertion",
    expiresAt,
    attemptsRemaining: 3,
  }
}

export function createInitialAuthFlowState(
  query: AuthFlowQueryInput
): AuthFlowState {
  const step = normalizeStep(query.step)
  const method = normalizeMethod(query.method)
  const email = (query.email ?? "").trim()
  const challengeId = (query.challenge ?? "").trim()
  const challenge = challengeId.length > 0 ? challengeFromId(challengeId) : null

  if (step === "challenge" && challenge === null) {
    return {
      ...defaultState,
      step: "method",
      email,
      method,
    }
  }

  return {
    ...defaultState,
    step,
    email,
    method,
    challenge,
  }
}

export function authFlowReducer(
  state: AuthFlowState,
  action: AuthFlowAction
): AuthFlowState {
  switch (action.type) {
    case "identify-submitted":
      return {
        ...state,
        step: "method",
        email: action.email.trim(),
        method: action.method,
      }
    case "method-selected":
      return {
        ...state,
        method: action.method,
        step: action.method === "passkey" ? "challenge" : "method",
      }
    case "challenge-started":
      return {
        ...state,
        step: "challenge",
        challenge: action.challenge,
      }
    case "challenge-cleared":
      return {
        ...state,
        step: "method",
        challenge: null,
      }
    case "complete":
      return {
        ...state,
        step: "complete",
        receipt: action.receipt,
      }
    case "reset":
      return {
        ...defaultState,
        email: state.email,
      }
    default:
      return state
  }
}

export function authFlowStateToQuery(state: AuthFlowState): URLSearchParams {
  const params = new URLSearchParams()

  if (state.step !== "identify") {
    params.set("step", state.step)
  }
  if (state.email.length > 0) {
    params.set("email", state.email)
  }
  if (state.method !== "password") {
    params.set("method", state.method)
  }
  if (state.challenge) {
    params.set("challenge", state.challenge.challengeId)
  }
  return params
}

export function authFlowQueryToString(params: URLSearchParams): string {
  const next = params.toString()
  return next
}
