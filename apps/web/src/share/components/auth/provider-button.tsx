import { providerIcons, useAuth, useSignInSocial } from "@better-auth-ui/react"
import { getProviderName } from "@better-auth-ui/react/core"
import type { SocialProvider } from "better-auth/social-providers"
import { type ComponentProps, useState } from "react"

import { Button, Spinner } from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"
import { useAuthPostLoginDestination } from "@/app/_platform/auth"

export type ProviderButtonProps = {
  provider: SocialProvider
  label?: "continueWith" | "providerName" | "none"
  isDisabled?: boolean
} & Omit<ComponentProps<typeof Button>, "onClick" | "disabled" | "children">

/**
 * Render a single social provider sign-in button with its own mutation and pending state.
 *
 * @param provider - The social provider this button signs in with.
 * @param label - Label style: `"continueWith"` (e.g. "Continue with Google"), `"providerName"` (e.g. "Google"), or `"none"` (icon only).
 * @param isDisabled - External disabled state (e.g. the parent form is submitting).
 */
export function ProviderButton({
  provider,
  label = "continueWith",
  isDisabled,
  variant = "outline",
  className,
  ...props
}: ProviderButtonProps) {
  const { baseURL, localization } = useAuth()
  const postLoginPath = useAuthPostLoginDestination()

  const callbackURL = `${baseURL}${postLoginPath}`

  const [redirecting, setRedirecting] = useState(false)

  const { mutate: signInSocial, isPending } = useSignInSocial({
    onSuccess: () => {
      setRedirecting(true)

      setTimeout(() => {
        setRedirecting(false)
      }, 5000)
    },
  })

  const ProviderIcon = providerIcons[provider]

  const pending = isPending || redirecting
  const providerName = getProviderName(provider)
  const buttonLabel =
    label === "continueWith"
      ? localization.auth.continueWith.replace("{{provider}}", providerName)
      : label === "providerName"
        ? providerName
        : providerName

  return (
    <Button
      type="button"
      variant={variant}
      size="lg"
      disabled={isDisabled || pending}
      aria-label={props["aria-label"] ?? buttonLabel}
      className={cn("auth-secondary-action auth-provider-action", className)}
      onClick={() => signInSocial({ provider, callbackURL })}
      {...props}
    >
      {pending ? <Spinner /> : <ProviderIcon />}

      {label === "none" ? null : buttonLabel}
    </Button>
  )
}
