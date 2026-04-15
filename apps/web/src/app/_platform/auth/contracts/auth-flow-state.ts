import type {
  AuthChallengeMethod,
  AuthChallengePrompt,
  AuthChallengeTicket,
} from "./auth-challenge-ticket"
import type { AuthChallengeSummaryViewModel } from "./auth-view-model"
import type { AuthReturnTarget } from "./auth-return-target"

export type AuthLoginMethod = "password" | "social" | "passkey"
export type AuthSocialProvider = "google" | "github"

type LoginFlowBase = {
  readonly email: string
  readonly selectedMethod: AuthLoginMethod
  readonly receipt: readonly string[]
}

export type LoginFlowState =
  | {
      readonly kind: "identify"
      readonly emailInput: string
      readonly receipt: readonly string[]
    }
  | (LoginFlowBase & {
      readonly kind: "password-entry"
    })
  | (LoginFlowBase & {
      readonly kind: "provider-selection"
    })
  | (LoginFlowBase & {
      readonly kind: "provider-redirecting"
      readonly provider: AuthSocialProvider
    })
  | (LoginFlowBase & {
      readonly kind: "challenge-requesting"
      readonly challengeMethod: AuthChallengeMethod
    })
  | (LoginFlowBase & {
      readonly kind: "challenge-ready"
      readonly challengeMethod: AuthChallengeMethod
      readonly ticket: AuthChallengeTicket
      readonly prompt: AuthChallengePrompt
    })
  | (LoginFlowBase & {
      readonly kind: "challenge-verifying"
      readonly challengeMethod: AuthChallengeMethod
      readonly ticket: AuthChallengeTicket
      readonly prompt: AuthChallengePrompt
    })
  | (LoginFlowBase & {
      readonly kind: "completed"
      readonly returnTarget: AuthReturnTarget
    })
  | (LoginFlowBase & {
      readonly kind: "redirecting"
      readonly returnTarget: AuthReturnTarget
    })
  | (LoginFlowBase & {
      readonly kind: "failure"
      readonly code: string
      readonly message: string
      readonly recoverable: boolean
    })

export function createInitialLoginFlowState(emailInput = ""): LoginFlowState {
  return {
    kind: "identify",
    emailInput: emailInput.trim(),
    receipt: [],
  }
}

function baseFromIdentify(
  email: string,
  selectedMethod: AuthLoginMethod,
  receipt: readonly string[]
): LoginFlowBase {
  return { email: email.trim(), selectedMethod, receipt }
}

export type LoginFlowAction =
  | {
      readonly type: "identify-submitted"
      readonly email: string
      readonly recommendedMethod: AuthLoginMethod
    }
  | { readonly type: "method-selected"; readonly method: AuthLoginMethod }
  | { readonly type: "challenge-cleared" }
  | { readonly type: "challenge-verify-start" }
  | {
      readonly type: "sign-in-success"
      readonly receipt: readonly string[]
      readonly returnTarget: AuthReturnTarget
    }
  | {
      readonly type: "provider-redirect-start"
      readonly provider: AuthSocialProvider
    }
  | { readonly type: "provider-redirect-end" }

/** Reducer used by tests and legacy harness; login UI uses {@link useLoginFlowController} setState. */
export function loginFlowReducer(
  state: LoginFlowState,
  action: LoginFlowAction
): LoginFlowState {
  switch (action.type) {
    case "identify-submitted": {
      const email = action.email.trim()
      const r = action.recommendedMethod
      if (r === "password") {
        return {
          kind: "password-entry",
          ...baseFromIdentify(email, "password", []),
        }
      }
      if (r === "social") {
        return {
          kind: "provider-selection",
          ...baseFromIdentify(email, "social", []),
        }
      }
      return {
        kind: "challenge-requesting",
        ...baseFromIdentify(email, "passkey", []),
        challengeMethod: "passkey",
      }
    }
    case "method-selected": {
      if (state.kind === "identify") {
        return state
      }
      const email = state.email
      const receipt = state.receipt
      const m = action.method
      if (m === "passkey") {
        return {
          kind: "challenge-requesting",
          ...baseFromIdentify(email, "passkey", receipt),
          challengeMethod: "passkey",
        }
      }
      if (m === "social") {
        return {
          kind: "provider-selection",
          ...baseFromIdentify(email, "social", receipt),
        }
      }
      return {
        kind: "password-entry",
        ...baseFromIdentify(email, "password", receipt),
      }
    }
    case "challenge-cleared": {
      if (
        state.kind !== "challenge-requesting" &&
        state.kind !== "challenge-ready" &&
        state.kind !== "challenge-verifying"
      ) {
        return state
      }
      return {
        kind: "password-entry",
        ...baseFromIdentify(state.email, "password", state.receipt),
      }
    }
    case "challenge-verify-start": {
      if (state.kind !== "challenge-ready") {
        return state
      }
      return {
        kind: "challenge-verifying",
        email: state.email,
        selectedMethod: state.selectedMethod,
        receipt: state.receipt,
        challengeMethod: state.challengeMethod,
        ticket: state.ticket,
        prompt: state.prompt,
      }
    }
    case "sign-in-success": {
      if (state.kind === "identify") {
        return state
      }
      return {
        kind: "completed",
        email: state.email,
        selectedMethod: state.selectedMethod,
        receipt: action.receipt,
        returnTarget: action.returnTarget,
      }
    }
    case "provider-redirect-start": {
      if (state.kind !== "provider-selection") {
        return state
      }
      return {
        kind: "provider-redirecting",
        email: state.email,
        selectedMethod: state.selectedMethod,
        receipt: state.receipt,
        provider: action.provider,
      }
    }
    case "provider-redirect-end": {
      if (state.kind !== "provider-redirecting") {
        return state
      }
      return {
        kind: "provider-selection",
        ...baseFromIdentify(state.email, "social", state.receipt),
      }
    }
    default:
      return state
  }
}

/** @deprecated Prefer {@link LoginFlowState} `kind` — kept for session panel labels. */
export type AuthFlowStep = "identify" | "method" | "challenge" | "complete"

export type SessionContinuityFlowStep = AuthFlowStep

export function loginFlowContinuityStep(
  state: LoginFlowState
): SessionContinuityFlowStep {
  switch (state.kind) {
    case "identify":
      return "identify"
    case "password-entry":
    case "provider-selection":
    case "provider-redirecting":
    case "failure":
      return "method"
    case "challenge-requesting":
    case "challenge-ready":
    case "challenge-verifying":
      return "challenge"
    case "completed":
    case "redirecting":
      return "complete"
  }
}

export function loginFlowEmail(state: LoginFlowState): string {
  if (state.kind === "identify") {
    return state.emailInput
  }
  return state.email
}

export function loginFlowChallengeSummary(
  state: LoginFlowState
): AuthChallengeSummaryViewModel | null {
  if (state.kind === "challenge-requesting") {
    return {
      title: "Preparing secure challenge",
      description: "Requesting a server-issued challenge for this sign-in.",
    }
  }
  if (state.kind === "challenge-ready" || state.kind === "challenge-verifying") {
    return {
      title: state.prompt.title,
      description: state.prompt.description,
      expiresAtIso: state.prompt.expiresAtIso,
      attemptsRemaining: state.prompt.attemptsRemaining,
    }
  }
  return null
}

export function loginFlowSelectedMethod(
  state: LoginFlowState
): AuthLoginMethod | null {
  if (state.kind === "identify") {
    return null
  }
  return state.selectedMethod
}
