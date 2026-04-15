import { useTranslation } from "react-i18next"

import { LegacyAuthChallengeCanvas } from "../shared/legacy-auth-challenge-canvas"
import { useLoginFlowController } from "../../controllers/use-login-flow-controller"
import { LoginChallengeStep } from "./login-challenge-step"
import { LoginCompleteStep } from "./login-complete-step"
import { LoginIdentifyStep } from "./login-identify-step"
import { LoginPasswordStep } from "./login-password-step"
import { LoginProviderStep } from "./login-provider-step"

type LoginFlowController = ReturnType<typeof useLoginFlowController>

type LoginFlowStepRendererProps = {
  readonly controller: LoginFlowController
}

export function LoginFlowStepRenderer(props: LoginFlowStepRendererProps) {
  const { controller } = props
  const { t } = useTranslation("shell")
  const { state } = controller

  if (state.kind === "identify") {
    return (
      <LoginIdentifyStep
        emailInput={controller.emailInput}
        emailLabel={t("marketing.login.email_label")}
        onEmailInputChange={controller.setEmailInput}
        onSubmit={controller.submitIdentify}
        submitLabel={t("auth_security.identify_continue")}
      />
    )
  }

  if (state.kind === "challenge-requesting") {
    return (
      <LegacyAuthChallengeCanvas
        method={controller.continuity.currentMethod}
        onMethodChange={controller.selectMethod}
        receipt={state.receipt}
      >
        <p className="text-sm text-muted-foreground">
          {t("auth_security.challenge_preparing")}
        </p>
      </LegacyAuthChallengeCanvas>
    )
  }

  if (
    state.kind === "challenge-ready" ||
    state.kind === "challenge-verifying"
  ) {
    return (
      <LegacyAuthChallengeCanvas
        method={controller.continuity.currentMethod}
        onMethodChange={controller.selectMethod}
        receipt={state.receipt}
      >
        <LoginChallengeStep
          passkeyAvailable={controller.intelligence.data.passkeyAvailable}
          promptTitle={state.prompt.title}
          promptReady={state.prompt.description}
          promptUnavailable={t("auth_security.passkey_not_ready")}
          useAnotherLabel={t("auth_security.challenge_use_another")}
          verifying={state.kind === "challenge-verifying"}
          verifyLabel={t("auth_security.passkey_action")}
          onUseAnother={controller.clearChallenge}
          onVerify={controller.verifyChallenge}
        />
      </LegacyAuthChallengeCanvas>
    )
  }

  if (state.kind === "completed" || state.kind === "redirecting") {
    return (
      <LegacyAuthChallengeCanvas
        method={controller.continuity.currentMethod}
        onMethodChange={controller.selectMethod}
        receipt={state.receipt}
      >
        <LoginCompleteStep message={t("auth_security.redirecting")} />
      </LegacyAuthChallengeCanvas>
    )
  }

  if (
    state.kind === "provider-selection" ||
    state.kind === "provider-redirecting"
  ) {
    return (
      <LegacyAuthChallengeCanvas
        method={controller.continuity.currentMethod}
        onMethodChange={controller.selectMethod}
        receipt={state.receipt}
      >
        <LoginProviderStep
          disabled={state.kind === "provider-redirecting"}
          githubLabel={t("marketing.login.github")}
          googleLabel={t("marketing.login.google")}
          prompt={t("auth_security.social_prompt")}
          redirectingProvider={
            state.kind === "provider-redirecting" ? state.provider : null
          }
          onGithub={() => void controller.signInWithProvider("github")}
          onGoogle={() => void controller.signInWithProvider("google")}
        />
      </LegacyAuthChallengeCanvas>
    )
  }

  return (
    <LegacyAuthChallengeCanvas
      method={controller.continuity.currentMethod}
      onMethodChange={controller.selectMethod}
      receipt={state.receipt}
    >
      <LoginPasswordStep
        email={state.email}
        forgotPasswordLabel={t("marketing.login.forgot_password")}
        password={controller.password}
        passwordLabel={t("marketing.login.password_label")}
        pending={controller.pending}
        submitLabel={t("marketing.login.submit")}
        onPasswordChange={controller.setPassword}
        onSubmit={controller.submitPassword}
      />
    </LegacyAuthChallengeCanvas>
  )
}
