import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { AUTH_ROUTES } from "../auth-paths"
import type { AuthStatusMessageViewModel } from "../contracts/auth-view-model"
import { mapAuthErrorToUserMessage } from "../mappers/map-auth-error-to-user-message"
import { resetPasswordWithToken } from "../services/auth-entry-service"

type UseResetPasswordControllerInput = {
  readonly token: string
  readonly tokenInvalid: boolean
}

export function useResetPasswordController(
  input: UseResetPasswordControllerInput
) {
  const { token, tokenInvalid } = input
  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [pending, setPending] = useState(false)
  const [statusMessage, setStatusMessage] =
    useState<AuthStatusMessageViewModel | null>(null)

  const canShowForm = token.trim().length > 0 && !tokenInvalid

  async function submit() {
    setStatusMessage(null)

    if (!canShowForm) {
      setStatusMessage({
        tone: "destructive",
        text: "This reset link is missing or invalid.",
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

    if (password !== confirm) {
      setStatusMessage({
        tone: "destructive",
        text: "The password confirmation does not match.",
      })
      return
    }

    setPending(true)
    setStatusMessage({
      tone: "muted",
      text: "Saving your new password…",
    })

    try {
      const result = await resetPasswordWithToken({
        token,
        newPassword: password,
      })

      if (!result.ok) {
        setStatusMessage({
          tone: "destructive",
          text: mapAuthErrorToUserMessage(
            result.code,
            "Unable to reset the password."
          ),
        })
        return
      }

      void navigate(AUTH_ROUTES.login, { replace: true })
    } finally {
      setPending(false)
    }
  }

  return {
    password,
    setPassword,
    confirm,
    setConfirm,
    pending,
    statusMessage,
    canShowForm,
    submit,
  } as const
}
