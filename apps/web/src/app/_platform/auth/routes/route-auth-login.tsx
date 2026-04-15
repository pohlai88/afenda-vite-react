import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { Separator } from "@afenda/design-system/ui-primitives"

import { AUTH_ROUTES } from "../auth-paths"
import { AuthAdaptiveShell } from "../components/shells/auth-adaptive-shell"
import { IdentityIntelligencePanel } from "../components/panels/identity-intelligence-panel"
import { SessionContinuityPanel } from "../components/panels/session-continuity-panel"
import { LoginFlowStepRenderer } from "../components/steps/login-flow-step-renderer"
import { AuthStatusMessage } from "../components/shared/auth-status-message"
import { useLoginFlowController } from "../controllers/use-login-flow-controller"
import { RequireGuest } from "../guards/require-guest"

export function RouteAuthLogin() {
  const { t } = useTranslation("shell")
  const controller = useLoginFlowController()

  return (
    <RequireGuest>
      <AuthAdaptiveShell
        title={t("marketing.login.title")}
        description={t("auth_security.shell_subtitle")}
        leftPanel={
          <IdentityIntelligencePanel
            resource={controller.intelligenceResource}
          />
        }
        rightPanel={
          <SessionContinuityPanel
            model={controller.continuity}
            snapshot={controller.intelligence.data}
            onResetChallenge={controller.clearChallenge}
          />
        }
        footer={
          <>
            <AuthStatusMessage message={controller.statusMessage} />

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {t("marketing.login.divider")}
                </span>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              <span>{t("marketing.login.no_account")} </span>
              <Link
                className="font-medium text-primary underline-offset-4 hover:underline"
                to={AUTH_ROUTES.register}
              >
                {t("marketing.login.register_link")}
              </Link>
            </p>

            <p className="mt-3 text-center text-sm text-muted-foreground">
              <Link
                className="font-medium text-primary underline-offset-4 hover:underline"
                to="/"
              >
                {t("marketing.login.back")}
              </Link>
            </p>
          </>
        }
      >
        <LoginFlowStepRenderer controller={controller} />
      </AuthAdaptiveShell>
    </RequireGuest>
  )
}
