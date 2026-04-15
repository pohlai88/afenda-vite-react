import type { AuthRecommendedMethod } from "../contracts/auth-domain"
import type { LoginFlowState } from "../contracts/auth-flow-state"
import {
  loginFlowChallengeSummary,
  loginFlowContinuityStep,
  loginFlowSelectedMethod,
} from "../contracts/auth-flow-state"
import type { AuthContinuityViewModel } from "../contracts/auth-view-model"

export function mapAuthContinuityToViewModel(
  flowState: LoginFlowState,
  fallbackMethod: AuthRecommendedMethod
): AuthContinuityViewModel {
  return {
    currentMethod: loginFlowSelectedMethod(flowState) ?? fallbackMethod,
    currentStep: loginFlowContinuityStep(flowState),
    challenge: loginFlowChallengeSummary(flowState),
  }
}
