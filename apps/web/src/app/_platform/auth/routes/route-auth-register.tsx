import { useMemo } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { AUTH_ROUTES } from "../auth-paths"
import { AuthAdaptiveShell } from "../components/shells/auth-adaptive-shell"
import { IdentityIntelligencePanel } from "../components/panels/identity-intelligence-panel"
import { SessionContinuityPanel } from "../components/panels/session-continuity-panel"
import { RegisterFormStep } from "../components/steps/register-form-step"
import { AuthStatusMessage } from "../components/shared/auth-status-message"
import { useRegisterFlowController } from "../controllers/use-register-flow-controller"
import { RequireGuest } from "../guards/require-guest"
import { mapAuthIntelligenceResource } from "../mappers/map-auth-intelligence-resource"

export function RouteAuthRegister() {
  const { t } = useTranslation("shell")
  const controller = useRegisterFlowController()

  const intelligenceResource = useMemo(
    () =>
      mapAuthIntelligenceResource({
        data: controller.intelligence.data,
        isLoading: controller.intelligence.isLoading,
        errorCode: controller.intelligence.errorCode,
      }),
    [
      controller.intelligence.data,
      controller.intelligence.errorCode,
      controller.intelligence.isLoading,
    ]
  )

  return (
    <RequireGuest>
      <AuthAdaptiveShell
        title={t("marketing.register.title")}
        description={t("auth_security.register_subtitle")}
        leftPanel={
          <IdentityIntelligencePanel resource={intelligenceResource} />
        }
        rightPanel={
          <SessionContinuityPanel
            model={controller.continuity}
            snapshot={controller.intelligence.data}
            onResetChallenge={() => undefined}
          />
        }
        footer={
          <>
            <AuthStatusMessage message={controller.statusMessage} />

            <p className="mt-6 text-center text-sm text-muted-foreground">
              <span>{t("marketing.register.have_account")} </span>
              <Link
                className="font-medium text-primary underline-offset-4 hover:underline"
                to={AUTH_ROUTES.login}
              >
                {t("marketing.register.sign_in_link")}
              </Link>
            </p>

            <p className="mt-3 text-center text-sm text-muted-foreground">
              <Link
                className="font-medium text-primary underline-offset-4 hover:underline"
                to="/"
              >
                {t("marketing.register.back")}
              </Link>
            </p>
          </>
        }
      >
        <RegisterFormStep
          email={controller.email}
          emailLabel={t("marketing.register.email_label")}
          name={controller.name}
          nameLabel={t("marketing.register.name_label")}
          password={controller.password}
          passwordLabel={t("marketing.register.password_label")}
          pending={controller.pending}
          submitLabel={t("marketing.register.submit")}
          onEmailChange={controller.setEmail}
          onNameChange={controller.setName}
          onPasswordChange={controller.setPassword}
          onSubmit={controller.submit}
        />
      </AuthAdaptiveShell>
    </RequireGuest>
  )
}
