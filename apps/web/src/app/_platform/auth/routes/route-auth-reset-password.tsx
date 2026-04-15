import { Link, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { AUTH_ROUTES } from "../auth-paths"
import { AuthStatusMessage } from "../components/shared/auth-status-message"
import { AuthFocusedShell } from "../components/shells/auth-focused-shell"
import { ResetPasswordFormStep } from "../components/steps/reset-password-form-step"
import { useResetPasswordController } from "../controllers/use-reset-password-controller"
import { RequireGuest } from "../guards/require-guest"

export function RouteAuthResetPassword() {
  const { t } = useTranslation("shell")
  const [searchParams] = useSearchParams()

  const token = searchParams.get("token") ?? ""
  const queryError = searchParams.get("error")
  const tokenInvalid =
    queryError === "INVALID_TOKEN" || queryError === "invalid_token"

  const controller = useResetPasswordController({
    token,
    tokenInvalid,
  })

  return (
    <RequireGuest>
      <AuthFocusedShell
        title={t("marketing.reset_password.title")}
        footer={
          <>
            <AuthStatusMessage message={controller.statusMessage} />

            <p className="mt-4 text-center text-sm text-muted-foreground">
              <Link
                className="font-medium text-primary underline-offset-4 hover:underline"
                to={AUTH_ROUTES.forgotPassword}
              >
                {t("marketing.reset_password.request_new_link")}
              </Link>
            </p>

            <p className="mt-3 text-center text-sm text-muted-foreground">
              <Link
                className="font-medium text-primary underline-offset-4 hover:underline"
                to={AUTH_ROUTES.login}
              >
                {t("marketing.reset_password.back_login")}
              </Link>
            </p>
          </>
        }
        supportAside={
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              Choose a fresh password you have not used recently.
            </p>
            <p className="text-sm text-muted-foreground">
              If this link has expired or already been used, request a new one
              and restart the recovery flow.
            </p>
          </div>
        }
      >
        {!controller.canShowForm ? (
          <p className="text-sm text-destructive" role="alert">
            {t("marketing.reset_password.error_token")}
          </p>
        ) : (
          <ResetPasswordFormStep
            confirm={controller.confirm}
            confirmLabel={t("marketing.reset_password.confirm_label")}
            password={controller.password}
            passwordLabel={t("marketing.reset_password.new_password_label")}
            pending={controller.pending}
            submitLabel={t("marketing.reset_password.submit")}
            onConfirmChange={controller.setConfirm}
            onPasswordChange={controller.setPassword}
            onSubmit={controller.submit}
          />
        )}
      </AuthFocusedShell>
    </RequireGuest>
  )
}
