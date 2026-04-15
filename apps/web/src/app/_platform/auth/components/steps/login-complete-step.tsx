type LoginCompleteStepProps = {
  readonly message: string
}

export function LoginCompleteStep(props: LoginCompleteStepProps) {
  const { message } = props

  return <p className="text-sm text-muted-foreground">{message}</p>
}
