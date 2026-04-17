import { Button, Input, Label } from "@afenda/design-system/ui-primitives"

import type { AsyncOrSyncVoid } from "../../types/async-or-sync-void"

type ForgotPasswordFormStepProps = {
  readonly email: string
  readonly pending: boolean
  readonly emailLabel: string
  readonly submitLabel: string
  readonly onEmailChange: (next: string) => void
  readonly onSubmit: () => AsyncOrSyncVoid
}

export function ForgotPasswordFormStep(props: ForgotPasswordFormStepProps) {
  const { email, pending, emailLabel, submitLabel, onEmailChange, onSubmit } =
    props

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        void onSubmit()
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="forgot-email">{emailLabel}</Label>
        <Input
          autoComplete="email"
          id="forgot-email"
          name="email"
          required
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
        />
      </div>

      <Button
        aria-busy={pending}
        className="w-full"
        disabled={pending}
        type="submit"
      >
        {submitLabel}
      </Button>
    </form>
  )
}
