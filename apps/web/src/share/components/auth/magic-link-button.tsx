import { useAuth } from "@better-auth-ui/react"
import type { AuthView } from "@better-auth-ui/react/core"
import { Lock, Mail } from "lucide-react"

import { Button } from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

export type MagicLinkButtonProps = {
  isPending: boolean
  view?: AuthView
}

/**
 * Renders a full-width outline button that navigates to either the magic-link flow or the sign-in flow and shows the matching icon and label.
 *
 * @param isPending - If true, disables the button and applies pending styling
 * @param view - Current auth view; when "magicLink", the button targets the sign-in/password route
 * @returns The button element configured to navigate to the appropriate auth route
 */
export function MagicLinkButton({ isPending, view }: MagicLinkButtonProps) {
  const { basePaths, viewPaths, localization, navigate } = useAuth()

  const isMagicLinkView = view === "magicLink"
  const nextPath = `${basePaths.auth}/${isMagicLinkView ? viewPaths.auth.signIn : viewPaths.auth.magicLink}`

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isPending}
      size="lg"
      className={cn(
        "auth-secondary-action",
        isPending && "pointer-events-none opacity-50"
      )}
      onClick={() => navigate({ to: nextPath })}
    >
      {isMagicLinkView ? <Lock /> : <Mail />}

      {localization.auth.continueWith.replace(
        "{{provider}}",
        isMagicLinkView
          ? localization.auth.password
          : localization.auth.magicLink
      )}
    </Button>
  )
}
