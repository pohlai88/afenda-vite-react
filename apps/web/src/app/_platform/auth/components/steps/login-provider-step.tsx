import { Button } from "@afenda/design-system/ui-primitives"

import type { AsyncOrSyncVoid } from "../../types/async-or-sync-void"

type LoginProviderStepProps = {
  readonly redirectingProvider: "google" | "github" | null
  readonly disabled: boolean
  readonly prompt: string
  readonly googleLabel: string
  readonly githubLabel: string
  readonly onGoogle: () => AsyncOrSyncVoid
  readonly onGithub: () => AsyncOrSyncVoid
}

export function LoginProviderStep(props: LoginProviderStepProps) {
  const {
    redirectingProvider,
    disabled,
    prompt,
    googleLabel,
    githubLabel,
    onGoogle,
    onGithub,
  } = props

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{prompt}</p>

      <Button
        aria-busy={redirectingProvider === "google"}
        className="w-full"
        disabled={disabled}
        onClick={() => void onGoogle()}
        type="button"
        variant="outline"
      >
        {googleLabel}
      </Button>

      <Button
        aria-busy={redirectingProvider === "github"}
        className="w-full"
        disabled={disabled}
        onClick={() => void onGithub()}
        type="button"
        variant="outline"
      >
        {githubLabel}
      </Button>
    </div>
  )
}
