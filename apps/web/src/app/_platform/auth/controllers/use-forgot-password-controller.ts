import { useState } from "react"

import { authPasswordResetRedirectUrl } from "../auth-redirect-urls"
import type { AuthStatusMessageViewModel } from "../contracts/auth-view-model"
import { mapAuthErrorToUserMessage } from "../mappers/map-auth-error-to-user-message"
import { requestPasswordResetEmail } from "../services/auth-entry-service"

export function useForgotPasswordController() {
  const [email, setEmail] = useState("")
  const [pending, setPending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [statusMessage, setStatusMessage] =
    useState<AuthStatusMessageViewModel | null>(null)

  async function submit() {
    setStatusMessage(null)

    if (email.trim().length === 0) {
      setStatusMessage({
        tone: "destructive",
        text: "Enter an email address to continue.",
      })
      return
    }

    setPending(true)
    setStatusMessage({
      tone: "muted",
      text: "Sending reset instructions…",
    })

    try {
      const result = await requestPasswordResetEmail({
        email,
        redirectTo: authPasswordResetRedirectUrl(),
      })

      if (!result.ok) {
        setStatusMessage({
          tone: "destructive",
          text: mapAuthErrorToUserMessage(
            result.code,
            "Unable to request a password reset."
          ),
        })
        return
      }

      setSubmitted(true)
      setStatusMessage({
        tone: "success",
        text: "Reset instructions sent. Check your inbox.",
      })
    } finally {
      setPending(false)
    }
  }

  return {
    email,
    setEmail,
    pending,
    submitted,
    statusMessage,
    submit,
  } as const
}
