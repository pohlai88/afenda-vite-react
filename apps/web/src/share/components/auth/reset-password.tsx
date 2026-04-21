"use client"

import { useAuth, useResetPassword } from "@better-auth-ui/react"
import { Eye, EyeOff } from "lucide-react"
import { type SyntheticEvent, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import {
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  Label,
  Spinner,
} from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"
import { AuthCardFrame } from "./auth-card-frame"

export type ResetPasswordProps = {
  className?: string
}

/**
 * Render a password reset form that validates the reset token from the URL, accepts a new password (and optional confirmation), and submits it to the auth client.
 *
 * The component checks for a `token` query parameter on mount and, if missing, shows an error toast and navigates to the sign-in page. It exposes per-field validation messages, toggles for password visibility, and disables inputs while the reset request is pending.
 *
 * @returns The password reset form UI ready to be mounted in the app layout.
 */
export function ResetPassword({ className }: ResetPasswordProps) {
  const { t } = useTranslation("auth", {
    keyPrefix: "experience.views.resetPassword",
  })
  const {
    basePaths,
    emailAndPassword,
    localization,
    viewPaths,
    navigate,
    Link,
  } = useAuth()

  const { mutate: resetPassword, isPending } = useResetPassword({
    onSuccess: () => {
      toast.success(localization.auth.passwordResetSuccess)
      navigate({ to: `${basePaths.auth}/${viewPaths.auth.signIn}` })
    },
  })

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)
  const confirmPasswordRef = useRef<HTMLInputElement | null>(null)

  const [fieldErrors, setFieldErrors] = useState<{
    password?: string
    confirmPassword?: string
  }>({})

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const token = searchParams.get("token") as string

    if (!token) {
      toast.error(localization.auth.invalidResetPasswordToken)
      navigate({ to: `${basePaths.auth}/${viewPaths.auth.signIn}` })
    }
  }, [
    basePaths.auth,
    localization.auth.invalidResetPasswordToken,
    viewPaths.auth.signIn,
    navigate,
  ])

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()

    const searchParams = new URLSearchParams(window.location.search)
    const token = searchParams.get("token") as string

    if (!token) {
      toast.error(localization.auth.invalidResetPasswordToken)
      navigate({ to: `${basePaths.auth}/${viewPaths.auth.signIn}` })
      return
    }

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (emailAndPassword?.confirmPassword && password !== confirmPassword) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: localization.auth.passwordsDoNotMatch,
      }))
      confirmPasswordRef.current?.focus()
      return
    }

    resetPassword({ token, newPassword: password })
  }

  const footer = (
    <div className="auth-footer-links flex w-full flex-col items-center">
      <FieldDescription className="text-center">
        {localization.auth.rememberYourPassword}{" "}
        <Link
          href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
          className="underline underline-offset-4 hover:underline"
        >
          {localization.auth.signIn}
        </Link>
      </FieldDescription>
    </div>
  )

  return (
    <AuthCardFrame
      title={t("panel_title")}
      description={t("panel_description")}
      footer={footer}
      className={cn(className)}
    >
      <form onSubmit={handleSubmit}>
        <FieldGroup className="auth-form-grid">
          <Field data-invalid={!!fieldErrors.password}>
            <Label htmlFor="password">{localization.auth.password}</Label>

            <InputGroup>
              <InputGroupInput
                id="password"
                name="password"
                type={isPasswordVisible ? "text" : "password"}
                autoComplete="new-password"
                placeholder={localization.auth.newPasswordPlaceholder}
                required
                minLength={emailAndPassword?.minPasswordLength}
                maxLength={emailAndPassword?.maxPasswordLength}
                disabled={isPending}
                onChange={() => {
                  setFieldErrors((prev) => ({
                    ...prev,
                    password: undefined,
                  }))
                }}
                onInvalid={(e) => {
                  e.preventDefault()

                  setFieldErrors((prev) => ({
                    ...prev,
                    password: (e.target as HTMLInputElement).validationMessage,
                  }))
                }}
                aria-invalid={!!fieldErrors.password}
              />

              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  aria-label={
                    isPasswordVisible
                      ? localization.auth.hidePassword
                      : localization.auth.showPassword
                  }
                  title={
                    isPasswordVisible
                      ? localization.auth.hidePassword
                      : localization.auth.showPassword
                  }
                  onClick={() => {
                    setIsPasswordVisible(!isPasswordVisible)
                  }}
                >
                  {isPasswordVisible ? <EyeOff /> : <Eye />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>

            <FieldError>{fieldErrors.password}</FieldError>
          </Field>

          {emailAndPassword?.confirmPassword && (
            <Field data-invalid={!!fieldErrors.confirmPassword}>
              <Label htmlFor="confirmPassword">
                {localization.auth.confirmPassword}
              </Label>

              <InputGroup>
                <InputGroupInput
                  ref={confirmPasswordRef}
                  id="confirmPassword"
                  name="confirmPassword"
                  type={isConfirmPasswordVisible ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder={localization.auth.confirmPasswordPlaceholder}
                  required
                  minLength={emailAndPassword?.minPasswordLength}
                  maxLength={emailAndPassword?.maxPasswordLength}
                  disabled={isPending}
                  onChange={() => {
                    setFieldErrors((prev) => ({
                      ...prev,
                      confirmPassword: undefined,
                    }))
                  }}
                  onInvalid={(e) => {
                    e.preventDefault()

                    setFieldErrors((prev) => ({
                      ...prev,
                      confirmPassword: (e.target as HTMLInputElement)
                        .validationMessage,
                    }))
                  }}
                  aria-invalid={!!fieldErrors.confirmPassword}
                />

                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    aria-label={
                      isConfirmPasswordVisible
                        ? localization.auth.hidePassword
                        : localization.auth.showPassword
                    }
                    title={
                      isConfirmPasswordVisible
                        ? localization.auth.hidePassword
                        : localization.auth.showPassword
                    }
                    onClick={() => {
                      setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                    }}
                  >
                    {isConfirmPasswordVisible ? <EyeOff /> : <Eye />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>

              <FieldError>{fieldErrors.confirmPassword}</FieldError>
            </Field>
          )}

          <div className="auth-form-actions auth-form-span-full">
            <Button
              type="submit"
              disabled={isPending}
              className="auth-primary-action"
              size="lg"
            >
              {isPending && <Spinner />}

              {localization.auth.resetPassword}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </AuthCardFrame>
  )
}
