import { useAuth, useSignUpEmail } from "@better-auth-ui/react"
import { Eye, EyeOff } from "lucide-react"
import { type SyntheticEvent, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import {
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSeparator,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  Label,
  Spinner,
} from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"
import { useAuthPostLoginDestination } from "@/app/_platform/auth"
import { AuthCardFrame } from "./auth-card-frame"
import { MagicLinkButton } from "./magic-link-button"
import { ProviderButtons, type SocialLayout } from "./provider-buttons"

export type SignUpProps = {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
}

function createSignupName(email: string): string {
  const localPart = email.split("@")[0]?.trim() ?? ""
  const cleaned = localPart
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  if (!cleaned) {
    return "New User"
  }

  return cleaned
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(" ")
}

/**
 * Renders a fast sign-up form with email and password credentials plus optional alternate auth methods.
 *
 * Submits credentials to the configured auth client and handles the response:
 * - If email verification is required, shows a notification and navigates to sign-in
 * - On success, refreshes the session and navigates to the configured redirect path
 * - On failure, displays error toasts
 * - Manages a pending state while the request is in-flight
 *
 * @param className - Additional CSS classes applied to the outer container
 * @param socialLayout - Social layout to apply to the component
 * @param socialPosition - Social position to apply to the component
 * @returns The sign-up form React element.
 */
export function SignUp({
  className,
  socialLayout,
  socialPosition = "bottom",
}: SignUpProps) {
  const { t } = useTranslation("auth", { keyPrefix: "experience.views.signUp" })
  const {
    basePaths,
    emailAndPassword,
    localization,
    magicLink,
    socialProviders,
    viewPaths,
    navigate,
    Link,
  } = useAuth()
  const postLoginPath = useAuthPostLoginDestination()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const { mutate: signUpEmail, isPending: signUpPending } = useSignUpEmail({
    onError: (error) => {
      setPassword("")
      setConfirmPassword("")
      toast.error(error.error?.message || error.message)
    },
    onSuccess: () => {
      if (emailAndPassword?.requireEmailVerification) {
        toast.success(localization.auth.verifyYourEmail)
        navigate({ to: `${basePaths.auth}/${viewPaths.auth.signIn}` })
      } else {
        navigate({ to: postLoginPath })
      }
    },
  })

  const isPending = signUpPending

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)
  const confirmPasswordRef = useRef<HTMLInputElement | null>(null)

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string

    if (emailAndPassword?.confirmPassword && password !== confirmPassword) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: localization.auth.passwordsDoNotMatch,
      }))
      confirmPasswordRef.current?.focus()
      return
    }

    signUpEmail({
      name: createSignupName(email),
      email,
      password,
    })
  }

  const showSeparator =
    emailAndPassword?.enabled && socialProviders && socialProviders.length > 0

  const footer = emailAndPassword?.enabled ? (
    <div className="auth-footer-links flex w-full flex-col items-center">
      <FieldDescription className="text-center">
        {localization.auth.alreadyHaveAnAccount}{" "}
        <Link
          href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
          className="underline underline-offset-4"
        >
          {localization.auth.signIn}
        </Link>
      </FieldDescription>
    </div>
  ) : undefined

  return (
    <AuthCardFrame
      title={t("panel_title")}
      description={t("panel_description")}
      footer={footer}
      className={cn(className)}
    >
      <div className="auth-form-shell">
        {socialPosition === "top" && (
          <>
            {socialProviders && socialProviders.length > 0 && (
              <ProviderButtons
                socialLayout={socialLayout}
                isPending={isPending}
              />
            )}

            {showSeparator && (
              <FieldSeparator className="flex items-center text-xs *:data-[slot=field-separator-content]:bg-background">
                {localization.auth.or}
              </FieldSeparator>
            )}
          </>
        )}

        {emailAndPassword?.enabled && (
          <form onSubmit={handleSubmit}>
            <FieldGroup className="auth-form-grid">
              <Field
                className="auth-form-span-full"
                data-invalid={!!fieldErrors.email}
              >
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

              <Field data-invalid={!!fieldErrors.password}>
                <Label htmlFor="password">{localization.auth.password}</Label>

                <InputGroup>
                  <InputGroupInput
                    id="password"
                    name="password"
                    type={isPasswordVisible ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setFieldErrors((prev) => ({
                        ...prev,
                        password: undefined,
                      }))
                    }}
                    placeholder={localization.auth.passwordPlaceholder}
                    required
                    minLength={emailAndPassword?.minPasswordLength}
                    maxLength={emailAndPassword?.maxPasswordLength}
                    disabled={isPending}
                    onInvalid={(e) => {
                      e.preventDefault()

                      setFieldErrors((prev) => ({
                        ...prev,
                        password: (e.target as HTMLInputElement)
                          .validationMessage,
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
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)

                        setFieldErrors((prev) => ({
                          ...prev,
                          confirmPassword: undefined,
                        }))
                      }}
                      placeholder={localization.auth.confirmPasswordPlaceholder}
                      required
                      minLength={emailAndPassword?.minPasswordLength}
                      maxLength={emailAndPassword?.maxPasswordLength}
                      disabled={isPending}
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
                        onClick={() =>
                          setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                        }
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

                  {localization.auth.signUp}
                </Button>

                {magicLink && (
                  <MagicLinkButton view="signUp" isPending={isPending} />
                )}
              </div>
            </FieldGroup>
          </form>
        )}

        {socialPosition === "bottom" && (
          <>
            {showSeparator && (
              <FieldSeparator className="flex items-center text-xs *:data-[slot=field-separator-content]:bg-background">
                {localization.auth.or}
              </FieldSeparator>
            )}

            {socialProviders && socialProviders.length > 0 && (
              <ProviderButtons
                socialLayout={socialLayout}
                isPending={isPending}
              />
            )}
          </>
        )}
      </div>
    </AuthCardFrame>
  )
}
