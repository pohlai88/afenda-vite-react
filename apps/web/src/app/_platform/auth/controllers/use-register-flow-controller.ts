import { useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { authAppCallbackUrl, authPostLoginPath } from "../auth-redirect-urls"
import type {
  AuthContinuityViewModel,
  AuthStatusMessageViewModel,
} from "../contracts/auth-view-model"
import {
  authReturnTargetToPath,
  normalizeAuthReturnTarget,
} from "../contracts/auth-return-target"
import { useAuthIntelligence } from "../hooks/use-auth-intelligence"
import { mapAuthErrorToUserMessage } from "../mappers/map-auth-error-to-user-message"
import { signUpWithEmail } from "../services/auth-entry-service"

export function useRegisterFlowController() {
  const navigate = useNavigate()
  const location = useLocation()
  const intelligence = useAuthIntelligence()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [pending, setPending] = useState(false)
  const [statusMessage, setStatusMessage] =
    useState<AuthStatusMessageViewModel | null>(null)

  const returnTarget = useMemo(
    () =>
      normalizeAuthReturnTarget(location.state, authPostLoginPath(undefined)),
    [location.state]
  )

  const continuity = useMemo<AuthContinuityViewModel>(
    () => ({
      currentMethod: "password",
      currentStep: "method",
      challenge: null,
    }),
    []
  )

  async function submit() {
    setStatusMessage(null)

    if (name.trim().length === 0) {
      setStatusMessage({
        tone: "destructive",
        text: "Enter your name to continue.",
      })
      return
    }

    if (email.trim().length === 0) {
      setStatusMessage({
        tone: "destructive",
        text: "Enter an email address to continue.",
      })
      return
    }

    if (password.length < 8) {
      setStatusMessage({
        tone: "destructive",
        text: "Use a password with at least 8 characters.",
      })
      return
    }

    setPending(true)
    setStatusMessage({
      tone: "muted",
      text: "Creating your account…",
    })

    try {
      const result = await signUpWithEmail({
        name,
        email,
        password,
        callbackURL: authAppCallbackUrl(),
      })

      if (!result.ok) {
        setStatusMessage({
          tone: "destructive",
          text: mapAuthErrorToUserMessage(
            result.code,
            "Unable to create the account."
          ),
        })
        return
      }

      setStatusMessage({
        tone: "success",
        text: "Account created. Redirecting to your workspace…",
      })

      void navigate(authReturnTargetToPath(returnTarget), {
        replace: true,
      })
    } finally {
      setPending(false)
    }
  }

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    pending,
    statusMessage,
    intelligence,
    continuity,
    submit,
  } as const
}
