import { Button } from "@afenda/design-system/ui-primitives"

type LoginProviderStepProps = {
  readonly redirectingProvider: "google" | "github" | null
  readonly disabled: boolean
  readonly prompt: string
  readonly googleLabel: string
  readonly githubLabel: string
  readonly onGoogle: () => Promise<void> | void
  readonly onGithub: () => Promise<void> | void
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
