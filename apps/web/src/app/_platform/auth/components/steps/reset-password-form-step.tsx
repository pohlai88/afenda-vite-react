import {
  Button,
  Input,
  Label,
} from "@afenda/design-system/ui-primitives"

type ResetPasswordFormStepProps = {
  readonly password: string
  readonly confirm: string
  readonly pending: boolean
  readonly passwordLabel: string
  readonly confirmLabel: string
  readonly submitLabel: string
  readonly onPasswordChange: (next: string) => void
  readonly onConfirmChange: (next: string) => void
  readonly onSubmit: () => Promise<void> | void
}

export function ResetPasswordFormStep(props: ResetPasswordFormStepProps) {
  const {
    password,
    confirm,
    pending,
    passwordLabel,
    confirmLabel,
    submitLabel,
    onPasswordChange,
    onConfirmChange,
    onSubmit,
  } = props

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        void onSubmit()
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="reset-password">{passwordLabel}</Label>
        <Input
          autoComplete="new-password"
          id="reset-password"
          name="password"
          minLength={8}
          required
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reset-password-confirm">{confirmLabel}</Label>
        <Input
          autoComplete="new-password"
          id="reset-password-confirm"
          name="confirm"
          minLength={8}
          required
          type="password"
          value={confirm}
          onChange={(event) => onConfirmChange(event.target.value)}
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
