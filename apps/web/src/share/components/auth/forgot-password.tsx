"use client"

import { useAuth, useRequestPasswordReset } from "@better-auth-ui/react"
import { type SyntheticEvent, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import {
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  Input,
  Label,
  Spinner,
} from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"
import { AuthCardFrame } from "./auth-card-frame"

export type ForgotPasswordProps = {
  className?: string
}

/**
 * Render a card-based "Forgot Password" form that sends a password-reset email.
 *
 * The form displays an email input, submit button, and a link back to sign-in.
 * Toasts are displayed on success or error via the `useForgotPassword` hook.
 *
 * @param className - Optional additional CSS class names applied to the card
 * @returns The forgot-password form UI as a JSX element
 */
export function ForgotPassword({ className }: ForgotPasswordProps) {
  const { t } = useTranslation("auth", {
    keyPrefix: "experience.views.forgotPassword",
  })
  const { basePaths, localization, viewPaths, Link } = useAuth()

  const { mutate: requestPasswordReset, isPending } = useRequestPasswordReset({
    onSuccess: () => toast.success(localization.auth.passwordResetEmailSent),
  })

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    requestPasswordReset({ email: formData.get("email") as string })
  }

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
  }>({})

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
        <FieldGroup className="auth-form-stack">
          <Field data-invalid={!!fieldErrors.email}>
            <Label htmlFor="email">{localization.auth.email}</Label>

            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              inputMode="email"
              placeholder={localization.auth.emailPlaceholder}
              required
              disabled={isPending}
              onChange={() => {
                setFieldErrors((prev) => ({
                  ...prev,
                  email: undefined,
                }))
              }}
              onInvalid={(e) => {
                e.preventDefault()

                setFieldErrors((prev) => ({
                  ...prev,
                  email: (e.target as HTMLInputElement).validationMessage,
                }))
              }}
              aria-invalid={!!fieldErrors.email}
            />

            <FieldError>{fieldErrors.email}</FieldError>
          </Field>

          <div className="auth-form-actions">
            <Button
              type="submit"
              disabled={isPending}
              className="auth-primary-action"
              size="lg"
            >
              {isPending && <Spinner />}

              {localization.auth.sendResetLink}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </AuthCardFrame>
  )
}
