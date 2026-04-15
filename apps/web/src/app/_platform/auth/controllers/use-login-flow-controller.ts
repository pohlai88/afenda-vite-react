import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { authClient } from "../auth-client"
import {
  authAppCallbackUrl,
  authPostLoginPath,
} from "../auth-redirect-urls"
import type {
  AuthChallengeMethod,
  AuthChallengeTicket,
} from "../contracts/auth-challenge-ticket"
import {
  createInitialLoginFlowState,
  type AuthLoginMethod,
  type AuthSocialProvider,
  type LoginFlowState,
} from "../contracts/auth-flow-state"
import type {
  AuthContinuityViewModel,
  AuthIntelligenceResource,
  AuthStatusMessageViewModel,
} from "../contracts/auth-view-model"
import {
  authReturnTargetToPath,
  normalizeAuthReturnTarget,
} from "../contracts/auth-return-target"
import type { AuthRecommendedMethod } from "../contracts/auth-domain"
import { useAuthIntelligence } from "../hooks/use-auth-intelligence"
import { mapAuthErrorToUserMessage } from "../mappers/map-auth-error-to-user-message"
import {
  requestAuthChallenge,
  verifyAuthChallengeTicket,
} from "../services/auth-challenge-service"
import { resolveAuthErrorCode } from "../services/auth-error-service"

function recommendedToLoginMethod(
  method: AuthRecommendedMethod
): AuthLoginMethod {
  return method
}

function loginMethodToRecommended(
  method: AuthLoginMethod
): AuthRecommendedMethod {
  return method
}

function currentEmail(state: LoginFlowState): string {
  return state.kind === "identify" ? state.emailInput.trim() : state.email
}

function currentReceipt(state: LoginFlowState): readonly string[] {
  return state.receipt
}

function enterCredentialMethod(
  email: string,
  method: Exclude<AuthLoginMethod, "passkey">,
  receipt: readonly string[] = []
): LoginFlowState {
  if (method === "password") {
    return {
      kind: "password-entry",
      email,
      selectedMethod: method,
      receipt,
    }
  }

  return {
    kind: "provider-selection",
    email,
    selectedMethod: method,
    receipt,
  }
}

function continuityFromState(state: LoginFlowState): AuthContinuityViewModel {
  if (state.kind === "identify") {
    return {
      currentMethod: "password",
      currentStep: "identify",
      challenge: null,
    }
  }

  if (state.kind === "challenge-requesting") {
    return {
      currentMethod: loginMethodToRecommended(state.selectedMethod),
      currentStep: "challenge",
      challenge: {
        title: "Preparing secure challenge",
        description: "Requesting a server-issued challenge for this sign-in.",
      },
    }
  }

  if (state.kind === "challenge-ready" || state.kind === "challenge-verifying") {
    return {
      currentMethod: loginMethodToRecommended(state.selectedMethod),
      currentStep: "challenge",
      challenge: {
        title: state.prompt.title,
        description: state.prompt.description,
        expiresAtIso: state.prompt.expiresAtIso,
        attemptsRemaining: state.prompt.attemptsRemaining,
      },
    }
  }

  if (state.kind === "completed" || state.kind === "redirecting") {
    return {
      currentMethod: loginMethodToRecommended(state.selectedMethod),
      currentStep: "complete",
      challenge: null,
    }
  }

  return {
    currentMethod: loginMethodToRecommended(state.selectedMethod),
    currentStep: "method",
    challenge: null,
  }
}

export type LoginFlowViewKind =
  | "identify"
  | "password-entry"
  | "social-select"
  | "provider-redirecting"
  | "challenge"
  | "complete"

export function loginViewKindFromState(flow: LoginFlowState): LoginFlowViewKind {
  switch (flow.kind) {
    case "identify":
      return "identify"
    case "password-entry":
      return "password-entry"
    case "provider-selection":
      return "social-select"
    case "provider-redirecting":
      return "provider-redirecting"
    case "challenge-requesting":
    case "challenge-ready":
    case "challenge-verifying":
      return "challenge"
    case "completed":
    case "redirecting":
      return "complete"
    case "failure":
      return "password-entry"
  }
}

export function useLoginFlowController() {
  const navigate = useNavigate()
  const location = useLocation()
  const intelligence = useAuthIntelligence()

  const [state, setState] = useState<LoginFlowState>(() =>
    createInitialLoginFlowState()
  )
  const [password, setPassword] = useState("")
  const [pending, setPending] = useState(false)
  const [statusMessage, setStatusMessage] =
    useState<AuthStatusMessageViewModel | null>(null)

  const returnTarget = useMemo(
    () =>
      normalizeAuthReturnTarget(location.state, authPostLoginPath(undefined)),
    [location.state]
  )

  const intelligenceResource = useMemo<AuthIntelligenceResource>(() => {
    if (intelligence.errorCode) {
      return {
        status: "unavailable",
        snapshot: intelligence.data,
        code: intelligence.errorCode,
      }
    }

    if (intelligence.isLoading) {
      return {
        status: "loading",
        snapshot: intelligence.data,
        code: null,
      }
    }

    return {
      status: "available",
      snapshot: intelligence.data,
      code: null,
    }
  }, [intelligence.data, intelligence.errorCode, intelligence.isLoading])

  const continuity = useMemo(() => continuityFromState(state), [state])

  useEffect(() => {
    if (state.kind !== "completed") {
      return
    }

    const target = authReturnTargetToPath(state.returnTarget)
    const timeoutId = window.setTimeout(() => {
      setState((current) => {
        if (current.kind !== "completed") {
          return current
        }

        return {
          ...current,
          kind: "redirecting",
        }
      })

      void navigate(target, {
        replace: true,
      })
    }, 700)

    return () => window.clearTimeout(timeoutId)
  }, [navigate, state])

  function setEmailInput(next: string) {
    setState((current) => {
      if (current.kind !== "identify") {
        return current
      }

      return {
        ...current,
        emailInput: next,
      }
    })
  }

  function clearMessage() {
    setStatusMessage(null)
  }

  function complete(
    email: string,
    selectedMethod: AuthLoginMethod,
    receipt: readonly string[]
  ) {
    setStatusMessage({
      tone: "muted",
      text: "Redirecting to your workspace…",
    })

    setState({
      kind: "completed",
      email,
      selectedMethod,
      receipt,
      returnTarget,
    })
  }

  function resetFlow() {
    setPassword("")
    setStatusMessage(null)
    setState(createInitialLoginFlowState(currentEmail(state)))
  }

  async function startChallenge(
    email: string,
    method: AuthChallengeMethod,
    receipt: readonly string[] = []
  ) {
    setStatusMessage({
      tone: "muted",
      text: "Preparing secure challenge…",
    })

    setState({
      kind: "challenge-requesting",
      email,
      selectedMethod: "passkey",
      challengeMethod: method,
      receipt,
    })

    setPending(true)
    try {
      const result = await requestAuthChallenge({
        email,
        method,
      })

      if (!result.ok) {
        setStatusMessage({
          tone: "destructive",
          text: mapAuthErrorToUserMessage(
            result.code,
            "Unable to prepare a secure challenge."
          ),
        })

        setState(enterCredentialMethod(email, "password", receipt))
        return
      }

      setStatusMessage(null)
      setState({
        kind: "challenge-ready",
        email,
        selectedMethod: "passkey",
        challengeMethod: method,
        ticket: result.data.ticket,
        prompt: result.data.prompt,
        receipt,
      })
    } finally {
      setPending(false)
    }
  }

  function selectMethod(next: AuthLoginMethod) {
    clearMessage()

    const email = currentEmail(state)
    if (email.length === 0) {
      return
    }

    setPassword("")

    if (next === "passkey") {
      if (!intelligence.data.passkeyAvailable) {
        setStatusMessage({
          tone: "warning",
          text: "Passkey is not ready on this device.",
        })
        return
      }

      void startChallenge(email, "passkey", currentReceipt(state))
      return
    }

    setState(enterCredentialMethod(email, next, currentReceipt(state)))
  }

  function submitIdentify() {
    clearMessage()

    if (state.kind !== "identify") {
      return
    }

    const email = state.emailInput.trim()
    if (email.length === 0) {
      setStatusMessage({
        tone: "destructive",
        text: "Enter an email address to continue.",
      })
      return
    }

    const recommended = recommendedToLoginMethod(
      intelligence.data.recommendedMethod
    )

    if (recommended === "passkey") {
      void startChallenge(email, "passkey")
      return
    }

    setState(enterCredentialMethod(email, recommended))
  }

  async function submitPassword() {
    clearMessage()

    if (state.kind !== "password-entry") {
      return
    }

    if (password.trim().length === 0) {
      setStatusMessage({
        tone: "destructive",
        text: "Enter your password to continue.",
      })
      return
    }

    setStatusMessage({
      tone: "muted",
      text: "Verifying credentials…",
    })

    setPending(true)
    try {
      const { error } = await authClient.signIn.email({
        email: state.email,
        password,
      })

      if (error) {
        const code = resolveAuthErrorCode(error)
        setStatusMessage({
          tone: "destructive",
          text: mapAuthErrorToUserMessage(
            code,
            "Unable to sign in with password."
          ),
        })
        return
      }

      complete(state.email, state.selectedMethod, [
        "Identity proof matched active credentials.",
        "Session cookie rotated with secure transport.",
        "Risk checks evaluated for current device posture.",
      ])
    } catch (error) {
      const code = resolveAuthErrorCode(error)
      setStatusMessage({
        tone: "destructive",
        text: mapAuthErrorToUserMessage(
          code,
          "Unable to sign in with password."
        ),
      })
    } finally {
      setPending(false)
    }
  }

  async function signInWithProvider(provider: AuthSocialProvider) {
    clearMessage()

    if (state.kind !== "provider-selection") {
      return
    }

    setState({
      ...state,
      kind: "provider-redirecting",
      provider,
    })

    setPending(true)
    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: authAppCallbackUrl(),
      })

      if (error) {
        const code = resolveAuthErrorCode(error)
        setStatusMessage({
          tone: "destructive",
          text: mapAuthErrorToUserMessage(
            code,
            "Unable to continue with the selected provider."
          ),
        })

        setState({
          kind: "provider-selection",
          email: state.email,
          selectedMethod: state.selectedMethod,
          receipt: state.receipt,
        })
      }
    } catch (error) {
      const code = resolveAuthErrorCode(error)
      setStatusMessage({
        tone: "destructive",
        text: mapAuthErrorToUserMessage(
          code,
          "Unable to continue with the selected provider."
        ),
      })

      setState({
        kind: "provider-selection",
        email: state.email,
        selectedMethod: state.selectedMethod,
        receipt: state.receipt,
      })
    } finally {
      setPending(false)
    }
  }

  async function verifyChallenge() {
    clearMessage()

    if (state.kind !== "challenge-ready") {
      return
    }

    setStatusMessage({
      tone: "muted",
      text: "Verifying challenge…",
    })

    setState({
      ...state,
      kind: "challenge-verifying",
    })

    setPending(true)
    try {
      const result = await verifyAuthChallengeTicket(state.ticket)

      if (!result.ok) {
        setStatusMessage({
          tone: "destructive",
          text: mapAuthErrorToUserMessage(
            result.code,
            "Challenge verification failed. Try another method."
          ),
        })

        setState({
          ...state,
          kind: "challenge-ready",
        })
        return
      }

      if (!result.data.verified) {
        setStatusMessage({
          tone: "destructive",
          text: "Challenge verification failed. Try another method.",
        })

        setState({
          ...state,
          kind: "challenge-ready",
        })
        return
      }

      complete(state.email, state.selectedMethod, result.data.receipt)
    } finally {
      setPending(false)
    }
  }

  function clearChallenge() {
    if (
      state.kind !== "challenge-requesting" &&
      state.kind !== "challenge-ready" &&
      state.kind !== "challenge-verifying"
    ) {
      return
    }

    clearMessage()
    setState(enterCredentialMethod(state.email, "password", state.receipt))
  }

  const emailInput =
    state.kind === "identify" ? state.emailInput : currentEmail(state)

  return {
    state,
    password,
    setPassword,
    emailInput,
    setEmailInput,
    statusMessage,
    pending,
    intelligence,
    intelligenceResource,
    continuity,
    selectMethod,
    submitIdentify,
    submitPassword,
    signInWithProvider,
    verifyChallenge,
    clearChallenge,
    resetFlow,
  } as const
}
