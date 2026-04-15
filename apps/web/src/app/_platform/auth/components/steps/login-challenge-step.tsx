import { Button } from "@afenda/design-system/ui-primitives"

type LoginChallengeStepProps = {
  readonly passkeyAvailable: boolean
  readonly verifying: boolean
  /** Optional heading from the server-issued challenge prompt. */
  readonly promptTitle?: string
  readonly promptReady: string
  readonly promptUnavailable: string
  readonly verifyLabel: string
  readonly useAnotherLabel: string
  readonly onVerify: () => Promise<void> | void
  readonly onUseAnother: () => void
}

export function LoginChallengeStep(props: LoginChallengeStepProps) {
  const {
    passkeyAvailable,
    verifying,
    promptTitle,
    promptReady,
    promptUnavailable,
    verifyLabel,
    useAnotherLabel,
    onVerify,
    onUseAnother,
  } = props

  return (
    <div className="space-y-3">
      {promptTitle ? (
        <p className="text-sm font-medium text-foreground">{promptTitle}</p>
      ) : null}
      <p className="text-sm text-muted-foreground">
        {passkeyAvailable ? promptReady : promptUnavailable}
      </p>

      <Button
        aria-busy={verifying}
        className="w-full"
        disabled={verifying || !passkeyAvailable}
        onClick={() => void onVerify()}
        type="button"
      >
        {verifyLabel}
      </Button>

      <Button
        className="w-full"
        type="button"
        variant="ghost"
        onClick={onUseAnother}
      >
        {useAnotherLabel}
      </Button>
    </div>
  )
}
