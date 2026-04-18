"use client"

import { useAuth, useSignInPasskey } from "@better-auth-ui/react"
import { Fingerprint } from "lucide-react"
import { Button, Spinner } from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

export type PasskeyButtonProps = {
  isPending: boolean
}

export function PasskeyButton({ isPending }: PasskeyButtonProps) {
  const { localization, redirectTo, navigate } = useAuth()

  const { mutate: signInPasskey, isPending: passkeyPending } = useSignInPasskey(
    {
      onSuccess: () => navigate({ to: redirectTo }),
    }
  )

  const isDisabled = isPending || passkeyPending

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isDisabled}
      className={cn("w-full", isDisabled && "pointer-events-none opacity-50")}
      onClick={() => signInPasskey()}
    >
      {passkeyPending ? <Spinner /> : <Fingerprint />}
      {localization.auth.continueWith.replace(
        "{{provider}}",
        localization.auth.passkey
      )}
    </Button>
  )
}
