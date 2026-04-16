import { Button, Input, Label } from "@afenda/design-system/ui-primitives"

type RegisterFormStepProps = {
  readonly name: string
  readonly email: string
  readonly password: string
  readonly pending: boolean
  readonly nameLabel: string
  readonly emailLabel: string
  readonly passwordLabel: string
  readonly submitLabel: string
  readonly onNameChange: (next: string) => void
  readonly onEmailChange: (next: string) => void
  readonly onPasswordChange: (next: string) => void
  readonly onSubmit: () => Promise<void> | void
}

export function RegisterFormStep(props: RegisterFormStepProps) {
  const {
    name,
    email,
    password,
    pending,
    nameLabel,
    emailLabel,
    passwordLabel,
    submitLabel,
    onNameChange,
    onEmailChange,
    onPasswordChange,
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
        <Label htmlFor="register-name">{nameLabel}</Label>
        <Input
          autoComplete="name"
          id="register-name"
          name="name"
          required
          type="text"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">{emailLabel}</Label>
        <Input
          autoComplete="email"
          id="register-email"
          name="email"
          required
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">{passwordLabel}</Label>
        <Input
          autoComplete="new-password"
          id="register-password"
          name="password"
          minLength={8}
          required
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
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
