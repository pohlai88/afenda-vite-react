import { Button } from "@afenda/design-system/ui-primitives"

import type { AuthChallengeMethod } from "../../contracts/auth-challenge-ticket"
import type { AsyncOrSyncVoid } from "../../types/async-or-sync-void"

type LoginChallengeStepProps = {
  readonly challengeMethod: AuthChallengeMethod
  readonly otpCode: string
  readonly onOtpChange: (value: string) => void
  readonly verifying: boolean
  /** Optional heading from the server-issued challenge prompt. */
  readonly promptTitle?: string
  readonly promptReady: string
  readonly promptUnavailable: string
  readonly verifyLabel: string
  readonly useAnotherLabel: string
  readonly switchToTotpLabel: string
  readonly passkeyPassageLabel: string
  readonly otpPlaceholder: string
  readonly onVerify: () => AsyncOrSyncVoid
  readonly onUseAnother: () => void
  /** When the current challenge is passkey, start a TOTP challenge instead (Wave 1: passkey verify is deferred). */
  readonly onSwitchToTotp: () => AsyncOrSyncVoid
}

export function LoginChallengeStep(props: LoginChallengeStepProps) {
  const {
    challengeMethod,
    otpCode,
    onOtpChange,
    verifying,
    promptTitle,
    promptReady,
    promptUnavailable,
    verifyLabel,
    useAnotherLabel,
    switchToTotpLabel,
    passkeyPassageLabel,
    otpPlaceholder,
    onVerify,
    onUseAnother,
    onSwitchToTotp,
  } = props

  const isOtpMethod =
    challengeMethod === "totp" || challengeMethod === "email_otp"
  const isPasskey = challengeMethod === "passkey"

  return (
    <div className="space-y-3">
      {promptTitle ? (
        <p className="text-sm font-medium text-foreground">{promptTitle}</p>
      ) : null}

      {isPasskey ? (
        <>
          <p className="text-sm text-muted-foreground">{passkeyPassageLabel}</p>
          <Button
            className="w-full"
            type="button"
            onClick={() => void onSwitchToTotp()}
          >
            {switchToTotpLabel}
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {isOtpMethod ? promptReady : promptUnavailable}
          </p>
          <label className="block space-y-1">
            <span className="sr-only">{otpPlaceholder}</span>
            <input
              autoComplete="one-time-code"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]*"
              placeholder={otpPlaceholder}
              type="text"
              value={otpCode}
              onChange={(e) =>
                onOtpChange(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />
          </label>
          <Button
            aria-busy={verifying}
            className="w-full"
            disabled={verifying || otpCode.trim().length !== 6}
            onClick={() => void onVerify()}
            type="button"
          >
            {verifyLabel}
          </Button>
        </>
      )}

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
