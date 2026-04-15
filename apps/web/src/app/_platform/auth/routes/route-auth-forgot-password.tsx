import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { AUTH_ROUTES } from "../auth-paths"
import { AuthStatusMessage } from "../components/shared/auth-status-message"
import { AuthFocusedShell } from "../components/shells/auth-focused-shell"
import { ForgotPasswordFormStep } from "../components/steps/forgot-password-form-step"
import { useForgotPasswordController } from "../controllers/use-forgot-password-controller"
import { RequireGuest } from "../guards/require-guest"

export function RouteAuthForgotPassword() {
  const { t } = useTranslation("shell")
  const controller = useForgotPasswordController()

  return (
    <RequireGuest>
      <AuthFocusedShell
        title={t("marketing.forgot_password.title")}
        description={t("marketing.forgot_password.description")}
        footer={
          <>
            <AuthStatusMessage message={controller.statusMessage} />

            <p className="mt-4 text-center text-sm text-muted-foreground">
              <Link
                className="font-medium text-primary underline-offset-4 hover:underline"
                to={AUTH_ROUTES.login}
              >
                {t("marketing.forgot_password.back_login")}
              </Link>
            </p>
          </>
        }
        supportAside={
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              Use the email tied to your workspace.
            </p>
            <p className="text-sm text-muted-foreground">
              We will send a reset link that returns into this Vite frontend
              flow, not out to a separate recovery surface.
            </p>
          </div>
        }
      >
        {controller.submitted ? (
          <p
            aria-live="polite"
            className="text-sm leading-relaxed text-muted-foreground"
            role="status"
          >
            {t("marketing.forgot_password.success")}
          </p>
        ) : (
          <ForgotPasswordFormStep
            email={controller.email}
            emailLabel={t("marketing.forgot_password.email_label")}
            pending={controller.pending}
            submitLabel={t("marketing.forgot_password.submit")}
            onEmailChange={controller.setEmail}
            onSubmit={controller.submit}
          />
        )}
      </AuthFocusedShell>
    </RequireGuest>
  )
}
