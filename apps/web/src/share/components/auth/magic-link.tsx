import { useAuth, useSignInMagicLink } from "@better-auth-ui/react"
import { type SyntheticEvent, useState } from "react"
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
  Label,
  Spinner,
} from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"
import { useAuthPostLoginDestination } from "@/app/_platform/auth"
import { AuthCardFrame } from "./auth-card-frame"
import { MagicLinkButton } from "./magic-link-button"
import { PasskeyButton } from "./passkey-button"
import { ProviderButtons, type SocialLayout } from "./provider-buttons"

export type MagicLinkProps = {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
}

/**
 * Render a card-based sign-in form that sends an email magic link and optionally shows social provider buttons.
 *
 * @param className - Additional CSS class names applied to the card container
 * @param socialLayout - Layout style for social provider buttons
 * @param socialPosition - Position of social provider buttons; `"top"` or `"bottom"`. Defaults to `"bottom"`.
 * @returns The magic-link sign-in UI as a JSX element
 */
export function MagicLink({
  className,
  socialLayout,
  socialPosition = "bottom",
}: MagicLinkProps) {
  const { t } = useTranslation("auth", {
    keyPrefix: "experience.views.magicLink",
  })
  const {
    basePaths,
    baseURL,
    localization,
    passkey,
    socialProviders,
    viewPaths,
    Link,
  } = useAuth()
  const postLoginPath = useAuthPostLoginDestination()

  const [email, setEmail] = useState("")

  const { mutate: signInMagicLink, isPending: magicLinkPending } =
    useSignInMagicLink({
      onSuccess: () => {
        setEmail("")
        toast.success(localization.auth.magicLinkSent)
      },
    })

  const isPending = magicLinkPending

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
  }>({})

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    signInMagicLink({ email, callbackURL: `${baseURL}${postLoginPath}` })
  }

  const showSeparator = socialProviders && socialProviders.length > 0

  const footer = (
    <div className="auth-footer-links flex w-full flex-col items-center">
      <FieldDescription className="text-center">
        {localization.auth.needToCreateAnAccount}{" "}
        <Link
          href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
          className="underline underline-offset-4"
        >
          {localization.auth.signUp}
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
              <FieldSeparator className="m-0 flex items-center text-xs *:data-[slot=field-separator-content]:bg-background">
                {localization.auth.or}
              </FieldSeparator>
            )}
          </>
        )}

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
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)

                  setFieldErrors((prev) => ({
                    ...prev,
                    email: undefined,
                  }))
                }}
                placeholder={localization.auth.emailPlaceholder}
                required
                disabled={isPending}
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

                {localization.auth.sendMagicLink}
              </Button>

              <MagicLinkButton view="magicLink" isPending={isPending} />

              {passkey && <PasskeyButton isPending={isPending} />}
            </div>
          </FieldGroup>
        </form>

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
