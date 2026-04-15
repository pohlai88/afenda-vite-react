import { Button, Input, Label } from "@afenda/design-system/ui-primitives"

type LoginIdentifyStepProps = {
  readonly emailInput: string
  readonly onEmailInputChange: (next: string) => void
  readonly onSubmit: () => void
  readonly submitLabel: string
  readonly emailLabel: string
}

export function LoginIdentifyStep(props: LoginIdentifyStepProps) {
  const {
    emailInput,
    onEmailInputChange,
    onSubmit,
    submitLabel,
    emailLabel,
  } = props

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="login-identify-email">{emailLabel}</Label>
        <Input
          autoComplete="email"
          id="login-identify-email"
          name="email"
          required
          type="email"
          value={emailInput}
          onChange={(event) => onEmailInputChange(event.target.value)}
        />
      </div>

      <Button className="w-full" type="submit">
        {submitLabel}
      </Button>
    </form>
  )
}
