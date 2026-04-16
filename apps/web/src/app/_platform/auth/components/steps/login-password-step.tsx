import { Link } from "react-router-dom"

import { Button, Input, Label } from "@afenda/design-system/ui-primitives"

import { AUTH_ROUTES } from "../../auth-paths"

type LoginPasswordStepProps = {
  readonly email: string
  readonly password: string
  readonly pending: boolean
  readonly onPasswordChange: (next: string) => void
  readonly onSubmit: () => Promise<void> | void
  readonly passwordLabel: string
  readonly forgotPasswordLabel: string
  readonly submitLabel: string
}

export function LoginPasswordStep(props: LoginPasswordStepProps) {
  const {
    email,
    password,
    pending,
    onPasswordChange,
    onSubmit,
    passwordLabel,
    forgotPasswordLabel,
    submitLabel,
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
        <Label htmlFor="login-password">{passwordLabel}</Label>
        <Input
          autoComplete="current-password"
          id="login-password"
          name="password"
          required
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
        />
      </div>

      <div className="flex items-center justify-between gap-[0.75rem] text-xs">
        <span className="text-muted-foreground">{email}</span>
        <Link
          className="text-primary underline-offset-4 hover:underline"
          to={AUTH_ROUTES.forgotPassword}
        >
          {forgotPasswordLabel}
        </Link>
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
