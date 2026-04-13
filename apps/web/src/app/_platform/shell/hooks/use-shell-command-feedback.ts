/**
 * SHELL COMMAND FEEDBACK HOOK
 *
 * Runtime hook for presenting translated shell command outcomes according to
 * governed feedback surface policy.
 */

import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"

import type {
  ShellCommandFeedbackContext,
  ShellCommandFeedbackPlan,
} from "../contract/shell-command-feedback-contract"
import type { ShellCommandOutcome } from "../contract/shell-command-outcome-contract"
import { emitShellCommandToast } from "../services/shell-command-toast-adapter"
import { resolveShellCommandFeedbackPlan } from "../services/resolve-shell-command-feedback-plan"
import { translateShellCommandOutcome } from "../services/translate-shell-command-outcome"
import { useBannerPort } from "./use-banner-port"
import { useInlineFeedbackPort } from "./use-inline-feedback-port"
import { useToastPort } from "./use-toast-port"

const defaultFeedbackContext: ShellCommandFeedbackContext = {
  intent: "header-action",
}

export interface ShellCommandFeedback {
  emitOutcome(
    outcome: ShellCommandOutcome,
    context?: ShellCommandFeedbackContext
  ): ShellCommandFeedbackPlan
}

export function useShellCommandFeedback(): ShellCommandFeedback {
  const { t } = useTranslation("shell")
  const toastPort = useToastPort()
  const bannerPort = useBannerPort()
  const inlinePort = useInlineFeedbackPort()

  const translate = useCallback(
    (key: string, fallback: string) => t(key, { defaultValue: fallback }),
    [t]
  )

  const emitOutcome = useCallback(
    (outcome: ShellCommandOutcome, context = defaultFeedbackContext) => {
      const plan = resolveShellCommandFeedbackPlan({
        context,
        outcome,
      })

      if (plan.surface === "silent") {
        return plan
      }

      if (plan.surface === "toast") {
        emitShellCommandToast({
          port: toastPort,
          outcome,
          translate,
        })
        return plan
      }

      const message = translateShellCommandOutcome({
        outcome,
        translate,
      })

      if (plan.surface === "banner") {
        bannerPort.show({
          severity: outcome.severity,
          message,
        })
      } else {
        inlinePort.show({
          severity: outcome.severity,
          message,
        })
      }

      return plan
    },
    [bannerPort, inlinePort, toastPort, translate]
  )

  return useMemo(() => ({ emitOutcome }), [emitOutcome])
}
