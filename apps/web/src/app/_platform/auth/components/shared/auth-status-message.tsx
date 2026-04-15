import type { AuthMessageTone, AuthStatusMessageViewModel } from "../../contracts/auth-view-model"

type AuthStatusMessageProps = {
  readonly message: AuthStatusMessageViewModel | null
}

function toneClassName(tone: AuthMessageTone): string {
  if (tone === "success") {
    return "text-success"
  }
  if (tone === "warning") {
    return "text-warning"
  }
  if (tone === "destructive") {
    return "text-destructive"
  }
  return "text-muted-foreground"
}

export function AuthStatusMessage(props: AuthStatusMessageProps) {
  const { message } = props

  if (!message) {
    return null
  }

  const role = message.tone === "destructive" ? "alert" : "status"

  return (
    <p className={`text-sm ${toneClassName(message.tone)}`} role={role} aria-live="polite">
      {message.text}
    </p>
  )
}
